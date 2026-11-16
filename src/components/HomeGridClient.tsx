'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ColumnBox from '@/components/ColumnBox';
import SearchBar from '@/components/SearchBar';
import CandidateFilterSidebar, { INITIAL_FILTERS } from '@/components/CandidateFilterSidebar';
import { matchesCandidateFilters } from '@/lib/filterUtils';
import { Job, Category, CandidateFilterState } from '@/types';
import { Search, ArrowRight, X, SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';

const STORAGE_KEY = 'govt_job_candidate_preferences_v1';

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
  const [filters, setFilters] = useState<CandidateFilterState>(INITIAL_FILTERS);
  const [isSavedInStorage, setIsSavedInStorage] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync initial search query
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Load candidate filter preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sarkari_candidate_preferences_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setFilters(parsed);
          setIsSavedInStorage(true);
        }
      }
    } catch (e) {
      console.warn('Failed to load candidate preferences from localStorage', e);
    }
  }, []);

  // Save to localStorage whenever filters change
  const handleFiltersChange = (newFilters: CandidateFilterState) => {
    setFilters(newFilters);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFilters));
      setIsSavedInStorage(true);
    } catch (e) {
      console.warn('Failed to save candidate preferences to localStorage', e);
    }
  };

  // Reset filters and clear localStorage
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setIsSavedInStorage(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return (
      filters.age !== '' ||
      filters.qualification !== 'all' ||
      filters.sector !== 'all' ||
      filters.categoryType !== 'all' ||
      filters.experience !== 'all'
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.age !== '') count++;
    if (filters.qualification !== 'all') count++;
    if (filters.sector !== 'all') count++;
    if (filters.categoryType !== 'all') count++;
    if (filters.experience !== 'all') count++;
    return count;
  }, [filters]);

  const searchWords = useMemo(() => {
    return searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }, [searchQuery]);

  // Total jobs count across all categories
  const allJobsFlat = useMemo(() => {
    const list = Object.values(jobsByCategory).flat();
    const seen = new Set<number>();
    const unique: Job[] = [];
    for (const j of list) {
      if (!seen.has(j.id)) {
        seen.add(j.id);
        unique.push(j);
      }
    }
    return unique;
  }, [jobsByCategory]);

  // Filtered jobs grouped by category
  const filteredJobsByCategory = useMemo(() => {
    const result: Record<string, Job[]> = {};

    for (const [slug, list] of Object.entries(jobsByCategory)) {
      result[slug] = list.filter((job) =>
        matchesCandidateFilters(job, filters, searchWords)
      );
    }
    return result;
  }, [jobsByCategory, filters, searchWords]);

  // All matching jobs flattened for unified search/filter view
  const allMatchingJobs = useMemo(() => {
    return allJobsFlat.filter((job) =>
      matchesCandidateFilters(job, filters, searchWords)
    );
  }, [allJobsFlat, filters, searchWords]);

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
      {/* MOBILE FILTER TOGGLE BUTTON */}
      <div className="lg:hidden mb-3">
        <button
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full bg-[#8b0000] hover:bg-[#6b0000] text-white font-extrabold text-xs md:text-sm py-2 px-3 rounded-xs shadow-md flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-300" />
            Candidate Job Filter (Age, Qualification, Sector)
          </span>
          {activeFilterCount > 0 ? (
            <span className="bg-amber-400 text-red-950 font-black text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount} Active
            </span>
          ) : (
            <span className="text-amber-200 text-xs font-semibold">
              {showMobileFilters ? 'Hide ▲' : 'Filter ▼'}
            </span>
          )}
        </button>

        {showMobileFilters && (
          <div className="mt-2">
            <CandidateFilterSidebar
              filters={filters}
              onChange={handleFiltersChange}
              onReset={handleResetFilters}
              isSavedInStorage={isSavedInStorage}
              totalMatches={allMatchingJobs.length}
              totalJobs={allJobsFlat.length}
            />
          </div>
        )}
      </div>

      {/* TWO-COLUMN LAYOUT: LEFT SIDEBAR + MAIN GRID */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* DESKTOP LEFT FILTER SIDEBAR (STICKY) */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-4">
          <CandidateFilterSidebar
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            isSavedInStorage={isSavedInStorage}
            totalMatches={allMatchingJobs.length}
            totalJobs={allJobsFlat.length}
          />
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 w-full">
          {/* Live Search Input */}
          <SearchBar onSearch={setSearchQuery} initialValue={searchQuery} />

          {/* ACTIVE FILTER STATUS PILL BAR */}
          {isFilterActive && (
            <div className="mt-3 bg-amber-50 border-2 border-amber-300 p-2.5 rounded-xs flex items-center justify-between flex-wrap gap-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-red-800 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filters Active:
                </span>
                {filters.age !== '' && (
                  <span className="bg-white border border-amber-400 text-gray-800 font-bold px-2 py-0.5 rounded-xs">
                    Age: {filters.age} Yrs
                  </span>
                )}
                {filters.qualification !== 'all' && (
                  <span className="bg-white border border-amber-400 text-gray-800 font-bold px-2 py-0.5 rounded-xs capitalize">
                    Edu: {filters.qualification.replace('_', ' ')}
                  </span>
                )}
                {filters.sector !== 'all' && (
                  <span className="bg-white border border-amber-400 text-gray-800 font-bold px-2 py-0.5 rounded-xs capitalize">
                    Sector: {filters.sector.replace('_', ' ')}
                  </span>
                )}
                {filters.categoryType !== 'all' && (
                  <span className="bg-white border border-amber-400 text-gray-800 font-bold px-2 py-0.5 rounded-xs capitalize">
                    Type: {filters.categoryType.replace('-', ' ')}
                  </span>
                )}
                {filters.experience === 'fresher' && (
                  <span className="bg-green-100 border border-green-400 text-green-900 font-bold px-2 py-0.5 rounded-xs">
                    Fresher Friendly
                  </span>
                )}
                <span className="text-gray-500 font-medium ml-1">
                  ({allMatchingJobs.length} jobs matched)
                </span>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-2.5 py-1 rounded-xs flex items-center gap-1 text-[11px] transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" /> Clear All Filters
              </button>
            </div>
          )}

          {/* DEDICATED SEARCH / FILTER RESULTS PANEL (WHEN SEARCH OR FILTER IS ACTIVE) */}
          {(searchQuery.trim() || isFilterActive) && (
            <div className="my-4 bg-white border-2 border-red-700 rounded-sm shadow-md overflow-hidden animate-in fade-in duration-200">
              <div className="bg-[#8b0000] text-white px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-xs md:text-sm">
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>
                    Matching Opportunities: Found {allMatchingJobs.length} of {allJobsFlat.length} notifications
                  </span>
                </div>
                <div className="flex gap-2">
                  {searchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs bg-red-900 hover:bg-red-950 text-white font-bold px-2 py-0.5 rounded-xs flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear Query
                    </button>
                  )}
                  {isFilterActive && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs bg-amber-400 hover:bg-amber-300 text-red-950 font-extrabold px-2 py-0.5 rounded-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {allMatchingJobs.length === 0 ? (
                <div className="p-8 text-center bg-gray-50">
                  <p className="text-gray-700 font-bold text-base mb-1">
                    No notifications match your current filter combination.
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Try adjusting your age limit or choosing &quot;All Qualifications&quot; to see more posts.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs px-4 py-2 rounded-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Candidate Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto">
                  {allMatchingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 hover:bg-amber-50/50 transition-colors flex items-center justify-between gap-3 text-xs md:text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase">
                            {job.category_name || 'Notice'}
                          </span>
                          {job.post_date && (
                            <span className="text-gray-400 text-[11px] font-medium">
                              {job.post_date}
                            </span>
                          )}
                          {job.age_limit?.max_age && (
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-xs">
                              Max Age: {job.age_limit.max_age}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/job/${job.slug}`}
                          className="text-blue-900 hover:text-red-700 font-bold hover:underline block leading-snug truncate"
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

          {/* THE FAMOUS 3-COLUMN GOVT JOB SECTION (Latest Jobs is First Column) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <ColumnBox
              title="Latest Jobs"
              slug="latest-jobs"
              headerColor="bg-[#047857]"
              items={latestJobs}
            />
            <ColumnBox
              title="Admit Card"
              slug="admit-card"
              headerColor="bg-[#1e40af]"
              items={admitCardJobs}
            />
            <ColumnBox
              title="Result"
              slug="results"
              headerColor="bg-[#b91c1c]"
              items={resultsJobs}
            />
          </div>

          {/* SECONDARY GOVT JOB SECTION: Answer Key, Syllabus, Admission */}
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
        </main>
      </div>
    </div>
  );
}
