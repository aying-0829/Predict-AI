import { NextResponse } from 'next/server'
import { getConfigStatus } from '@/lib/notifyApi'

/**
 * GET /api/alerts/config-status
 * 返回邮件和短信通道的配置状态
 */
export async function GET() {
  return NextResponse.json({
    code: 0,
    data: getConfigStatus(),
  })
}
