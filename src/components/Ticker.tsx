'use client';

import Link from 'next/link';
import { TickerAlert } from '@/types';
import { Bell } from 'lucide-react';

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
          {alerts.map((alert, idx) => (
            <span key={idx} className="mr-8 text-xs md:text-sm font-semibold text-gray-900">
              {alert.link ? (
                <Link
                  href={alert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-700 underline"
                >
                  {alert.text}
                </Link>
              ) : (
                alert.text
              )}
              <span className="mx-4 text-red-600 font-bold">★</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
