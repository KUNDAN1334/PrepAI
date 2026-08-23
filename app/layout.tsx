// app/layout.tsx
import type { Metadata, Viewport } from 'next';
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

// Absolute URLs for the social card. Set NEXT_PUBLIC_APP_URL in production.
const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PrepAI — AI-Powered Interview Preparation Platform',
    template: '%s · PrepAI',
  },
  description:
    'Prepare for your dream job with AI-powered mock interviews, resume optimization, company research and a community-driven question bank.',
  applicationName: 'PrepAI',
  keywords: [
    'interview preparation',
    'mock interview',
    'resume optimizer',
    'company research',
    'question bank',
    'AI interview coach',
  ],
  // /favicon.ico, /icon.svg and /apple-icon.png are served from the app dir.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'PrepAI',
    title: 'PrepAI — AI-powered interview prep, without the guesswork',
    description:
      'Mock interviews, resume optimization, company research and a shared question bank — in one focused workspace.',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PrepAI — AI-powered interview preparation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrepAI — AI-powered interview prep, without the guesswork',
    description:
      'Mock interviews, resume optimization, company research and a shared question bank.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#141210',
  colorScheme: 'light',
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
