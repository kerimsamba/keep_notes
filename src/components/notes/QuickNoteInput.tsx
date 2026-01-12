'use client';

import React, { useState } from 'react';
import { Plus, CheckSquare, FileText } from 'lucide-react';

interface QuickNoteInputProps {
  onExpand: (type: 'text' | 'checklist') => void;
}

export default function QuickNoteInput({ onExpand }: QuickNoteInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  if (!isFocused) {
    return (
      <div className="max-w-2xl mx-auto mb-8">
        <div
          onClick={() => setIsFocused(true)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-text shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center gap-2 text-gray-500">
            <Plus className="w-5 h-5" />
            <span>Take a note...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="p-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full text-lg font-semibold outline-none mb-2"
            onFocus={() => onExpand('text')}
          />
          <textarea
            placeholder="Take a note..."
            className="w-full outline-none resize-none"
            rows={3}
            onFocus={() => onExpand('text')}
          />
        </div>
        <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExpand('text')}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="Text note"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => onExpand('checklist')}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="Checklist"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsFocused(false)}
            className="px-4 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
