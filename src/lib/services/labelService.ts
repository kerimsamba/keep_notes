import { Label } from '@/types';
import { notesStore } from '@/lib/storage/store';

export const labelService = {
  // Create a new label
  createLabel(name: string, color: string): string {
    return notesStore.createLabel(name, color);
  },

  // Update a label
  updateLabel(labelId: string, updates: Partial<Label>): void {
    notesStore.patchLabel(labelId, updates);
  },

  // Delete a label (also removes it from all notes)
  deleteLabel(labelId: string): void {
    notesStore.deleteLabel(labelId);
  },

  // Subscribe to labels, sorted by name
  subscribeToLabels(onUpdate: (labels: Label[]) => void): () => void {
    onUpdate(notesStore.getLabels());
    return notesStore.subscribe(() => onUpdate(notesStore.getLabels()));
  },

  // Get all labels
  getLabels(): Label[] {
    return notesStore.getLabels();
  },
};
