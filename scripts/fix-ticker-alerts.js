const { Pool } = require('pg');

let connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function syncTicker() {
  const client = await pool.connect();
  try {
    await client.query('TRUNCATE TABLE ticker_alerts RESTART IDENTITY');
    await client.query(`
      INSERT INTO ticker_alerts (text, link, is_active, created_at)
      SELECT 
        CASE 
          WHEN length(title) > 65 THEN substring(title from 1 for 62) || '...'
          ELSE title
        END as text,
        '/job/' || slug as link,
        true as is_active,
        NOW() as created_at
      FROM jobs
      ORDER BY id DESC
      LIMIT 10
    `);

    const res = await client.query('SELECT id, text, link FROM ticker_alerts ORDER BY id ASC');
    console.log('✅ New Ticker Alerts (all linked to internal /job/slug):');
    console.table(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

syncTicker();
