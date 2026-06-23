'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  House,
  SoccerBall,
  Ticket,
  Broadcast,
  ChartBar,
  MagnifyingGlass,
  Bell,
  ArrowsOut,
  User,
  SignOut,
  List,
  X,
  Trophy,
  Newspaper,
} from 'phosphor-react'
import SearchPanel from './search/SearchPanel'
import LanguageSwitch from './i18n/LanguageSwitch'
import { useTranslation } from '@/lib/i18n'

interface UserInfo { id: number; phone: string; points: number; plan: string }

export default function Header() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (data.code === 0 && data.data) setUser(data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleStorage = () => {
      fetch('/api/auth/me').then(res => res.json())
        .then(data => setUser(data.code === 0 && data.data ? data.data : null))
        .catch(() => setUser(null))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const navItems = [
    { href: '/', label: t.nav.home, icon: House },
    { href: '/world-cup', label: t.nav.worldCup, icon: SoccerBall },
    { href: '/lottery', label: t.nav.lottery, icon: Ticket },
    { href: '/live', label: t.nav.live, icon: Broadcast },
    { href: '/stats', label: t.nav.stats, icon: ChartBar },
    { href: '/leaderboard', label: t.nav.standings, icon: Trophy },
    { href: '/news', label: t.nav.headlines, icon: Newspaper },
  ]

  return (
    <>
      {/* ========== 左侧终端面板 ========== */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-out"
        style={{
          width: sidebarExpanded ? '200px' : '56px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-laser)',
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-4 h-14 flex-shrink-0 border-b border-[var(--border-laser)]">
          <span className="font-orbitron font-bold text-lg tracking-widest uppercase text-[var(--neon-cyan)] whitespace-nowrap"
            style={{
              background: sidebarExpanded ? 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))' : 'none',
              WebkitBackgroundClip: sidebarExpanded ? 'text' : 'none',
              WebkitTextFillColor: sidebarExpanded ? 'transparent' : 'var(--neon-cyan)',
              backgroundClip: sidebarExpanded ? 'text' : 'none',
            }}>
            {sidebarExpanded ? 'PREDICT AI' : 'P'}
          </span>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 py-3 px-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-body)] hover:bg-white/5'
                }`}
                title={!sidebarExpanded ? item.label : undefined}
              >
                <Icon
                  size={22}
                  weight={isActive ? 'fill' : 'duotone'}
                  className="flex-shrink-0"
                  style={isActive ? { color: 'var(--neon-cyan)' } : {}}
                />
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                    sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && !sidebarExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-[var(--neon-cyan)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: user area */}
        <div className="p-2 border-t border-[var(--border-laser)] flex-shrink-0">
          {loading ? (
            <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
          ) : user ? (
            <Link
              href="/member"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-body)] hover:bg-white/5 transition-all"
              title={!sidebarExpanded ? user.phone : undefined}
            >
              <User size={22} weight="duotone" className="flex-shrink-0" />
              <span className={`text-xs whitespace-nowrap transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {user.phone}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-dim)] hover:text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/5 transition-all"
              title={!sidebarExpanded ? t.nav.login : undefined}
            >
              <User size={22} weight="duotone" className="flex-shrink-0" />
              <span className={`text-xs whitespace-nowrap transition-opacity duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {t.nav.login}
              </span>
            </Link>
          )}
        </div>
      </aside>

      {/* ========== 底部 Dock ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-6 px-6 py-2 mb-3 rounded-2xl"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-laser)',
            height: '48px',
          }}>
          <button
            onClick={() => setSearchOpen(true)}
            className="text-[var(--text-dim)] hover:text-[var(--neon-cyan)] transition-all duration-200 hover:scale-110 group relative"
            title="搜索"
          >
            <MagnifyingGlass size={22} weight="duotone" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-dim)] bg-[rgba(0,0,0,0.8)] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              搜索
            </span>
          </button>
          <button
            className="text-[var(--text-dim)] hover:text-[var(--neon-cyan)] transition-all duration-200 hover:scale-110 group relative"
            title="通知"
          >
            <Bell size={22} weight="duotone" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-dim)] bg-[rgba(0,0,0,0.8)] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              通知
            </span>
          </button>
          <LanguageSwitch />
          <button
            className="text-[var(--text-dim)] hover:text-[var(--neon-cyan)] transition-all duration-200 hover:scale-110 group relative"
            title="全屏"
            onClick={() => { if (document.fullscreenElement) { document.exitFullscreen() } else { document.documentElement.requestFullscreen() } }}
          >
            <ArrowsOut size={22} weight="duotone" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-dim)] bg-[rgba(0,0,0,0.8)] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              全屏
            </span>
          </button>
        </div>
      </div>

      {/* ========== 移动端汉堡按钮 ========== */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
        className="md:hidden fixed top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center rounded-lg"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border-laser)',
        }}
      >
        {mobileOpen ? (
          <X size={20} weight="bold" color="var(--neon-cyan)" />
        ) : (
          <List size={20} weight="bold" color="var(--text-body)" />
        )}
      </button>

      {/* ========== 移动端全屏覆盖导航 ========== */}
      <div
        className={`md:hidden fixed inset-0 z-[55] flex flex-col items-center justify-center transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        onClick={() => setMobileOpen(false)}
      >
        <nav className="flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative font-orbitron text-2xl tracking-widest uppercase transition-all duration-300 py-2 px-8 ${
                  isActive ? 'text-[var(--neon-cyan])' : 'text-[var(--text-dim)] hover:text-[var(--text-heading)]'
                }`}
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-[var(--neon-cyan)] group-hover:w-6 transition-all duration-300 rounded" />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0.5 bg-[var(--neon-magenta)] group-hover:w-6 transition-all duration-300 rounded" />
                <span className="flex items-center gap-3">
                  <Icon size={24} weight="duotone" />
                  {item.label}
                </span>
              </Link>
            )
          })}
          <div className="mt-4 pt-4 border-t border-[var(--border-laser)] w-full flex justify-center gap-6">
            {user ? (
              <>
                <Link href="/member" onClick={() => setMobileOpen(false)} className="text-[var(--text-dim)] hover:text-[var(--neon-cyan)]">
                  <User size={24} weight="duotone" />
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-[var(--text-dim)] hover:text-[var(--neon-magenta)]">
                  <SignOut size={24} weight="duotone" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[var(--neon-cyan)] hover:text-[var(--text-heading)] font-orbitron text-sm tracking-widest">
                  {t.nav.login}
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="text-[var(--neon-magenta)] hover:text-[var(--text-heading)] font-orbitron text-sm tracking-widest">
                  {t.auth.register}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {searchOpen && <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  )
}
