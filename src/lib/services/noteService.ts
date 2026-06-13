import { Note, NoteColor, ChecklistItem } from '@/types';
import { notesStore, CreateNoteInput } from '@/lib/storage/store';

export const noteService = {
  // Create a new note
  createNote(input: CreateNoteInput): string {
    return notesStore.createNote(input);
  },

  // Update an existing note
  updateNote(noteId: string, updates: Partial<Note>): void {
    notesStore.patchNote(noteId, updates);
  },

  // Soft delete a note (move to trash)
  moveToTrash(noteId: string): void {
    notesStore.patchNote(noteId, {
      isDeleted: true,
      isPinned: false,
      deletedAt: new Date().toISOString(),
    });
  },

  // Restore a note from trash
  restoreFromTrash(noteId: string): void {
    notesStore.patchNote(noteId, { isDeleted: false, deletedAt: null });
  },

  // Permanently delete a note
  permanentlyDelete(noteId: string): void {
    notesStore.permanentlyDeleteNote(noteId);
  },

  // Archive a note
  archiveNote(noteId: string): void {
    notesStore.patchNote(noteId, { isArchived: true, isPinned: false });
  },

  // Unarchive a note
  unarchiveNote(noteId: string): void {
    notesStore.patchNote(noteId, { isArchived: false });
  },

  // Pin/unpin a note
  togglePin(noteId: string, isPinned: boolean): void {
    notesStore.patchNote(noteId, { isPinned });
  },

  // Update note color
  updateColor(noteId: string, color: NoteColor): void {
    notesStore.patchNote(noteId, { color });
  },

  // Update checklist items
  updateChecklistItems(noteId: string, items: ChecklistItem[]): void {
    notesStore.patchNote(noteId, { checklistItems: items });
  },

  // Subscribe to notes (pinned first, then most recently updated)
  subscribeToNotes(onUpdate: (notes: Note[]) => void): () => void {
    onUpdate(notesStore.getNotes());
    return notesStore.subscribe(() => onUpdate(notesStore.getNotes()));
  },

  // Delete old trash items (7 days retention)
  cleanupTrash(): void {
    notesStore.cleanupTrash();
  },
};
