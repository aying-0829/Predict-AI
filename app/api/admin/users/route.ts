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

  const rateResult = checkRateLimitEnhanced(ip, '/api/admin/users', admin.adminId)
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
    const search = url.searchParams.get('search') || ''
    const offset = (page - 1) * limit

    const db = getDB()

    let countSql = 'SELECT COUNT(*) as total FROM users'
    let dataSql = 'SELECT id, username, phone, membership_type, points, total_predictions, total_hits, current_streak, rank, created_at FROM users'
    const params: (string | number)[] = []

    if (search) {
      const where = ' WHERE username LIKE ? OR phone LIKE ?'
      countSql += where
      dataSql += `${where} ORDER BY id DESC LIMIT ? OFFSET ?`
      params.push(`%${search}%`, `%${search}%`, limit, offset)
    } else {
      dataSql += ' ORDER BY id DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const totalRow = db.prepare(countSql).get(...(search ? [params[0], params[1]] : [])) as { total: number }
    const users = db.prepare(dataSql).all(...params) as Array<{
      id: number
      username: string
      phone: string | null
      membership_type: string
      points: number
      total_predictions: number
      total_hits: number
      current_streak: number
      rank: number
      created_at: string
    }>

    const enriched = users.map(u => ({
      ...u,
      accuracy: u.total_predictions > 0 ? Math.round((u.total_hits / u.total_predictions) * 100) : 0,
    }))

    return NextResponse.json({
      code: 0,
      data: {
        users: enriched,
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
