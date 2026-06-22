import { describe, it, expect, beforeAll } from 'vitest'

// ============================================================
// auth.ts 单元测试
// ============================================================

// 模拟 JWT_SECRET，在所有测试前设置
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests'
})

describe('auth.ts — Token 生成与验证', () => {
  it('1. generateToken 应返回一个字符串 token', async () => {
    const { generateToken } = await import('../auth')
    const token = generateToken(1, '13800138000')
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT 三段式
  })

  it('2. verifyToken 应正确解密 token 中的 userId 和 phone', async () => {
    const { generateToken, verifyToken } = await import('../auth')
    const token = generateToken(42, '13900139000')
    const payload = verifyToken(token)
    expect(payload).not.toBeNull()
    expect(payload!.userId).toBe(42)
    expect(payload!.phone).toBe('13900139000')
  })

  it('3. verifyToken 对无效 token 应返回 null', async () => {
    const { verifyToken } = await import('../auth')
    expect(verifyToken('invalid-token-string')).toBeNull()
    expect(verifyToken('')).toBeNull()
  })

  it('4. verifyToken 对篡改过的 token 应返回 null', async () => {
    const { generateToken, verifyToken } = await import('../auth')
    const token = generateToken(1, '13800138000')
    // 篡改 token 中间段
    const parts = token.split('.')
    parts[1] = 'tampered'
    const badToken = parts.join('.')
    expect(verifyToken(badToken)).toBeNull()
  })

  it('5. hashPassword 和 verifyPassword 应正确工作', async () => {
    const { hashPassword, verifyPassword } = await import('../auth')
    const hash = await hashPassword('my-password-123')
    expect(hash).not.toBe('my-password-123')
    expect(hash.startsWith('$2')).toBe(true) // bcrypt hash

    const valid = await verifyPassword('my-password-123', hash)
    expect(valid).toBe(true)

    const invalid = await verifyPassword('wrong-password', hash)
    expect(invalid).toBe(false)
  })
})

describe('auth.ts — 验证码生成与验证', () => {
  it('6. generateResetCode 应生成 6 位数字并写入数据库', async () => {
    const { generateResetCode } = await import('../auth')
    const { getDB } = await import('../db')
    const phone = '13877777777'
    const code = generateResetCode(phone)
    expect(code).toMatch(/^\d{6}$/)

    // 验证数据库中确实存在该验证码
    const db = getDB()
    const row = db.prepare(
      'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND used = 0'
    ).get(phone, code) as { id: number } | undefined
    expect(row).toBeDefined()
    expect(row!.id).toBeGreaterThan(0)
  })


  it('7. verifyResetCode 对错误验证码应返回失败', async () => {
    const { generateResetCode, verifyResetCode } = await import('../auth')
    generateResetCode('13822222222')
    const result = verifyResetCode('13822222222', '000000')
    expect(result.valid).toBe(false)
    expect(result.message).toBe('验证码错误')
  })
})

describe('db.ts — 数据库 CRUD', () => {
  it('8. getDB 应返回数据库实例，且 users 表存在', async () => {
    const { getDB } = await import('../db')
    const db = getDB()
    expect(db).toBeDefined()

    // 验证表存在
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get() as { name: string } | undefined
    expect(row).toBeDefined()
    expect(row!.name).toBe('users')
  })

  it('9. admins 表应包含种子管理员', async () => {
    const { getDB } = await import('../db')
    const db = getDB()

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin') as { username: string; password_hash: string } | undefined
    expect(admin).toBeDefined()
    expect(admin!.username).toBe('admin')
    expect(admin!.password_hash).toBeTruthy()
    expect(admin!.password_hash.startsWith('$2')).toBe(true)
  })

  it('10. predictions 种子数据应存在', async () => {
    const { getDB } = await import('../db')
    const db = getDB()

    const count = db.prepare('SELECT COUNT(*) as c FROM predictions').get() as { c: number }
    expect(count.c).toBeGreaterThan(0)
  })
})
