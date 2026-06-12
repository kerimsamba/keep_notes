import { Note, Label, NoteType, NoteColor, ChecklistItem } from '@/types';
import { GitHubConfig, loadConfig, saveConfig, clearConfig } from './config';
import { getRepoInfo, getFile, putFile, GitHubApiError } from './github';

export type SyncStatus = 'disconnected' | 'syncing' | 'synced' | 'offline' | 'error';

export const NOTES_FILE_PATH = 'notes.json';

const DATA_KEY = 'keep-notes:data';
const SYNC_DEBOUNCE_MS = 2000;
const TOMBSTONE_RETENTION_DAYS = 30;
const TRASH_RETENTION_DAYS = 7;

interface NotesData {
  version: 1;
  savedAt: string;
  notes: Note[];
  labels: Label[];
  /** Permanently deleted ids -> deletion time, so deletes propagate across devices */
  tombstones: Record<string, string>;
}

function emptyData(): NotesData {
  return { version: 1, savedAt: new Date().toISOString(), notes: [], labels: [], tombstones: {} };
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function serialize(data: NotesData): string {
  // Pretty-printed so the file is readable and diffs nicely in GitHub history
  return JSON.stringify(data, null, 2) + '\n';
}

function parseData(text: string): NotesData {
  const parsed = JSON.parse(text);
  return {
    version: 1,
    savedAt: parsed.savedAt || new Date(0).toISOString(),
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    labels: Array.isArray(parsed.labels) ? parsed.labels : [],
    tombstones: parsed.tombstones && typeof parsed.tombstones === 'object' ? parsed.tombstones : {},
  };
}

/**
 * Merge two versions of the data set. Per-item last-write-wins by updatedAt,
 * with tombstones so permanent deletions win over stale copies from other devices.
 */
function merge(a: NotesData, b: NotesData): NotesData {
  const tombstones: Record<string, string> = { ...a.tombstones };
  for (const [id, at] of Object.entries(b.tombstones)) {
    if (!tombstones[id] || tombstones[id] < at) tombstones[id] = at;
  }

  const mergeById = <T extends { id: string; updatedAt: string }>(xs: T[], ys: T[]): T[] => {
    const byId = new Map<string, T>();
    for (const item of [...xs, ...ys]) {
      const existing = byId.get(item.id);
      if (!existing || existing.updatedAt < item.updatedAt) byId.set(item.id, item);
    }
    return Array.from(byId.values()).filter((item) => {
      const deletedAt = tombstones[item.id];
      return !deletedAt || deletedAt < item.updatedAt;
    });
  };

  // Drop tombstones older than the retention window to keep the file tidy
  const cutoff = new Date(Date.now() - TOMBSTONE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  for (const [id, at] of Object.entries(tombstones)) {
    if (at < cutoff) delete tombstones[id];
  }

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    notes: mergeById(a.notes, b.notes),
    labels: mergeById(a.labels, b.labels),
    tombstones,
  };
}

export interface CreateNoteInput {
  title: string;
  content: string;
  type?: NoteType;
  color?: NoteColor;
  isPinned?: boolean;
  labels?: string[];
  checklistItems?: ChecklistItem[];
}

class NotesStore {
  private data: NotesData = emptyData();
  private config: GitHubConfig | null = null;
  private listeners = new Set<() => void>();
  private statusListeners = new Set<() => void>();
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncing = false;
  private pendingSync = false;
  private initialized = false;

  status: SyncStatus = 'disconnected';
  lastError = '';

  /** Load cached data + config from localStorage; kick off a background pull. Client-only. */
  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      const raw = window.localStorage.getItem(DATA_KEY);
      if (raw) this.data = parseData(raw);
    } catch {
      this.data = emptyData();
    }

    this.config = loadConfig();
    if (this.config) {
      this.status = 'synced';
      void this.sync();
    }

    this.cleanupTrash();

    window.addEventListener('online', () => {
      if (this.config) void this.sync();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.config) void this.sync();
    });
  }

  getConfig(): GitHubConfig | null {
    return this.config;
  }

  // ----- subscriptions -----

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeStatus(listener: () => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private setStatus(status: SyncStatus, error = ''): void {
    this.status = status;
    this.lastError = error;
    this.statusListeners.forEach((l) => l());
  }

  // ----- reads -----

  getNotes(): Note[] {
    return [...this.data.notes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    });
  }

  getLabels(): Label[] {
    return [...this.data.labels].sort((a, b) => a.name.localeCompare(b.name));
  }

  // ----- note mutations -----

  createNote(input: CreateNoteInput): string {
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: input.title,
      content: input.content,
      type: input.type ?? 'text',
      color: input.color ?? 'default',
      labels: input.labels ?? [],
      isPinned: input.isPinned ?? false,
      isArchived: false,
      isDeleted: false,
      checklistItems: input.type === 'checklist' ? input.checklistItems ?? [] : undefined,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.notes.push(note);
    this.commit();
    return note.id;
  }

  patchNote(noteId: string, updates: Partial<Note>): void {
    const note = this.data.notes.find((n) => n.id === noteId);
    if (!note) return;
    Object.assign(note, updates, { updatedAt: new Date().toISOString() });
    this.commit();
  }

  permanentlyDeleteNote(noteId: string): void {
    this.data.notes = this.data.notes.filter((n) => n.id !== noteId);
    this.data.tombstones[noteId] = new Date().toISOString();
    this.commit();
  }

  cleanupTrash(): void {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const expired = this.data.notes.filter(
      (n) => n.isDeleted && n.deletedAt && n.deletedAt < cutoff
    );
    if (expired.length === 0) return;
    const now = new Date().toISOString();
    for (const note of expired) {
      this.data.tombstones[note.id] = now;
    }
    this.data.notes = this.data.notes.filter((n) => !expired.includes(n));
    this.commit();
  }

  // ----- label mutations -----

  createLabel(name: string, color: string): string {
    const now = new Date().toISOString();
    const label: Label = { id: generateId(), name, color, createdAt: now, updatedAt: now };
    this.data.labels.push(label);
    this.commit();
    return label.id;
  }

  patchLabel(labelId: string, updates: Partial<Label>): void {
    const label = this.data.labels.find((l) => l.id === labelId);
    if (!label) return;
    Object.assign(label, updates, { updatedAt: new Date().toISOString() });
    this.commit();
  }

  deleteLabel(labelId: string): void {
    const now = new Date().toISOString();
    for (const note of this.data.notes) {
      if (note.labels.includes(labelId)) {
        note.labels = note.labels.filter((id) => id !== labelId);
        note.updatedAt = now;
      }
    }
    this.data.labels = this.data.labels.filter((l) => l.id !== labelId);
    this.data.tombstones[labelId] = now;
    this.commit();
  }

  // ----- persistence & sync -----

  private commit(): void {
    this.data.savedAt = new Date().toISOString();
    this.saveLocal();
    this.notify();
    this.scheduleSync();
  }

  private saveLocal(): void {
    try {
      window.localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('Failed to save notes locally:', err);
    }
  }

  private scheduleSync(): void {
    if (!this.config) return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => void this.sync(), SYNC_DEBOUNCE_MS);
  }

  /**
   * Pull the remote file, merge it with local state, and push back if anything
   * changed locally. Safe to call at any time; concurrent calls coalesce.
   */
  async sync(): Promise<void> {
    if (!this.config) return;
    if (this.syncing) {
      this.pendingSync = true;
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    this.syncing = true;
    this.setStatus('syncing');
    try {
      await this.syncOnce();
      this.setStatus('synced');
    } catch (err) {
      if (err instanceof GitHubApiError && err.status === 409) {
        // Stale sha (another device pushed first) — retry once with a fresh pull
        try {
          await this.syncOnce();
          this.setStatus('synced');
        } catch (retryErr) {
          this.setStatus('error', retryErr instanceof Error ? retryErr.message : 'Sync failed');
        }
      } else {
        this.setStatus('error', err instanceof Error ? err.message : 'Sync failed');
      }
    } finally {
      this.syncing = false;
      if (this.pendingSync) {
        this.pendingSync = false;
        this.scheduleSync();
      }
    }
  }

  private async syncOnce(): Promise<void> {
    if (!this.config) return;
    const remote = await getFile(this.config, NOTES_FILE_PATH);
    const remoteData = remote ? parseData(remote.text) : emptyData();
    const merged = merge(this.data, remoteData);

    const mergedLocal = serialize(merged);
    const changedLocally = JSON.stringify(this.dataDigest(merged)) !== JSON.stringify(this.dataDigest(this.data));
    this.data = merged;
    this.saveLocal();
    if (changedLocally) this.notify();

    const remoteText = remote ? remote.text : null;
    if (remoteText !== mergedLocal) {
      const message = `Update notes (${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC)`;
      await putFile(this.config, NOTES_FILE_PATH, mergedLocal, message, remote?.sha);
    }
  }

  /** Content-only view of the data, ignoring the savedAt timestamp. */
  private dataDigest(data: NotesData) {
    return { notes: data.notes, labels: data.labels, tombstones: data.tombstones };
  }

  // ----- connection management -----

  /**
   * Validate the token/repo, resolve the branch, do an initial two-way sync,
   * and persist the config. Throws with a readable message on failure.
   */
  async connect(config: GitHubConfig): Promise<void> {
    const repo = config.repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/+$/, '');
    const candidate: GitHubConfig = { token: config.token.trim(), repo, branch: config.branch.trim() };

    let info;
    try {
      info = await getRepoInfo(candidate);
    } catch (err) {
      if (err instanceof GitHubApiError && err.status === 401) {
        throw new Error('GitHub rejected the token. Check that it was copied correctly and has not expired.');
      }
      if (err instanceof GitHubApiError && err.status === 404) {
        throw new Error(
          `Repository "${repo}" not found. Check the owner/name, and make sure the token has access to it.`
        );
      }
      throw err;
    }

    if (!candidate.branch) candidate.branch = info.defaultBranch;

    this.config = candidate;
    saveConfig(candidate);
    this.setStatus('syncing');
    await this.sync();
    if (this.status === 'error') {
      const message = this.lastError;
      this.config = null;
      clearConfig();
      this.setStatus('disconnected');
      throw new Error(message || 'Could not read or write notes.json in the repository.');
    }
  }

  /** Forget the GitHub connection. Local notes stay cached in this browser. */
  disconnect(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.config = null;
    clearConfig();
    this.setStatus('disconnected');
  }
}

export const notesStore = new NotesStore();
