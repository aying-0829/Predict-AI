import { describe, it, expect } from 'vitest'
import { checkIpRateLimit, checkUserRateLimit, checkRateLimitEnhanced } from '../rateLimit'

describe('rateLimit.ts — IP 限流', () => {
  it('前 20 次请求应被允许', () => {
    for (let i = 0; i < 20; i++) {
      const result = checkIpRateLimit(`192.168.1.${i % 5}`, '/api/test')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
    }
  })

  it('超过阈值后应拒绝请求', () => {
    // 使用固定 IP 快速触发限流
    for (let i = 0; i < 20; i++) {
      checkIpRateLimit('10.0.0.99', '/api/test-overlimit')
    }
    const result = checkIpRateLimit('10.0.0.99', '/api/test-overlimit')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})

describe('rateLimit.ts — 用户限流', () => {
  it('用户限流正常工作', () => {
    const userId = 9999
    for (let i = 0; i < 30; i++) {
      const result = checkUserRateLimit(userId, '/api/user-test')
      expect(result.allowed).toBe(true)
    }
    const blocked = checkUserRateLimit(userId, '/api/user-test')
    expect(blocked.allowed).toBe(false)
  })
})

describe('rateLimit.ts — 增强限流', () => {
  it('管理员白名单用户不受限流限制', async () => {
    const { addAdminToWhitelist, checkRateLimitEnhanced } = await import('../rateLimit')
    addAdminToWhitelist(1)
    const result = checkRateLimitEnhanced('10.0.0.1', '/api/admin/realtime', 1)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(999)
  })
})
