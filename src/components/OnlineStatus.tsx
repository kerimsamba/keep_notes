'use client';

import { useState, useEffect } from 'react';

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="fixed top-4 right-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Online
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center">
      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
      Offline
    </div>
  );
} 