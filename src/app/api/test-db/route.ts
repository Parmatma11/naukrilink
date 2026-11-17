import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query('SELECT count(*) as count from categories');
    return NextResponse.json({
      success: true,
      data: res.rows,
      hasDbUrl: !!process.env.DATABASE_URL,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
        name: err?.name,
        code: err?.code,
        stack: err?.stack,
        hasDbUrl: !!process.env.DATABASE_URL,
      },
      { status: 500 }
    );
  }
}
