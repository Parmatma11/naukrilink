/**
 * Govt Job Portal Scraper & Ingestion Worker (Configured for Supabase Cloud PostgreSQL)
 */

const { Pool } = require('pg');
const cheerio = require('cheerio');
let webpush;
try {
  webpush = require('web-push');
} catch (e) {
  // Optional if web-push is not installed
}

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
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
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
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCategory(title) {
  const t = (title || '').toLowerCase();
  if (/result|score card|marks|merit list/i.test(t)) return { id: 1, name: 'Results', slug: 'results' };
  if (/admit card|hall ticket|call letter/i.test(t)) return { id: 2, name: 'Admit Card', slug: 'admit-card' };
  if (/answer key/i.test(t)) return { id: 4, name: 'Answer Key', slug: 'answer-key' };
  if (/syllabus|exam pattern/i.test(t)) return { id: 5, name: 'Syllabus', slug: 'syllabus' };
  if (/admission|entrance|counselling/i.test(t)) return { id: 6, name: 'Admission', slug: 'admission' };
  if (/certificate|verification/i.test(t)) return { id: 7, name: 'Certificate Verification', slug: 'certificate-verification' };
  if (/correction|important notice|date extend/i.test(t)) return { id: 8, name: 'Important', slug: 'important' };
  return { id: 3, name: 'Latest Jobs', slug: 'latest-jobs' };
}

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    clearTimeout(timeout);
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
      const rawInfo = nextTr.text() || $(row).text();
      shortInfo = cleanText(rawInfo.replace(/^Short Information\s*:?\s*/i, ''));
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

async function processSingleJob(client, cat, rawTitle, sourceUrl, newlyInsertedJobs) {
  if (!sourceUrl || !sourceUrl.startsWith('http') || !rawTitle) {
    return { updated: false, inserted: false };
  }

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
    return { updated: true, inserted: false, title: finalTitle };
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
    newlyInsertedJobs.push({ title: finalTitle, slug, category: cat.name });
    console.log(`\n✨ [NEW NOTIFICATION INSERTED] [${cat.name}] ${finalTitle}`);
    return { updated: false, inserted: true, title: finalTitle };
  }
}

async function scrapeFull() {
  console.log('🚀 Running Precision Scraper on Supabase Database...');
  const client = await pool.connect();

  let totalUpdated = 0;
  let totalInserted = 0;
  const newlyInsertedJobs = [];

  try {
    let homepageHtml = await fetchPage(BASE_URL);

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

    if (homepageHtml) {
      console.log('🌐 Successfully loaded Homepage HTML. Scraping 8 category columns...');
      const $ = cheerio.load(homepageHtml);
      const quickLists = $('ul.sarkari-quick-list');

      for (let i = 0; i < Math.min(quickLists.length, categoryMapping.length); i++) {
        const cat = categoryMapping[i];
        const listElement = quickLists[i];
        const listItems = $(listElement).find('li a').toArray();

        console.log(`\n📂 [${cat.name}] Ingesting ${listItems.length} items...`);

        for (let j = 0; j < listItems.length; j++) {
          const el = listItems[j];
          const rawTitle = cleanText($(el).text());
          const sourceUrl = $(el).attr('href');

          const res = await processSingleJob(client, cat, rawTitle, sourceUrl, newlyInsertedJobs);
          if (res.updated) {
            totalUpdated++;
            process.stdout.write(`* [${j + 1}/${listItems.length}] Updated: ${rawTitle.slice(0, 32)}...\n`);
          } else if (res.inserted) {
            totalInserted++;
          }
        }
      }
    } else {
      console.warn('⚠️ Homepage HTML blocked or unavailable (CloudFront WAF). Activating WordPress REST API Engine...');
      const wpRes = await fetch('https://www.sarkariresult.com/wp-json/wp/v2/posts?per_page=50', { headers: HEADERS });

      if (wpRes.ok) {
        const posts = await wpRes.json();
        console.log(`📡 Ingesting ${posts.length} latest posts directly via WordPress REST API...`);

        for (let j = 0; j < posts.length; j++) {
          const p = posts[j];
          const rawTitle = cleanText(p.title?.rendered || '');
          const sourceUrl = p.link;
          const cat = inferCategory(rawTitle);

          const res = await processSingleJob(client, cat, rawTitle, sourceUrl, newlyInsertedJobs);
          if (res.updated) {
            totalUpdated++;
            process.stdout.write(`* [${j + 1}/${posts.length}] Updated [${cat.name}]: ${rawTitle.slice(0, 32)}...\n`);
          } else if (res.inserted) {
            totalInserted++;
          }
        }
      } else {
        throw new Error(`Both Homepage HTML and WordPress REST API failed to load (Status: ${wpRes.status})`);
      }
    }

    console.log(`\n🎉 Ingestion complete! Updated: ${totalUpdated} | Newly Inserted: ${totalInserted}`);

    // Broadcast Push Notifications to candidate subscribers if new jobs were found
    if (newlyInsertedJobs.length > 0 && webpush) {
      try {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFyy1-zz-cTGPcW1vHuqtLJ4J2fF05B59Fy3hUkAzrAb0pXvXlEmwT6Mc83kYlY-4Y4k2TkG6BPpuWtt-Bmb_ek';
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'hxA1LwjHAAM7ajnIkLRs308oRw7VC3YBDMFAnAUdqp4';
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:alerts@govtjob.site';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.govtjob.site';

        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

        const subs = await client.query('SELECT id, endpoint, p256dh, auth FROM push_subscriptions');
        if (subs.rows.length > 0) {
          const latestJob = newlyInsertedJobs[0];
          const payload = JSON.stringify({
            title: `📢 New ${latestJob.category}: ${latestJob.title.slice(0, 50)}...`,
            body: newlyInsertedJobs.length > 1
              ? `Plus ${newlyInsertedJobs.length - 1} more new vacancies published today!`
              : 'Application started. Click to check eligibility & apply online.',
            url: `${siteUrl}/job/${latestJob.slug}`,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: `job-${latestJob.slug}`,
          });

          console.log(`\n🔔 Broadcasting Web Push to ${subs.rows.length} subscribers...`);
          const deadIds = [];

          await Promise.all(
            subs.rows.map(async (sub) => {
              try {
                await webpush.sendNotification(
                  { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                  payload
                );
              } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                  deadIds.push(sub.id);
                }
              }
            })
          );

          if (deadIds.length > 0) {
            await client.query('DELETE FROM push_subscriptions WHERE id = ANY($1::int[])', [deadIds]);
            console.log(`🧹 Cleaned up ${deadIds.length} expired device subscriptions.`);
          }
          console.log(`✅ Push alerts delivered successfully!`);
        }
      } catch (pushErr) {
        console.warn('Push broadcast note:', pushErr.message);
      }
    }

    // Write GitHub Actions Step Summary if running in CI
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        const fs = require('fs');
        let summary = `### 🚀 Govt Job Scraper Ingestion Report\n\n`;
        summary += `- **Run Time:** ${new Date().toUTCString()}\n`;
        summary += `- **Existing Posts Refreshed:** \`${totalUpdated}\`\n`;
        summary += `- **Newly Added Notifications:** \`${totalInserted}\`\n\n`;

        if (newlyInsertedJobs.length > 0) {
          summary += `#### ✨ Newly Added Notifications (${newlyInsertedJobs.length}):\n\n`;
          summary += `| Category | Job Title | Link |\n`;
          summary += `| :--- | :--- | :--- |\n`;
          for (const job of newlyInsertedJobs) {
            summary += `| **${job.category}** | ${job.title} | [View Post](https://www.govtjob.site/job/${job.slug}) |\n`;
          }
        } else {
          summary += `> ℹ️ *No brand-new recruitment posts found in this run. Existing exam dates and links were refreshed.*\n`;
        }

        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
      } catch (e) {
        // Ignored if summary file is unavailable
      }
    }

    // Trigger Next.js on-demand cache revalidation
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
      const secret = process.env.REVALIDATION_SECRET || 'govtjob-revalidate-secret';
      const revalRes = await fetch(`${siteUrl}/api/revalidate?secret=${secret}&tag=jobs`);
      if (revalRes.ok) {
        console.log('⚡ Next.js Cache successfully revalidated across all tags!');
      }
    } catch (e) {
      // Ignored if app is not running locally during batch scrape
    }
  } catch (err) {
    console.error('Error during scraping:', err);
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        const fs = require('fs');
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ❌ Scraper Error Encountered\n\n\`\`\`\n${err.message}\n\`\`\`\n`);
      } catch (e) {}
    }
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

scrapeFull();
