import { Client, QueryResultRow } from 'pg';

let cachedConnectionString: string | null = null;

function getConnectionString(): string {
  if (cachedConnectionString) return cachedConnectionString;

  let conn =
    process.env.DATABASE_URL ||
    'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

  if (conn.includes('pooler.supabase.com:5432')) {
    conn = conn.replace(':5432', ':6543');
  }

  cachedConnectionString = conn;
  return conn;
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const connectionString = getConnectionString();
  const isSupabase = connectionString.includes('supabase.com');

  const client = new Client({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 8000,
  });

  try {
    await client.connect();
    return await client.query<T>(text, params);
  } catch (error) {
    console.error('Database query error:', error, 'Query text:', text);
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

const db = { query };
export default db;
