import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/db';
import { Category, Job, TickerAlert } from '@/types';

/**
 * 1. Home Page Data Layer
 * Parallelizes independent queries and trims payload.
 */
async function fetchHomeDataUncached() {
  const [categoriesRes, jobsRes, alertsRes] = await Promise.all([
    query<Category>('SELECT id, name, slug, color_code, order_index FROM categories ORDER BY order_index ASC'),
    query<Job>(`
      SELECT 
        j.id, j.category_id, j.title, j.slug, j.post_date, j.is_featured,
        c.name as category_name, c.slug as category_slug, c.color_code as category_color 
      FROM jobs j 
      JOIN categories c ON j.category_id = c.id 
      ORDER BY j.id DESC
    `),
    query<TickerAlert>('SELECT id, text, link, is_active FROM ticker_alerts WHERE is_active = true ORDER BY id DESC LIMIT 10')
  ]);

  const categories = categoriesRes.rows;
  const jobsByCategory: Record<string, Job[]> = {};

  for (const cat of categories) {
    jobsByCategory[cat.slug] = [];
  }

  for (const job of jobsRes.rows) {
    if (job.category_slug && jobsByCategory[job.category_slug]) {
      jobsByCategory[job.category_slug].push(job);
    }
  }

  return {
    categories,
    jobsByCategory,
    alerts: alertsRes.rows,
  };
}

// Next.js Data Cache: Cached across requests, revalidated every 5 mins
export const getCachedHomeData = unstable_cache(
  fetchHomeDataUncached,
  ['home-data-v1'],
  { revalidate: 300, tags: ['jobs', 'categories', 'alerts'] }
);

/**
 * 2. Single Job Detail Data Layer
 * Deduplicated per-request via React cache() and cross-request via unstable_cache().
 */
async function fetchJobUncached(slug: string): Promise<Job | null> {
  const res = await query<Job>(
    `SELECT j.*, c.name as category_name, c.slug as category_slug, c.color_code as category_color 
     FROM jobs j 
     JOIN categories c ON j.category_id = c.id 
     WHERE j.slug = $1`,
    [slug]
  );
  return res.rows[0] || null;
}

export const getCachedJob = cache(async (slug: string) => {
  return unstable_cache(
    () => fetchJobUncached(slug),
    [`job-${slug}`],
    { revalidate: 600, tags: [`job-${slug}`, 'jobs'] }
  )();
});

/**
 * 3. Category Page Data Layer
 */
async function fetchCategoryDataUncached(slug: string) {
  const catRes = await query<Category>(
    'SELECT id, name, slug, color_code, order_index FROM categories WHERE slug = $1',
    [slug]
  );
  const category = catRes.rows[0] || null;

  if (!category) return null;

  const jobsRes = await query<Job>(
    `SELECT id, category_id, title, slug, department, post_date, is_featured
     FROM jobs 
     WHERE category_id = $1 
     ORDER BY id DESC`,
    [category.id]
  );

  return { category, jobs: jobsRes.rows };
}

export const getCachedCategoryData = cache(async (slug: string) => {
  return unstable_cache(
    () => fetchCategoryDataUncached(slug),
    [`category-${slug}`],
    { revalidate: 600, tags: [`category-${slug}`, 'categories'] }
  )();
});

/**
 * 4. Sitemap Data Layer
 * Cached across requests for 1 hour to prevent bots from hammering DB.
 */
async function fetchSitemapDataUncached() {
  const [catsRes, jobsRes] = await Promise.all([
    query<Category>('SELECT slug FROM categories ORDER BY order_index ASC'),
    query<Job>('SELECT slug, updated_at FROM jobs ORDER BY id DESC LIMIT 500')
  ]);
  return {
    categories: catsRes.rows,
    jobs: jobsRes.rows,
  };
}

export const getCachedSitemapData = unstable_cache(
  fetchSitemapDataUncached,
  ['sitemap-data-v1'],
  { revalidate: 3600, tags: ['sitemap', 'jobs', 'categories'] }
);

/**
 * 5. Search Data Layer
 * Deduplicated per-request using React cache() with trimmed payload.
 */
export const searchJobsCached = cache(async (queryString: string): Promise<Job[]> => {
  if (!queryString.trim()) return [];

  const words = queryString.trim().split(/\s+/).filter(Boolean);
  const conditions: string[] = [];
  const values: any[] = [];

  words.forEach((word, idx) => {
    const paramIdx = idx + 1;
    conditions.push(`(
      j.title ILIKE $${paramIdx} OR 
      j.department ILIKE $${paramIdx} OR 
      j.short_info ILIKE $${paramIdx} OR 
      c.name ILIKE $${paramIdx}
    )`);
    values.push(`%${word}%`);
  });

  const sql = `
    SELECT 
      j.id, j.category_id, j.title, j.slug, j.department, j.post_date, j.short_info,
      c.name as category_name, c.slug as category_slug, c.color_code as category_color 
    FROM jobs j 
    JOIN categories c ON j.category_id = c.id 
    WHERE ${conditions.join(' AND ')}
    ORDER BY j.id DESC
    LIMIT 60
  `;

  const res = await query<Job>(sql, values);
  return res.rows;
});

/**
 * 6. Helper for static generation (SSG)
 */
export async function getAllCategorySlugs() {
  try {
    const res = await query<{ slug: string }>('SELECT slug FROM categories');
    return res.rows.map((r) => ({ slug: r.slug }));
  } catch (err) {
    console.error('Error fetching category slugs for static paths:', err);
    return [];
  }
}

export async function getTopJobSlugs() {
  try {
    const res = await query<{ slug: string }>('SELECT slug FROM jobs ORDER BY id DESC LIMIT 50');
    return res.rows.map((r) => ({ slug: r.slug }));
  } catch (err) {
    console.error('Error fetching job slugs for static paths:', err);
    return [];
  }
}
