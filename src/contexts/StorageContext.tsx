'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GitHubConfig } from '@/lib/storage/config';
import { notesStore, SyncStatus } from '@/lib/storage/store';

interface StorageContextType {
  /** Current GitHub connection, or null when not set up yet */
  config: GitHubConfig | null;
  /** True until the local cache has been read on the client */
  loading: boolean;
  syncStatus: SyncStatus;
  syncError: string;
  connect: (config: GitHubConfig) => Promise<void>;
  disconnect: () => void;
  syncNow: () => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GitHubConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    notesStore.init();
    setConfig(notesStore.getConfig());
    setSyncStatus(notesStore.status);
    setLoading(false);

    return notesStore.subscribeStatus(() => {
      setSyncStatus(notesStore.status);
      setSyncError(notesStore.lastError);
      setConfig(notesStore.getConfig());
    });
  }, []);

  const connect = async (newConfig: GitHubConfig) => {
    await notesStore.connect(newConfig);
    setConfig(notesStore.getConfig());
  };

  const disconnect = () => {
    notesStore.disconnect();
    setConfig(null);
  };

  const syncNow = () => {
    void notesStore.sync();
  };

  return (
    <StorageContext.Provider
      value={{ config, loading, syncStatus, syncError, connect, disconnect, syncNow }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
