import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg picks its Workers socket adapter via a dynamic require the tracer cannot see.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/pg-cloudflare/**/*'],
  },
  // Each query opens its own short-lived DB connection (Workers-safe). Limit parallel
  // prerendering so the Supabase pooler is not flooded during `next build`.
  experimental: {
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
  },
  // Canonicalize apex -> www so Google doesn't index "alternate" host variants.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'govtjob.site' }],
        destination: 'https://www.govtjob.site/:path*',
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
