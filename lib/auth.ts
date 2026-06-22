import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDB } from './db'

const JWT_EXPIRES_IN = '7d'

/** 懒加载 JWT 密钥：仅在首次签名/验证时检查，避免 Next.js 构建阶段因缺环境变量而崩溃 */
function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('[FATAL] JWT_SECRET 环境变量未设置，拒绝启动')
  }
  return secret
}

/** 哈希密码 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/** 验证密码 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/** 生成 JWT token（7天过期） */
export function generateToken(userId: number, phone: string): string {
  return jwt.sign({ userId, phone }, getSecret(), { expiresIn: JWT_EXPIRES_IN })
}

/** 验证 token，返回 payload 或 null */
export function verifyToken(token: string): { userId: number; phone: string } | null {
  try {
    const payload = jwt.verify(token, getSecret()) as unknown as { userId: number; phone: string }
    return payload
  } catch {
    return null
  }
}

/** 生成 6 位数字验证码，写入 verification_codes 表，15 分钟过期 */
export function generateResetCode(phone: string): string {
  const db = getDB()
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)

  // 删除该手机号的旧码
  db.prepare('DELETE FROM verification_codes WHERE phone = ?').run(phone)
  // 写入新码
  db.prepare('INSERT INTO verification_codes (phone, code, expires_at) VALUES (?, ?, ?)').run(phone, code, expiresAt)

  return code
}

/** 验证验证码是否正确且在有效期内 */
export function verifyResetCode(phone: string, code: string): { valid: boolean; message?: string } {
  const db = getDB()
  const row = db.prepare(
    'SELECT * FROM verification_codes WHERE phone = ? AND code = ? AND used = 0 ORDER BY id DESC LIMIT 1'
  ).get(phone, code) as { id: number; expires_at: string } | undefined

  if (!row) {
    return { valid: false, message: '验证码错误' }
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { valid: false, message: '验证码已过期，请重新获取' }
  }

  // 标记已使用
  db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(row.id)

  return { valid: true }
}
