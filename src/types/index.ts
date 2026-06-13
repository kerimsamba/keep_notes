export type NoteType = 'text' | 'checklist' | 'image' | 'audio' | 'drawing';

export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'darkblue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'gray';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  order: number;
}

export interface Attachment {
  id: string;
  noteId: string;
  type: 'image' | 'audio' | 'file';
  url: string;
  fileName: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  color: NoteColor;
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  checklistItems?: ChecklistItem[];
  attachments?: Attachment[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deletedAt?: string | null; // ISO 8601
}

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export const NOTE_COLORS: Record<NoteColor, { bg: string; hover: string; border: string }> = {
  default: { bg: 'bg-white', hover: 'hover:bg-gray-50', border: 'border-gray-200' },
  red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', border: 'border-red-200' },
  orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', border: 'border-orange-200' },
  yellow: { bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100', border: 'border-yellow-200' },
  green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', border: 'border-green-200' },
  teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', border: 'border-teal-200' },
  blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', border: 'border-blue-200' },
  darkblue: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', border: 'border-indigo-200' },
  purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', border: 'border-purple-200' },
  pink: { bg: 'bg-pink-50', hover: 'hover:bg-pink-100', border: 'border-pink-200' },
  brown: { bg: 'bg-amber-50', hover: 'hover:bg-amber-100', border: 'border-amber-200' },
  gray: { bg: 'bg-gray-50', hover: 'hover:bg-gray-100', border: 'border-gray-200' },
};
