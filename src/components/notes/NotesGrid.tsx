'use client';

import React from 'react';
import { Note } from '@/types';
import NoteCard from './NoteCard';

interface NotesGridProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  layoutMode: 'grid' | 'list';
  labels: Array<{ id: string; name: string; color: string }>;
}

export default function NotesGrid({ notes, onNoteClick, layoutMode, labels }: NotesGridProps) {
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const unpinnedNotes = notes.filter((note) => !note.isPinned);

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
      </div>
    );
  }

  const gridClasses =
    layoutMode === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      : 'flex flex-col gap-2';

  return (
    <div className="space-y-6">
      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Pinned</h2>
          <div className={gridClasses}>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => onNoteClick(note)}
                labels={labels}
              />
            ))}
          </div>
        </div>
      )}

      {unpinnedNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Others</h2>
          )}
          <div className={gridClasses}>
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => onNoteClick(note)}
                labels={labels}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
