import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Read-only cache served from Workers static assets (no KV / R2 operations, so no free-tier
// quota to exhaust). Dynamic data is fetched per request through Hyperdrive, which caches
// query results itself.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
