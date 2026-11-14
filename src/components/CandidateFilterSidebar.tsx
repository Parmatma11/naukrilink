'use client';

import React from 'react';
import { CandidateFilterState } from '@/types';
import { SlidersHorizontal, RotateCcw, CheckCircle2, UserCheck, Sparkles, Briefcase, GraduationCap, Calendar, Building2 } from 'lucide-react';

interface CandidateFilterSidebarProps {
  filters: CandidateFilterState;
  onChange: (filters: CandidateFilterState) => void;
  onReset: () => void;
  isSavedInStorage: boolean;
  totalMatches: number;
  totalJobs: number;
  className?: string;
}

export const INITIAL_FILTERS: CandidateFilterState = {
  age: '',
  qualification: 'all',
  sector: 'all',
  categoryType: 'all',
  experience: 'all',
};

export default function CandidateFilterSidebar({
  filters,
  onChange,
  onReset,
  isSavedInStorage,
  totalMatches,
  totalJobs,
  className = '',
}: CandidateFilterSidebarProps) {
  const activeCount = [
    filters.age !== '' ? 1 : 0,
    filters.qualification !== 'all' ? 1 : 0,
    filters.sector !== 'all' ? 1 : 0,
    filters.categoryType !== 'all' ? 1 : 0,
    filters.experience !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const updateField = <K extends keyof CandidateFilterState>(
    field: K,
    value: CandidateFilterState[K]
  ) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className={`bg-white border-2 border-red-700 shadow-md rounded-sm overflow-hidden text-xs md:text-sm ${className}`}>
      {/* Header Banner */}
      <div className="bg-[#8b0000] text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-300" />
          <h3 className="font-extrabold uppercase tracking-wide text-xs md:text-sm">
            Candidate Job Filter
          </h3>
        </div>
        {activeCount > 0 && (
          <span className="bg-amber-400 text-red-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow-xs">
            {activeCount} Active
          </span>
        )}
      </div>

      {/* Persistence Status & Match Counter */}
      <div className="bg-amber-50/80 px-3 py-2 border-b border-amber-200 flex items-center justify-between text-[11px] text-gray-700">
        <div className="flex items-center gap-1 font-semibold text-gray-800">
          {isSavedInStorage ? (
            <span className="flex items-center gap-1 text-green-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved on Device
            </span>
          ) : (
            <span className="flex items-center gap-1 text-gray-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Auto-saved in browser
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-red-700 hover:text-red-900 font-bold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <div className="p-3.5 space-y-4">
        {/* 1. Candidate Age Filter */}
        <div>
          <label className="font-extrabold text-[#8b0000] uppercase text-xs flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-700" />
            Your Age (Years)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="14"
              max="65"
              placeholder="e.g. 24"
              value={filters.age}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                updateField('age', val);
              }}
              className="w-full border-2 border-gray-300 focus:border-red-700 focus:outline-hidden p-1.5 rounded-xs text-xs font-bold text-gray-900"
            />
            {filters.age !== '' && (
              <button
                type="button"
                onClick={() => updateField('age', '')}
                className="text-gray-400 hover:text-red-700 font-bold text-xs px-1.5 py-1"
                title="Clear age"
              >
                ✕
              </button>
            )}
          </div>
          {/* Quick Age Buttons */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {[18, 21, 24, 27, 30, 35].map((presetAge) => (
              <button
                key={presetAge}
                type="button"
                onClick={() => updateField('age', filters.age === presetAge ? '' : presetAge)}
                className={`text-[11px] px-2 py-0.5 rounded-xs border font-semibold transition-colors ${
                  filters.age === presetAge
                    ? 'bg-red-700 text-white border-red-700 font-bold shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                }`}
              >
                {presetAge} Yr
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-1 italic">
            Filters jobs where your age satisfies minimum and maximum limits.
          </p>
        </div>

        {/* 2. Qualification Filter */}
        <div className="border-t border-gray-200 pt-3">
          <label className="font-extrabold text-[#8b0000] uppercase text-xs flex items-center gap-1.5 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-red-700" />
            Qualification / Education
          </label>
          <select
            value={filters.qualification}
            onChange={(e) => updateField('qualification', e.target.value)}
            className="w-full border-2 border-gray-300 focus:border-red-700 focus:outline-hidden p-1.5 rounded-xs text-xs font-semibold text-gray-800 bg-white"
          >
            <option value="all">All Qualifications</option>
            <option value="10th">10th Pass (Matric / High School)</option>
            <option value="12th">12th Pass (Intermediate / 10+2)</option>
            <option value="graduate">Graduate / Degree (BA, BSc, BCom)</option>
            <option value="post_graduate">Post Graduate / Master&apos;s (MA, MSc, MBA)</option>
            <option value="diploma_iti">Diploma / ITI / Polytechnic</option>
            <option value="engineering">Engineering (B.Tech / B.E)</option>
            <option value="teaching">Teaching (B.Ed / D.El.Ed / TET)</option>
            <option value="medical">Medical / Nursing / Pharmacy</option>
          </select>
        </div>

        {/* 3. Job Sector / Department */}
        <div className="border-t border-gray-200 pt-3">
          <label className="font-extrabold text-[#8b0000] uppercase text-xs flex items-center gap-1.5 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-red-700" />
            Sector / Department
          </label>
          <select
            value={filters.sector}
            onChange={(e) => updateField('sector', e.target.value)}
            className="w-full border-2 border-gray-300 focus:border-red-700 focus:outline-hidden p-1.5 rounded-xs text-xs font-semibold text-gray-800 bg-white"
          >
            <option value="all">All Sectors &amp; Departments</option>
            <option value="railway">Railway (RRB / RRC)</option>
            <option value="ssc">SSC (CGL, CHSL, MTS, GD)</option>
            <option value="upsc">UPSC / Civil Services</option>
            <option value="defence_police">Defence / Police / Army</option>
            <option value="banking">Banking &amp; Insurance (IBPS, SBI, PNB)</option>
            <option value="teaching">Teaching / University</option>
            <option value="state_gov">State Govt (UP, Bihar, MP, Rajasthan)</option>
          </select>
        </div>

        {/* 4. Category Type (Latest Jobs, Results, Admit Card) */}
        <div className="border-t border-gray-200 pt-3">
          <label className="font-extrabold text-[#8b0000] uppercase text-xs flex items-center gap-1.5 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-red-700" />
            Notice Type
          </label>
          <select
            value={filters.categoryType}
            onChange={(e) => updateField('categoryType', e.target.value)}
            className="w-full border-2 border-gray-300 focus:border-red-700 focus:outline-hidden p-1.5 rounded-xs text-xs font-semibold text-gray-800 bg-white"
          >
            <option value="all">All Types (Jobs, Results, Admit Card)</option>
            <option value="latest-jobs">Latest Jobs / Online Forms</option>
            <option value="results">Results / Score Cards</option>
            <option value="admit-card">Admit Cards / Hall Tickets</option>
            <option value="answer-key">Answer Keys</option>
            <option value="admission">Admission Notices</option>
          </select>
        </div>

        {/* 5. Experience Preference */}
        <div className="border-t border-gray-200 pt-3">
          <label className="font-extrabold text-[#8b0000] uppercase text-xs flex items-center gap-1.5 mb-1.5">
            <UserCheck className="w-3.5 h-3.5 text-red-700" />
            Experience Preference
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('experience', 'all')}
              className={`flex-1 py-1 px-2 rounded-xs border text-xs font-bold transition-colors ${
                filters.experience === 'all'
                  ? 'bg-[#8b0000] text-white border-red-900'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => updateField('experience', filters.experience === 'fresher' ? 'all' : 'fresher')}
              className={`flex-1 py-1 px-2 rounded-xs border text-xs font-bold transition-colors ${
                filters.experience === 'fresher'
                  ? 'bg-green-700 text-white border-green-800'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Fresher Friendly
            </button>
          </div>
        </div>

        {/* Match Result Banner */}
        <div className="bg-gray-100 p-2.5 rounded-xs border border-gray-200 text-center">
          <div className="text-xs text-gray-600">Matching Notifications:</div>
          <div className="text-lg font-black text-red-700">
            {totalMatches} <span className="text-xs font-normal text-gray-500">/ {totalJobs} Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
