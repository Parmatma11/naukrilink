import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const SECRET_TOKEN = process.env.REVALIDATION_SECRET || 'sarkari-revalidate-secret';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');

  if (secret !== SECRET_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    if (tag) {
      revalidateTag(tag, { expire: 0 });
    } else if (path) {
      revalidatePath(path);
    } else {
      // Default: purge all main cache tags and homepage
      revalidateTag('jobs', { expire: 0 });
      revalidateTag('categories', { expire: 0 });
      revalidateTag('alerts', { expire: 0 });
      revalidatePath('/');
    }

    return NextResponse.json({
      revalidated: true,
      tag: tag || 'all',
      path: path || '/',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-revalidation-token');

    if (secret !== SECRET_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const tag = body.tag;
    const path = body.path;

    if (tag) {
      revalidateTag(tag, { expire: 0 });
    } else if (path) {
      revalidatePath(path);
    } else {
      revalidateTag('jobs', { expire: 0 });
      revalidateTag('categories', { expire: 0 });
      revalidateTag('alerts', { expire: 0 });
      revalidatePath('/');
    }

    return NextResponse.json({
      revalidated: true,
      tag: tag || 'all',
      path: path || '/',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
  }
}
