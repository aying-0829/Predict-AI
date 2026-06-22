import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rl = checkRateLimit(ip, 'auth')
    if (!rl.allowed) {
      return NextResponse.json({ code: -1, message: '请求过于频繁，请稍后再试' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } })
    }

    const { phone, password } = await req.json()

    // 后端双重校验
    if (!phone || !/^\d{11}$/.test(phone)) {
      return NextResponse.json({ code: -1, message: '请输入正确的 11 位手机号' }, { status: 400 })
    }
    if (!password || password.length < 6 || password.length > 20) {
      return NextResponse.json({ code: -1, message: '密码需 6-20 位' }, { status: 400 })
    }

    const db = getDB()

    // 查重
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as { id: number } | undefined
    if (existing) {
      return NextResponse.json({ code: -1, message: '该手机号已注册' }, { status: 409 })
    }

    // 哈希密码
    const pwdHash = await hashPassword(password)

    // 生成用户名（手机号后4位）
    const username = `用户${phone.slice(-4)}`

    // 插入用户
    const result = db.prepare(
      `INSERT INTO users (username, phone, password_hash, points, created_at)
       VALUES (?, ?, ?, 50, datetime('now','localtime'))`
    ).run(username, phone, pwdHash)

    const userId = result.lastInsertRowid as number

    // 生成 token
    const token = generateToken(userId, phone)

    const response = NextResponse.json({
      code: 0,
      data: {
        token,
        user: {
          id: userId,
          phone,
          username,
          points: 50,
          membership_type: 'free',
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
    console.error('[register] error:', err.message)

    // 明确 JWT_SECRET 缺失的情况 — 这是 Railway 部署中最常见的根因
    if (err.message.includes('JWT_SECRET')) {
      return NextResponse.json(
        { code: -1, message: '服务器配置错误：JWT_SECRET 未设置，请联系管理员' },
        { status: 500 }
      )
    }

    // 明确 SQLite 权限/路径问题
    if (err.message.includes('SQLITE') || err.message.includes('database') || err.message.includes('ENOENT')) {
      return NextResponse.json(
        { code: -1, message: `数据库错误：${err.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { code: -1, message: `注册失败：${process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message}` },
      { status: 500 }
    )
  }
}
