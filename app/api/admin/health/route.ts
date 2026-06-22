import { NextRequest, NextResponse } from 'next/server'
import { parseAdminFromRequest } from '@/lib/adminAuth'
import { checkRateLimitEnhanced, buildRateLimitHeaders } from '@/lib/rateLimit'
import { getDB } from '@/lib/db'
import os from 'os'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const admin = parseAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ code: -1, message: '未授权' }, { status: 401 })
  }

  const rateResult = checkRateLimitEnhanced(ip, '/api/admin/health', admin.adminId)
  if (!rateResult.allowed) {
    return NextResponse.json(
      { code: -1, message: '请求过于频繁' },
      { status: 429, headers: buildRateLimitHeaders(rateResult) }
    )
  }

  try {
    const db = getDB()

    // 数据库大小
    const dbPath = path.join(process.cwd(), 'data.db')
    let dbSizeMb = 0
    try {
      const stats = fs.statSync(dbPath)
      dbSizeMb = Math.round((stats.size / (1024 * 1024)) * 100) / 100
    } catch { /* db file not found */ }

    // 数据库表行数统计
    const tables = ['users', 'predictions', 'points_history', 'alert_subscriptions', 'bet_slips', 'verification_codes', 'duels', 'user_achievements', 'referrals', 'admins', 'admin_notifications']
    const dbStats: Array<{ table: string; rows: number }> = []
    for (const table of tables) {
      try {
        const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number }
        dbStats.push({ table, rows: row.count })
      } catch { dbStats.push({ table, rows: 0 }) }
    }

    // 内存使用
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memoryUsagePercent = Math.round((usedMem / totalMem) * 100)

    // 磁盘空间
    let diskTotal = 0, diskFree = 0
    try {
      const root = process.cwd().slice(0, 3) // e.g., "D:\"
      if (process.platform === 'win32') {
        const { execSync } = require('child_process')
        const output = execSync(`wmic logicaldisk where "DeviceID='${root}'" get Size,FreeSpace /format:csv`, { encoding: 'utf8', timeout: 3000 })
        const lines = output.trim().split('\n')
        if (lines.length >= 2) {
          const parts = lines[1].split(',')
          diskFree = parseInt(parts[1]) || 0
          diskTotal = parseInt(parts[2]) || 0
        }
      }
    } catch { /* fallback */ }

    // API 响应时间（简单自测）
    const startTime = Date.now()
    db.prepare('SELECT 1').get()
    const apiLatency = Date.now() - startTime

    // 各端点平均延迟（近 10 次采样模拟）
    // 注意：以下数据为 mock/demo 演示数据，使用 Math.random() 模拟延迟
    // 生产环境需替换为真实监控数据（如 Prometheus metrics、APM SDK 采集等）
    const endpoints = ['/api/auth/login', '/api/sports/matches', '/api/member/points', '/api/admin/realtime', '/api/admin/users']
    const apiLatencyDetail = endpoints.map(e => ({
      endpoint: e,
      avgLatency: Math.round(10 + Math.random() * 40),
      status: 'ok' as const,
    }))

    return NextResponse.json({
      code: 0,
      data: {
        dbSize: `${dbSizeMb} MB`,
        dbSizeBytes: dbSizeMb * 1024 * 1024,
        dbConnection: 'ok',
        dbStats,
        memory: {
          total: `${Math.round(totalMem / (1024 * 1024))} MB`,
          used: `${Math.round(usedMem / (1024 * 1024))} MB`,
          free: `${Math.round(freeMem / (1024 * 1024))} MB`,
          percent: memoryUsagePercent,
        },
        disk: diskTotal > 0 ? {
          total: `${Math.round(diskTotal / (1024 * 1024 * 1024))} GB`,
          free: `${Math.round(diskFree / (1024 * 1024 * 1024))} GB`,
          percent: Math.round(((diskTotal - diskFree) / diskTotal) * 100),
        } : null,
        apiLatency: `${apiLatency}ms`,
        apiLatencyDetail,
        uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
        nodeVersion: process.version,
        platform: process.platform,
      },
    }, { headers: buildRateLimitHeaders(rateResult) })
  } catch {
    return NextResponse.json({ code: -1, message: '服务器错误' }, { status: 500 })
  }
}
