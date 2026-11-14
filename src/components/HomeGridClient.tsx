'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ColumnBox from '@/components/ColumnBox';
import SearchBar from '@/components/SearchBar';
import { Job, Category } from '@/types';
import { Search, ArrowRight, X } from 'lucide-react';

interface HomeGridClientProps {
  categories: Category[];
  jobsByCategory: Record<string, Job[]>;
  initialQuery?: string;
}

export default function HomeGridClient({
  categories,
  jobsByCategory,
  initialQuery = '',
}: HomeGridClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Robust multi-word search algorithm
  const matchJob = (job: Job, words: string[]) => {
    const haystack = `${job.title} ${job.department || ''} ${job.short_info || ''} ${job.category_name || ''}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  };

  // Filtered jobs grouped by category
  const filteredJobsByCategory = useMemo(() => {
    if (!searchQuery.trim()) return jobsByCategory;

    const words = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const result: Record<string, Job[]> = {};

    for (const [slug, list] of Object.entries(jobsByCategory)) {
      result[slug] = list.filter((job) => matchJob(job, words));
    }
    return result;
  }, [jobsByCategory, searchQuery]);

  // All matching jobs flattened for unified search view
  const allMatchingJobs = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const words = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const allJobs = Object.values(jobsByCategory).flat();
    const seen = new Set<number>();
    const matches: Job[] = [];

    for (const job of allJobs) {
      if (!seen.has(job.id) && matchJob(job, words)) {
        seen.add(job.id);
        matches.push(job);
      }
    }
    return matches;
  }, [jobsByCategory, searchQuery]);

  // Primary 3 columns
  const resultsJobs = filteredJobsByCategory['results'] || [];
  const admitCardJobs = filteredJobsByCategory['admit-card'] || [];
  const latestJobs = filteredJobsByCategory['latest-jobs'] || [];

  // Secondary categories
  const answerKeyJobs = filteredJobsByCategory['answer-key'] || [];
  const syllabusJobs = filteredJobsByCategory['syllabus'] || [];
  const admissionJobs = filteredJobsByCategory['admission'] || [];
  const certJobs = filteredJobsByCategory['certificate-verification'] || [];
  const importantJobs = filteredJobsByCategory['important'] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Live Search Input */}
      <SearchBar onSearch={setSearchQuery} initialValue={searchQuery} />

      {/* DEDICATED SEARCH RESULTS PANEL (ACTIVE WHEN SEARCHING) */}
      {searchQuery.trim() && (
        <div className="my-6 bg-white border-2 border-red-700 rounded-sm shadow-md overflow-hidden animate-in fade-in duration-200">
          <div className="bg-[#8b0000] text-white px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-sm md:text-base">
              <Search className="w-4 h-4 text-amber-300" />
              <span>
                Search Results: Found {allMatchingJobs.length} updates for &quot;{searchQuery}&quot;
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs bg-red-900 hover:bg-red-950 text-white font-bold px-2.5 py-1 rounded-xs flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear Filter
            </button>
          </div>

          {allMatchingJobs.length === 0 ? (
            <div className="p-8 text-center bg-gray-50">
              <p className="text-gray-700 font-bold text-base mb-2">
                No matching jobs found for &quot;{searchQuery}&quot;.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Try searching with popular keywords like:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Railway', 'SSC CGL', 'UPSC', 'Police', 'UPPSC', 'Teacher', 'Admit Card'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="bg-white border border-gray-300 hover:border-red-700 hover:text-red-700 text-xs font-semibold px-3 py-1 rounded-xs transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {allMatchingJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 hover:bg-amber-50/50 transition-colors flex items-center justify-between gap-3 text-xs md:text-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase">
                        {job.category_name || 'Notice'}
                      </span>
                      {job.post_date && (
                        <span className="text-gray-400 text-[11px] font-medium">
                          {job.post_date}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/job/${job.slug}`}
                      className="text-blue-900 hover:text-red-700 font-bold hover:underline block leading-snug"
                    >
                      {job.title}
                    </Link>
                  </div>
                  <Link
                    href={`/job/${job.slug}`}
                    className="shrink-0 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-xs flex items-center gap-1 shadow-xs transition-colors"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* THE FAMOUS 3-COLUMN SARKARI RESULT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <ColumnBox
          title="Result"
          slug="results"
          headerColor="bg-[#b91c1c]"
          items={resultsJobs}
        />
        <ColumnBox
          title="Admit Card"
          slug="admit-card"
          headerColor="bg-[#1e40af]"
          items={admitCardJobs}
        />
        <ColumnBox
          title="Latest Jobs"
          slug="latest-jobs"
          headerColor="bg-[#047857]"
          items={latestJobs}
        />
      </div>

      {/* SECONDARY SARKARI SECTION: Answer Key, Syllabus, Admission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <ColumnBox
          title="Answer Key"
          slug="answer-key"
          headerColor="bg-[#7c2d12]"
          items={answerKeyJobs}
        />
        <ColumnBox
          title="Syllabus"
          slug="syllabus"
          headerColor="bg-[#4c1d95]"
          items={syllabusJobs}
        />
        <ColumnBox
          title="Admission"
          slug="admission"
          headerColor="bg-[#0e7490]"
          items={admissionJobs}
        />
      </div>

      {/* ADDITIONAL SECTIONS: Certificate Verification & Important */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <ColumnBox
          title="Certificate Verification"
          slug="certificate-verification"
          headerColor="bg-[#b45309]"
          items={certJobs}
        />
        <ColumnBox
          title="Important Links"
          slug="important"
          headerColor="bg-[#374151]"
          items={importantJobs}
        />
      </div>
    </div>
  );
}
