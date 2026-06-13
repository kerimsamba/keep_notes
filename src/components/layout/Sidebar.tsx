'use client';

import React from 'react';
import {
  Lightbulb,
  Bell,
  Archive,
  Trash2,
  Tag,
  Unplug,
  Github,
  RefreshCw,
  Grid3x3,
  List,
} from 'lucide-react';
import { useStorage } from '@/contexts/StorageContext';

interface SidebarProps {
  currentView: 'notes' | 'reminders' | 'archive' | 'trash';
  onViewChange: (view: 'notes' | 'reminders' | 'archive' | 'trash') => void;
  layoutMode: 'grid' | 'list';
  onLayoutChange: (mode: 'grid' | 'list') => void;
  labels: Array<{ id: string; name: string; color: string }>;
  onLabelClick: (labelId: string) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  layoutMode,
  onLayoutChange,
  labels,
  onLabelClick,
}: SidebarProps) {
  const { config, syncStatus, syncNow, disconnect } = useStorage();

  const statusLabel =
    syncStatus === 'syncing'
      ? 'Syncing...'
      : syncStatus === 'offline'
        ? 'Offline'
        : syncStatus === 'error'
          ? 'Sync error'
          : 'Synced';

  const handleDisconnect = () => {
    if (
      confirm(
        'Disconnect from GitHub? Your notes stay in your repo and in this browser; you can reconnect anytime.'
      )
    ) {
      disconnect();
    }
  };

  const menuItems = [
    { id: 'notes', icon: Lightbulb, label: 'Notes' },
    { id: 'reminders', icon: Bell, label: 'Reminders' },
    { id: 'archive', icon: Archive, label: 'Archive' },
    { id: 'trash', icon: Trash2, label: 'Trash' },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="text-yellow-500" />
          KeepClone
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition ${
              currentView === item.id
                ? 'bg-yellow-50 text-yellow-700 border-r-4 border-yellow-500'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {labels.length > 0 && (
          <div className="mt-6">
            <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
              Labels
            </div>
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => onLabelClick(label.id)}
                className="w-full flex items-center gap-3 px-6 py-2 text-left text-gray-700 hover:bg-gray-50 transition"
              >
                <Tag className="w-4 h-4" style={{ color: label.color }} />
                <span className="text-sm">{label.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => onLayoutChange('grid')}
            className={`flex-1 p-2 rounded-lg transition ${
              layoutMode === 'grid'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Grid view"
          >
            <Grid3x3 className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={() => onLayoutChange('list')}
            className={`flex-1 p-2 rounded-lg transition ${
              layoutMode === 'list'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List view"
          >
            <List className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
            <Github className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" title={config?.repo}>
              {config?.repo || 'Not connected'}
            </p>
            <p className="text-xs text-gray-500 truncate">{statusLabel}</p>
          </div>
          <button
            onClick={syncNow}
            className="p-2 text-gray-600 hover:text-gray-900 transition"
            title="Sync now"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDisconnect}
            className="p-2 text-gray-600 hover:text-red-600 transition"
            title="Disconnect from GitHub"
          >
            <Unplug className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
