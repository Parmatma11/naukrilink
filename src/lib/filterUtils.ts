import { Job, CandidateFilterState } from '@/types';

export function parseAge(val?: string | number): number | null {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return val;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export const QUALIFICATION_PATTERNS: Record<string, RegExp> = {
  '10th': /\b(10th|matric|high school|sslc|class 10|matriculation)\b/i,
  '12th': /\b(12th|intermediate|10\+2|hsc|class 12|senior secondary|inter)\b/i,
  'graduate': /\b(graduate|graduation|bachelor|degree|b\.?a|b\.?sc|b\.?com|b\.?tech|b\.?e|llb|bca|bba|mbbs)\b/i,
  'post_graduate': /\b(post graduate|post graduation|master|m\.?a|m\.?sc|m\.?com|m\.?tech|ph\.?d|llm|mca|mba|pg degree)\b/i,
  'diploma_iti': /\b(diploma|iti|polytechnic|ncvt|scvt)\b/i,
  'engineering': /\b(engineering|engineer|b\.?tech|b\.?e|polytechnic|junior engineer|je)\b/i,
  'teaching': /\b(b\.?ed|d\.?el\.?ed|tet|ctet|teacher|prt|tgt|pgt|professor|lecturer)\b/i,
  'medical': /\b(mbbs|bds|nursing|anm|gnm|pharmacist|pharma|medical|ayush)\b/i,
};

export const SECTOR_PATTERNS: Record<string, RegExp> = {
  'railway': /\b(railway|rrb|rrc)\b/i,
  'ssc': /\b(ssc|cgl|chsl|mts|cpo|gd constable|steno|je)\b/i,
  'upsc': /\b(upsc|ias|ips|ifs|nda|cds|civil services|epfo)\b/i,
  'defence_police': /\b(police|army|navy|air force|airforce|defence|crpf|bsf|cisf|itbp|ssb|constable|sub inspector|si|commandant)\b/i,
  'banking': /\b(bank|ibps|sbi|rbi|pnb|bob|nabard|insurance|lic|uiic|niacl|nicl)\b/i,
  'teaching': /\b(teacher|education|tet|ctet|tgt|pgt|prt|kvs|nvs|dsssb|university|school|professor)\b/i,
  'state_gov': /\b(up |uttar pradesh|uppsc|upsssc|bihar|bpsc|bssc|rajasthan|rpsc|rsmssb|mp |mppsc|haryana|hpsc|delhi|dsssb|jharkhand|jpsc)\b/i,
};

export function matchesCandidateFilters(job: Job, filters: CandidateFilterState, searchWords: string[] = []): boolean {
  // 1. Text Search (multi-word matching)
  if (searchWords.length > 0) {
    const haystack = `${job.title} ${job.department || ''} ${job.short_info || ''} ${job.category_name || ''}`.toLowerCase();
    const matchesSearch = searchWords.every((word) => haystack.includes(word));
    if (!matchesSearch) return false;
  }

  // 2. Category Type Filter
  if (filters.categoryType && filters.categoryType !== 'all') {
    if (job.category_slug !== filters.categoryType) {
      return false;
    }
  }

  // 3. Candidate Age Filter
  if (filters.age !== '' && typeof filters.age === 'number') {
    const candAge = filters.age;
    const minAge = parseAge(job.age_limit?.min_age);
    const maxAge = parseAge(job.age_limit?.max_age);

    // If job specifies min age and candidate is younger, reject
    if (minAge !== null && candAge < minAge) {
      return false;
    }
    // If job specifies max age and candidate is older, reject
    if (maxAge !== null && candAge > maxAge) {
      return false;
    }
  }

  // Combine full text of job for deep semantic filtering
  const vacancyText = Array.isArray(job.vacancy_details)
    ? job.vacancy_details.map((v) => `${v.post_name} ${v.eligibility}`).join(' ')
    : '';
  const fullJobText = `${job.title} ${job.department || ''} ${job.short_info || ''} ${vacancyText}`;

  // 4. Qualification Filter
  if (filters.qualification && filters.qualification !== 'all') {
    const pattern = QUALIFICATION_PATTERNS[filters.qualification];
    if (pattern && !pattern.test(fullJobText)) {
      return false;
    }
  }

  // 5. Sector Filter
  if (filters.sector && filters.sector !== 'all') {
    const pattern = SECTOR_PATTERNS[filters.sector];
    if (pattern && !pattern.test(fullJobText)) {
      return false;
    }
  }

  // 6. Experience Filter (Fresher Friendly)
  if (filters.experience === 'fresher') {
    const requiresExpPattern = /\b([2-9]|\d{2})\s*(years?|yrs?)\s*(of\s*)?experience\b/i;
    if (requiresExpPattern.test(fullJobText) && !/\b(no experience|fresher|fresher can apply)\b/i.test(fullJobText)) {
      return false;
    }
  }

  return true;
}
