import { Pool, QueryResultRow } from 'pg';

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

if (!global.__pgPool) {
  global.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgrespassword@localhost:5432/sarkaridb',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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
