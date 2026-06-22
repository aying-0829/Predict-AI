import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user: { id: number; phone: string | null }
}

export interface OptionalAuthRequest extends NextRequest {
  user: { id: number; phone: string | null } | null
}

type AuthHandler = (req: AuthenticatedRequest, context?: unknown) => Promise<NextResponse>
type OptionalAuthHandler = (req: OptionalAuthRequest, context?: unknown) => Promise<NextResponse>

/** 解析 token，成功返回 payload，失败返回 null（不拦截） */
function resolveToken(req: NextRequest): { userId: number; phone: string | null } | null {
  let token = req.cookies.get('auth-token')?.value
  if (!token) {
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }
  if (!token) return null
  return verifyToken(token)
}

/** 强制认证中间件：未登录返回 401 */
export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest, context?: unknown) => {
    const payload = resolveToken(req)
    if (!payload) {
      return NextResponse.json({ code: -1, message: '请先登录' }, { status: 401 })
    }

    const authReq = req as AuthenticatedRequest
    authReq.user = { id: payload.userId, phone: payload.phone }
    return handler(authReq, context)
  }
}

/** 可选认证中间件：未登录时 req.user = null，由 handler 自行降级 */
export function withOptionalAuth(handler: OptionalAuthHandler) {
  return async (req: NextRequest, context?: unknown) => {
    const payload = resolveToken(req)
    const authReq = req as OptionalAuthRequest
    authReq.user = payload ? { id: payload.userId, phone: payload.phone } : null
    return handler(authReq, context)
  }
}
