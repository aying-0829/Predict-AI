'use client'

import { useEffect, useState, useCallback } from 'react'

interface User {
  id: number
  username: string
  phone: string | null
  membership_type: string
  points: number
  total_predictions: number
  total_hits: number
  accuracy: number
  current_streak: number
  rank: number
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin-token')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.code === 0) {
        setUsers(json.data.users)
        setTotalPages(json.data.totalPages)
        setTotal(json.data.total)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">用户管理</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="搜索用户名或手机号..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 w-64 focus:outline-none focus:border-indigo-500"
        />
        <span className="text-xs text-gray-500">共 {total} 个用户</span>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm py-12 text-center">加载中...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">昵称</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">邮箱/手机</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">注册时间</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">预测数</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">准确率</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <>
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4 text-gray-400">{u.id}</td>
                      <td className="py-3 px-4 text-gray-200 font-medium">{u.username}</td>
                      <td className="py-3 px-4 text-gray-400">{u.phone || '-'}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{u.created_at?.slice(0, 10)}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{u.total_predictions}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={u.accuracy >= 60 ? 'text-green-400' : u.accuracy >= 30 ? 'text-amber-400' : 'text-red-400'}>
                          {u.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {expandedId === u.id ? '收起' : '详情'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === u.id && (
                      <tr key={`detail-${u.id}`}>
                        <td colSpan={7} className="py-4 px-6 bg-gray-800/30">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div><span className="text-gray-500">会员类型：</span><span className="text-gray-300">{u.membership_type}</span></div>
                            <div><span className="text-gray-500">积分：</span><span className="text-gray-300">{u.points}</span></div>
                            <div><span className="text-gray-500">排名：</span><span className="text-gray-300">#{u.rank}</span></div>
                            <div><span className="text-gray-500">连击：</span><span className="text-gray-300">{u.current_streak}</span></div>
                            <div><span className="text-gray-500">命中次数：</span><span className="text-gray-300">{u.total_hits}</span></div>
                            <div><span className="text-gray-500">注册时间：</span><span className="text-gray-300">{u.created_at}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">第 {page}/{totalPages} 页</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >上一页</button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >下一页</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
