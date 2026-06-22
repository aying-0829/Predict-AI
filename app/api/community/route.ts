import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'

async function handler(req: OptionalAuthRequest) {
  const db = getDB()
  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'feed'

  // ===== 发帖 / 回帖 =====
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const { content, match_tag } = body
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ code: -1, message: '内容不能为空' }, { status: 400 })
      }
      if (content.length > 2000) {
        return NextResponse.json({ code: -1, message: '内容不能超过2000字' }, { status: 400 })
      }
      const userId = req.user?.id || 1
      let username = '匿名用户'
      if (req.user?.id) {
        const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.user.id) as { username: string } | undefined
        if (user) username = user.username
      }
      const result = db.prepare(
        'INSERT INTO posts (user_id, username, content, match_tag) VALUES (?, ?, ?, ?)'
      ).run(userId, username, content.trim(), match_tag || '')
      const newPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>
      return NextResponse.json({
        code: 0,
        data: {
          id: newPost.id,
          username: newPost.username,
          content: newPost.content,
          match_tag: newPost.match_tag,
          likes: newPost.likes,
          views: newPost.views,
          createdAt: newPost.created_at,
        },
      })
    } catch {
      return NextResponse.json({ code: -1, message: '发帖失败' }, { status: 500 })
    }
  }

  // ===== 帖子列表 =====
  if (type === 'posts') {
    const posts = db.prepare(`
      SELECT id, username, content, match_tag, likes, views, created_at
      FROM posts
      ORDER BY created_at DESC
      LIMIT 50
    `).all() as Array<Record<string, unknown>>

    return NextResponse.json({
      code: 0,
      data: posts.map((p) => ({
        id: p.id,
        username: p.username,
        content: p.content,
        matchTag: p.match_tag,
        likes: p.likes,
        views: p.views,
        createdAt: p.created_at,
      })),
    })
  }

  if (type === 'top-predictors') {
    const predictors = db.prepare(`
      SELECT id, username, points, total_predictions, total_hits,
             CASE WHEN total_predictions >= 10 THEN ROUND(CAST(total_hits AS REAL) / total_predictions * 100, 1) ELSE 0 END as accuracy,
             current_streak
      FROM users
      WHERE total_predictions >= 5
      ORDER BY accuracy DESC, total_predictions DESC
      LIMIT 6
    `).all() as Array<Record<string, unknown>>

    return NextResponse.json({
      code: 0,
      data: predictors.map((p) => ({
        userId: p.id,
        username: p.username,
        accuracy: p.accuracy,
        totalPredictions: p.total_predictions,
        currentStreak: p.current_streak,
      })),
    })
  }

  if (type === 'hot-topics') {
    const topics = [
      { tag: '世界杯', count: 32 },
      { tag: 'AI预测', count: 28 },
      { tag: '双色球', count: 24 },
      { tag: '冷门分析', count: 18 },
      { tag: '连胜秘诀', count: 15 },
      { tag: '积分攻略', count: 12 },
    ]
    return NextResponse.json({ code: 0, data: topics })
  }

  // type === 'feed': 预测动态流
  const predictions = db.prepare(`
    SELECT p.*, u.username
    FROM predictions p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all() as Array<Record<string, unknown>>

  return NextResponse.json({
    code: 0,
    data: predictions.map((p) => ({
      id: p.id,
      userId: p.user_id,
      username: p.username,
      lotteryType: p.lottery_type,
      numbers: p.numbers,
      result: p.result,
      isHit: p.is_hit,
      createdAt: p.created_at,
    })),
  })
}

export const GET = withOptionalAuth(handler)
export const POST = withOptionalAuth(handler)
