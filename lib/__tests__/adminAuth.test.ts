import { describe, it, expect, beforeAll } from 'vitest'

describe('adminAuth.ts — 管理员认证', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-admin-secret'
  })

  it('generateAdminToken 应返回有效 token', async () => {
    const { generateAdminToken, verifyAdminToken } = await import('../adminAuth')
    const token = generateAdminToken(1, 'admin')
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)

    const payload = verifyAdminToken(token)
    expect(payload).not.toBeNull()
    expect(payload!.adminId).toBe(1)
    expect(payload!.username).toBe('admin')
  })

  it('verifyAdminToken 应拒绝普通用户 token', async () => {
    const { generateAdminToken, verifyAdminToken } = await import('../adminAuth')
    const { generateToken, verifyToken } = await import('../auth')

    // 普通用户 token
    const userToken = generateToken(1, '13800138000')
    expect(verifyToken(userToken)).not.toBeNull()

    // 但 admin 验证应拒绝
    const result = verifyAdminToken(userToken)
    expect(result).toBeNull()
  })

  it('authenticateAdmin 应对正确凭据返回 token', async () => {
    const { authenticateAdmin } = await import('../adminAuth')
    // admin/admin123 是种子数据
    const result = authenticateAdmin('admin', 'admin123')
    expect(result).not.toBeNull()
    expect(result!.token).toBeTruthy()
  })

  it('authenticateAdmin 应对错误密码返回 null', async () => {
    const { authenticateAdmin } = await import('../adminAuth')
    const result = authenticateAdmin('admin', 'wrong-password')
    expect(result).toBeNull()
  })

  it('authenticateAdmin 应对不存在的用户返回 null', async () => {
    const { authenticateAdmin } = await import('../adminAuth')
    const result = authenticateAdmin('nonexistent', 'password')
    expect(result).toBeNull()
  })
})
