import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getDB } from './db'

const ADMIN_JWT_EXPIRES_IN = '24h'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('[FATAL] JWT_SECRET 环境变量未设置')
  return secret
}

export interface AdminPayload {
  adminId: number
  username: string
}

export function generateAdminToken(adminId: number, username: string): string {
  return jwt.sign({ adminId, username, type: 'admin' }, getSecret(), { expiresIn: ADMIN_JWT_EXPIRES_IN })
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const payload = jwt.verify(token, getSecret()) as jwt.JwtPayload
    if (payload.type !== 'admin') return null
    return { adminId: payload.adminId, username: payload.username }
  } catch {
    return null
  }
}

export function authenticateAdmin(username: string, password: string): { token: string } | null {
  const db = getDB()
  const row = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username) as { id: number; username: string; password_hash: string } | undefined
  if (!row) return null
  if (!bcrypt.compareSync(password, row.password_hash)) return null
  const token = generateAdminToken(row.id, row.username)
  return { token }
}

export function parseAdminFromRequest(req: Request): AdminPayload | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.slice(7))
}
