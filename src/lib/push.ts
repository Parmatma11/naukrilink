import * as webpush from 'web-push';
import { query } from '@/lib/db';

function cleanBase64Key(key: string): string {
  return key
    .trim()
    .replace(/^["']|["']$/g, '') // remove surrounding quotes if entered in dashboard
    .replace(/=+$/, '')          // remove trailing padding "=" to satisfy URL-safe base64
    .replace(/\+/g, '-')          // standard to URL-safe
    .replace(/\//g, '_');
}

let isVapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (isVapidConfigured) return true;

  try {
    const rawPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const rawPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:alerts@govtjob.site';

    if (!rawPublicKey || !rawPrivateKey) throw new Error('VAPID keys are not configured');
    const vapidPublicKey = cleanBase64Key(rawPublicKey);
    const vapidPrivateKey = cleanBase64Key(rawPrivateKey);

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    isVapidConfigured = true;
    return true;
  } catch (err) {
    console.warn('VAPID Initialization Notice:', (err as Error).message);
    return false;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

export interface PushSendResult {
  total: number;
  sent: number;
  failed: number;
  cleaned: number;
}

/**
 * Broadcasts a push notification to all active subscribers.
 * Automatically removes dead tokens (HTTP 410 Gone / 404 Not Found).
 */
export async function sendPushToAllSubscribers(payload: PushPayload): Promise<PushSendResult> {
  const result: PushSendResult = { total: 0, sent: 0, failed: 0, cleaned: 0 };

  if (!ensureVapidConfigured()) {
    console.warn('Cannot send push: VAPID keys not configured.');
    return result;
  }

  try {
    const res = await query<{ id: number; endpoint: string; p256dh: string; auth: string }>(
      'SELECT id, endpoint, p256dh, auth FROM push_subscriptions'
    );

    result.total = res.rows.length;
    if (result.total === 0) {
      return result;
    }

    const jsonPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || 'https://www.govtjob.site/',
      icon: payload.icon || '/icon.svg',
      badge: '/icon.svg',
      tag: payload.tag || 'govtjob-alert',
    });

    const deadEndpointIds: number[] = [];

    await Promise.all(
      res.rows.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, jsonPayload);
          result.sent++;
        } catch (err: any) {
          result.failed++;
          // HTTP 404 or 410 means the candidate unsubscribed or uninstalled the browser
          if (err.statusCode === 404 || err.statusCode === 410) {
            deadEndpointIds.push(sub.id);
          } else {
            console.warn(`Failed to push to endpoint ${sub.id}:`, err.message);
          }
        }
      })
    );

    // Clean up expired tokens
    if (deadEndpointIds.length > 0) {
      await query(
        `DELETE FROM push_subscriptions WHERE id = ANY($1::int[])`,
        [deadEndpointIds]
      );
      result.cleaned = deadEndpointIds.length;
    }
  } catch (error) {
    console.error('Error broadcasting push notification:', error);
  }

  return result;
}
