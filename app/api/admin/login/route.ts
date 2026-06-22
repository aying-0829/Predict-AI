import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/adminAuth'
import { checkIpRateLimit, buildRateLimitHeaders } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  // 登录接口单独限流：60 秒内最多 5 次
  const rateResult = checkIpRateLimit(ip, '/api/admin/login')
  if (!rateResult.allowed) {
    return NextResponse.json(
      { code: -1, message: '请求过于频繁，请稍后再试' },
      { status: 429, headers: buildRateLimitHeaders(rateResult) }
    )
  }

  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ code: -1, message: '请输入用户名和密码' }, { status: 400 })
    }

    const result = authenticateAdmin(username, password)
    if (!result) {
      return NextResponse.json({ code: -1, message: '用户名或密码错误' }, { status: 401 })
    }

    return NextResponse.json({
      code: 0,
      data: { token: result.token },
      message: '登录成功',
    })
  } catch {
    return NextResponse.json({ code: -1, message: '请求格式错误' }, { status: 400 })
  }
}
