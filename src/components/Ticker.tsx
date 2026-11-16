'use client';

import Link from 'next/link';
import { TickerAlert } from '@/types';
import { Bell } from 'lucide-react';

function getSafeHref(link: string | null | undefined, text: string): string {
  if (!link) return `/?q=${encodeURIComponent(text.slice(0, 30))}`;

  // If already an internal route, use as-is
  if (link.startsWith('/') || link.startsWith('https://www.govtjob.site') || link.startsWith('https://govtjob.site')) {
    return link.replace(/^https?:\/\/(www\.)?govtjob\.site/, '') || '/';
  }

  // Intercept any external competitor or scraper URLs
  if (link.includes('sarkariresult.com') || link.includes('rojgarresult.com')) {
    const parts = link.split('/').filter(Boolean);
    const lastSlug = parts[parts.length - 1];
    if (lastSlug && !lastSlug.includes('.com') && lastSlug.length > 3) {
      return `/job/${lastSlug}`;
    }
    return `/?q=${encodeURIComponent(text.slice(0, 30))}`;
  }

  return link;
}

export default function Ticker({ alerts }: { alerts: TickerAlert[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-amber-100 border-y border-amber-300 py-1.5 px-4 overflow-hidden flex items-center">
      <div className="flex items-center gap-1.5 bg-[#8b0000] text-white text-xs font-bold px-2.5 py-1 rounded-sm shrink-0 mr-3 shadow-sm">
        <Bell className="w-3.5 h-3.5 animate-pulse" />
        <span>ALERT:</span>
      </div>
      <div className="overflow-hidden whitespace-nowrap w-full relative">
        <div className="inline-block animate-marquee">
          {alerts.map((alert, idx) => {
            const safeHref = getSafeHref(alert.link, alert.text);
            const isInternal = safeHref.startsWith('/');

            return (
              <span key={idx} className="mr-8 text-xs md:text-sm font-semibold text-gray-900">
                <Link
                  href={safeHref}
                  target={isInternal ? undefined : '_blank'}
                  rel={isInternal ? undefined : 'noopener noreferrer'}
                  className="hover:text-red-700 underline"
                >
                  {alert.text}
                </Link>
                <span className="mx-4 text-red-600 font-bold">★</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
