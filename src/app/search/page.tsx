import { Metadata } from 'next';
import Link from 'next/link';
import { searchJobsCached } from '@/lib/data';
import SearchBar from '@/components/SearchBar';
import { ArrowRight, Search, FileText } from 'lucide-react';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const searchQuery = (q || '').trim();
  return {
    title: searchQuery ? `Search Results for "${searchQuery}" - Sarkari Result 2026` : 'Search Government Jobs & Results 2026',
    description: `Search all latest Sarkari Result recruitment notices, admit cards, answer keys and results for ${searchQuery}.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const queryStr = (q || '').trim();
  const results = queryStr ? await searchJobsCached(queryStr) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">Search Jobs &amp; Results</span>
      </nav>

      {/* Search Header Banner */}
      <div className="bg-[#8b0000] text-white p-4 text-center rounded-t-sm shadow-md">
        <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide flex items-center justify-center gap-2">
          <Search className="w-5 h-5 text-amber-300" />
          Search Sarkari Results &amp; Jobs 2026
        </h1>
        <p className="text-xs text-amber-200 mt-1 font-medium">
          Find notifications, admit cards, answer keys, and exam forms instantly
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white border-x-2 border-b-2 border-red-700 p-4 shadow-sm mb-6">
        <SearchBar initialValue={queryStr} autoFocus />

        {/* Popular Search Suggestions */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500 font-medium mr-2">Quick Searches:</span>
          <div className="inline-flex flex-wrap gap-1.5 justify-center mt-1">
            {['Railway NTPC', 'SSC CGL', 'UPSC', 'UPPSC RO ARO', 'Police Constable', 'Teacher TET', 'Admit Card 2026'].map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-700 border border-gray-300 px-2.5 py-0.5 rounded-xs font-semibold text-gray-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {queryStr ? (
        <div className="bg-white border-2 border-gray-300 shadow-md rounded-sm overflow-hidden">
          <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-300 flex items-center justify-between text-xs md:text-sm font-bold text-gray-800">
            <span>
              Found {results.length} results matching: &quot;<span className="text-red-700">{queryStr}</span>&quot;
            </span>
            <Link href="/" className="text-red-700 hover:underline text-xs">
              « Back to Homepage
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-base text-gray-800">No matching notifications found.</p>
              <p className="text-xs text-gray-500 mt-1">
                Please check the spelling or try searching with simpler words like &quot;SSC&quot;, &quot;Railway&quot;, or &quot;UPPSC&quot;.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 hover:bg-amber-50/50 transition-colors flex items-start justify-between gap-3 text-xs md:text-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase">
                        {job.category_name}
                      </span>
                      {job.post_date && (
                        <span className="text-gray-400 text-[11px] font-medium">
                          {job.post_date}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/job/${job.slug}`}
                      className="text-blue-900 hover:text-red-700 font-bold text-sm md:text-base hover:underline block leading-snug"
                    >
                      {job.title}
                    </Link>
                    {job.short_info && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                        {job.short_info}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/job/${job.slug}`}
                    className="shrink-0 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-xs flex items-center gap-1 shadow-xs transition-colors mt-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 p-8 text-center text-gray-500 text-xs md:text-sm rounded-sm">
          Please enter an exam name, department, or job keyword above to search.
        </div>
      )}
    </div>
  );
}
