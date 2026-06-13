'use client';

import React, { useState } from 'react';
import { Note, NoteType, NoteColor, ChecklistItem, NOTE_COLORS } from '@/types';
import { X, Pin, Palette, Tag, Plus, Check } from 'lucide-react';
import { noteService } from '@/lib/services/noteService';

interface NoteEditorProps {
  note?: Note;
  onClose: () => void;
  labels: Array<{ id: string; name: string; color: string }>;
}

export default function NoteEditor({ note, onClose, labels }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(note?.type || 'text');
  const [color, setColor] = useState<NoteColor>(note?.color || 'default');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    note?.checklistItems || []
  );
  const [newItemText, setNewItemText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(note?.labels || []);

  const colorClasses = NOTE_COLORS[color];

  const handleSave = () => {
    if (!title.trim() && !content.trim() && checklistItems.length === 0) {
      onClose();
      return;
    }

    try {
      if (note) {
        noteService.updateNote(note.id, {
          title,
          content,
          type: noteType,
          color,
          isPinned,
          checklistItems: noteType === 'checklist' ? checklistItems : undefined,
          labels: selectedLabels,
        });
      } else {
        noteService.createNote({
          title,
          content,
          type: noteType,
          color,
          isPinned,
          labels: selectedLabels,
          checklistItems: noteType === 'checklist' ? checklistItems : undefined,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false,
      order: checklistItems.length,
    };

    setChecklistItems([...checklistItems, newItem]);
    setNewItemText('');
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== itemId));
  };

  const toggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      setSelectedLabels(selectedLabels.filter((id) => id !== labelId));
    } else {
      setSelectedLabels([...selectedLabels, labelId]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className={`${colorClasses.bg} border ${colorClasses.border} rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="flex-1 text-xl font-semibold bg-transparent outline-none placeholder-gray-400"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="text">Text Note</option>
              <option value="checklist">Checklist</option>
            </select>
          </div>

          {noteType === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              className="w-full min-h-[200px] bg-transparent outline-none resize-none placeholder-gray-400"
            />
          ) : (
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="p-1 hover:bg-gray-200 rounded transition flex-shrink-0"
                  >
                    {item.checked ? (
                      <Check className="w-5 h-5 text-gray-700" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      item.checked ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 mt-2">
                <Plus className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="Add item"
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {labels
                .filter((label) => selectedLabels.includes(label.id))
                .map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs"
                    style={{ borderLeft: `3px solid ${label.color}` }}
                  >
                    {label.name}
                    <button
                      onClick={() => toggleLabel(label.id)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-white bg-opacity-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-full hover:bg-gray-200 transition ${
                isPinned ? 'text-gray-900' : 'text-gray-600'
              }`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-full hover:bg-gray-200 transition"
                title="Change color"
              >
                <Palette className="w-5 h-5" />
              </button>

              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10">
                  {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map(
                    (colorKey) => (
                      <button
                        key={colorKey}
                        onClick={() => {
                          setColor(colorKey);
                          setShowColorPicker(false);
                        }}
                        className={`w-6 h-6 rounded-full ${NOTE_COLORS[colorKey].bg} border-2 ${
                          color === colorKey ? 'border-gray-900' : 'border-gray-300'
                        } hover:scale-110 transition`}
                        title={colorKey}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {labels.length > 0 && (
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-200 transition" title="Add label">
                  <Tag className="w-5 h-5" />
                </button>

                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[150px] hidden group-hover:block">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => toggleLabel(label.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded transition text-left"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm flex-1">{label.name}</span>
                      {selectedLabels.includes(label.id) && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition"
          >
            {note ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
