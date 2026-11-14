import { Pool, QueryResultRow } from 'pg';

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

let connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

// Auto-switch to transaction mode pooler (port 6543) for Serverless/Vercel environments
// to prevent EMAXCONNSESSION (max clients reached in session mode limit: 15)
if (connectionString.includes('pooler.supabase.com:5432')) {
  connectionString = connectionString.replace(':5432', ':6543');
}

const isSupabase = connectionString.includes('supabase.com');

if (!global.__pgPool) {
  global.__pgPool = new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 5, // Serverless-optimized small pool size per lambda
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}

pool = global.__pgPool;

export default pool;

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  return await pool.query<T>(text, params);
}
