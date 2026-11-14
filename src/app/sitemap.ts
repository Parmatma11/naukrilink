import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { Category, Job } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sarkariresult.com';

  try {
    const catsRes = await query<Category>('SELECT slug FROM categories');
    const jobsRes = await query<Job>('SELECT slug, updated_at FROM jobs');

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1.0,
      },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = catsRes.rows.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    }));

    const jobRoutes: MetadataRoute.Sitemap = jobsRes.rows.map((job) => ({
      url: `${baseUrl}/job/${job.slug}`,
      lastModified: new Date(job.updated_at || Date.now()),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...jobRoutes];
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}
