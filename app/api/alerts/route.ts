import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function getHandler(_req: AuthenticatedRequest) {
  const db = getDB()
  const rows = db.prepare(
    'SELECT id, lottery_name, lottery_type, draw_time, enabled, channel_inapp, channel_wechat, channel_email, channel_sms FROM alert_subscriptions ORDER BY id ASC'
  ).all() as {
    id: number; lottery_name: string; lottery_type: string; draw_time: string;
    enabled: number; channel_inapp: number; channel_wechat: number; channel_email: number; channel_sms: number
  }[]

  const subscriptions = rows.map((r) => ({
    id: `alert-${r.id}`,
    lotteryName: r.lottery_name,
    lotteryType: r.lottery_type,
    drawTime: r.draw_time,
    enabled: r.enabled === 1,
    channels: {
      inapp: r.channel_inapp === 1,
      wechat: r.channel_wechat === 1,
      email: r.channel_email === 1,
      sms: r.channel_sms === 1,
    },
  }))

  return NextResponse.json({ code: 0, data: subscriptions })
}

async function putHandler(req: AuthenticatedRequest) {
  const body = await req.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ code: -1, message: '缺少 id 参数' }, { status: 400 })
  }

  const db = getDB()
  const numericId = parseInt(String(id).replace('alert-', ''), 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ code: -1, message: '无效的 id' }, { status: 400 })
  }

  if (data.enabled !== undefined) {
    db.prepare('UPDATE alert_subscriptions SET enabled = ? WHERE id = ?').run(data.enabled ? 1 : 0, numericId)
  }

  if (data.channels) {
    const ch = data.channels
    db.prepare(
      'UPDATE alert_subscriptions SET channel_inapp = ?, channel_wechat = ?, channel_email = ?, channel_sms = ? WHERE id = ?'
    ).run(
      ch.inapp !== undefined ? (ch.inapp ? 1 : 0) : undefined,
      ch.wechat !== undefined ? (ch.wechat ? 1 : 0) : undefined,
      ch.email !== undefined ? (ch.email ? 1 : 0) : undefined,
      ch.sms !== undefined ? (ch.sms ? 1 : 0) : undefined,
      numericId
    )
  }

  const row = db.prepare('SELECT id, lottery_name, lottery_type, draw_time, enabled, channel_inapp, channel_wechat, channel_email, channel_sms FROM alert_subscriptions WHERE id = ?').get(numericId) as {
    id: number; lottery_name: string; lottery_type: string; draw_time: string;
    enabled: number; channel_inapp: number; channel_wechat: number; channel_email: number; channel_sms: number
  } | undefined

  if (!row) {
    return NextResponse.json({ code: -1, message: '订阅不存在' }, { status: 404 })
  }

  return NextResponse.json({
    code: 0,
    data: {
      id: `alert-${row.id}`,
      lotteryName: row.lottery_name,
      lotteryType: row.lottery_type,
      drawTime: row.draw_time,
      enabled: row.enabled === 1,
      channels: {
        inapp: row.channel_inapp === 1,
        wechat: row.channel_wechat === 1,
        email: row.channel_email === 1,
        sms: row.channel_sms === 1,
      },
    },
  })
}

export const GET = withAuth(getHandler)
export const PUT = withAuth(putHandler)
