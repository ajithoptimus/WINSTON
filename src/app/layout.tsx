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
  title: 'WINSTON | Synthetic Tactical Intelligence & Protocol Engine',
  description: 'Synthetic tactical intelligence and daily protocol dashboard inspired by Edmond Kirsch\'s Winston AI in Dan Brown\'s Origin.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WINSTON',
  },
};

export const viewport: Viewport = {
  themeColor: '#040711',
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
      <body className="bg-[#040711] text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
