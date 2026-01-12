import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Note, NoteType, NoteColor, ChecklistItem } from '@/types';

export const noteService = {
  // Create a new note
  async createNote(
    userId: string,
    title: string,
    content: string,
    type: NoteType = 'text',
    color: NoteColor = 'default'
  ): Promise<string> {
    const noteData: Partial<Note> = {
      userId,
      title,
      content,
      type,
      color,
      labels: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      checklistItems: type === 'checklist' ? [] : undefined,
      attachments: [],
      sharedWith: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'notes'), noteData);
    return docRef.id;
  },

  // Update an existing note
  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Soft delete a note (move to trash)
  async moveToTrash(noteId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  // Restore a note from trash
  async restoreFromTrash(noteId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: Timestamp.now(),
    });
  },

  // Permanently delete a note
  async permanentlyDelete(noteId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
  },

  // Archive a note
  async archiveNote(noteId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      isArchived: true,
      isPinned: false,
      updatedAt: Timestamp.now(),
    });
  },

  // Unarchive a note
  async unarchiveNote(noteId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      isArchived: false,
      updatedAt: Timestamp.now(),
    });
  },

  // Pin/unpin a note
  async togglePin(noteId: string, isPinned: boolean): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      isPinned,
      updatedAt: Timestamp.now(),
    });
  },

  // Update note color
  async updateColor(noteId: string, color: NoteColor): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      color,
      updatedAt: Timestamp.now(),
    });
  },

  // Add label to note
  async addLabel(noteId: string, labelId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    const noteDoc = await getDocs(query(collection(db, 'notes'), where('__name__', '==', noteId)));
    const note = noteDoc.docs[0]?.data() as Note;

    if (note && !note.labels.includes(labelId)) {
      await updateDoc(noteRef, {
        labels: [...note.labels, labelId],
        updatedAt: Timestamp.now(),
      });
    }
  },

  // Remove label from note
  async removeLabel(noteId: string, labelId: string): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    const noteDoc = await getDocs(query(collection(db, 'notes'), where('__name__', '==', noteId)));
    const note = noteDoc.docs[0]?.data() as Note;

    if (note) {
      await updateDoc(noteRef, {
        labels: note.labels.filter((id) => id !== labelId),
        updatedAt: Timestamp.now(),
      });
    }
  },

  // Update checklist items
  async updateChecklistItems(noteId: string, items: ChecklistItem[]): Promise<void> {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      checklistItems: items,
      updatedAt: Timestamp.now(),
    });
  },

  // Subscribe to user's notes with real-time updates
  subscribeToNotes(
    userId: string,
    onUpdate: (notes: Note[]) => void,
    filters?: {
      isArchived?: boolean;
      isDeleted?: boolean;
      labelId?: string;
    }
  ): () => void {
    let q = query(collection(db, 'notes'), where('userId', '==', userId));

    if (filters?.isArchived !== undefined) {
      q = query(q, where('isArchived', '==', filters.isArchived));
    }
    if (filters?.isDeleted !== undefined) {
      q = query(q, where('isDeleted', '==', filters.isDeleted));
    }

    q = query(q, orderBy('isPinned', 'desc'), orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];

      // Filter by label if specified
      const filteredNotes = filters?.labelId
        ? notes.filter((note) => note.labels.includes(filters.labelId!))
        : notes;

      onUpdate(filteredNotes);
    });
  },

  // Search notes
  async searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      where('isDeleted', '==', false)
    );

    const snapshot = await getDocs(q);
    const allNotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];

    // Client-side search for title and content
    const searchLower = searchTerm.toLowerCase();
    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
    );
  },

  // Delete old trash items (7 days retention)
  async cleanupTrash(userId: string): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      where('isDeleted', '==', true)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((document) => {
      const note = document.data() as Note;
      if (note.deletedAt && note.deletedAt.toDate() < sevenDaysAgo) {
        batch.delete(document.ref);
      }
    });

    await batch.commit();
  },
};
