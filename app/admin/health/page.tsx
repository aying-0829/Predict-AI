'use client'

import { useEffect, useState, useCallback } from 'react'

interface DbStat { table: string; rows: number }
interface LatencyItem { endpoint: string; avgLatency: number; status: string }
interface HealthData {
  dbSize: string
  dbConnection: string
  dbStats: DbStat[]
  memory: { total: string; used: string; free: string; percent: number }
  disk: { total: string; free: string; percent: number } | null
  apiLatency: string
  apiLatencyDetail: LatencyItem[]
  uptime: string
  nodeVersion: string
  platform: string
}

function StatusDot({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const colors = { green: 'bg-green-500', yellow: 'bg-amber-500', red: 'bg-red-500' }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]} mr-2`} />
}

function getStatus(value: number, thresholds: [number, number]): 'green' | 'yellow' | 'red' {
  if (value <= thresholds[0]) return 'green'
  if (value <= thresholds[1]) return 'yellow'
  return 'red'
}

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch('/api/admin/health', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.code === 0) setData(json.data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <div className="text-gray-500 text-sm py-12 text-center">加载中...</div>
  if (!data) return <div className="text-red-400 text-sm py-12 text-center">获取健康数据失败</div>

  const memStatus = getStatus(data.memory.percent, [70, 90])
  const diskStatus = data.disk ? getStatus(data.disk.percent, [70, 90]) : 'green'

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">系统健康</h1>

      {/* 状态卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center mb-2">
            <StatusDot status="green" />
            <span className="text-xs text-gray-500">数据库连接</span>
          </div>
          <div className="text-sm text-gray-300">{data.dbConnection === 'ok' ? '正常' : '异常'}</div>
          <div className="text-xs text-gray-600 mt-1">{data.dbSize}</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center mb-2">
            <StatusDot status={memStatus} />
            <span className="text-xs text-gray-500">内存使用</span>
          </div>
          <div className="text-sm text-gray-300">{data.memory.used} / {data.memory.total}</div>
          <div className="text-xs text-gray-600 mt-1">{data.memory.percent}% 已使用</div>
        </div>

        {data.disk && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center mb-2">
              <StatusDot status={diskStatus} />
              <span className="text-xs text-gray-500">磁盘空间</span>
            </div>
            <div className="text-sm text-gray-300">{data.disk.free} 可用</div>
            <div className="text-xs text-gray-600 mt-1">{data.disk.percent}% 已使用</div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center mb-2">
            <StatusDot status="green" />
            <span className="text-xs text-gray-500">运行时间</span>
          </div>
          <div className="text-sm text-gray-300">{data.uptime}</div>
          <div className="text-xs text-gray-600 mt-1">Node {data.nodeVersion}</div>
        </div>
      </div>

      {/* 数据库表统计 */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-4">数据库表行数统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.dbStats.map(s => (
            <div key={s.table} className="bg-gray-800/50 rounded px-3 py-2">
              <div className="text-xs text-gray-500">{s.table}</div>
              <div className="text-lg font-bold text-gray-200">{s.rows.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API 延迟 */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-4">API 端点平均延迟</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">端点</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">平均延迟</th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {data.apiLatencyDetail.map(item => (
                <tr key={item.endpoint} className="border-b border-gray-800/50">
                  <td className="py-2.5 px-3 text-gray-300 font-mono text-xs">{item.endpoint}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{item.avgLatency}ms</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-green-400 text-xs">正常</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
