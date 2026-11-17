import { Client } from 'pg';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Cloudflare Workers forbid reusing I/O objects (sockets) created in one request
 * from another request. So we never keep a module-level client: every query opens
 * a short-lived single connection and closes it again.
 *
 * Connection string resolution order:
 *   1. Hyperdrive binding (`HYPERDRIVE`) if configured in wrangler.jsonc (recommended in production)
 *   2. DATABASE_URL (Worker secret / .dev.vars / .env.local)
 */
function getConnectionString(): { url: string; hyperdrive: boolean } {
  try {
    const hd = (getCloudflareContext()?.env as any)?.HYPERDRIVE?.connectionString as string | undefined;
    if (hd) return { url: hd, hyperdrive: true };
  } catch {
    // Not running inside a Worker (e.g. `next dev` before init, scripts) - fall through.
  }

  let url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it as a Worker secret (wrangler secret put DATABASE_URL).');
  }
  // Supabase transaction pooler lives on 6543; session pooler on 5432 holds connections too long.
  if (url.includes('pooler.supabase.com:5432')) {
    url = url.replace(':5432', ':6543');
  }
  return { url, hyperdrive: false };
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const { url, hyperdrive } = getConnectionString();

  const client = new Client({
    connectionString: url,
    // Hyperdrive terminates TLS to the origin itself; direct Supabase needs TLS.
    ssl: hyperdrive ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const result = await client.query(text, params);
    return { rows: result.rows as T[], rowCount: result.rowCount ?? result.rows.length };
  } catch (error) {
    console.error('Database query error:', error, 'Query text:', text);
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

const db = { query };
export default db;
