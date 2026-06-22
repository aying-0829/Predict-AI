import { describe, it, expect, beforeAll } from 'vitest'

// Next.js API 路由作为函数可以被直接调用测试

describe('API 集成测试 — auth/login', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-api-integration-secret'
  })

  it('1. POST /api/auth/login — 缺少参数应返回 400', async () => {
    const { POST } = await import('../../api/auth/login/route')
    const req = createMockRequest('POST', {})
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.code).toBe(-1)
  })

  it('2. POST /api/auth/login — 不存在的手机号应返回 401', async () => {
    const { POST } = await import('../../api/auth/login/route')
    const req = createMockRequest('POST', { phone: '99999999999', password: 'test123456' })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.message).toContain('错误')
  })

  it('3. POST /api/auth/register — 无效手机号应返回 400', async () => {
    const { POST } = await import('../../api/auth/register/route')
    const req = createMockRequest('POST', { phone: '12345', password: 'test123' })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.code).toBe(-1)
  })

  it('4. POST /api/auth/register — 密码太短应返回 400', async () => {
    const { POST } = await import('../../api/auth/register/route')
    const req = createMockRequest('POST', { phone: '13800000001', password: '12' })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.message).toContain('密码')
  })

  it('5. POST /api/admin/login — 错误凭据应返回 401', async () => {
    const { POST } = await import('../../api/admin/login/route')
    const req = createMockRequest('POST', { username: 'admin', password: 'wrong' })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.code).toBe(-1)
  })

  it('6. GET /api/admin/realtime — 无 token 应返回 401', async () => {
    const { GET } = await import('../../api/admin/realtime/route')
    const req = createMockRequest('GET')
    const res = await GET(req)
    const data = await res.json()
    expect(res.status).toBe(401)
    expect(data.code).toBe(-1)
  })
})

// ============ 辅助函数 ============

function createMockRequest(method: string, body?: unknown) {
  const headers = new Headers({
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.1',
  })
  return {
    method,
    headers,
    json: async () => body,
    cookies: {
      get: () => null,
    },
    nextUrl: { pathname: '' },
    url: 'http://localhost:3000',
  } as unknown as any
}
