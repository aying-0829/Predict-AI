import { NextRequest, NextResponse } from 'next/server'
import { parseAdminFromRequest } from '@/lib/adminAuth'
import { checkRateLimitEnhanced, buildRateLimitHeaders } from '@/lib/rateLimit'
import { getDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  // Admin 认证
  const admin = parseAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ code: -1, message: '未授权' }, { status: 401 })
  }

  const rateResult = checkRateLimitEnhanced(ip, '/api/admin/realtime', admin.adminId)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { code: -1, message: '请求过于频繁' },
      { status: 429, headers: buildRateLimitHeaders(rateResult) }
    )
  }

  try {
    const db = getDB()
    const today = new Date().toISOString().slice(0, 10)

    // 今日活跃用户数（今天有预测的用户）
    const activeUsers = db.prepare(
      `SELECT COUNT(DISTINCT user_id) as count FROM predictions
       WHERE date(created_at) = ? AND user_id IS NOT NULL`
    ).get(today) as { count: number }

    // 昨日活跃用户（环比计算）
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const yesterdayActive = db.prepare(
      `SELECT COUNT(DISTINCT user_id) as count FROM predictions
       WHERE date(created_at) = ? AND user_id IS NOT NULL`
    ).get(yesterday) as { count: number }

    // 今日新增注册
    const newUsers = db.prepare(
      `SELECT COUNT(*) as count FROM users WHERE date(created_at) = ?`
    ).get(today) as { count: number }

    const yesterdayNewUsers = db.prepare(
      `SELECT COUNT(*) as count FROM users WHERE date(created_at) = ?`
    ).get(yesterday) as { count: number }

    // 今日预测总量
    const totalPredictions = db.prepare(
      `SELECT COUNT(*) as count FROM predictions WHERE date(created_at) = ?`
    ).get(today) as { count: number }

    const yesterdayPredictions = db.prepare(
      `SELECT COUNT(*) as count FROM predictions WHERE date(created_at) = ?`
    ).get(yesterday) as { count: number }

    // 系统平均准确率
    const accuracy = db.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_hit = 1 THEN 1 ELSE 0 END) as hits
       FROM predictions WHERE result IS NOT NULL AND result != ''`
    ).get() as { total: number; hits: number }

    // API 调用量（用 predictions 表当日新增做近似）
    const apiCalls = db.prepare(
      `SELECT COUNT(*) as count FROM predictions WHERE date(created_at) = ?`
    ).get(today) as { count: number }

    const yesterdayApiCalls = db.prepare(
      `SELECT COUNT(*) as count FROM predictions WHERE date(created_at) = ?`
    ).get(yesterday) as { count: number }

    // 最近 1 小时 API 调用（每分钟粒度）
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString().replace('T', ' ').slice(0, 19)
    const hourlyCalls = db.prepare(
      `SELECT strftime('%H:%M', created_at) as minute, COUNT(*) as count
       FROM predictions
       WHERE created_at >= ?
       GROUP BY strftime('%H:%M', created_at)
       ORDER BY minute ASC`
    ).all(oneHourAgo) as { minute: string; count: number }[]

    // 24 小时活跃用户（每小时粒度）
    const dayAgo = new Date(Date.now() - 86400000).toISOString().replace('T', ' ').slice(0, 19)
    const hourlyActive = db.prepare(
      `SELECT strftime('%H', created_at) as hour, COUNT(DISTINCT user_id) as count
       FROM predictions
       WHERE created_at >= ? AND user_id IS NOT NULL
       GROUP BY strftime('%H', created_at)
       ORDER BY hour ASC`
    ).all(dayAgo) as { hour: string; count: number }[]

    const calcChange = (today: number, yesterday: number): number => {
      if (yesterday === 0) return today > 0 ? 100 : 0
      return Math.round(((today - yesterday) / yesterday) * 100)
    }

    return NextResponse.json({
      code: 0,
      data: {
        activeUsers: { value: activeUsers.count, change: calcChange(activeUsers.count, yesterdayActive.count) },
        newUsers: { value: newUsers.count, change: calcChange(newUsers.count, yesterdayNewUsers.count) },
        totalPredictions: { value: totalPredictions.count, change: calcChange(totalPredictions.count, yesterdayPredictions.count) },
        accuracy: {
          value: accuracy.total > 0 ? Math.round((accuracy.hits / accuracy.total) * 1000) / 10 : 0,
          change: 0, // 准确率环比由前端自行计算
        },
        apiCalls: { value: apiCalls.count, change: calcChange(apiCalls.count, yesterdayApiCalls.count) },
        hourlyCalls,
        hourlyActive,
        updatedAt: new Date().toISOString(),
      },
    }, { headers: buildRateLimitHeaders(rateResult) })
  } catch (err) {
    return NextResponse.json({ code: -1, message: '服务器错误' }, { status: 500 })
  }
}
