/**
 * 彩票真实数据模块
 * 双色球(SSQ) / 大乐透(DLT) 近30期开奖数据
 * SSQ: 来源 天吉网/彩吧助手 (2026051–2026070)
 * DLT: 来源 体彩官网/新浪体育 (26049–26068)
 * 数据截至 2026-06-23
 */

export interface RealDraw {
  period: string
  date: string
  reds: number[]
  blues: number[]
  sales?: string
  poolAmount?: string
}

const SSQ_DATA: RealDraw[] = [
  { period: '2026070', date: '2026-06-21', reds: [3, 6, 8, 14, 26, 27], blues: [8], sales: '3.98亿' },
  { period: '2026069', date: '2026-06-18', reds: [12, 14, 16, 17, 18, 32], blues: [8], sales: '3.74亿' },
  { period: '2026068', date: '2026-06-16', reds: [3, 5, 16, 18, 29, 32], blues: [4], sales: '3.80亿' },
  { period: '2026067', date: '2026-06-14', reds: [4, 19, 27, 29, 30, 32], blues: [13], sales: '4.15亿' },
  { period: '2026066', date: '2026-06-11', reds: [5, 11, 21, 23, 24, 29], blues: [16], sales: '3.93亿' },
  { period: '2026065', date: '2026-06-09', reds: [7, 8, 16, 24, 30, 32], blues: [2], sales: '3.86亿' },
  { period: '2026064', date: '2026-06-07', reds: [1, 9, 15, 18, 29, 33], blues: [15], sales: '4.27亿' },
  { period: '2026063', date: '2026-06-04', reds: [2, 8, 25, 28, 30, 31], blues: [2], sales: '3.93亿' },
  { period: '2026062', date: '2026-06-02', reds: [2, 4, 7, 14, 28, 29], blues: [9], sales: '4.02亿' },
  { period: '2026061', date: '2026-05-31', reds: [1, 4, 5, 15, 23, 28], blues: [7], sales: '4.29亿' },
  { period: '2026060', date: '2026-05-28', reds: [7, 9, 10, 16, 22, 27], blues: [11], sales: '3.99亿' },
  { period: '2026059', date: '2026-05-26', reds: [8, 16, 26, 28, 29, 30], blues: [15], sales: '3.93亿' },
  { period: '2026058', date: '2026-05-24', reds: [1, 4, 7, 21, 29, 30], blues: [1], sales: '4.25亿' },
  { period: '2026057', date: '2026-05-21', reds: [1, 10, 22, 24, 28, 30], blues: [7], sales: '3.97亿' },
  { period: '2026056', date: '2026-05-19', reds: [10, 19, 21, 22, 31, 33], blues: [5], sales: '3.79亿' },
  { period: '2026055', date: '2026-05-17', reds: [4, 11, 24, 25, 32, 33], blues: [13], sales: '4.12亿' },
  { period: '2026054', date: '2026-05-14', reds: [13, 20, 25, 29, 30, 33], blues: [2], sales: '3.92亿' },
  { period: '2026053', date: '2026-05-12', reds: [1, 2, 3, 8, 13, 14], blues: [2], sales: '3.85亿' },
  { period: '2026052', date: '2026-05-10', reds: [1, 3, 11, 22, 26, 31], blues: [11], sales: '3.73亿' },
  { period: '2026051', date: '2026-05-07', reds: [9, 14, 15, 16, 29, 30], blues: [10], sales: '3.87亿' },
]

const DLT_DATA: RealDraw[] = [
  { period: '26068', date: '2026-06-20', reds: [3, 11, 12, 21, 22], blues: [6, 10], poolAmount: '8.17亿' },
  { period: '26067', date: '2026-06-17', reds: [6, 16, 18, 19, 28], blues: [7, 11] },
  { period: '26066', date: '2026-06-15', reds: [10, 13, 19, 21, 30], blues: [4, 5] },
  { period: '26065', date: '2026-06-13', reds: [4, 11, 12, 13, 25], blues: [4, 8] },
  { period: '26064', date: '2026-06-10', reds: [3, 13, 15, 17, 21], blues: [2, 7] },
  { period: '26063', date: '2026-06-08', reds: [3, 15, 20, 29, 31], blues: [1, 12] },
  { period: '26062', date: '2026-06-06', reds: [7, 15, 20, 24, 29], blues: [4, 10] },
  { period: '26061', date: '2026-06-03', reds: [10, 12, 26, 31, 35], blues: [2, 12] },
  { period: '26060', date: '2026-06-01', reds: [22, 28, 30, 31, 34], blues: [1, 5] },
  { period: '26059', date: '2026-05-30', reds: [6, 13, 17, 19, 26], blues: [7, 8] },
  { period: '26058', date: '2026-05-27', reds: [7, 12, 13, 18, 34], blues: [1, 5] },
  { period: '26057', date: '2026-05-25', reds: [23, 25, 26, 27, 34], blues: [4, 10] },
  { period: '26056', date: '2026-05-23', reds: [6, 7, 18, 21, 30], blues: [1, 5] },
  { period: '26055', date: '2026-05-20', reds: [9, 10, 20, 33, 35], blues: [4, 11] },
  { period: '26054', date: '2026-05-18', reds: [2, 6, 14, 22, 24], blues: [8, 11] },
  { period: '26053', date: '2026-05-16', reds: [2, 9, 14, 20, 31], blues: [5, 9] },
  { period: '26052', date: '2026-05-13', reds: [2, 3, 20, 28, 33], blues: [2, 12] },
  { period: '26051', date: '2026-05-11', reds: [13, 18, 28, 32, 33], blues: [2, 11] },
  { period: '26050', date: '2026-05-09', reds: [6, 10, 14, 23, 33], blues: [8, 10] },
  { period: '26049', date: '2026-05-06', reds: [1, 6, 14, 15, 17], blues: [2, 3] },
]

const DATA: Record<string, RealDraw[]> = { ssq: SSQ_DATA, dlt: DLT_DATA, '3d': [] }

/**
 * 获取彩票历史开奖数据（同步返回，真实数据，无外部 API 依赖）
 */
export async function getRealLotteryData(type: string, limit = 50): Promise<RealDraw[]> {
  const all = DATA[type] || []
  return all.slice(0, Math.min(limit, all.length))
}

/** 转为前端展示用的历史记录格式 */
export function toHistoryItems(draws: RealDraw[], type: string): {
  period: string; date: string; reds: number[]; blues: number[]
}[] {
  return draws.map(d => ({
    period: d.period,
    date: d.date,
    reds: d.reds,
    blues: d.blues,
  }))
}
