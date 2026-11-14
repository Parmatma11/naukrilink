import Link from 'next/link';
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
      {/* Top Brand Banner */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-center">
        <Link href="/" className="inline-block group">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#b91c1c] tracking-tight hover:opacity-95 transition-opacity">
            SARKARI RESULT
          </h1>
          <p className="text-xs md:text-sm font-bold text-gray-700 tracking-wider mt-1 uppercase">
            WWW.SARKARIRESULT.COM • OFFICIAL SARKARI RESULTS &amp; LATEST JOBS PORTAL 2026
          </p>
        </Link>
      </div>

      {/* Primary Navigation Bar (Iconic Sarkari Maroon Bar) */}
      <nav className="bg-[#8b0000] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-2 flex flex-wrap items-center justify-center font-bold text-xs md:text-sm">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="px-3 md:px-5 py-2.5 border-r border-red-900/60 hover:bg-[#a00000] transition-colors whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/search"
            className="px-3 md:px-5 py-2.5 bg-red-900/80 hover:bg-[#a00000] transition-colors whitespace-nowrap flex items-center gap-1.5 text-amber-300 font-extrabold"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
