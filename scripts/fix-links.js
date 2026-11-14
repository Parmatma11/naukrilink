/**
 * Precision Link Fixer & Refresher
 * Re-parses authentic direct links (official portals & notification PDFs) for all jobs in Supabase.
 */

const fs = require('fs');
const cheerio = require('cheerio');
const { Pool } = require('pg');

let connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

if (connectionString.includes('pooler.supabase.com:5432')) {
  connectionString = connectionString.replace(':5432', ':6543');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

async function fetchPage(url) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    return null;
  }
}

function parseLinks(html) {
  const $ = cheerio.load(html);
  const importantLinks = {};
  let inLinksSection = false;

  $('table tr').each((_, row) => {
    const rowText = $(row).text().replace(/\s+/g, ' ').trim();
    const rowLower = rowText.toLowerCase();

    if (rowLower.includes('important link') || rowLower.includes('useful link')) {
      inLinksSection = true;
      return;
    }

    if (!inLinksSection) return;

    const aTags = $(row).find('a');
    if (aTags.length === 0) return;

    aTags.each((_, linkTag) => {
      const linkHref = $(linkTag).attr('href');
      if (!linkHref || !linkHref.startsWith('http')) return;
      const cleanHref = linkHref.trim();

      // STRICT FILTER: Discard bare root homepages, app stores, and social networks
      if (
        cleanHref === 'https://www.sarkariresult.com/' ||
        cleanHref === 'https://www.sarkariresult.com' ||
        cleanHref === 'http://www.sarkariresult.com/' ||
        cleanHref === 'http://www.sarkariresult.com' ||
        cleanHref.includes('play.google.com') ||
        cleanHref.includes('itunes.apple.com') ||
        cleanHref.includes('sarkariresultportal.com') ||
        cleanHref.includes('sarkariresult.tools') ||
        cleanHref.includes('t.me/') ||
        cleanHref.includes('whatsapp.com') ||
        cleanHref.includes('youtube.com') ||
        cleanHref.includes('youtu.be')
      ) {
        return;
      }

      const linkText = $(linkTag).text().trim().toLowerCase();
      const tds = $(row).find('td');
      const labelText = tds.length > 1 ? $(tds[0]).text().toLowerCase().trim() : rowLower;

      if ((labelText.includes('apply online') || linkText.includes('apply online')) && !importantLinks.apply_online) {
        importantLinks.apply_online = cleanHref;
      } else if ((labelText.includes('notification') || linkText.includes('notification')) && !importantLinks.download_notification) {
        importantLinks.download_notification = cleanHref;
      } else if ((labelText.includes('result') || labelText.includes('score card') || linkText.includes('result')) && !importantLinks.result) {
        importantLinks.result = cleanHref;
      } else if ((labelText.includes('admit card') || labelText.includes('hall ticket') || linkText.includes('admit card')) && !importantLinks.admit_card) {
        importantLinks.admit_card = cleanHref;
      } else if ((labelText.includes('answer key') || linkText.includes('answer key')) && !importantLinks.answer_key) {
        importantLinks.answer_key = cleanHref;
      } else if ((labelText.includes('syllabus') || linkText.includes('syllabus')) && !importantLinks.syllabus) {
        importantLinks.syllabus = cleanHref;
      } else if ((labelText.includes('official website') || linkText.includes('official website')) && !importantLinks.official_website) {
        importantLinks.official_website = cleanHref;
      }
    });
  });

  return importantLinks;
}

async function fixAllLinks() {
  console.log('🚀 Starting Link Rectification across Supabase Database...');
  const client = await pool.connect();

  try {
    const jobsRes = await client.query('SELECT id, title, slug, source_url FROM jobs ORDER BY id ASC');
    const jobs = jobsRes.rows;
    console.log(`Found ${jobs.length} jobs to inspect and fix.\n`);

    let updatedCount = 0;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (!job.source_url || !job.source_url.startsWith('http') || !job.source_url.includes('sarkariresult.com/')) {
        continue;
      }

      const html = await fetchPage(job.source_url);
      if (!html) continue;

      const freshLinks = parseLinks(html);

      await client.query(
        'UPDATE jobs SET important_links = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(freshLinks), job.id]
      );

      updatedCount++;
      if (updatedCount % 15 === 0 || i === jobs.length - 1) {
        console.log(`✓ [${i + 1}/${jobs.length}] Processed: "${job.title.slice(0, 35)}..."`);
      }
    }

    console.log(`\n🎉 Successfully refreshed authentic links for ${updatedCount} jobs!`);

    // Invalidate Next.js cache
    try {
      const revalRes = await fetch('http://localhost:3001/api/revalidate?secret=sarkari-revalidate-secret&tag=jobs');
      if (revalRes.ok) {
        console.log('⚡ Next.js Cache revalidated!');
      }
    } catch (e) {}

  } catch (err) {
    console.error('Error fixing links:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAllLinks();
