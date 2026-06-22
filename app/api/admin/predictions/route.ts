import { NextRequest, NextResponse } from 'next/server'
import { parseAdminFromRequest } from '@/lib/adminAuth'
import { checkRateLimitEnhanced, buildRateLimitHeaders } from '@/lib/rateLimit'
import { getDB } from '@/lib/db'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const admin = parseAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ code: -1, message: '未授权' }, { status: 401 })
  }

  const rateResult = checkRateLimitEnhanced(ip, '/api/admin/predictions', admin.adminId)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { code: -1, message: '请求过于频繁' },
      { status: 429, headers: buildRateLimitHeaders(rateResult) }
    )
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const lotteryType = url.searchParams.get('lottery_type') || ''
    const offset = (page - 1) * limit

    const db = getDB()

    let whereClause = 'WHERE 1=1'
    const params: (string | number)[] = []

    if (lotteryType) {
      whereClause += ' AND p.lottery_type = ?'
      params.push(lotteryType)
    }

    const countSql = `SELECT COUNT(*) as total FROM predictions p ${whereClause}`
    const dataSql = `
      SELECT p.id, p.lottery_type, p.numbers, p.result, p.ai_numbers, p.hit, p.is_hit, p.created_at,
             COALESCE(u.username, '匿名') as username
      FROM predictions p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `

    const totalRow = db.prepare(countSql).get(...params) as { total: number }
    const predictions = db.prepare(dataSql).all(...params, limit, offset) as Array<{
      id: number
      lottery_type: string
      numbers: string
      result: string | null
      ai_numbers: string
      hit: number
      is_hit: number
      created_at: string
      username: string
    }>

    // 按类型统计准确率
    const accuracyByType = db.prepare(`
      SELECT lottery_type,
        COUNT(*) as total,
        SUM(CASE WHEN is_hit = 1 THEN 1 ELSE 0 END) as hits
      FROM predictions
      WHERE result IS NOT NULL AND result != ''
      GROUP BY lottery_type
    `).all() as Array<{ lottery_type: string; total: number; hits: number }>

    const typeAccuracy = accuracyByType.map(t => ({
      type: t.lottery_type,
      total: t.total,
      hits: t.hits,
      accuracy: t.total > 0 ? Math.round((t.hits / t.total) * 1000) / 10 : 0,
    }))

    return NextResponse.json({
      code: 0,
      data: {
        predictions,
        typeAccuracy,
        total: totalRow.total,
        page,
        limit,
        totalPages: Math.ceil(totalRow.total / limit),
      },
    }, { headers: buildRateLimitHeaders(rateResult) })
  } catch {
    return NextResponse.json({ code: -1, message: '服务器错误' }, { status: 500 })
  }
}
