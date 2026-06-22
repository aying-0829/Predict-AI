'use client'

import { useEffect, useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface MetricData {
  value: number
  change: number
}

interface RealtimeData {
  activeUsers: MetricData
  newUsers: MetricData
  totalPredictions: MetricData
  accuracy: MetricData
  apiCalls: MetricData
  hourlyCalls: Array<{ minute: string; count: number }>
  hourlyActive: Array<{ hour: string; count: number }>
  updatedAt: string
}

function MetricCard({ title, value, change, suffix = '' }: { title: string; value: number; change: number; suffix?: string }) {
  const changeColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-500'
  const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="text-xs text-gray-500 mb-2">{title}</div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}{suffix}</div>
      <div className={`text-xs mt-1.5 ${changeColor}`}>
        {arrow} {Math.abs(change)}% 较昨日
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch('/api/admin/realtime', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.code === 0) {
        setData(json.data)
        setLastUpdated(new Date().toLocaleTimeString('zh-CN'))
        setError('')
      } else {
        setError(json.message)
      }
    } catch {
      setError('获取数据失败')
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">实时概览</h1>
        <span className="text-xs text-gray-500">
          每 5 秒刷新 | 最后更新: {lastUpdated}
        </span>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="今日活跃用户" value={data.activeUsers.value} change={data.activeUsers.change} />
        <MetricCard title="今日新增注册" value={data.newUsers.value} change={data.newUsers.change} />
        <MetricCard title="今日预测总量" value={data.totalPredictions.value} change={data.totalPredictions.change} />
        <MetricCard title="系统平均准确率" value={data.accuracy.value} change={data.accuracy.change} suffix="%" />
        <MetricCard title="API 调用量" value={data.apiCalls.value} change={data.apiCalls.change} />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近 1 小时 API 调用折线图 */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">最近 1 小时 API 调用趋势</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.hourlyCalls}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="minute" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6 }}
                labelStyle={{ color: '#d1d5db' }}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 24 小时活跃用户柱状图 */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">24 小时活跃用户分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.hourlyActive}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6 }}
                labelStyle={{ color: '#d1d5db' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 快速链接 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '用户管理', desc: '查看和管理所有用户', href: '/admin/users', color: 'bg-blue-600' },
          { label: '预测监控', desc: '监控预测数据和准确率', href: '/admin/predictions', color: 'bg-emerald-600' },
          { label: '系统健康', desc: '查看服务器状态', href: '/admin/health', color: 'bg-amber-600' },
          { label: '通知管理', desc: '发送全站公告', href: '/admin/notifications', color: 'bg-rose-600' },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div className={`w-8 h-8 rounded ${item.color} flex items-center justify-center text-white text-xs font-bold mb-3`}>
              {item.label[0]}
            </div>
            <div className="text-sm font-medium text-gray-300">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
