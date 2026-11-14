import { MetadataRoute } from 'next';
import { getCachedSitemapData } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sarkariresult.com';

  try {
    const { categories, jobs } = await getCachedSitemapData();

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1.0,
      },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    }));

    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
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
