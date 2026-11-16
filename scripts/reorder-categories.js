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

async function reorder() {
  const client = await pool.connect();
  try {
    await client.query("UPDATE categories SET order_index = 1 WHERE slug = 'latest-jobs'");
    await client.query("UPDATE categories SET order_index = 2 WHERE slug = 'admit-card'");
    await client.query("UPDATE categories SET order_index = 3 WHERE slug = 'results'");

    const res = await client.query('SELECT id, name, slug, order_index FROM categories ORDER BY order_index ASC');
    console.table(res.rows);
    console.log('✅ Categories order successfully updated in Supabase!');
  } finally {
    client.release();
    await pool.end();
  }
}

reorder();
