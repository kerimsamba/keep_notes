'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStorage } from '@/contexts/StorageContext';
import SetupPage from '@/components/auth/SetupPage';
import Sidebar from '@/components/layout/Sidebar';
import SearchBar from '@/components/layout/SearchBar';
import NotesGrid from '@/components/notes/NotesGrid';
import NoteEditor from '@/components/notes/NoteEditor';
import QuickNoteInput from '@/components/notes/QuickNoteInput';
import LabelManager from '@/components/labels/LabelManager';
import { Note, Label } from '@/types';
import { noteService } from '@/lib/services/noteService';
import { labelService } from '@/lib/services/labelService';
import { Plus, Tag as TagIcon } from 'lucide-react';

// Dynamically import PWA components with no SSR
const InstallPWA = dynamic(() => import('@/components/InstallPWA'), {
  ssr: false,
});

const SyncStatus = dynamic(() => import('@/components/SyncStatus'), {
  ssr: false,
});

export default function Home() {
  const { config, loading } = useStorage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [currentView, setCurrentView] = useState<'notes' | 'reminders' | 'archive' | 'trash'>(
    'notes'
  );
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | null>(null);

  // Subscribe to notes and labels
  useEffect(() => {
    if (!config) return;
    const unsubscribeNotes = noteService.subscribeToNotes(setNotes);
    const unsubscribeLabels = labelService.subscribeToLabels(setLabels);
    return () => {
      unsubscribeNotes();
      unsubscribeLabels();
    };
  }, [config]);

  // Auto-cleanup trash (7 days)
  useEffect(() => {
    if (!config) return;
    noteService.cleanupTrash();
    const interval = setInterval(() => noteService.cleanupTrash(), 24 * 60 * 60 * 1000); // Daily
    return () => clearInterval(interval);
  }, [config]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return <SetupPage />;
  }

  // Filter notes for the current view, search query, and label filter
  const filteredNotes = notes.filter((note) => {
    const matchesView =
      currentView === 'trash'
        ? note.isDeleted
        : currentView === 'archive'
          ? note.isArchived && !note.isDeleted
          : !note.isArchived && !note.isDeleted;

    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLabel = !selectedLabelFilter || note.labels.includes(selectedLabelFilter);

    return matchesView && matchesSearch && matchesLabel;
  });

  const handleCreateNote = () => {
    setIsCreatingNote(true);
  };

  const handleLabelClick = (labelId: string) => {
    setSelectedLabelFilter(selectedLabelFilter === labelId ? null : labelId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SyncStatus />

      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        layoutMode={layoutMode}
        onLayoutChange={setLayoutMode}
        labels={labels}
        onLabelClick={handleLabelClick}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <SearchBar onSearch={setSearchQuery} />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLabelManager(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Manage labels"
              >
                <TagIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Note</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {currentView === 'notes' && !selectedLabelFilter && (
            <QuickNoteInput onExpand={handleCreateNote} />
          )}

          {currentView === 'trash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Notes in trash are automatically deleted after 7 days.
              </p>
            </div>
          )}

          {selectedLabelFilter && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      labels.find((l) => l.id === selectedLabelFilter)?.color || '#000',
                  }}
                />
                {labels.find((l) => l.id === selectedLabelFilter)?.name}
                <button
                  onClick={() => setSelectedLabelFilter(null)}
                  className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          <NotesGrid
            notes={filteredNotes}
            onNoteClick={setSelectedNote}
            layoutMode={layoutMode}
            labels={labels}
          />
        </div>
      </main>

      {(selectedNote || isCreatingNote) && (
        <NoteEditor
          note={selectedNote || undefined}
          onClose={() => {
            setSelectedNote(null);
            setIsCreatingNote(false);
          }}
          labels={labels}
        />
      )}

      {showLabelManager && (
        <LabelManager labels={labels} onClose={() => setShowLabelManager(false)} />
      )}

      <InstallPWA />
    </div>
  );
}
