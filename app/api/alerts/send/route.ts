import { NextResponse } from 'next/server'
import { sendEmail, sendSMS, NotifyResult } from '@/lib/notifyApi'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

/**
 * POST /api/alerts/send
 * 发送测试邮件/短信（需登录）
 *
 * body: {
 *   channel: 'email' | 'sms'
 *   to: string           // 收件邮箱 或 手机号
 *   subject?: string     // 邮件主题（默认 "Prescient AI 通知测试"）
 *   message?: string     // 通知内容
 * }
 */
async function handler(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { channel, to, subject, message } = body

    if (!channel || !to) {
      return NextResponse.json(
        { code: -1, message: '缺少必填参数 channel / to' },
        { status: 400 }
      )
    }

    let result: NotifyResult

    if (channel === 'email') {
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #c9a84c;">Prescient AI 通知测试</h2>
          <p>${message || '这是一封来自 Prescient AI 的测试邮件。'}</p>
          <hr style="border: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            Prescient AI 智能预测平台<br/>
            ${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      `

      result = await sendEmail(
        to,
        subject || 'Prescient AI 通知测试',
        html
      )
    } else if (channel === 'sms') {
      result = await sendSMS(to, message || 'Prescient AI 通知测试')
    } else {
      return NextResponse.json(
        { code: -1, message: `不支持的通道: ${channel}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      code: result.sent ? 0 : result.skipped ? 1 : -1,
      data: result,
      message: result.sent
        ? '发送成功'
        : result.skipped
          ? result.reason
          : `发送失败: ${result.reason}`,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { code: -1, message: err instanceof Error ? err.message : '未知错误' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
