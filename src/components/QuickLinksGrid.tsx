import Link from 'next/link';

export default function QuickLinksGrid() {
  const quickCategories = [
    { name: 'Railway Jobs', color: 'bg-emerald-700 hover:bg-emerald-800', query: 'Railway' },
    { name: 'SSC CGL / CHSL', color: 'bg-indigo-700 hover:bg-indigo-800', query: 'SSC' },
    { name: 'UPSC Civil Services', color: 'bg-rose-700 hover:bg-rose-800', query: 'UPSC' },
    { name: 'Police / SI / Constable', color: 'bg-amber-700 hover:bg-amber-800', query: 'Police' },
    { name: 'Teaching (TET / TGT)', color: 'bg-cyan-700 hover:bg-cyan-800', query: 'Teacher' },
    { name: 'UPSSSC / UP Jobs', color: 'bg-purple-700 hover:bg-purple-800', query: 'UPSSSC' },
    { name: 'Defence / Airforce', color: 'bg-blue-800 hover:bg-blue-900', query: 'Airforce' },
    { name: 'Admit Card 2026', color: 'bg-red-700 hover:bg-red-800', link: '/category/admit-card' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 my-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-center">
        {quickCategories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.link || `/?q=${encodeURIComponent(cat.query || '')}`}
            className={`${cat.color} text-white font-bold text-xs md:text-sm py-2 px-1 rounded-sm shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
