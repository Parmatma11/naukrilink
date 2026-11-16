const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local if DATABASE_URL is not set
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initPushDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Supabase...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_notified_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);
    `);

    console.log('✅ Table "push_subscriptions" and index created successfully on Supabase!');
  } catch (err) {
    console.error('Error creating push table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initPushDb();
