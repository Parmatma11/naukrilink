import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';

export default defineCloudflareConfig({
  // ISR / unstable_cache storage (KV binding NEXT_INC_CACHE_KV in wrangler.jsonc)
  incrementalCache: kvIncrementalCache,
});
