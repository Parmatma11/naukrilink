import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-dynamic';

async function tryConnect(connStr: string) {
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT count(*) as count from categories');
    await client.end();
    return { ok: true, count: res.rows[0]?.count };
  } catch (err: any) {
    await client.end().catch(() => {});
    return { ok: false, error: err?.message, code: err?.code, stack: err?.stack?.slice(0, 200) };
  }
}

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Direct host (port 5432, IPv6 enabled)
  results['direct_5432'] = await tryConnect(
    'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@db.qvwajcdxqqppzzxiktzx.supabase.co:5432/postgres?sslmode=require'
  );

  // 2. Pooler transaction mode (port 6543)
  results['pooler_6543'] = await tryConnect(
    'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require'
  );

  // 3. Pooler session mode (port 5432)
  results['pooler_5432'] = await tryConnect(
    'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'
  );

  return NextResponse.json(results);
}
