export type PosterData = {
  accuracy: number
  totalPredictions: number
  hits: number
  recentPredictions: number
  rank: number
  overPercent: number
  streak: number
  template: 'stats' | 'streak' | 'badge' | 'winstreak-flame' | 'predict-compare' | 'invite'
  maxStreak?: number
  recentResults?: { date: string; result: string; hit: boolean }[]
  unlockedBadges?: { name: string; icon: string; unlockedAt: string }[]
  lockedBadges?: { name: string; icon: string; requirement: string }[]
  nickname?: string
  avatarUrl?: string
  inviteCode?: string
  rewardPoints?: number
}

export function getPosterData(template?: 'stats' | 'streak' | 'badge' | 'winstreak-flame' | 'predict-compare' | 'invite'): PosterData {
  const base: PosterData = {
    accuracy: 67.3,
    totalPredictions: 56,
    hits: 38,
    recentPredictions: 12,
    rank: 42,
    overPercent: 89,
    streak: 6,
    template: template || 'stats',
  }

  if (template === 'streak') {
    base.maxStreak = 12
    base.recentResults = [
      { date: '06-14', result: '巴西 2-0 摩洛哥', hit: true },
      { date: '06-13', result: '法国 1-1 英格兰', hit: true },
      { date: '06-12', result: '阿根廷 2-1 德国', hit: true },
      { date: '06-11', result: '双色球 4+1', hit: true },
      { date: '06-10', result: '西班牙 1-1 葡萄牙', hit: true },
      { date: '06-09', result: '大乐透 3+2', hit: true },
    ]
  }

  if (template === 'badge') {
    base.unlockedBadges = [
      { name: '白银预言家', icon: '🔮', unlockedAt: '2026-05-20' },
      { name: '连中三元', icon: '🎯', unlockedAt: '2026-06-01' },
      { name: '月度之星', icon: '⭐', unlockedAt: '2026-06-10' },
    ]
    base.lockedBadges = [
      { name: '黄金预言家', icon: '🏆', requirement: '累计命中 100 次' },
      { name: '十连斩', icon: '⚔️', requirement: '连胜 10 场' },
      { name: '全知全能', icon: '🌟', requirement: '全彩种命中率 > 80%' },
      { name: '社区领袖', icon: '👑', requirement: '社区积分 > 5000' },
      { name: '年度 MVP', icon: '💎', requirement: '年度排名前 10' },
    ]
  }

  if (template === 'winstreak-flame') {
    base.maxStreak = 12
    base.hits = 38
  }

  if (template === 'predict-compare') {
    base.hits = 38
    base.totalPredictions = 56
    base.overPercent = 89
  }

  if (template === 'invite') {
    base.inviteCode = `PREDICT${String(base.rank).padStart(4, '0')}`
    base.rewardPoints = 200
  }

  return base
}
