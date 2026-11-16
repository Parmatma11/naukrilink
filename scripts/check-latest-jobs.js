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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkLatest() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        j.id, 
        c.name as category,
        j.title,
        j.post_date,
        to_char(j.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM jobs j
      LEFT JOIN categories c ON j.category_id = c.id
      ORDER BY j.id DESC
      LIMIT 10
    `);

    console.log('\n📋 Most Recent 10 Jobs in Database:');
    console.table(res.rows.map(r => ({
      ID: r.id,
      Category: r.category,
      Title: r.title.length > 55 ? r.title.slice(0, 52) + '...' : r.title,
      'Post Date': r.post_date,
      'Created At': r.created_at
    })));
  } finally {
    client.release();
    await pool.end();
  }
}

checkLatest();
