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

  // ============ matches 表字段迁移（try/catch 幂等） ============
  try { database.exec('ALTER TABLE matches ADD COLUMN group_name TEXT DEFAULT \'\'') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN stadium TEXT DEFAULT \'\'') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN city TEXT DEFAULT \'\'') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN match_time TEXT DEFAULT \'\'') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN home_flag TEXT DEFAULT \'\'') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN away_flag TEXT DEFAULT \'\'') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN minute INTEGER DEFAULT NULL') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN home_score_ht INTEGER DEFAULT NULL') } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN away_score_ht INTEGER DEFAULT NULL') } catch { /* 已存在 */ }
  try { database.exec("ALTER TABLE matches ADD COLUMN source_id TEXT DEFAULT ''") } catch { /* 已存在 */ }
  try { database.exec("ALTER TABLE matches ADD COLUMN home_scorers TEXT DEFAULT ''") } catch { /* 已存在 */ }
  try { database.exec("ALTER TABLE matches ADD COLUMN away_scorers TEXT DEFAULT ''") } catch { /* 已存在 */ }
  try { database.exec('ALTER TABLE matches ADD COLUMN matchday INTEGER DEFAULT NULL') } catch { /* 已存在 */ }
  try { database.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_source_id ON matches(source_id)') } catch { /* 已存在 */ }

  // ============ wc_matches 表（worldcup26.ir 同步专用） ============
  database.exec(`
    CREATE TABLE IF NOT EXISTS wc_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER UNIQUE NOT NULL,
      home_team TEXT NOT NULL DEFAULT '',
      away_team TEXT NOT NULL DEFAULT '',
      home_score INTEGER DEFAULT NULL,
      away_score INTEGER DEFAULT NULL,
      home_scorers TEXT DEFAULT '',
      away_scorers TEXT DEFAULT '',
      status TEXT DEFAULT 'scheduled',
      group_name TEXT DEFAULT '',
      stadium TEXT DEFAULT '',
      match_date TEXT DEFAULT '',
      match_time TEXT DEFAULT '',
      time_elapsed TEXT DEFAULT '',
      matchday INTEGER DEFAULT NULL,
      match_type TEXT DEFAULT 'group',
      finished INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `)

  // ============ 比赛事件 & 新闻表 ============
  database.exec(`
    CREATE TABLE IF NOT EXISTS match_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      minute INTEGER NOT NULL,
      team TEXT DEFAULT '',
      player_name TEXT DEFAULT '',
      detail TEXT DEFAULT '',
      extra TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      category TEXT DEFAULT '世界杯',
      source TEXT DEFAULT '',
      published_at TEXT NOT NULL,
      url TEXT DEFAULT '',
      breaking INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
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

  // matches 种子数据（完整世界杯赛程，INSERT OR IGNORE 保证幂等）
  const insertMatch = database.prepare(
    'INSERT OR IGNORE INTO matches (id, home_team, away_team, home_score, away_score, status, match_date, match_time, group_name, stadium, city, home_flag, away_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const matchSeeds: [number, string, string, number | null, number | null, string, string, string, string, string, string, string, string][] = [
    [1, '墨西哥', '南非', 2, 0, 'finished', '2026-06-11', '16:00', 'A', '墨西哥城体育场', '墨西哥城', 'MX', 'ZA'],
    [2, '韩国', '捷克', 2, 1, 'finished', '2026-06-11', '19:00', 'A', '瓜达拉哈拉体育场', '瓜达拉哈拉', 'KR', 'CZ'],
    [3, '加拿大', '波黑', 1, 1, 'finished', '2026-06-12', '16:00', 'B', '多伦多体育场', '多伦多', 'CA', 'BA'],
    [4, '瑞士', '卡塔尔', 1, 1, 'finished', '2026-06-12', '19:00', 'B', '蒙特利尔体育场', '蒙特利尔', 'CH', 'QA'],
    [5, '美国', '巴拉圭', 4, 1, 'finished', '2026-06-12', '20:00', 'D', '洛杉矶体育场', '洛杉矶', 'US', 'PY'],
    [6, '海地', '苏格兰', 0, 1, 'finished', '2026-06-13', '14:00', 'C', '波士顿体育场', '波士顿', 'HT', 'GB'],
    [7, '澳大利亚', '土耳其', 2, 0, 'finished', '2026-06-13', '16:00', 'D', '温哥华BC体育场', '温哥华', 'AU', 'TR'],
    [8, '巴西', '摩洛哥', 1, 1, 'finished', '2026-06-13', '20:00', 'C', '纽约新泽西体育场', '纽约', 'BR', 'MA'],
    [9, '德国', '库拉索', 7, 1, 'finished', '2026-06-14', '14:00', 'E', '慕尼黑安联球场', '慕尼黑', 'DE', 'CW'],
    [10, '科特迪瓦', '厄瓜多尔', 1, 0, 'finished', '2026-06-14', '17:00', 'E', '柏林奥林匹克球场', '柏林', 'CI', 'EC'],
    [11, '荷兰', '日本', 2, 2, 'finished', '2026-06-14', '20:00', 'F', '阿姆斯特丹竞技场', '阿姆斯特丹', 'NL', 'JP'],
    [12, '瑞典', '突尼斯', 5, 1, 'finished', '2026-06-15', '14:00', 'F', '斯德哥尔摩友谊竞技场', '斯德哥尔摩', 'SE', 'TN'],
    [13, '比利时', '埃及', 1, 1, 'finished', '2026-06-15', '17:00', 'G', '布鲁塞尔体育场', '布鲁塞尔', 'BE', 'EG'],
    [14, '伊朗', '新西兰', 2, 2, 'finished', '2026-06-15', '20:00', 'G', '德黑兰体育场', '德黑兰', 'IR', 'NZ'],
    [15, '西班牙', '佛得角', 0, 0, 'finished', '2026-06-16', '14:00', 'H', '巴塞罗那诺坎普', '巴塞罗那', 'ES', 'CV'],
    [16, '沙特阿拉伯', '乌拉圭', 1, 1, 'finished', '2026-06-16', '17:00', 'H', '马德里大都会球场', '马德里', 'SA', 'UY'],
    [17, '法国', '塞内加尔', 3, 1, 'finished', '2026-06-16', '20:00', 'I', '巴黎法兰西球场', '巴黎', 'FR', 'SN'],
    [18, '挪威', '伊拉克', 4, 1, 'finished', '2026-06-17', '14:00', 'I', '奥斯陆体育场', '奥斯陆', 'NO', 'IQ'],
    [19, '阿根廷', '阿尔及利亚', 3, 0, 'finished', '2026-06-17', '17:00', 'J', '布宜诺斯艾利斯纪念碑球场', '布宜诺斯艾利斯', 'AR', 'DZ'],
    [20, '奥地利', '约旦', 3, 1, 'finished', '2026-06-17', '20:00', 'J', '维也纳体育场', '维也纳', 'AT', 'JO'],
    [21, '葡萄牙', '刚果(金)', 1, 1, 'finished', '2026-06-18', '14:00', 'K', '里斯本光明球场', '里斯本', 'PT', 'CD'],
    [22, '哥伦比亚', '乌兹别克斯坦', 3, 1, 'finished', '2026-06-18', '17:00', 'K', '波哥大体育场', '波哥大', 'CO', 'UZ'],
    [23, '英格兰', '克罗地亚', 4, 2, 'finished', '2026-06-18', '20:00', 'L', '伦敦温布利球场', '伦敦', 'GB', 'HR'],
    [24, '加纳', '巴拿马', 1, 0, 'finished', '2026-06-19', '14:00', 'L', '阿克拉体育场', '阿克拉', 'GH', 'PA'],
    [25, '墨西哥', '韩国', 1, 0, 'finished', '2026-06-19', '17:00', 'A', '墨西哥城体育场', '墨西哥城', 'MX', 'KR'],
    [26, '捷克', '南非', 1, 1, 'finished', '2026-06-19', '20:00', 'A', '瓜达拉哈拉体育场', '瓜达拉哈拉', 'CZ', 'ZA'],
    [27, '加拿大', '卡塔尔', 6, 0, 'finished', '2026-06-20', '14:00', 'B', '多伦多体育场', '多伦多', 'CA', 'QA'],
    [28, '瑞士', '波黑', 4, 1, 'finished', '2026-06-20', '17:00', 'B', '蒙特利尔体育场', '蒙特利尔', 'CH', 'BA'],
    [29, '巴西', '海地', 3, 0, 'finished', '2026-06-20', '20:00', 'C', '纽约新泽西体育场', '纽约', 'BR', 'HT'],
    [30, '摩洛哥', '苏格兰', 1, 0, 'finished', '2026-06-20', '20:00', 'C', '波士顿体育场', '波士顿', 'MA', 'GB'],
    [31, '美国', '澳大利亚', 2, 0, 'finished', '2026-06-21', '14:00', 'D', '洛杉矶体育场', '洛杉矶', 'US', 'AU'],
    [32, '巴拉圭', '土耳其', 1, 0, 'finished', '2026-06-21', '17:00', 'D', '温哥华BC体育场', '温哥华', 'PY', 'TR'],
    [33, '德国', '科特迪瓦', 2, 1, 'finished', '2026-06-21', '20:00', 'E', '慕尼黑安联球场', '慕尼黑', 'DE', 'CI'],
    [34, '厄瓜多尔', '库拉索', 0, 0, 'finished', '2026-06-21', '20:00', 'E', '柏林奥林匹克球场', '柏林', 'EC', 'CW'],
    [35, '荷兰', '瑞典', 5, 1, 'finished', '2026-06-22', '14:00', 'F', '阿姆斯特丹竞技场', '阿姆斯特丹', 'NL', 'SE'],
    [36, '日本', '突尼斯', 4, 0, 'finished', '2026-06-22', '17:00', 'F', '埼玉体育场', '埼玉', 'JP', 'TN'],
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

  // news 种子数据（INSERT OR REPLACE 保证幂等）
  const insertNews = database.prepare(
    'INSERT OR REPLACE INTO news (id, title, summary, thumbnail, category, source, published_at, url, breaking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  const newsSeeds: [string, string, string, string, string, string, string, string, number][] = [
    ['n1', '世界杯小组赛D组：巴西3-0完胜摩洛哥 维尼修斯梅开二度', '桑巴军团延续强势表现，维尼修斯在上半场梅开二度，帮助巴西队以3-0横扫摩洛哥，提前一轮锁定小组头名。', '', '世界杯', 'ESPN', '2026-06-17T08:30:00Z', '#', 1],
    ['n2', '英超：曼城官方宣布与哈兰德续约至2031年', '曼城正式宣布挪威前锋哈兰德签署新合同，周薪将突破50万英镑，成为英超历史第一高薪。', '', '英超', 'BBC Sport', '2026-06-17T06:15:00Z', '#', 1],
    ['n3', '西甲转会：皇马接近签下拜仁中场穆西亚拉', '据多家媒体证实，皇家马德里已与拜仁慕尼黑就穆西亚拉的转会达成初步协议，转会费预计达到1.2亿欧元。', '', '西甲', 'Marca', '2026-06-16T22:00:00Z', '#', 0],
    ['n4', '意甲：AC米兰官宣新主帅 孔蒂正式上任', 'AC米兰正式宣布安东尼奥·孔蒂出任球队新任主教练，双方签约三年，年薪达到800万欧元。', '', '意甲', 'Gazzetta', '2026-06-16T18:45:00Z', '#', 0],
    ['n5', '德甲：勒沃库森提前三轮卫冕成功', '阿隆索执教的勒沃库森在客场2-0击败多特蒙德后，提前三轮锁定德甲冠军，完成卫冕壮举。', '', '德甲', 'Kicker', '2026-06-16T15:20:00Z', '#', 0],
    ['n6', '彩市动态：大乐透奖池突破28亿 创今年新高', '体彩大乐透最新一期开奖后，奖池金额攀升至28.36亿元，创下2026年以来的最高纪录。', '', '彩票', '中国体彩网', '2026-06-17T07:00:00Z', '#', 0],
    ['n7', '世界杯G组：瑞士2-1逆转卡塔尔 小组头名晋级', '瑞士队在先失一球的情况下连扳两球，以2-1逆转战胜东道主卡塔尔，以G组头名身份晋级淘汰赛。', '', '世界杯', 'FIFA', '2026-06-16T20:00:00Z', '#', 0],
    ['n8', '英超：利物浦宣布新赛季季票价格冻结', '利物浦官方宣布2026-27赛季季票价格维持不变，这也是连续第三年不涨价。', '', '英超', 'Liverpool Echo', '2026-06-16T12:00:00Z', '#', 0],
    ['n9', '西甲：巴萨青年队夺得欧洲青年联赛冠军', '巴塞罗那U19梯队以3-1击败本菲卡，夺得2025-26赛季欧洲青年联赛冠军。', '', '西甲', 'Sport', '2026-06-15T19:30:00Z', '#', 0],
    ['n10', '彩市动态：竞彩足球世界杯期间销量增长215%', '据国家体彩中心数据，竞彩足球在2026世界杯期间销量同比增长215%，单日最高销售额突破50亿元。', '', '彩票', '新华网', '2026-06-15T10:00:00Z', '#', 0],
    ['n11', '德甲：多特蒙德官宣签下日本国脚久保健英', '多特蒙德以4500万欧元从皇家社会签下日本前锋久保健英，合同期至2030年。', '', '德甲', 'BILD', '2026-06-15T14:00:00Z', '#', 0],
    ['n12', '意甲：尤文图斯宣布今夏亚洲行计划', '尤文图斯官方公布了今年7月的亚洲行计划，将在中国北京、上海和日本东京进行三场友谊赛。', '', '意甲', 'Football Italia', '2026-06-14T16:00:00Z', '#', 0],
  ]
  for (const n of newsSeeds) {
    insertNews.run(...n)
  }

  console.log('[DB] 数据库初始化完成')
}

// 显式调用（Next.js 冷启动时由第一个 API 路由触发）
export function initDB(): void {
  getDB() // 首次调用触发 initDBInternal
}
