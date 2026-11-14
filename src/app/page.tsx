import { Metadata } from 'next';
import pool from '@/lib/db';
import { Category, Job, TickerAlert } from '@/types';
import Ticker from '@/components/Ticker';
import QuickLinksGrid from '@/components/QuickLinksGrid';
import HomeGridClient from '@/components/HomeGridClient';

export const metadata: Metadata = {
  title: 'Sarkari Result 2026 : SarkariResult.Com Official Website for Latest Jobs, Results, Admit Card',
  description: 'Sarkari Result 2026: Get latest Sarkari Result jobs, online application forms, admit cards, exam results, answer keys for Railway, SSC, UPSC, Bank, Police, UPPSC, Defence, and State govt exams.',
  keywords: [
    'Sarkari Result',
    'Sarkari Result 2026',
    'Sarkari Naukri',
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
    canonical: 'https://www.sarkariresult.com/',
  },
  openGraph: {
    title: 'Sarkari Result 2026 : Official Portal for Latest Govt Jobs, Results & Admit Cards',
    description: 'Find all latest government recruitment notifications, online forms, admit cards, answer keys and syllabus at one place.',
    type: 'website',
    locale: 'en_IN',
  },
};

async function getHomeData() {
  const client = await pool.connect();
  try {
    // 1. Fetch categories
    const categoriesRes = await client.query<Category>(
      'SELECT * FROM categories ORDER BY order_index ASC'
    );
    const categories = categoriesRes.rows;

    // 2. Fetch jobs
    const jobsRes = await client.query<Job>(
      `SELECT j.*, c.name as category_name, c.slug as category_slug, c.color_code as category_color 
       FROM jobs j 
       JOIN categories c ON j.category_id = c.id 
       ORDER BY j.id DESC`
    );

    // Group jobs by category slug
    const jobsByCategory: Record<string, Job[]> = {};
    for (const cat of categories) {
      jobsByCategory[cat.slug] = [];
    }

    for (const job of jobsRes.rows) {
      if (job.category_slug) {
        if (!jobsByCategory[job.category_slug]) {
          jobsByCategory[job.category_slug] = [];
        }
        jobsByCategory[job.category_slug].push(job);
      }
    }

    // 3. Fetch ticker alerts
    const alertsRes = await client.query<TickerAlert>(
      'SELECT * FROM ticker_alerts WHERE is_active = true ORDER BY id DESC LIMIT 10'
    );
    const alerts = alertsRes.rows;

    return { categories, jobsByCategory, alerts };
  } catch (err) {
    console.error('Error fetching home data:', err);
    return { categories: [], jobsByCategory: {}, alerts: [] };
  } finally {
    client.release();
  }
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const { categories, jobsByCategory, alerts } = await getHomeData();

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sarkari Result 2026',
    url: 'https://www.sarkariresult.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.sarkariresult.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    description: 'Official portal for Sarkari Results, Admit Cards, and Latest Jobs in India.',
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
            Sarkari Result : SarkariResult.Com Official Website for Latest Jobs, Online Forms &amp; Results
          </h2>
          <p className="text-xs md:text-sm font-medium text-gray-700 mt-1">
            Get 100% authenticated notifications for Central Government (SSC, UPSC, Railway, Defence) &amp; State Level (UP, Bihar, MP, Rajasthan, Delhi) examinations.
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
