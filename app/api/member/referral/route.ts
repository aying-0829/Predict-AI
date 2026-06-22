import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import crypto from 'crypto'

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

// GET: 获取邀请信息
async function handleGet(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  // 确保用户有邀请码
  let user = db.prepare('SELECT referral_code, username FROM users WHERE id = ?').get(userId) as
    | { referral_code: string | null; username: string }
    | undefined
  if (!user) return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })

  let code = user.referral_code
  if (!code) {
    code = generateCode()
    db.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(code, userId)
  }

  // 已邀请列表
  const referrals = db.prepare(`
    SELECT r.id, r.code, r.status, r.reward_claimed, r.created_at,
           COALESCE(u.username, '待注册') as invitee_name
    FROM referrals r
    LEFT JOIN users u ON r.invitee_id = u.id
    WHERE r.inviter_id = ?
    ORDER BY r.created_at DESC
  `).all(userId) as Array<Record<string, unknown>>

  const acceptedCount = referrals.filter((r) => r.status === 'accepted').length

  // 阶梯奖励
  const tiers = [
    { count: 1, reward: 50, label: '邀请 1 人', achieved: acceptedCount >= 1 },
    { count: 3, reward: 150, label: '邀请 3 人', achieved: acceptedCount >= 3 },
    { count: 5, reward: 300, label: '邀请 5 人', achieved: acceptedCount >= 5, badge: '社交达人' },
  ]

  return NextResponse.json({
    code: 0,
    data: {
      code,
      inviteUrl: `/register?ref=${code}`,
      acceptedCount,
      referrals: referrals.map((r) => ({
        id: r.id,
        code: r.code,
        inviteeName: r.invitee_name,
        status: r.status,
        rewardClaimed: r.reward_claimed,
        createdAt: r.created_at,
      })),
      tiers,
    },
  })
}

// POST: 领取奖励
async function handlePost(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  const acceptedCount = (
    db.prepare("SELECT COUNT(*) as cnt FROM referrals WHERE inviter_id = ? AND status = 'accepted'").get(userId) as {
      cnt: number
    }
  ).cnt

  // 查找未领取的 tier
  const tiers: { threshold: number; reward: number }[] = [
    { threshold: 5, reward: 300 },
    { threshold: 3, reward: 150 },
    { threshold: 1, reward: 50 },
  ]

  for (const tier of tiers) {
    if (acceptedCount >= tier.threshold) {
      // 检查是否已领取
      const claimed = db
        .prepare('SELECT COUNT(*) as cnt FROM points_history WHERE user_id = ? AND reason = ?')
        .get(userId, `邀请${tier.threshold}人奖励`) as { cnt: number }

      if (claimed.cnt > 0) continue

      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(tier.reward, userId)
      db.prepare(
        "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, ?, ?, 'earn', ?)"
      ).run(userId, tier.reward, `邀请${tier.threshold}人奖励`, `邀请 ${tier.threshold} 人奖励 ${tier.reward} 积分`)

      return NextResponse.json({
        code: 0,
        data: { reward: tier.reward, tier: tier.threshold },
        message: `已领取 ${tier.reward} 积分奖励！`,
      })
    }
  }

  return NextResponse.json({ code: -1, message: '暂无可领取的奖励' }, { status: 400 })
}

export const GET = withAuth(handleGet)
export const POST = withAuth(handlePost)
