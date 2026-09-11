import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WINSTON OS // KONGAD PROTOCOL',
    short_name: 'WINSTON OS',
    description: 'Synthetic tactical intelligence and daily protocol dashboard inspired by Edmond Kirsch\'s Winston AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#040711',
    theme_color: '#040711',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
