import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

const PROTECTED_PATHS = ['/member', '/lottery']

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || '127.0.0.1'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getIP(request)

  // ── 速率限制：对所有 POST/PUT/DELETE API 路由 ──
  if (pathname.startsWith('/api') && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const routePrefix = pathname.split('/').slice(0, 4).join('/')
    const { allowed, remaining, resetAt } = checkRateLimit(clientIP, routePrefix)

    if (!allowed) {
      return NextResponse.json(
        { code: -1, message: `请求过于频繁，请在 ${Math.ceil((resetAt - Date.now()) / 1000)} 秒后重试` },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  // ── 认证保护：受保护页面 ──
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/member/:path*', '/lottery/:path*'],
}
