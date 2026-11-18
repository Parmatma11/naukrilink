import Link from 'next/link';
import { Job } from '@/types';

interface ColumnBoxProps {
  title: string;
  slug: string;
  headerColor?: string;
  items: Job[];
  viewMoreLink?: string;
}

export default function ColumnBox({
  title,
  slug,
  headerColor = 'bg-[#8b0000]',
  items,
  viewMoreLink,
}: ColumnBoxProps) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-sm shadow-sm flex flex-col h-full">
      {/* Box Header */}
      <div className={`${headerColor} text-white font-extrabold text-base md:text-lg py-2 px-3 text-center tracking-wide uppercase shadow-inner`}>
        <Link href={viewMoreLink || `/category/${slug}`} className="hover:underline">
          {title}
        </Link>
      </div>

      {/* List of Links */}
      <ul className="divide-y divide-gray-100 p-2 text-xs md:text-sm flex-1">
        {items.length === 0 ? (
          <li className="py-3 text-center text-gray-500 italic">No updates available right now.</li>
        ) : (
          items.map((job) => (
            <li key={job.id} className="py-2 px-1 flex items-start gap-1.5 hover:bg-gray-50 transition-colors">
              <span className="text-red-700 font-bold select-none">•</span>
              <div className="flex-1">
                <Link
                  href={`/job/${job.slug}`}
                  className="text-blue-900 font-medium hover:text-red-700 hover:underline leading-snug"
                >
                  {job.title}
                </Link>
                {job.is_featured && (
                  <span className="ml-1.5 bg-red-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                    New
                  </span>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* View More Link at bottom */}
      <div className="bg-gray-100 border-t border-gray-200 py-2 px-3 text-right">
        <Link
          href={viewMoreLink || `/category/${slug}`}
          className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline"
        >
          View More {title} »
        </Link>
      </div>
    </div>
  );
}
