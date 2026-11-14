import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/db';
import { Category, Job } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  const client = await pool.connect();
  try {
    const catRes = await client.query<Category>(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    const category = catRes.rows[0] || null;

    if (!category) return null;

    const jobsRes = await client.query<Job>(
      'SELECT * FROM jobs WHERE category_id = $1 ORDER BY id DESC',
      [category.id]
    );

    return { category, jobs: jobsRes.rows };
  } catch (err) {
    console.error('Error fetching category data:', err);
    return null;
  } finally {
    client.release();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) return { title: 'Category Not Found' };

  const title = `${data.category.name} 2026 : Sarkari Result Latest Updates`;
  const description = `Find all latest ${data.category.name} updates for 2026. Official government examination results, notifications, and application links.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.sarkariresult.com/category/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

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

      {/* Category Header */}
      <div className="bg-[#8b0000] text-white p-4 text-center rounded-t-sm shadow-md">
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide">
          {category.name} 2026
        </h1>
        <p className="text-xs text-amber-200 mt-1 font-medium">
          Showing all {jobs.length} latest updates and official notices
        </p>
      </div>

      {/* List */}
      <div className="bg-white border-2 border-red-700 shadow-md divide-y divide-gray-200">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">No posts found in this category.</div>
        ) : (
          jobs.map((job, idx) => (
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
