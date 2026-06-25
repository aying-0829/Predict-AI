// Internal task scheduler - startup-check strategy
// Railway free tier kills containers quickly, so we check & run on startup
// Relies on Railway Cron Schedule (*/5 * * * *) to wake container periodically

import { getDB } from '@/lib/db'

const CRON_KEY = process.env.CRON_SECRET || 'predict-ai-cron-2020'
const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : 'http://localhost:3000'

async function callEndpoint(path: string) {
  try {
    const url = `${BASE_URL}${path}?token=${CRON_KEY}`
    const res = await fetch(url, { cache: 'no-store' })
    console.log(`[scheduler] ${path} → ${res.status}`)
    return true
  } catch (err: any) {
    console.error(`[scheduler] ${path} → FAIL: ${err.message}`)
    return false
  }
}

function getLastRun(taskName: string): number {
  try {
    const db = getDB()
    const row = db.prepare(
      'SELECT last_run_at FROM scheduler_runs WHERE task_name = ?'
    ).get(taskName) as { last_run_at: number } | undefined
    return row ? row.last_run_at : 0
  } catch {
    return 0
  }
}

function setLastRun(taskName: string, now: number) {
  try {
    const db = getDB()
    db.prepare(
      'INSERT INTO scheduler_runs (task_name, last_run_at) VALUES (?, ?) ON CONFLICT(task_name) DO UPDATE SET last_run_at = ?'
    ).run(taskName, now, now)
  } catch (err: any) {
    console.error(`[scheduler] Failed to save last_run for ${taskName}:`, err.message)
  }
}

function ensureTable() {
  try {
    const db = getDB()
    db.exec(`
      CREATE TABLE IF NOT EXISTS scheduler_runs (
        task_name TEXT PRIMARY KEY,
        last_run_at INTEGER NOT NULL DEFAULT 0
      )
    `)
  } catch (err: any) {
    console.error('[scheduler] Failed to create scheduler_runs table:', err.message)
  }
}

async function runIfDue(
  taskName: string,
  endpoint: string,
  intervalMs: number
) {
  const lastRun = getLastRun(taskName)
  const now = Date.now()
  if (now - lastRun >= intervalMs) {
    console.log(`[scheduler] Running ${taskName} (last run: ${new Date(lastRun).toISOString()})`)
    const ok = await callEndpoint(endpoint)
    if (ok) {
      setLastRun(taskName, now)
    }
  } else {
    const nextRun = new Date(lastRun + intervalMs)
    console.log(`[scheduler] ${taskName} not due yet, next run after ${nextRun.toISOString()}`)
  }
}

function isLotteryTime(): boolean {
  const now = new Date()
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()
  // Target: UTC 05:30, 07:30, 12:30 (= CST 13:30, 15:30, 20:30)
  return (hour === 5 || hour === 7 || hour === 12) && minute >= 30 && minute < 32
}

let initialized = false

export async function initScheduler() {
  if (initialized) return
  initialized = true

  console.log('[scheduler] Starting internal task scheduler (startup-check mode)...')
  ensureTable()

  // Execute due tasks immediately on startup
  await runIfDue('sync-matches', '/api/cron/sync-matches', 5 * 60 * 1000)
  await runIfDue('sync-news', '/api/cron/sync-news', 30 * 60 * 1000)
  await runIfDue('sync-standings', '/api/cron/sync-standings', 10 * 60 * 1000)

  if (isLotteryTime()) {
    const lastRun = getLastRun('verify-lottery')
    const now = Date.now()
    // Only run if not already executed in this time window
    if (now - lastRun > 60 * 60 * 1000) {
      console.log('[scheduler] Lottery time window active, running verify-lottery')
      const ok = await callEndpoint('/api/lottery/verify')
      if (ok) {
        setLastRun('verify-lottery', now)
      }
    }
  }

  console.log('[scheduler] Startup check complete')
}
