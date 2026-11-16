import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';

export default function Header() {
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Latest Jobs', href: '/category/latest-jobs' },
    { name: 'Results', href: '/category/results' },
    { name: 'Admit Card', href: '/category/admit-card' },
    { name: 'Answer Key', href: '/category/answer-key' },
    { name: 'Syllabus', href: '/category/syllabus' },
    { name: 'Admission', href: '/category/admission' },
  ];

  return (
    <header className="w-full bg-white border-b-2 border-red-700">
      {/* Top Brand Banner with Circular Emblem Logo */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 md:gap-4 group">
          <Image
            src="/logo.svg"
            alt="Govt Job Circular Emblem"
            width={64}
            height={64}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md drop-shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0"
            priority
          />
          <div className="text-left">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#b91c1c] tracking-tight hover:opacity-95 transition-opacity leading-none">
              GOVT JOB
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 tracking-wider mt-1 uppercase">
              WWW.GOVTJOB.SITE • OFFICIAL GOVT JOBS, RESULTS &amp; ADMIT CARDS PORTAL 2026
            </p>
          </div>
        </Link>
      </div>

      {/* Primary Navigation Bar (Iconic Govt Job Maroon Bar - Mobile Horizontal Smooth Scroll) */}
      <nav className="bg-[#8b0000] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar font-bold text-xs md:text-sm">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="px-3.5 md:px-5 py-2.5 border-r border-red-900/60 hover:bg-[#a00000] transition-colors whitespace-nowrap shrink-0"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/search"
            className="px-3.5 md:px-5 py-2.5 bg-red-900/80 hover:bg-[#a00000] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-amber-300 font-extrabold"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
