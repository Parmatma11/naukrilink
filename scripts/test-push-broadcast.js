const webpush = require('web-push');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        process.env[k.trim()] = v.join('=').trim();
      }
    }
  }
}

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFyy1-zz-cTGPcW1vHuqtLJ4J2fF05B59Fy3hUkAzrAb0pXvXlEmwT6Mc83kYlY-4Y4k2TkG6BPpuWtt-Bmb_ek';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'hxA1LwjHAAM7ajnIkLRs308oRw7VC3YBDMFAnAUdqp4';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:alerts@govtjob.site';

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runTestBroadcast() {
  const client = await pool.connect();
  try {
    const subs = await client.query('SELECT id, endpoint, p256dh, auth, created_at FROM push_subscriptions');
    console.log(`Found ${subs.rows.length} subscriber(s) in Supabase database.`);

    if (subs.rows.length === 0) {
      console.log('💡 No candidate subscriptions found yet.');
      console.log('👉 Open https://www.govtjob.site (or http://localhost:3001), click the "Get Job Alerts" button and click "Allow".');
      return;
    }

    const payload = JSON.stringify({
      title: '📢 Govt Job 2026 Test Alert',
      body: 'Push notification system is working! You will receive instant vacancy updates.',
      url: 'https://www.govtjob.site/',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'test-alert',
    });

    let sent = 0;
    for (const sub of subs.rows) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, payload);
        sent++;
        console.log(`✅ Push delivered to subscriber #${sub.id}`);
      } catch (err) {
        console.error(`❌ Failed for subscriber #${sub.id}:`, err.message);
      }
    }

    console.log(`\n🎉 Test broadcast complete: ${sent}/${subs.rows.length} successful!`);
  } catch (err) {
    console.error('Error during broadcast:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runTestBroadcast();
