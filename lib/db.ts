import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// 优先使用 DATABASE_PATH 环境变量，否则使用 Railway 持久化卷默认路径 /data/data.db
const DB_PATH = process.env.DATABASE_PATH || '/data/data.db'

// 确保数据库文件所在的目录存在（Railway 卷挂载场景下 /data 可能不存在）
const dbDir = path.dirname(DB_PATH)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

let db: Database.Database | null = null
let initialized = false

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  // 延迟初始化：首次调用时建表+种子
  if (!initialized) {
    initialized = true
    initDBInternal(db)
  }
  return db
}

function initDBInternal(database: Database.Database): void {
  // ============ 建表 ============
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT DEFAULT 'Marvis',
      phone TEXT,
      membership_type TEXT DEFAULT 'free',
      membership_expire TEXT,
      points INTEGER DEFAULT 0,
      total_predictions INTEGER DEFAULT 0,
      total_hits INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 12,
      rank INTEGER DEFAULT 42,
      password_hash TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lottery_type TEXT,
      numbers TEXT,
      result TEXT,
      ai_numbers TEXT,
      hit INTEGER DEFAULT 0,
      is_hit INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS points_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount INTEGER,
      reason TEXT,
      type TEXT,
      detail TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS alert_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lottery_name TEXT,
      lottery_type TEXT,
      draw_time TEXT,
      enabled INTEGER DEFAULT 0,
      channel_inapp INTEGER DEFAULT 1,
      channel_wechat INTEGER DEFAULT 0,
      channel_email INTEGER DEFAULT 0,
      channel_sms INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bet_slips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT,
      pick TEXT,
      odds REAL,
      total_odds REAL,
      cost INTEGER DEFAULT 100,
      won INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `)

  // ============ 管理后台 ============
  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS admin_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target TEXT DEFAULT 'all',
      sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `)

  // 种子管理员（默认 admin/admin123，生产环境需修改）
  const bcrypt = require('bcryptjs')
  const adminHash = bcrypt.hashSync('admin123', 10)
  database.prepare('INSERT OR IGNORE INTO admins (id, username, password_hash) VALUES (1, ?, ?)').run('admin', adminHash)

  // 迁移：为已存在的 alert_subscriptions 表添加 channel_email 列
  try {
    database.exec('ALTER TABLE alert_subscriptions ADD COLUMN channel_email INTEGER DEFAULT 0')
  } catch {
    // 列已存在，忽略
  }

  // 迁移：为已存在的 users 表添加 phone / password_hash 列
  try {
    database.exec('ALTER TABLE users ADD COLUMN phone TEXT')
  } catch {
    // 列已存在，忽略
  }
  try {
    database.exec('ALTER TABLE users ADD COLUMN password_hash TEXT')
  } catch {
    // 列已存在，忽略
  }

  // 迁移：为已存在的 points_history 表添加 user_id 列
  try {
    database.exec('ALTER TABLE points_history ADD COLUMN user_id INTEGER')
  } catch {
    // 列已存在，忽略
  }

  // 迁移：为已存在的 users 表添加 last_checkin_date 列
  try {
    database.exec("ALTER TABLE users ADD COLUMN last_checkin_date TEXT DEFAULT ''")
  } catch {
    // 列已存在，忽略
  }

  // 迁移：为已存在的 predictions 表添加 user_id 列
  try {
    database.exec('ALTER TABLE predictions ADD COLUMN user_id INTEGER')
  } catch {
    // 列已存在，忽略
  }

  // 迁移：为已存在的 bet_slips 表添加 user_id 列
  try {
    database.exec('ALTER TABLE bet_slips ADD COLUMN user_id INTEGER DEFAULT 1')
  } catch {
    // 列已存在，忽略
  }

  // 迁移：为已存在的 bet_slips 表添加 match_ref_id 列
  try {
    database.exec('ALTER TABLE bet_slips ADD COLUMN match_ref_id INTEGER')
  } catch {
    // 列已存在，忽略
  }

  // ============ 游戏化与社交功能建表 ============
  database.exec(`
    CREATE TABLE IF NOT EXISTS duels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenger_id INTEGER NOT NULL,
      opponent_id INTEGER NOT NULL,
      match_id TEXT NOT NULL,
      match_info TEXT DEFAULT '',
      stake INTEGER DEFAULT 10,
      challenger_pick TEXT DEFAULT '',
      opponent_pick TEXT DEFAULT '',
      result TEXT DEFAULT 'pending',
      winner_id INTEGER,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      settled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_key TEXT NOT NULL,
      unlocked_at TEXT,
      progress INTEGER DEFAULT 0,
      target INTEGER DEFAULT 1,
      UNIQUE(user_id, achievement_key)
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inviter_id INTEGER NOT NULL,
      invitee_id INTEGER,
      code TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'pending',
      reward_claimed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `)

  // ============ matches 表（世界杯赛事结算方案A） ============
  database.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      status TEXT DEFAULT 'upcoming',
      match_date TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `)

  // 迁移：为现有 users 添加邀请码字段
  try {
    database.exec('ALTER TABLE users ADD COLUMN referral_code TEXT')
  } catch { /* 已存在 */ }
  try {
    database.exec('ALTER TABLE users ADD COLUMN checkin_streak INTEGER DEFAULT 0')
  } catch { /* 已存在 */ }
  try {
    database.exec('ALTER TABLE users ADD COLUMN consecutive_days INTEGER DEFAULT 0')
  } catch { /* 已存在 */ }

  // ============ 种子数据（INSERT OR IGNORE 保证幂等） ============

  // 开奖提醒
  const insertAlert = database.prepare(
    'INSERT OR IGNORE INTO alert_subscriptions (id, lottery_name, lottery_type, draw_time, enabled, channel_inapp, channel_wechat, channel_email, channel_sms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const alerts: [number, string, string, string, number, number, number, number, number][] = [
    [1, '双色球', 'ssq', '每周二、四、日 21:15 开奖', 1, 1, 1, 0, 0],
    [2, '大乐透', 'dlt', '每周一、三、六 20:25 开奖', 1, 1, 0, 0, 0],
    [3, '3D福彩', '3d', '每日 20:30 开奖', 0, 0, 0, 0, 0],
    [4, '竞彩足球', 'sport', '赛事结束后 30 分钟内公布', 1, 1, 0, 1, 1],
    [5, '排列五', 'pl5', '每日 20:30 开奖', 0, 0, 0, 0, 0],
  ]
  for (const a of alerts) {
    insertAlert.run(...a)
  }

  // 历史预测
  const insertPred = database.prepare(
    'INSERT OR IGNORE INTO predictions (id, lottery_type, numbers, result, ai_numbers, hit, is_hit, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const now = new Date('2026-06-14')
  const records: { lt: string; numbers: string; result: string; ai_numbers: string; hit: number; is_hit: number; daysAgo: number }[] = [
    { lt: 'ssq', numbers: '05,11,18,23,27,33|09', result: '05,11,18,23,27,33|09', ai_numbers: '05,11,18,23,27,33|09', hit: 7, is_hit: 1, daysAgo: 0 },
    { lt: 'dlt', numbers: '07,13,22,25,31|04,09', result: '07,13,22,25,31|04,09', ai_numbers: '07,13,22,25,31|04,09', hit: 7, is_hit: 1, daysAgo: 1 },
    { lt: 'ssq', numbers: '02,08,14,21,25,30|12', result: '02,08,14,21,25,30|11', ai_numbers: '02,08,14,21,25,30|12', hit: 5, is_hit: 0, daysAgo: 3 },
    { lt: '3d', numbers: '5,3,8', result: '5,3,8', ai_numbers: '5,3,8', hit: 3, is_hit: 1, daysAgo: 4 },
    { lt: 'ssq', numbers: '03,09,15,22,28,31|07', result: '03,10,15,22,28,31|07', ai_numbers: '03,09,15,22,28,31|07', hit: 6, is_hit: 0, daysAgo: 5 },
    { lt: 'dlt', numbers: '03,11,17,24,29|06,11', result: '03,11,17,24,29|06,11', ai_numbers: '03,11,17,24,29|06,11', hit: 7, is_hit: 1, daysAgo: 6 },
    { lt: 'ssq', numbers: '04,10,16,19,26,32|14', result: '04,10,16,19,26,32|14', ai_numbers: '04,10,16,19,26,32|14', hit: 7, is_hit: 1, daysAgo: 8 },
    { lt: 'dlt', numbers: '05,14,19,27,33|02,08', result: '05,14,19,27,33|03,08', ai_numbers: '05,14,19,27,33|02,08', hit: 6, is_hit: 0, daysAgo: 9 },
    { lt: '3d', numbers: '1,7,4', result: '1,6,4', ai_numbers: '1,7,4', hit: 2, is_hit: 0, daysAgo: 11 },
    { lt: 'ssq', numbers: '01,07,13,20,24,29|05', result: '01,07,13,20,25,29|05', ai_numbers: '01,07,13,20,24,29|05', hit: 5, is_hit: 0, daysAgo: 12 },
    { lt: 'dlt', numbers: '08,12,21,26,30|05,10', result: '08,12,21,26,30|05,10', ai_numbers: '08,12,21,26,30|05,10', hit: 7, is_hit: 1, daysAgo: 13 },
    { lt: 'ssq', numbers: '06,12,17,21,25,33|08', result: '06,11,17,21,25,33|08', ai_numbers: '06,12,17,21,25,33|08', hit: 5, is_hit: 0, daysAgo: 15 },
    { lt: '3d', numbers: '9,2,6', result: '9,2,6', ai_numbers: '9,2,6', hit: 3, is_hit: 1, daysAgo: 16 },
    { lt: 'dlt', numbers: '02,09,16,23,28|03,07', result: '02,09,15,23,28|03,07', ai_numbers: '02,09,16,23,28|03,07', hit: 6, is_hit: 0, daysAgo: 18 },
    { lt: 'ssq', numbers: '03,08,14,22,27,31|11', result: '03,08,14,22,27,31|11', ai_numbers: '03,08,14,22,27,31|11', hit: 7, is_hit: 1, daysAgo: 19 },
    { lt: 'dlt', numbers: '07,13,22,25,31|04,09', result: '07,13,22,25,31|04,09', ai_numbers: '07,13,22,25,31|04,09', hit: 7, is_hit: 1, daysAgo: 20 },
    { lt: 'ssq', numbers: '05,10,15,19,26,30|04', result: '05,10,15,19,28,30|04', ai_numbers: '05,10,15,19,26,30|04', hit: 5, is_hit: 0, daysAgo: 22 },
    { lt: '3d', numbers: '3,6,0', result: '3,6,0', ai_numbers: '3,6,0', hit: 3, is_hit: 1, daysAgo: 24 },
    { lt: 'ssq', numbers: '02,09,16,23,28,32|13', result: '02,09,16,23,28,32|13', ai_numbers: '02,09,16,23,28,32|13', hit: 7, is_hit: 1, daysAgo: 26 },
    { lt: 'dlt', numbers: '08,12,20,26,30|05,10', result: '08,12,20,26,30|05,11', ai_numbers: '08,12,20,26,30|05,10', hit: 6, is_hit: 0, daysAgo: 28 },
  ]
  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const d = new Date(now)
    d.setDate(d.getDate() - r.daysAgo)
    insertPred.run(i + 1, r.lt, r.numbers, r.result, r.ai_numbers, r.hit, r.is_hit, 1, d.toISOString().slice(0, 10) + ' 10:00:00')
  }

  // 积分流水
  const insertPts = database.prepare(
    'INSERT OR IGNORE INTO points_history (id, amount, reason, type, detail, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  const ptsRecords: [number, number, string, string, string, number, string][] = [
    [1, 10, '每日签到', 'earn', '签到获得 10 积分', 1, '2026-06-14 08:30:00'],
    [2, 5, '完成 AI 预测', 'earn', '双色球预测', 1, '2026-06-14 09:00:00'],
    [3, 20, '分享预测结果', 'earn', '分享到社区', 1, '2026-06-13 14:20:00'],
    [4, 5, '完成 AI 预测', 'earn', '大乐透预测', 1, '2026-06-13 09:00:00'],
    [5, 10, '每日签到', 'earn', '签到获得 10 积分', 1, '2026-06-13 08:15:00'],
    [6, 100, '连续签到 7 天', 'earn', '连续签到 7 天奖励', 1, '2026-06-12 08:00:00'],
    [7, 5, '完成 AI 预测', 'earn', '福彩3D 预测', 1, '2026-06-12 09:00:00'],
    [8, 10, '每日签到', 'earn', '签到获得 10 积分', 1, '2026-06-12 08:00:00'],
    [9, -50, '兑换道具', 'spend', '兑换高级分析次数', 1, '2026-06-11 16:00:00'],
    [10, 5, '完成 AI 预测', 'earn', '竞彩足球预测', 1, '2026-06-11 10:00:00'],
    [11, 10, '每日签到', 'earn', '签到获得 10 积分', 1, '2026-06-11 08:00:00'],
    [12, -100, '模拟投注', 'spend', '竞彩足球模拟投注', 1, '2026-06-10 22:00:00'],
    [13, 20, '分享预测结果', 'earn', '分享到社区', 1, '2026-06-10 20:00:00'],
    [14, 10, '每日签到', 'earn', '签到获得 10 积分', 1, '2026-06-10 08:00:00'],
    [15, 5, '完成 AI 预测', 'earn', '排列五预测', 1, '2026-06-09 09:00:00'],
  ]
  for (const p of ptsRecords) {
    insertPts.run(...p)
  }

  // matches 种子数据（基于 worldCupMatches 前三场）
  const insertMatch = database.prepare(
    'INSERT OR IGNORE INTO matches (id, home_team, away_team, home_score, away_score, status, match_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  const matchSeeds: [number, string, string, number, number, string, string][] = [
    [1, '卡塔尔', '瑞士', 1, 2, 'finished', '2026-06-14'],
    [2, '巴西', '摩洛哥', 3, 1, 'finished', '2026-06-14'],
    [3, '海地', '苏格兰', 0, 2, 'finished', '2026-06-14'],
  ]
  for (const m of matchSeeds) {
    insertMatch.run(...m)
  }

  // 投注记录
  const insertBet = database.prepare(
    'INSERT OR IGNORE INTO bet_slips (id, match_id, pick, odds, total_odds, cost, won, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const bets: [number, string, string, number, number, number, number, string][] = [
    [1, 's1', 'home', 1.85, 3.89, 100, 1, '2026-06-13 22:00:00'],
    [2, 's3', 'home', 2.1, 3.89, 100, 0, '2026-06-12 22:00:00'],
    [3, 's2', 'draw', 3.1, 9.65, 100, 0, '2026-06-11 22:00:00'],
  ]
  for (const b of bets) {
    insertBet.run(...b)
  }

  // 更新 bet_slips 的 match_ref_id（s1→1, s2→2, s3→3）
  database.exec(`
    UPDATE bet_slips SET match_ref_id = CASE match_id
      WHEN 's1' THEN 1
      WHEN 's2' THEN 2
      WHEN 's3' THEN 3
    END
    WHERE match_id IN ('s1', 's2', 's3') AND match_ref_id IS NULL
  `)

  console.log('[DB] 数据库初始化完成')
}

// 显式调用（Next.js 冷启动时由第一个 API 路由触发）
export function initDB(): void {
  getDB() // 首次调用触发 initDBInternal
}
