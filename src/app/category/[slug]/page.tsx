import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCachedCategoryData, getAllCategorySlugs } from '@/lib/data';

// Next.js ISR: Revalidate category listings every 10 minutes
export const revalidate = 600;

// Pre-render all category pages at build time
export async function generateStaticParams() {
  return await getAllCategorySlugs();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCachedCategoryData(slug);

  if (!data) return { title: 'Category Not Found' };

  const title = `${data.category.name} 2026 : Govt Job Latest Updates`;
  const latest = data.jobs.slice(0, 2).map((j) => j.title).join('; ');
  const description = `${data.jobs.length} ${data.category.name} updates for 2026${latest ? `, latest: ${latest}` : ''}. Notifications, dates and direct links.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.govtjob.site/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCachedCategoryData(slug);

  if (!data) notFound();

  const { category, jobs } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-red-700 font-semibold">Home</Link>
        <span>&raquo;</span>
        <span className="text-gray-900 font-bold">{category.name}</span>
      </nav>

      {/* Category Header with Circular Logo */}
      <div className="bg-[#8b0000] text-white p-4 text-center rounded-t-sm shadow-md">
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <Image
            src="/logo.svg"
            alt="Govt Job Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-amber-300 bg-white shrink-0"
          />
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide">
            {category.name} 2026
          </h1>
        </div>
        <p className="text-xs text-amber-200 mt-1 font-medium">
          Showing all {jobs.length} latest updates and official notices
        </p>
        <p className="text-xs text-white/90 mt-2 max-w-3xl mx-auto leading-relaxed">
          This page lists every {category.name} update we track in 2026 — new notifications,
          application start and last dates, and direct links to official sources. Open any entry
          for eligibility, fees and age limit details.
        </p>
      </div>

      {/* List */}
      <div className="bg-white border-2 border-red-700 shadow-md divide-y divide-gray-200">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">No posts found in this category.</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-2.5">
              <span className="text-red-700 font-bold text-sm mt-0.5">•</span>
              <div className="flex-1">
                <Link
                  href={`/job/${job.slug}`}
                  className="text-blue-900 font-bold text-sm md:text-base hover:text-red-700 hover:underline leading-tight"
                >
                  {job.title}
                </Link>
                <div className="text-xs text-gray-500 mt-1 flex gap-4">
                  <span>Posted: {job.post_date || 'Latest'}</span>
                  {job.department && <span>Department: {job.department}</span>}
                </div>
              </div>
              <Link
                href={`/job/${job.slug}`}
                className="shrink-0 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-xs"
              >
                View Details »
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
