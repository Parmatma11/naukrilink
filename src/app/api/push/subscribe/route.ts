import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription payload' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { success: false, error: 'Missing p256dh or auth keys' },
        { status: 400 }
      );
    }

    // Upsert into push_subscriptions
    await query(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (endpoint) DO UPDATE SET
         p256dh = EXCLUDED.p256dh,
         auth = EXCLUDED.auth,
         user_agent = EXCLUDED.user_agent,
         created_at = NOW()`,
      [endpoint, p256dh, auth, userAgent || req.headers.get('user-agent') || '']
    );

    return NextResponse.json({ success: true, message: 'Subscribed to push notifications successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ success: false, error: 'Missing endpoint' }, { status: 400 });
    }

    await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
