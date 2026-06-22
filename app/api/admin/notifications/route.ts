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

  const rateResult = checkRateLimitEnhanced(ip, '/api/admin/notifications', admin.adminId)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { code: -1, message: '请求过于频繁' },
      { status: 429, headers: buildRateLimitHeaders(rateResult) }
    )
  }

  const db = getDB()

  try {
    const page = parseInt(new URL(req.url).searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const total = (db.prepare('SELECT COUNT(*) as count FROM admin_notifications').get() as { count: number }).count
    const notifications = db.prepare(
      'SELECT * FROM admin_notifications ORDER BY id DESC LIMIT ? OFFSET ?'
    ).all(limit, offset)

    return NextResponse.json({
      code: 0,
      data: { notifications, total, page, limit, totalPages: Math.ceil(total / limit) },
    }, { headers: buildRateLimitHeaders(rateResult) })
  } catch {
    return NextResponse.json({ code: -1, message: '获取通知列表失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const admin = parseAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ code: -1, message: '未授权' }, { status: 401 })
  }

  const rateResult = checkRateLimitEnhanced(ip, '/api/admin/notifications', admin.adminId)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { code: -1, message: '请求过于频繁' },
      { status: 429, headers: buildRateLimitHeaders(rateResult) }
    )
  }

  try {
    const { title, content, target } = await req.json()
    if (!title || !content) {
      return NextResponse.json({ code: -1, message: '标题和内容不能为空' }, { status: 400 })
    }

    const db = getDB()
    db.prepare(
      'INSERT INTO admin_notifications (title, content, target) VALUES (?, ?, ?)'
    ).run(title, content, target || 'all')

    return NextResponse.json({ code: 0, message: '通知已发送' }, { headers: buildRateLimitHeaders(rateResult) })
  } catch {
    return NextResponse.json({ code: -1, message: '发送失败' }, { status: 500 })
  }
}
