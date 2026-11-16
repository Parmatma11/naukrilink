import { Metadata } from 'next';
import { getCachedHomeData } from '@/lib/data';
import Ticker from '@/components/Ticker';
import QuickLinksGrid from '@/components/QuickLinksGrid';
import HomeGridClient from '@/components/HomeGridClient';

// Enable ISR (5 minutes background revalidation)
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Govt Job 2026 : GovtJob.site Website for Latest Jobs, Results, Admit Card',
  description: 'Govt Job 2026: Get latest government jobs, online application forms, admit cards, exam results, answer keys for Railway, SSC, UPSC, Bank, Police, UPPSC, Defence, and State govt exams.',
  keywords: [
    'Govt Job',
    'Govt Job 2026',
    'Govt Jobs Portal',
    'Government Jobs',
    'Latest Jobs',
    'Admit Card',
    'Govt Exam Results',
    'Online Application Form',
    'Railway Recruitment 2026',
    'SSC CGL 2026',
    'UPSC Exam',
    'UPSSSC'
  ],
  alternates: {
    canonical: 'https://www.govtjob.site/',
  },
  openGraph: {
    title: 'Govt Job 2026 : Official Portal for Latest Govt Jobs, Results & Admit Cards',
    description: 'Find all latest government recruitment notifications, online forms, admit cards, answer keys and syllabus at one place.',
    type: 'website',
    locale: 'en_IN',
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  // High-performance cached fetch (parallel queries + trimmed payload)
  const { categories, jobsByCategory, alerts } = await getCachedHomeData();

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Govt Job 2026',
    url: 'https://www.govtjob.site/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.govtjob.site/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    description: 'Official portal for Govt Job Results, Admit Cards, and Latest Jobs in India.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Marquee Ticker */}
      <Ticker alerts={alerts} />

      {/* Iconic Quick Category Color Blocks */}
      <QuickLinksGrid />

      {/* Hero Welcome Announcement */}
      <div className="max-w-7xl mx-auto px-4 mt-2 mb-4">
        <div className="bg-amber-50 border-2 border-red-800 p-3 text-center rounded-sm">
          <h2 className="text-base md:text-xl font-extrabold text-red-800 tracking-wide">
            Govt Job : GovtJob.site Official Website for Latest Jobs, Online Forms &amp; Results
          </h2>
          <p className="text-xs md:text-sm font-medium text-gray-700 mt-1">
            Get all notifications for Central Government (SSC, UPSC, Railway, Defence) &amp; State Level (UP, Bihar, MP, Rajasthan, Delhi) examinations.
          </p>
        </div>
      </div>

      {/* Multi-Column Main Layout with Integrated Live Search */}
      <HomeGridClient
        categories={categories}
        jobsByCategory={jobsByCategory}
        initialQuery={q || ''}
      />
    </>
  );
}
