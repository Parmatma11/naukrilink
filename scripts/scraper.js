/**
 * Sarkari Portal Scraper & Ingestion Worker (Configured for Supabase Cloud PostgreSQL)
 */

const { Pool } = require('pg');
const cheerio = require('cheerio');

let connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.qvwajcdxqqppzzxiktzx:K!%40rishan12@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

if (connectionString.includes('pooler.supabase.com:5432')) {
  connectionString = connectionString.replace(':5432', ':6543');
}

const isSupabase = connectionString.includes('supabase.com');

const pool = new Pool({
  connectionString,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});

const BASE_URL = 'https://www.sarkariresult.com/';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 150);
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/Sarkari\s*Result®?/gi, '')
    .replace(/SarkariResult\.Com/gi, '')
    .replace(/WWW\.SARKARIRESULT\.COM/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    return null;
  }
}

async function parseJobDetail(url) {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const title = cleanText($('h1').text()) || cleanText($('title').text());
  let postDate = '';
  let shortInfo = '';
  const importantDates = {};
  const applicationFee = {};
  const ageLimit = {};
  const vacancyDetails = [];
  const importantLinks = {};

  // 1. Precise Scoped Dates & Fees from their dedicated table cells
  $('td').each((_, td) => {
    const tdText = $(td).text();

    if (tdText.includes('Important Dates')) {
      $(td).find('li').each((_, li) => {
        const raw = $(li).text().replace(/\s+/g, ' ').trim();
        if (!raw.includes(':')) return;
        const [k, ...rest] = raw.split(':');
        const key = k.trim();
        const val = cleanText(rest.join(':').trim());
        if (!val || val.length > 80) return;

        if (key.includes('Application Begin')) importantDates.application_begin = val;
        else if (key.includes('Last Date for Apply') || key.includes('Last Date')) importantDates.last_date = val;
        else if (key.includes('Pay Exam Fee Last Date')) importantDates.fee_last_date = val;
        else if (key.includes('Correction Date')) importantDates.correction_date = val;
        else if (key.includes('Exam Date')) importantDates.exam_date = val;
        else if (key.includes('Admit Card Available')) importantDates.admit_card_date = val;
      });
    }

    if (tdText.includes('Application Fee')) {
      $(td).find('li').each((_, li) => {
        const raw = $(li).text().replace(/\s+/g, ' ').trim();
        if (!raw.includes(':')) return;
        const [k, ...rest] = raw.split(':');
        const key = k.trim();
        const val = cleanText(rest.join(':').trim());
        if (!val || val.length > 60) return;

        if (key.includes('General') || key.includes('Gen') || key.includes('OBC') || key.includes('EWS')) {
          applicationFee.gen_obc = val;
        }
        if (key.includes('SC') || key.includes('ST')) {
          applicationFee.sc_st = val;
          if (key.includes('PH')) applicationFee.ph = val;
        }
        if (key.includes('PH') && !applicationFee.ph) {
          applicationFee.ph = val;
        }
        if (key.includes('Female')) {
          applicationFee.female = val;
        }
        if (key.includes('All Candidates') || key.includes('No Application Fee')) {
          applicationFee.gen_obc = val || '0/- (Nil)';
          applicationFee.sc_st = val || '0/- (Nil)';
        }
      });
    }
  });

  // 2. Table parsing for Post Date, Short Info, Age Limits, Vacancy Details, Links
  let inVacancySection = false;

  $('table tr').each((rowIdx, row) => {
    const rowText = $(row).text();
    const tds = $(row).find('td');

    // Post Date
    if (rowText.includes('Post Date') || rowText.includes('Update :')) {
      const match = rowText.match(/Post Date\s*\/?\s*Update\s*:\s*([^|]+)/i);
      if (match) postDate = match[1].trim();
    }

    // Short Information
    if (rowText.includes('Short Information')) {
      const nextTr = $(row).next();
      shortInfo = cleanText(nextTr.text() || $(row).text());
    }

    // Age Limit
    if (rowText.includes('Minimum Age')) {
      const m = rowText.match(/Minimum Age\s*:\s*([^\n\r]+)/i);
      if (m) ageLimit.min_age = cleanText(m[1]);
    }
    if (rowText.includes('Maximum Age')) {
      const m = rowText.match(/Maximum Age\s*:\s*([^\n\r]+)/i);
      if (m) ageLimit.max_age = cleanText(m[1]);
    }

    // Vacancy Details Table Row Detection
    if (tds.length === 3) {
      const col1 = cleanText($(tds[0]).text());
      const col2 = cleanText($(tds[1]).text());
      const col3 = cleanText($(tds[2]).text());

      if (col1.toLowerCase().includes('post name') && col2.toLowerCase().includes('total post')) {
        inVacancySection = true;
      } else if (inVacancySection) {
        if (col1 && (col2 || col3) && !col1.toLowerCase().includes('interested') && !col1.toLowerCase().includes('how to')) {
          vacancyDetails.push({
            post_name: col1,
            total_post: col2,
            eligibility: col3
          });
        }
      }
    } else if (tds.length < 3 && inVacancySection && (rowText.includes('How to Apply') || rowText.includes('Important Links') || rowText.includes('Interested'))) {
      inVacancySection = false;
    }

    // Scoped Important Links Row Detection
    if (rowText.toLowerCase().includes('important link') || rowText.toLowerCase().includes('useful link')) {
      inVacancySection = false;
    }

    const isAfterLinksHeader = rowText.toLowerCase().includes('important link') || rowText.toLowerCase().includes('useful link');
    if (isAfterLinksHeader) {
      // Set flag on outer scope if needed
    }

    const aTags = $(row).find('a');
    if (aTags.length > 0) {
      aTags.each((_, linkTag) => {
        const linkHref = $(linkTag).attr('href');
        if (!linkHref || !linkHref.startsWith('http')) return;
        const cleanHref = linkHref.trim();

        // Strict filter: Ignore bare root homepages, app stores, and social networks
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
        const labelText = tds.length > 1 ? $(tds[0]).text().toLowerCase().trim() : rowText.toLowerCase();

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
    }
  });

  return {
    title,
    postDate,
    shortInfo,
    importantDates,
    applicationFee,
    ageLimit,
    vacancyDetails,
    importantLinks
  };
}

async function scrapeFull() {
  console.log('🚀 Running Precision Scraper on Supabase Database...');
  const client = await pool.connect();

  try {
    const homepageHtml = await fetchPage(BASE_URL);
    if (!homepageHtml) throw new Error('Failed to load homepage HTML.');

    const $ = cheerio.load(homepageHtml);

    const quickLists = $('ul.sarkari-quick-list');
    const categoryMapping = [
      { id: 1, name: 'Results', slug: 'results' },
      { id: 2, name: 'Admit Card', slug: 'admit-card' },
      { id: 3, name: 'Latest Jobs', slug: 'latest-jobs' },
      { id: 4, name: 'Answer Key', slug: 'answer-key' },
      { id: 5, name: 'Syllabus', slug: 'syllabus' },
      { id: 6, name: 'Admission', slug: 'admission' },
      { id: 7, name: 'Certificate Verification', slug: 'certificate-verification' },
      { id: 8, name: 'Important', slug: 'important' }
    ];

    let totalUpdated = 0;
    let totalInserted = 0;

    for (let i = 0; i < Math.min(quickLists.length, categoryMapping.length); i++) {
      const cat = categoryMapping[i];
      const listElement = quickLists[i];
      const listItems = $(listElement).find('li a').toArray();

      console.log(`\n📂 [${cat.name}] Updating ${listItems.length} items...`);

      for (let j = 0; j < listItems.length; j++) {
        const el = listItems[j];
        const rawTitle = cleanText($(el).text());
        const sourceUrl = $(el).attr('href');

        if (!sourceUrl || !sourceUrl.startsWith('http') || !rawTitle) continue;

        let detailData = null;
        if (sourceUrl.includes('sarkariresult.com/')) {
          detailData = await parseJobDetail(sourceUrl);
        }

        const finalTitle = (detailData && detailData.title) ? detailData.title : rawTitle;
        const importantDates = detailData ? detailData.importantDates : {};
        const applicationFee = detailData ? detailData.applicationFee : {};
        const ageLimit = detailData ? detailData.ageLimit : {};
        const vacancyDetails = detailData ? detailData.vacancyDetails : [];
        const importantLinks = detailData ? detailData.importantLinks : { apply_online: sourceUrl };
        const shortInfo = detailData ? detailData.shortInfo : `${rawTitle} Notification and details.`;
        const postDate = detailData ? detailData.postDate : new Date().toLocaleDateString();

        const existing = await client.query('SELECT id FROM jobs WHERE source_url = $1', [sourceUrl]);

        if (existing.rows.length > 0) {
          await client.query(
            `UPDATE jobs SET 
              title = $1, short_info = $2, post_date = $3,
              important_dates = $4, application_fee = $5, age_limit = $6,
              vacancy_details = $7, important_links = $8, updated_at = NOW()
             WHERE id = $9`,
            [
              finalTitle, shortInfo, postDate,
              JSON.stringify(importantDates), JSON.stringify(applicationFee), JSON.stringify(ageLimit),
              JSON.stringify(vacancyDetails), JSON.stringify(importantLinks),
              existing.rows[0].id
            ]
          );
          totalUpdated++;
          process.stdout.write(`* [${j + 1}/${listItems.length}] Updated: ${rawTitle.slice(0, 28)}...\n`);
        } else {
          let slug = generateSlug(finalTitle);
          const slugCheck = await client.query('SELECT id FROM jobs WHERE slug = $1', [slug]);
          if (slugCheck.rows.length > 0) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
          }

          await client.query(
            `INSERT INTO jobs (
              category_id, title, slug, short_info, post_date,
              important_dates, application_fee, age_limit,
              vacancy_details, important_links, source_url, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
            [
              cat.id,
              finalTitle,
              slug,
              shortInfo,
              postDate,
              JSON.stringify(importantDates),
              JSON.stringify(applicationFee),
              JSON.stringify(ageLimit),
              JSON.stringify(vacancyDetails),
              JSON.stringify(importantLinks),
              sourceUrl
            ]
          );
          totalInserted++;
          console.log(`\n✨ [NEW NOTIFICATION INSERTED] ${finalTitle}`);
        }
      }
    }

    console.log(`\n🎉 Ingestion complete! Updated: ${totalUpdated} | Newly Inserted: ${totalInserted}`);

    // Trigger Next.js on-demand cache revalidation
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
      const secret = process.env.REVALIDATION_SECRET || 'sarkari-revalidate-secret';
      const revalRes = await fetch(`${siteUrl}/api/revalidate?secret=${secret}&tag=jobs`);
      if (revalRes.ok) {
        console.log('⚡ Next.js Cache successfully revalidated across all tags!');
      }
    } catch (e) {
      // Ignored if app is not running locally during batch scrape
    }
  } catch (err) {
    console.error('Error during scraping:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

scrapeFull();
