// app/layout.tsx
import type { Metadata } from 'next';
import { Space_Grotesk, Newsreader, Caveat } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';
import Providers from '@/components/Providers';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prep AI - AI-Powered Interview Preparation Platform',
  description:
    'Prepare for your dream job with AI-powered mock interviews, resume optimization, and community-driven question bank.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${newsreader.variable} ${caveat.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
