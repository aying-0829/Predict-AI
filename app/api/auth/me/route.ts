import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'

async function handler(request: OptionalAuthRequest) {
  if (!request.user) {
    return NextResponse.json({ code: -1, message: '未登录' }, { status: 401 })
  }

  const db = getDB()
  const user = db.prepare(
    'SELECT id, phone, points, membership_type FROM users WHERE id = ?'
  ).get(request.user.id) as { id: number; phone: string; points: number; membership_type: string } | undefined

  if (!user) {
    return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })
  }

  return NextResponse.json({
    code: 0,
    data: { id: user.id, phone: user.phone, points: user.points, plan: user.membership_type },
  })
}

export const GET = withOptionalAuth(handler)
