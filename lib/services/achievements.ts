import { getDB } from '@/lib/db'

export interface AchievementDef {
  key: string
  name: string
  description: string
  icon: string
  category: 'prediction' | 'checkin' | 'social' | 'mastery' | 'special'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'perfect_day', name: '百发百中', description: '单日全部预测命中', icon: '🎯', category: 'prediction' },
  { key: 'hundred_wins', name: '常胜将军', description: '累计获得 100 场胜利', icon: '🏆', category: 'prediction' },
  { key: 'checkin_7', name: '初露锋芒', description: '连续签到 7 天', icon: '🔥', category: 'checkin' },
  { key: 'checkin_30', name: '坚持不懈', description: '连续签到 30 天', icon: '💎', category: 'checkin' },
  { key: 'master_predictor', name: '预测大师', description: '总准确率超过 70%', icon: '🧠', category: 'mastery' },
  { key: 'social_butterfly', name: '社交达人', description: '成功邀请 5 位好友', icon: '🦋', category: 'social' },
  { key: 'first_win', name: '首战告捷', description: '完成第一次预测并命中', icon: '⚡', category: 'special' },
  { key: 'underdog_hunter', name: '冷门猎手', description: '预测冷门结果且正确', icon: '🐺', category: 'special' },
  { key: 'jack_of_all', name: '百科全能', description: '所有赛事类型均有预测记录', icon: '🌟', category: 'mastery' },
  { key: 'fifty_wins', name: '五十胜', description: '累计获得 50 场胜利', icon: '🥇', category: 'prediction' },
  { key: 'ten_wins', name: '十连胜', description: '连续 10 次预测命中', icon: '⚔️', category: 'prediction' },
  { key: 'betting_king', name: '投注之王', description: '累计投注金额超过 10000', icon: '👑', category: 'mastery' },
]

export function getAchievementDef(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.key === key)
}

/** 确保用户的成就记录存在 */
export function ensureUserAchievements(db: ReturnType<typeof getDB>, userId: number): void {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO user_achievements (user_id, achievement_key, progress, target) VALUES (?, ?, 0, ?)'
  )
  for (const ach of ACHIEVEMENTS) {
    insert.run(userId, ach.key, getTargetForAchievement(ach.key, userId))
  }
}

function getTargetForAchievement(key: string, _userId: number): number {
  switch (key) {
    case 'hundred_wins': return 100
    case 'checkin_7': return 7
    case 'checkin_30': return 30
    case 'social_butterfly': return 5
    case 'fifty_wins': return 50
    case 'ten_wins': return 10
    case 'betting_king': return 10000
    default: return 1
  }
}

export interface AchievementCheckResult {
  unlocked: string[]
  progress: Record<string, { current: number; target: number }>
}

/** 全量检查用户所有成就，返回新解锁的成就 */
export function checkAllAchievements(userId: number): AchievementCheckResult {
  const db = getDB()
  ensureUserAchievements(db, userId)

  const user = db.prepare(
    'SELECT id, total_predictions, total_hits, current_streak, checkin_streak, consecutive_days, points FROM users WHERE id = ?'
  ).get(userId) as Record<string, number> | undefined

  if (!user) return { unlocked: [], progress: {} }

  const accuracy = user.total_predictions > 0 ? user.total_hits / user.total_predictions : 0

  // 统计邀请数
  const referralCount = (db.prepare(
    "SELECT COUNT(*) as cnt FROM referrals WHERE inviter_id = ? AND status = 'accepted'"
  ).get(userId) as { cnt: number }).cnt

  // 统计胜场数
  const winsCount = (db.prepare(
    'SELECT COUNT(*) as cnt FROM predictions WHERE user_id = ? AND is_hit = 1'
  ).get(userId) as { cnt: number }).cnt

  // 今日全部命中检查
  const today = new Date().toISOString().slice(0, 10)
  const todayPreds = db.prepare(
    "SELECT COUNT(*) as total, SUM(is_hit) as hits FROM predictions WHERE user_id = ? AND created_at >= ?"
  ).get(userId, today) as { total: number; hits: number }
  const todayPerfect = todayPreds.total > 0 && todayPreds.total === todayPreds.hits

  // 冷门检查 (bet_slips 中 odds > 3.0 且 won=1)
  const underdogWin = db.prepare(
    'SELECT COUNT(*) as cnt FROM bet_slips WHERE user_id = ? AND odds > 3.0 AND won = 1'
  ).get(userId) as { cnt: number }

  // 多类型检查
  const typeCount = (db.prepare(
    'SELECT COUNT(DISTINCT lottery_type) as cnt FROM predictions WHERE user_id = ?'
  ).get(userId) as { cnt: number }).cnt
  const allTypes = db.prepare(
    'SELECT COUNT(DISTINCT lottery_type) as cnt FROM predictions'
  ).get() as { cnt: number }

  // 投注总金额
  const totalBet = (db.prepare(
    'SELECT COALESCE(SUM(cost), 0) as total FROM bet_slips WHERE user_id = ?'
  ).get(userId) as { total: number }).total

  const evaluations: Record<string, boolean> = {
    perfect_day: todayPerfect,
    hundred_wins: winsCount >= 100,
    checkin_7: (user.checkin_streak || 0) >= 7,
    checkin_30: (user.checkin_streak || 0) >= 30,
    master_predictor: user.total_predictions >= 20 && accuracy >= 0.7,
    social_butterfly: referralCount >= 5,
    first_win: winsCount >= 1,
    underdog_hunter: underdogWin.cnt > 0,
    jack_of_all: typeCount >= allTypes.cnt && allTypes.cnt > 0,
    fifty_wins: winsCount >= 50,
    ten_wins: (user.current_streak || 0) >= 10,
    betting_king: totalBet >= 10000,
  }

  const progressUpdates: Record<string, { current: number; target: number }> = {
    hundred_wins: { current: winsCount, target: 100 },
    checkin_7: { current: user.checkin_streak || 0, target: 7 },
    checkin_30: { current: user.checkin_streak || 0, target: 30 },
    social_butterfly: { current: referralCount, target: 5 },
    fifty_wins: { current: winsCount, target: 50 },
    ten_wins: { current: user.current_streak || 0, target: 10 },
    betting_king: { current: totalBet, target: 10000 },
  }

  const unlocked: string[] = []

  // 更新进度并检查解锁
  for (const ach of ACHIEVEMENTS) {
    const isUnlocked = evaluations[ach.key] ?? false
    const current = db.prepare(
      'SELECT unlocked_at FROM user_achievements WHERE user_id = ? AND achievement_key = ?'
    ).get(userId, ach.key) as { unlocked_at: string | null } | undefined

    if (current?.unlocked_at) continue // 已解锁

    // 更新进度
    const prog = progressUpdates[ach.key]
    if (prog) {
      db.prepare(
        'UPDATE user_achievements SET progress = ? WHERE user_id = ? AND achievement_key = ?'
      ).run(Math.min(prog.current, prog.target), userId, ach.key)
    }

    // 检查是否新解锁
    if (isUnlocked) {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      db.prepare(
        'UPDATE user_achievements SET unlocked_at = ?, progress = target WHERE user_id = ? AND achievement_key = ?'
      ).run(now, userId, ach.key)
      unlocked.push(ach.key)
    }
  }

  return { unlocked, progress: progressUpdates }
}
