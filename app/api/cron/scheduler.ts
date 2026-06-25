// Internal task scheduler - replaces Railway external cron calls
// Runs on app startup, fires sync tasks on fixed intervals

const CRON_KEY = process.env.CRON_SECRET || 'predict-ai-cron-2020';

const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : 'http://localhost:3000';

async function callEndpoint(path: string) {
  try {
    const url = `${BASE_URL}${path}?token=${CRON_KEY}`;
    const res = await fetch(url, { cache: 'no-store' });
    console.log(`[scheduler] ${path} → ${res.status}`);
  } catch (err: any) {
    console.error(`[scheduler] ${path} → FAIL: ${err.message}`);
  }
}

// Register all schedules once on module load
if (typeof globalThis !== 'undefined') {
  const key = '__predict_ai_scheduler_initialized__';
  if (!(globalThis as any)[key]) {
    (globalThis as any)[key] = true;

    console.log('[scheduler] Starting internal task scheduler...');

    // 1. sync-matches: every 5 minutes
    setInterval(() => callEndpoint('/api/cron/sync-matches'), 5 * 60 * 1000);

    // 2. sync-news: every 30 minutes
    setInterval(() => callEndpoint('/api/cron/sync-news'), 30 * 60 * 1000);

    // 3. sync-standings: every 10 minutes
    setInterval(() => callEndpoint('/api/cron/sync-standings'), 10 * 60 * 1000);

    // 4. verify-lottery: check every 10 minutes, execute only at target times
    setInterval(() => {
      const now = new Date();
      const hour = now.getUTCHours();
      const minute = now.getUTCMinutes();
      // Target times: 05:30, 07:30, 12:30 UTC (= 13:30, 15:30, 20:30 CST)
      const isTargetTime =
        (hour === 5 || hour === 7 || hour === 12) && minute === 30;
      if (isTargetTime) {
        callEndpoint('/api/lottery/verify');
      }
    }, 60 * 1000); // check every minute

    console.log('[scheduler] All schedules registered');
  }
}
