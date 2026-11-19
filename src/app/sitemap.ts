import { MetadataRoute } from 'next';
import { getCachedSitemapData } from '@/lib/data';

// Render at request time (not build time): the DB is only reachable through the Hyperdrive
// binding at runtime, and a build-time failure would bake an empty sitemap into the cache.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.govtjob.site';

  try {
    const { categories, jobs } = await getCachedSitemapData();

    // Real lastmod values only: Google ignores lastmod once it is always "now".
    const latestJobUpdate = jobs.reduce<Date | undefined>((max, j) => {
      const d = j.updated_at ? new Date(j.updated_at) : undefined;
      return d && (!max || d > max) ? d : max;
    }, undefined);
    const staticLastModified = new Date('2026-01-01');

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: latestJobUpdate,
        priority: 1.0,
      },
      ...['privacy-policy', 'terms', 'disclaimer', 'about-us', 'contact-us'].map((p) => ({
        url: `${baseUrl}/${p}`,
        lastModified: staticLastModified,
        priority: 0.5,
      })),
    ];

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: latestJobUpdate,
      priority: 0.9,
    }));

    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/job/${job.slug}`,
      lastModified: job.updated_at ? new Date(job.updated_at) : undefined,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...jobRoutes];
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}
