import { Pool, QueryResultRow } from 'pg';

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const isSupabase = connectionString.includes('supabase.com');

if (!global.__pgPool) {
  global.__pgPool = new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

pool = global.__pgPool;

export default pool;

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  return res;
}
