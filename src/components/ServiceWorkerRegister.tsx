'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[DIRECTIVE OS] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[DIRECTIVE OS] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
