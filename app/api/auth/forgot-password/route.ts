import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { generateResetCode } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'

/** 手机号发送冷却池（60 秒内同一号码不可重复请求） */
const phoneCooldown = new Map<string, number>()

/**
 * POST /api/auth/forgot-password
 * 手机验证码找回密码流程 - 第一步：发送短信验证码
 * Body: { phone }
 * 验证码 6 位数字，15 分钟有效，存入 verification_codes 表。
 * 客户端收到后进入第二步（调用 /api/auth/reset-password）完成密码重置。
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // IP 级别限流
    const rl = checkRateLimit(ip, 'auth')
    if (!rl.allowed) {
      return NextResponse.json(
        { code: -1, message: '请求过于频繁，请稍后再试' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { phone } = await request.json()

    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ code: -1, message: '请输入正确的手机号' })
    }

    // 手机号冷却检查（60 秒内禁止重复发送）
    const lastSent = phoneCooldown.get(phone)
    if (lastSent && Date.now() - lastSent < 60_000) {
      const remain = Math.ceil((60_000 - (Date.now() - lastSent)) / 1000)
      return NextResponse.json({ code: -1, message: `请 ${remain} 秒后再试` })
    }

    const db = getDB()
    const user = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)

    if (!user) {
      return NextResponse.json({ code: -1, message: '该手机号未注册' })
    }

    // 生成 6 位验证码并写入数据库（15 分钟有效）
    const code = generateResetCode(phone)
    phoneCooldown.set(phone, Date.now())

    // 开发/演示模式：通过控制台和响应返回验证码方便测试
    const isDev = process.env.NODE_ENV !== 'production'
    if (isDev) {
      console.log(`[forgot-password] 验证码: phone=${phone} code=${code}`)
    }

    return NextResponse.json({
      code: 0,
      message: '验证码已发送',
      data: isDev ? { devCode: code } : {},
    })
  } catch (e) {
    console.error('[forgot-password]', e)
    return NextResponse.json({ code: -1, message: '服务器内部错误，请稍后重试' })
  }
}
