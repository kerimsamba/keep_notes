'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { labelService } from '@/lib/services/labelService';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelManagerProps {
  labels: Label[];
  onClose: () => void;
}

const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // blue
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export default function LabelManager({ labels, onClose }: LabelManagerProps) {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      labelService.createLabel(newLabelName.trim(), newLabelColor);
      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0]);
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel) return;

    try {
      await labelService.updateLabel(editingLabel.id, {
        name: editingLabel.name,
        color: editingLabel.color,
      });
      setEditingLabel(null);
    } catch (error) {
      console.error('Error updating label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm('Are you sure you want to delete this label? It will be removed from all notes.')) {
      return;
    }

    try {
      labelService.deleteLabel(labelId);
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Manage Labels</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleCreateLabel} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create New Label
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewLabelColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newLabelColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  } transition`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </form>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Labels
            </label>
            {labels.length === 0 ? (
              <p className="text-gray-500 text-sm">No labels yet. Create your first label!</p>
            ) : (
              labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  {editingLabel?.id === label.id ? (
                    <>
                      <input
                        type="text"
                        value={editingLabel.name}
                        onChange={(e) =>
                          setEditingLabel({ ...editingLabel, name: e.target.value })
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <select
                        value={editingLabel.color}
                        onChange={(e) =>
                          setEditingLabel({ ...editingLabel, color: e.target.value })
                        }
                        className="px-2 py-1 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        {LABEL_COLORS.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleUpdateLabel}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingLabel(null)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="flex-1 text-sm font-medium">{label.name}</span>
                      <button
                        onClick={() => setEditingLabel(label)}
                        className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
