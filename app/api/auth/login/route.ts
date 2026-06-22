import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rl = checkRateLimit(ip, 'auth')
    if (!rl.allowed) {
      return NextResponse.json({ code: -1, message: '请求过于频繁，请稍后再试' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } })
    }

    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json({ code: -1, message: '请输入手机号和密码' }, { status: 400 })
    }

    const db = getDB()

    const user = db.prepare(
      'SELECT id, username, phone, password_hash, membership_type, points FROM users WHERE phone = ?'
    ).get(phone) as {
      id: number; username: string; phone: string; password_hash: string | null;
      membership_type: string; points: number
    } | undefined

    if (!user) {
      return NextResponse.json({ code: -1, message: '手机号或密码错误' }, { status: 401 })
    }

    // 兼容无密码 hash 的老用户（seed 用户 id=1 无 phone，走不到这里）
    if (!user.password_hash) {
      return NextResponse.json({ code: -1, message: '手机号或密码错误' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ code: -1, message: '手机号或密码错误' }, { status: 401 })
    }

    const token = generateToken(user.id, user.phone)

    const response = NextResponse.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          points: user.points,
          membership_type: user.membership_type,
        },
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[login] error:', err.message)

    if (err.message.includes('JWT_SECRET')) {
      return NextResponse.json(
        { code: -1, message: '服务器配置错误：JWT_SECRET 未设置，请联系管理员' },
        { status: 500 }
      )
    }

    if (err.message.includes('SQLITE') || err.message.includes('database') || err.message.includes('ENOENT')) {
      return NextResponse.json(
        { code: -1, message: `数据库错误：${err.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { code: -1, message: `登录失败：${process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message}` },
      { status: 500 }
    )
  }
}
