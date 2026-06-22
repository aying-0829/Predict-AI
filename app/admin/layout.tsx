'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin', label: '实时概览', icon: 'D' },
  { href: '/admin/users', label: '用户管理', icon: 'U' },
  { href: '/admin/predictions', label: '预测监控', icon: 'P' },
  { href: '/admin/health', label: '系统健康', icon: 'H' },
  { href: '/admin/notifications', label: '通知管理', icon: 'N' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthed(false)
      setLoading(false)
      return
    }
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.replace('/admin/login')
      return
    }
    setAuthed(true)
    setLoading(false)
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  // 登录页使用独立布局
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!authed) return null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* 侧边栏 */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="text-lg font-bold text-white tracking-wide">
            PREDICT ADMIN
          </Link>
          <p className="text-xs text-gray-500 mt-1">管理控制台</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  active ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              localStorage.removeItem('admin-token')
              router.push('/admin/login')
            }}
            className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors py-2"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
