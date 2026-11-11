'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear legacy caches to ensure user always sees latest WINSTON v2 UI
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            if (
              key.includes('directive-os') ||
              (key.startsWith('winston-v2-cache-') && key !== 'winston-v2-cache-v4')
            ) {
              caches.delete(key);
            }
          });
        });
      }

      // Register / update service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            reg.update();
          })
          .catch((err) => {
            console.warn('[WINSTON] SW registration error:', err);
          });
      }
    }
  }, []);

  return null;
}
