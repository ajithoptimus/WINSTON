import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DIRECTIVE OS',
    short_name: 'DIRECTIVE',
    description: 'Automated weightless daily protocol dashboard & high-performance operational tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#07090E',
    theme_color: '#07090E',
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
