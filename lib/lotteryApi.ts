/**
 * 彩票真实 API 数据源封装
 *
 * 数据源 1: 中国福利彩票官网 (cwl.gov.cn)
 *   - 双色球: GET .../findDrawNotice?name=ssq&issueCount=N
 *   - 福彩3D: GET .../findDrawNotice?name=3d&issueCount=N
 *
 * 数据源 2: 中国体育彩票官网 (lottery.gov.cn)
 *   - 大乐透: GET .../api/findDrawNotice?lottery_type=dlt&pageNum=1&pageSize=N
 *
 * 均为免密钥公开 JSON 接口
 */

const CWL_BASE = 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx'
const TC_BASE = 'https://www.lottery.gov.cn/api'

// ── fetch 工具 ──────────────────────────────────────────────

async function fetchJSON(url: string, timeoutMs = 8000): Promise<Record<string, unknown> | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://www.cwl.gov.cn/',
      },
    })
    if (!res.ok) return null
    return (await res.json()) as Record<string, unknown>
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── 原始数据类型 ──────────────────────────────────────────────

interface CWLResultRaw {
  code?: string
  name?: string
  red?: string
  blue?: string
  date?: string
}

interface TCDrawRaw {
  draw_num?: string
  draw_date?: string
  red?: string
  blue?: string
}

// ── 标准化后的开奖记录 ────────────────────────────────────────

export interface LotteryDraw {
  period: string
  date: string
  reds: number[]
  blues: number[]
  /** 原始号码字符串（逗号分隔），兼容旧调用方 */
  raw: string
}

// ── 兼容旧类型导出 ───────────────────────────────────────────

export type LotteryType = 'ssq' | 'dlt' | '3d'

// ── 内部构建函数 ─────────────────────────────────────────────

function buildDraw(
  code: string,
  date: string,
  redStr: string,
  blueStr: string,
): LotteryDraw {
  const reds = redStr.split(',').map(Number).filter(n => !isNaN(n))
  const blues = blueStr.split(',').map(Number).filter(n => !isNaN(n))
  const raw = blueStr ? `${redStr} + ${blueStr}` : redStr
  return {
    period: `第 ${code} 期`,
    date: date || '',
    reds,
    blues,
    raw,
  }
}

// ── 双色球 / 福彩3D (cwl.gov.cn) ────────────────────────────

export async function fetchCWLHistory(
  name: 'ssq' | '3d',
  count = 50,
): Promise<LotteryDraw[] | null> {
  const url = `${CWL_BASE}/findDrawNotice?name=${name}&issueCount=${count}`
  const json = await fetchJSON(url)
  if (!json) return null

  const results = json.result as CWLResultRaw[] | undefined
  if (!Array.isArray(results)) return null

  return results.map((item: CWLResultRaw) =>
    buildDraw(item.code || '', item.date || '', item.red || '', item.blue || ''),
  )
}

// ── 大乐透 (lottery.gov.cn) ──────────────────────────────────

export async function fetchDLTHistory(count = 50): Promise<LotteryDraw[] | null> {
  const pages = Math.ceil(count / 30)
  const allResults: LotteryDraw[] = []

  for (let page = 1; page <= pages; page++) {
    const pageSize = Math.min(30, count - (page - 1) * 30)
    const url = `${TC_BASE}/findDrawNotice?lottery_type=dlt&pageNum=${page}&pageSize=${pageSize}`
    const json = await fetchJSON(url)
    if (!json) break

    const results = json.result as TCDrawRaw[] | undefined
    if (!Array.isArray(results)) break

    for (const item of results) {
      allResults.push(
        buildDraw(item.draw_num || '', item.draw_date || '', item.red || '', item.blue || ''),
      )
    }

    if ((results.length || 0) < pageSize) break
  }

  return allResults.length > 0 ? allResults : null
}

// ── 统一入口 ─────────────────────────────────────────────────

export async function fetchLotteryHistory(
  type: LotteryType,
  count = 50,
): Promise<LotteryDraw[] | null> {
  if (type === 'dlt') {
    return fetchDLTHistory(count)
  }
  return fetchCWLHistory(type as 'ssq' | '3d', count)
}

// ── 兼容工具 ─────────────────────────────────────────────────

/**
 * 将真实开奖数据转换为 lib/services/lottery.ts 中的 LotteryHistoryItem 格式
 */
export function toHistoryFormat(
  draws: LotteryDraw[],
  type: 'ssq' | 'dlt' | '3d',
) {
  return draws.map((d) => {
    const reds = d.reds
    const blue = d.blues?.[0] ?? -1
    const sum = reds.reduce((a, b) => a + b, 0)
    const oddCount = reds.filter(n => n % 2 === 1).length
    const evenCount = reds.length - oddCount
    const z1 = reds.filter(n => type === 'ssq' ? n <= 11 : n <= 12).length
    const z2 = reds.filter(n => type === 'ssq' ? n >= 12 && n <= 22 : n >= 13 && n <= 24).length
    const z3 = reds.length - z1 - z2
    return {
      period: d.period,
      date: d.date,
      reds,
      blue,
      sum,
      oddEven: `${oddCount}:${evenCount}`,
      zone: `${z1}:${z2}:${z3}`,
    }
  })
}

/**
 * 获取最新一期双色球和大乐透开奖数据（用于仪表盘概览）
 */
export async function fetchOverviewLatest() {
  const [ssqResult, dltResult] = await Promise.all([
    fetchCWLHistory('ssq', 1),
    fetchDLTHistory(1),
  ])

  const latest = {
    ssq: ssqResult?.[0] ?? null,
    dlt: dltResult?.[0] ?? null,
  }

  return {
    ssq: latest.ssq
      ? { period: latest.ssq.period, raw: latest.ssq.raw, date: latest.ssq.date }
      : null,
    dlt: latest.dlt
      ? { period: latest.dlt.period, raw: latest.dlt.raw, date: latest.dlt.date }
      : null,
  }
}
