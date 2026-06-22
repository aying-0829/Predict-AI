import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'

async function handler(req: OptionalAuthRequest) {
  const db = getDB()
  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'accuracy'
  const season = url.searchParams.get('season') || 'current'
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)

  let orderBy: string
  let title: string
  switch (type) {
    case 'streak':
      orderBy = 'longest_streak DESC, current_streak DESC'
      title = '连胜榜'
      break
    case 'points':
      orderBy = 'points DESC'
      title = '积分榜'
      break
    case 'accuracy':
    default:
      orderBy = 'CASE WHEN total_predictions >= 10 THEN CAST(total_hits AS REAL) / total_predictions ELSE 0 END DESC, total_predictions DESC'
      title = '准确率榜'
      break
  }

  const users = db.prepare(`
    SELECT id, username, points, total_predictions, total_hits,
           current_streak, longest_streak,
           CASE WHEN total_predictions >= 10 THEN ROUND(CAST(total_hits AS REAL) / total_predictions * 100, 1) ELSE 0 END as accuracy
    FROM users
    WHERE total_predictions > 0
    ORDER BY ${orderBy}
    LIMIT ?
  `).all(limit) as Array<Record<string, unknown>>

  // Mock 兜底：DB 为空时生成示例排行榜数据
  let list: Array<{ rank: number; userId: number; username: string; points: number; totalPredictions: number; totalHits: number; accuracy: number; currentStreak: number; longestStreak: number }>
  if (users.length === 0) {
    const mockNames = ['预言大师', '数据猎人', '绿茵智者', '蓝球猎手', '概率之眼', '冷门捕手', '金球先生', '战术鬼才', '赛前雷达', '胜率机器', '稳胆先锋', '波胆达人']
    list = mockNames.map((name, i) => {
      const totalPredictions = 20 + Math.floor(Math.random() * 40)
      const totalHits = Math.floor(totalPredictions * (0.5 + Math.random() * 0.35))
      return {
        rank: i + 1,
        userId: 1000 + i,
        username: name,
        points: 1000 - i * 50 + Math.floor(Math.random() * 100),
        totalPredictions,
        totalHits,
        accuracy: totalPredictions > 0 ? Math.round((totalHits / totalPredictions) * 1000) / 10 : 0,
        currentStreak: Math.floor(Math.random() * 8),
        longestStreak: 5 + Math.floor(Math.random() * 10),
      }
    })
    list.sort((a, b) => {
      if (type === 'streak') return b.longestStreak - a.longestStreak
      if (type === 'points') return b.points - a.points
      return b.accuracy - a.accuracy
    })
    list = list.map((u, i) => ({ ...u, rank: i + 1 }))
  } else {
    list = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id as number,
      username: u.username as string,
      points: u.points as number,
      totalPredictions: u.total_predictions as number,
      totalHits: u.total_hits as number,
      accuracy: u.accuracy as number,
      currentStreak: u.current_streak as number,
      longestStreak: u.longest_streak as number,
    }))
  }

  // 获取当前用户排名
  let myRank: { rank: number; accuracy: number } | null = null
  if (req.user?.id) {
    const allUsers = db.prepare(`
      SELECT id, CASE WHEN total_predictions >= 10 THEN ROUND(CAST(total_hits AS REAL) / total_predictions * 100, 1) ELSE 0 END as accuracy
      FROM users WHERE total_predictions > 0
      ORDER BY ${orderBy}
    `).all() as Array<{ id: number; accuracy: number }>

    const idx = allUsers.findIndex((u) => u.id === req.user!.id)
    if (idx >= 0) {
      myRank = { rank: idx + 1, accuracy: allUsers[idx].accuracy }
    }
  }

  return NextResponse.json({
    code: 0,
    data: {
      title,
      type,
      season,
      list: users.map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        username: u.username,
        points: u.points,
        totalPredictions: u.total_predictions,
        totalHits: u.total_hits,
        accuracy: u.accuracy,
        currentStreak: u.current_streak,
        longestStreak: u.longest_streak,
      })),
      myRank,
    },
  })
}

export const GET = withOptionalAuth(handler)
