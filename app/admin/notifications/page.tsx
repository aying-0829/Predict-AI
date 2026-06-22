'use client'

import { useEffect, useState, useCallback } from 'react'

interface Notification {
  id: number
  title: string
  content: string
  target: string
  sent: number
  created_at: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [target, setTarget] = useState('all')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch(`/api/admin/notifications?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.code === 0) {
        setNotifications(json.data.notifications)
        setTotalPages(json.data.totalPages)
      }
    } catch { /* ignore */ }
  }, [page])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage('标题和内容不能为空')
      return
    }
    setSending(true)
    setMessage('')
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), target }),
      })
      const json = await res.json()
      if (json.code === 0) {
        setMessage('通知已发送')
        setTitle('')
        setContent('')
        setTarget('all')
        setPage(1)
        fetchNotifications()
      } else {
        setMessage(json.message || '发送失败')
      }
    } catch {
      setMessage('网络错误')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">通知管理</h1>

      {/* 发送通知表单 */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-medium text-gray-300">发送全站公告</h3>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">标题</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
            placeholder="公告标题"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">内容</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="公告内容..."
          />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">目标</label>
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">全部用户</option>
              <option value="vip">VIP 用户</option>
              <option value="free">免费用户</option>
            </select>
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="mt-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
          >
            {sending ? '发送中...' : '发送公告'}
          </button>
        </div>

        {message && (
          <div className={`text-sm px-3 py-2 rounded ${
            message.includes('已发送') ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* 已发送通知列表 */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-300">已发送通知</h3>
        </div>
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-sm py-8 text-center">暂无通知</div>
        ) : (
          <>
            <div className="divide-y divide-gray-800/50">
              {notifications.map(n => (
                <div key={n.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-200">{n.title}</span>
                    <span className="text-xs text-gray-600">{n.created_at?.slice(0, 16)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{n.content}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                    n.target === 'all' ? 'bg-blue-900/30 text-blue-400' :
                    n.target === 'vip' ? 'bg-amber-900/30 text-amber-400' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {n.target === 'all' ? '全部用户' : n.target === 'vip' ? 'VIP用户' : '免费用户'}
                  </span>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">第 {page}/{totalPages} 页</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-40">上一页</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-40">下一页</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
