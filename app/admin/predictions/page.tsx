'use client'

import { useEffect, useState, useCallback } from 'react'

interface Prediction {
  id: number
  lottery_type: string
  numbers: string
  result: string | null
  ai_numbers: string
  hit: number
  is_hit: number
  created_at: string
  username: string
}

interface TypeAccuracy {
  type: string
  total: number
  hits: number
  accuracy: number
}

const TYPE_LABELS: Record<string, string> = {
  ssq: '双色球', dlt: '大乐透', '3d': '福彩3D', pl5: '排列五', sport: '竞彩足球', worldcup: '世界杯',
}

export default function AdminPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [typeAccuracy, setTypeAccuracy] = useState<TypeAccuracy[]>([])
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filterType) params.set('lottery_type', filterType)
      const res = await fetch(`/api/admin/predictions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.code === 0) {
        setPredictions(json.data.predictions)
        setTypeAccuracy(json.data.typeAccuracy)
        setTotalPages(json.data.totalPages)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, filterType])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">预测监控</h1>

      {/* 按类型准确率 */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-4">各赛事类型准确率对比</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">类型</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">总预测</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">命中</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">准确率</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">进度条</th>
              </tr>
            </thead>
            <tbody>
              {typeAccuracy.map(t => (
                <tr key={t.type} className="border-b border-gray-800/50">
                  <td className="py-2.5 px-3 text-gray-300">{TYPE_LABELS[t.type] || t.type}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{t.total}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{t.hits}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={t.accuracy >= 60 ? 'text-green-400' : t.accuracy >= 30 ? 'text-amber-400' : 'text-red-400'}>
                      {t.accuracy}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(t.accuracy, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">按类型筛选：</span>
        {['', 'ssq', 'dlt', '3d', 'pl5', 'sport'].map(t => (
          <button
            key={t}
            onClick={() => { setFilterType(t); setPage(1) }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              filterType === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t === '' ? '全部' : TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* 预测列表 */}
      {loading ? (
        <div className="text-gray-500 text-sm py-12 text-center">加载中...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">用户</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">赛事类型</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">预测内容</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">结果</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">命中</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map(p => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-gray-500">{p.id}</td>
                    <td className="py-3 px-4 text-gray-200">{p.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400">
                        {TYPE_LABELS[p.lottery_type] || p.lottery_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">{p.numbers || p.ai_numbers}</td>
                    <td className="py-3 px-4 text-gray-400">{p.result || '待开奖'}</td>
                    <td className="py-3 px-4 text-center">
                      {p.is_hit ? (
                        <span className="text-green-400 text-xs font-medium">命中 {p.hit}</span>
                      ) : p.result ? (
                        <span className="text-red-400 text-xs">未中</span>
                      ) : (
                        <span className="text-gray-600 text-xs">待定</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{p.created_at?.slice(0, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">第 {page}/{totalPages} 页</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-40">上一页</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-40">下一页</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
