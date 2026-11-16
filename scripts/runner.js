/**
 * 24/7 Automated Scraper Background Daemon for Local Laptop
 * Memory footprint: ~30-40 MB RAM
 * CPU usage: < 1%
 */

const { spawn } = require('child_process');
const path = require('path');

// Interval in hours (Default: 2 hours)
const INTERVAL_HOURS = process.env.INTERVAL_HOURS ? parseFloat(process.env.INTERVAL_HOURS) : 2;
const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;

const scraperScriptPath = path.resolve(__dirname, 'scraper.js');

let runCount = 0;
let isRunning = false;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function runScraper() {
  if (isRunning) {
    console.log(`[${formatTime()}] ⚠️ Scraper already in progress. Skipping cycle.`);
    return;
  }

  runCount++;
  isRunning = true;

  console.log(`\n========================================================`);
  console.log(`🚀 [Cycle #${runCount}] GovtJob Scraper Starting at ${formatTime()}`);
  console.log(`   Target: SarkariResult & Sister Networks`);
  console.log(`   Database: Supabase PostgreSQL (Cloud)`);
  console.log(`========================================================\n`);

  const child = spawn(process.execPath, [scraperScriptPath], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('close', (code) => {
    isRunning = false;
    const nextRun = new Date(Date.now() + INTERVAL_MS);
    console.log(`\n========================================================`);
    console.log(`🏁 [Cycle #${runCount}] Completed with exit code ${code} at ${formatTime()}`);
    console.log(`⏰ Next automatic scan scheduled for: ${formatTime(nextRun)} (${INTERVAL_HOURS} hours)`);
    console.log(`========================================================\n`);
  });

  child.on('error', (err) => {
    isRunning = false;
    console.error(`❌ Process Error in cycle #${runCount}:`, err.message);
  });
}

console.log(`\n========================================================`);
console.log(`  🌟 GOVTJOB.SITE - 24/7 AUTOMATED LOCAL WORKER`);
console.log(`  Interval: Every ${INTERVAL_HOURS} hours`);
console.log(`  Process ID (PID): ${process.pid}`);
console.log(`========================================================`);

// 1. Initial run immediately on startup
runScraper();

// 2. Periodic execution every INTERVAL_MS
setInterval(runScraper, INTERVAL_MS);
