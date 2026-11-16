'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  onSearch,
  initialValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const [term, setTerm] = useState(initialValue);
  const router = useRouter();

  useEffect(() => {
    setTerm(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTerm(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(term);
    }
    if (term.trim()) {
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleClear = () => {
    setTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 my-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={term}
          onChange={handleChange}
          autoFocus={autoFocus}
          placeholder="Search jobs, admit cards, exams (e.g. SSC, Railway)..."
          className="w-full pl-10 pr-24 py-2.5 text-sm border-2 border-red-700 rounded-xs focus:outline-none focus:ring-2 focus:ring-red-600 bg-white shadow-inner font-medium text-gray-900 placeholder-gray-500"
        />
        <Search className="w-5 h-5 text-red-700 absolute left-3 pointer-events-none" />

        <div className="absolute right-2 flex items-center gap-1">
          {term && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded-xs transition-colors shadow-xs"
          >
            SEARCH
          </button>
        </div>
      </form>
    </div>
  );
}
