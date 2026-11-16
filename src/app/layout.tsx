import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationPrompt from '@/components/NotificationPrompt';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Analytics } from '@vercel/analytics/react';

export const viewport: Viewport = {
  themeColor: '#8b0000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Govt Job 2026 : GovtJob.site Official Website for Latest Jobs, Results, Admit Card',
  description: 'Govt Job 2026: Get latest government jobs, online application forms, admit cards, exam results, answer keys for Railway, SSC, UPSC, Bank, Police, UPPSC, Defence, and State govt exams.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Govt Job',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'google-adsense-account': 'ca-pub-7591354342191223',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7591354342191223"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fdfbf7] text-[#171717] antialiased">
        <PWAInstallPrompt />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <NotificationPrompt />
        <Analytics />
      </body>
    </html>
  );
}
