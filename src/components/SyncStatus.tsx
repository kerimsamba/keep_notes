'use client';

import { useStorage } from '@/contexts/StorageContext';
import { Cloud, CloudOff, Loader2, AlertTriangle } from 'lucide-react';

export default function SyncStatus() {
  const { syncStatus, syncError } = useStorage();

  if (syncStatus === 'syncing') {
    return (
      <div className="fixed top-4 right-4 z-40 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Syncing...
      </div>
    );
  }

  if (syncStatus === 'offline') {
    return (
      <div className="fixed top-4 right-4 z-40 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center gap-2">
        <CloudOff className="w-3.5 h-3.5" />
        Offline — saved locally
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div
        className="fixed top-4 right-4 z-40 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-2 max-w-md"
        title={syncError}
      >
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">Sync error{syncError ? `: ${syncError}` : ''}</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
      <Cloud className="w-3.5 h-3.5" />
      Synced
    </div>
  );
}
