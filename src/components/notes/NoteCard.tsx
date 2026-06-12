'use client';

import React, { useState } from 'react';
import { Note, NOTE_COLORS } from '@/types';
import {
  Pin,
  Archive,
  Trash2,
  Palette,
  Square,
  CheckSquare,
  Undo2,
} from 'lucide-react';
import { noteService } from '@/lib/services/noteService';
import { format } from 'date-fns';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  labels: Array<{ id: string; name: string; color: string }>;
}

export default function NoteCard({ note, onClick, labels }: NoteCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorClasses = NOTE_COLORS[note.color];

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await noteService.togglePin(note.id, !note.isPinned);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.isArchived) {
      await noteService.unarchiveNote(note.id);
    } else {
      await noteService.archiveNote(note.id);
    }
  };

  const handleTrash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await noteService.moveToTrash(note.id);
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await noteService.restoreFromTrash(note.id);
  };

  const handleDeleteForever = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this note forever?')) {
      await noteService.permanentlyDelete(note.id);
    }
  };

  const handleColorChange = async (e: React.MouseEvent, color: keyof typeof NOTE_COLORS) => {
    e.stopPropagation();
    await noteService.updateColor(note.id, color);
    setShowColorPicker(false);
  };

  const noteLabels = labels.filter((label) => note.labels.includes(label.id));

  return (
    <div
      onClick={onClick}
      className={`${colorClasses.bg} ${colorClasses.hover} border ${colorClasses.border} rounded-lg p-4 cursor-pointer transition-all group relative`}
    >
      {note.isPinned && (
        <Pin className="absolute top-2 right-2 w-4 h-4 text-gray-600 fill-gray-600" />
      )}

      {note.title && (
        <h3 className="font-semibold text-gray-900 mb-2 pr-6">{note.title}</h3>
      )}

      {note.type === 'text' && note.content && (
        <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-6">
          {note.content}
        </p>
      )}

      {note.type === 'checklist' && note.checklistItems && (
        <div className="space-y-1">
          {note.checklistItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              {item.checked ? (
                <CheckSquare className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  item.checked ? 'text-gray-500 line-through' : 'text-gray-700'
                }`}
              >
                {item.text}
              </span>
            </div>
          ))}
          {note.checklistItems.length > 5 && (
            <p className="text-xs text-gray-500 pl-6">
              +{note.checklistItems.length - 5} more items
            </p>
          )}
        </div>
      )}

      {noteLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {noteLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs"
              style={{ borderLeft: `3px solid ${label.color}` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {note.isDeleted ? (
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRestore}
            className="p-1.5 rounded-full hover:bg-gray-200 transition flex items-center gap-1 text-sm text-gray-700"
            title="Restore"
          >
            <Undo2 className="w-4 h-4" />
            Restore
          </button>
          <button
            onClick={handleDeleteForever}
            className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition"
            title="Delete forever"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
      <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePin}
            className="p-1.5 rounded-full hover:bg-gray-200 transition"
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-gray-600' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1.5 rounded-full hover:bg-gray-200 transition"
              title="Change color"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showColorPicker && (
              <div
                className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map((color) => (
                  <button
                    key={color}
                    onClick={(e) => handleColorChange(e, color)}
                    className={`w-6 h-6 rounded-full ${NOTE_COLORS[color].bg} border-2 ${
                      note.color === color ? 'border-gray-900' : 'border-gray-300'
                    } hover:scale-110 transition`}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleArchive}
            className="p-1.5 rounded-full hover:bg-gray-200 transition"
            title={note.isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleTrash}
          className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        {format(new Date(note.updatedAt), 'MMM d, yyyy')}
      </div>
    </div>
  );
}
