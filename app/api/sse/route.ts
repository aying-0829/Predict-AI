import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getRealCompletedMatches } from '@/lib/worldCupRealData'

/**
 * SSE (Server-Sent Events) 实时推送端点
 * 
 * 事件类型：
 * - live_match_update：实时比分更新
 * - prediction_result：预测结果公布
 * - leaderboard_update：排行榜变化
 * 
 * 客户端通过 EventSource 连接，无需 ws 库依赖。
 * 
 * 当前为演示模式，所有事件均为模拟数据。生产环境需对接实时数据源。
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // 可选认证：未登录也可连接，但仅推送公开事件
  let userId: number | null = null
  const token = req.cookies.get('auth-token')?.value
  if (token) {
    const payload = verifyToken(token)
    if (payload) userId = payload.userId
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // 取最近一场已完赛比赛作为实时推送内容
      const completedMatches = getRealCompletedMatches()
      const recentMatch = completedMatches[completedMatches.length - 1] || null

      // 连接建立事件
      const connectedEvent = `event: connected\ndata: ${JSON.stringify({ userId, timestamp: Date.now() })}\n\n`
      controller.enqueue(encoder.encode(connectedEvent))

      let heartbeatCount = 0

      // 心跳 + 模拟实时事件推送
      const heartbeatInterval = setInterval(() => {
        heartbeatCount++

        // 每 15 秒发送心跳
        const heartbeat = `: heartbeat ${heartbeatCount}\n\n`
        controller.enqueue(encoder.encode(heartbeat))

        // 模拟事件：每 30 秒推送一次排行榜更新
        if (heartbeatCount % 2 === 0) {
          const event = `event: leaderboard_update\ndata: ${JSON.stringify({
            type: 'leaderboard_update',
            timestamp: Date.now(),
            message: '排行榜数据已更新',
          })}\n\n`
          controller.enqueue(encoder.encode(event))
        }

        // 模拟事件：每 45 秒推送一次预测结果
        if (heartbeatCount % 3 === 0) {
          const event = `event: prediction_result\ndata: ${JSON.stringify({
            type: 'prediction_result',
            timestamp: Date.now(),
            message: '有新的预测结果公布',
          })}\n\n`
          controller.enqueue(encoder.encode(event))
        }

        // 模拟事件：每 25 秒推送一次比分更新（使用真实比赛数据）
        if (heartbeatCount % 5 === 1 && recentMatch) {
          const event = `event: live_match_update\ndata: ${JSON.stringify({
            type: 'live_match_update',
            timestamp: Date.now(),
            match: {
              home: recentMatch.home,
              away: recentMatch.away,
              homeScore: recentMatch.homeScore,
              awayScore: recentMatch.awayScore,
              minute: 90,
            },
          })}\n\n`
          controller.enqueue(encoder.encode(event))
        }
      }, 15000)

      // 客户端断开时清理
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval)
        controller.close()
      })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
