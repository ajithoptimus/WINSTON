import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'DIRECTIVE OS | Weightless Daily Protocol Dashboard',
  description: 'Automated weightless daily protocol dashboard featuring 5 growth tracks, IndexedDB offline persistence, and anti-gravity design.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DIRECTIVE OS',
  },
};

export const viewport: Viewport = {
  themeColor: '#07090E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-[#07090E] text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
