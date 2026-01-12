import {
  collection,
  addDoc,
  updateDoc,
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
import { Label } from '@/types';

export const labelService = {
  // Create a new label
  async createLabel(userId: string, name: string, color: string): Promise<string> {
    const labelData: Partial<Label> = {
      userId,
      name,
      color,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'labels'), labelData);
    return docRef.id;
  },

  // Update a label
  async updateLabel(labelId: string, updates: Partial<Label>): Promise<void> {
    const labelRef = doc(db, 'labels', labelId);
    await updateDoc(labelRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete a label
  async deleteLabel(labelId: string, userId: string): Promise<void> {
    // Remove label from all notes
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      where('labels', 'array-contains', labelId)
    );

    const notesSnapshot = await getDocs(notesQuery);
    const batch = writeBatch(db);

    notesSnapshot.docs.forEach((document) => {
      const labels = document.data().labels.filter((id: string) => id !== labelId);
      batch.update(document.ref, { labels });
    });

    // Delete the label
    const labelRef = doc(db, 'labels', labelId);
    batch.delete(labelRef);

    await batch.commit();
  },

  // Subscribe to user's labels with real-time updates
  subscribeToLabels(userId: string, onUpdate: (labels: Label[]) => void): () => void {
    const q = query(
      collection(db, 'labels'),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const labels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Label[];

      onUpdate(labels);
    });
  },

  // Get all labels for a user
  async getLabels(userId: string): Promise<Label[]> {
    const q = query(
      collection(db, 'labels'),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Label[];
  },
};
