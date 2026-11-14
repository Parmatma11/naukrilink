import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Sarkari Result 2026 : SarkariResult.Com Official Website for Latest Jobs, Results, Admit Card',
  description: 'Sarkari Result 2026: Get latest Sarkari Result jobs, online application forms, admit cards, exam results, answer keys for Railway, SSC, UPSC, Bank, Police, UPPSC, Defence, and State govt exams.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fdfbf7] text-[#171717] antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
