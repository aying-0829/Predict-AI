import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { verifyResetCode, hashPassword } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = checkRateLimit(ip, 'auth')
    if (!rl.allowed) {
      return NextResponse.json({ code: -1, message: '请求过于频繁，请稍后再试' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } })
    }

    const { phone, code, password } = await request.json()

    if (!phone || !code || !password) {
      return NextResponse.json({ code: -1, message: '参数不完整' })
    }

    if (!/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ code: -1, message: '请输入正确的手机号' })
    }

    if (password.length < 6 || password.length > 20) {
      return NextResponse.json({ code: -1, message: '密码长度需为 6-20 位' })
    }

    // 验证验证码
    const result = verifyResetCode(phone, code)
    if (!result.valid) {
      return NextResponse.json({ code: -1, message: result.message || '验证码错误' })
    }

    // 更新密码
    const db = getDB()
    const hashed = await hashPassword(password)
    db.prepare('UPDATE users SET password_hash = ? WHERE phone = ?').run(hashed, phone)

    return NextResponse.json({ code: 0, message: '密码重置成功' })
  } catch (e) {
    console.error('[reset-password]', e)
    return NextResponse.json({ code: -1, message: '服务器错误' })
  }
}
