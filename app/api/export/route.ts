import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

async function handler(req: OptionalAuthRequest) {
  const format = req.nextUrl.searchParams.get('format') || 'csv'
  const startDate = req.nextUrl.searchParams.get('start') || ''
  const endDate = req.nextUrl.searchParams.get('end') || ''

  try {
    const db = getDB()
    const userId = req.user?.id || 1

    let query = `
      SELECT id, lottery_type, numbers, ai_numbers, result, is_hit, created_at
      FROM predictions
      WHERE user_id = ?
    `
    const params: string[] = [String(userId)]

    if (startDate) {
      query += ` AND created_at >= ?`
      params.push(startDate + ' 00:00:00')
    }
    if (endDate) {
      query += ` AND created_at <= ?`
      params.push(endDate + ' 23:59:59')
    }
    query += ` ORDER BY created_at DESC LIMIT 10000`

    const rows = db.prepare(query).all(...params) as any[]

    if (format === 'csv') {
      const typeMap: Record<string, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D', pl5: '排列五' }
      const headers = 'ID,类型,预测号码,AI推荐,开奖结果,是否命中,日期\n'

      const csvContent = headers + rows.map((r: Record<string, unknown>) => {
        const type = typeMap[String(r.lottery_type || '')] || String(r.lottery_type || '')
        const aiNums = String(r.ai_numbers || '').replace(/,/g, ' ')
        const numbers = String(r.numbers || '').replace(/,/g, ' ')
        const result = String(r.result || '').replace(/,/g, ' ')
        const hit = r.is_hit ? '是' : '否'
        const date = String(r.created_at || '').slice(0, 10)
        return `${r.id},${type},"${numbers}","${aiNums}","${result}",${hit},${date}`
      }).join('\n')

      // 写入 BOM 确保 Excel 正确识别中文
      const bom = '﻿'
      return new NextResponse(bom + csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="predict-history-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    // JSON format
    return NextResponse.json({
      code: 0,
      data: {
        total: rows.length,
        exportDate: new Date().toISOString(),
        records: rows.map((r: Record<string, unknown>) => ({
          id: r.id,
          type: r.lottery_type,
          numbers: r.numbers,
          aiRecommendation: r.ai_numbers,
          result: r.result,
          isHit: !!r.is_hit,
          date: r.created_at,
        })),
      },
    })
  } catch (e: unknown) {
    return NextResponse.json({ code: -1, message: '导出失败: ' + (e instanceof Error ? e.message : 'unknown') }, { status: 500 })
  }
}

export const GET = withOptionalAuth(handler)
