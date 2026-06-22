/**
 * 增强版内存滑动窗口速率限制器
 * - 按 IP+路由前缀 限流（默认 60 秒内最多 20 次）
 * - 按用户 ID 限流（每用户 60 秒内最多 30 次）
 * - 管理员白名单（不受限制）
 * - 降级响应头（Retry-After）
 */

interface RateLimitEntry {
  timestamps: number[]
}

const ipStore = new Map<string, RateLimitEntry>()
const userStore = new Map<number, RateLimitEntry>()

const WINDOW_MS = 60 * 1000
const MAX_IP_REQUESTS = 20
const MAX_USER_REQUESTS = 30

// 管理员用户 ID 白名单（通过 admin token 的请求不受限流限制）
const adminWhitelist = new Set<number>()

/** 将管理员 ID 加入白名单 */
export function addAdminToWhitelist(adminId: number): void {
  adminWhitelist.add(adminId)
}

/** 检查用户是否在白名单中 */
export function isAdminWhitelisted(userId?: number): boolean {
  if (userId == null) return false
  return adminWhitelist.has(userId)
}

function cleanupStore(store: Map<string | number, RateLimitEntry>, now: number): void {
  for (const [key, entry] of Array.from(store.entries())) {
    entry.timestamps = entry.timestamps.filter((t: number) => now - t < WINDOW_MS)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

// 定时清理，防止内存泄漏
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    cleanupStore(ipStore, now)
    cleanupStore(userStore, now)
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

function checkStore(
  store: Map<string | number, RateLimitEntry>,
  key: string | number,
  maxRequests: number
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry) {
    store.set(key, { timestamps: [now] })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + WINDOW_MS, limit: maxRequests }
  }

  entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS)

  if (entry.timestamps.length >= maxRequests) {
    const resetAt = entry.timestamps[0] + WINDOW_MS
    return { allowed: false, remaining: 0, resetAt, limit: maxRequests }
  }

  entry.timestamps.push(now)
  const remaining = maxRequests - entry.timestamps.length
  return { allowed: true, remaining, resetAt: entry.timestamps[0] + WINDOW_MS, limit: maxRequests }
}

/**
 * 检查 IP 速率限制
 * @param ip 客户端 IP 地址
 * @param routePrefix 路由前缀，如 '/api'
 */
export function checkIpRateLimit(ip: string, routePrefix: string): RateLimitResult {
  const key = `${ip}:${routePrefix}`
  return checkStore(ipStore, key, MAX_IP_REQUESTS)
}

/**
 * 检查用户速率限制
 * @param userId 用户 ID
 * @param routePrefix 路由前缀
 */
export function checkUserRateLimit(userId: number, routePrefix: string): RateLimitResult {
  const key = `${userId}:${routePrefix}`
  return checkStore(userStore, key, MAX_USER_REQUESTS)
}

/**
 * 增强版综合速率限制检查
 * - 管理员白名单直接放行
 * - 先检查 IP 限流，再检查用户限流
 * @param ip 客户端 IP
 * @param routePrefix 路由前缀
 * @param userId 可选的用户 ID（管理员免限流）
 * @returns 限流结果
 */
export function checkRateLimitEnhanced(
  ip: string,
  routePrefix: string,
  userId?: number
): RateLimitResult {
  // 管理员白名单直接放行
  if (userId != null && adminWhitelist.has(userId)) {
    return { allowed: true, remaining: 999, resetAt: Date.now() + WINDOW_MS, limit: 999 }
  }

  // 先检查 IP 限流
  const ipResult = checkIpRateLimit(ip, routePrefix)
  if (!ipResult.allowed) return ipResult

  // 再检查用户限流
  if (userId != null) {
    const userResult = checkUserRateLimit(userId, routePrefix)
    if (!userResult.allowed) return userResult
    return {
      allowed: true,
      remaining: Math.min(ipResult.remaining, userResult.remaining),
      resetAt: Math.max(ipResult.resetAt, userResult.resetAt),
      limit: Math.min(ipResult.limit, userResult.limit),
    }
  }

  return ipResult
}

/**
 * 兼容旧 API：checkRateLimit → 仅 IP 限流
 */
export function checkRateLimit(ip: string, routePrefix: string): RateLimitResult {
  return checkIpRateLimit(ip, routePrefix)
}

/**
 * 构建限流响应头
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  }
}
