import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAllSubscribers } from '@/lib/push';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, title, body: alertBody, url, tag } = body;

    // Validate secret token to protect against unauthorized triggers
    const token = process.env.REVALIDATION_SECRET;
    if (!token || secret !== token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: invalid secret' }, { status: 401 });
    }

    if (!title || !alertBody) {
      return NextResponse.json({ success: false, error: 'Missing title or body' }, { status: 400 });
    }

    const result = await sendPushToAllSubscribers({
      title,
      body: alertBody,
      url,
      tag,
    });

    return NextResponse.json({
      success: true,
      message: `Push broadcast completed: ${result.sent} sent out of ${result.total}`,
      stats: result,
    });
  } catch (error) {
    console.error('Error in /api/push/send:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
