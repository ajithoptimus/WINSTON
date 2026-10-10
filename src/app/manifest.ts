import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WINSTON',
    short_name: 'WINSTON',
    description: "Synthetic tactical intelligence and personal AI assistant inspired by Edmond Kirsch's Winston AI",
    start_url: '/',
    display: 'standalone',
    background_color: '#040711',
    theme_color: '#040711',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
