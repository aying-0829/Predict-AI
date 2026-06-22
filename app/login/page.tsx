'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; password?: string }>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const errors: { phone?: string; password?: string } = {}
    if (!phone.trim()) errors.phone = '请输入手机号'
    if (!password) errors.password = '请输入密码'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()
      if (!res.ok || data.code !== 0) throw new Error(data.message || '登录失败')
      window.location.href = '/'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发生未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-[1]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text-heading)] tracking-wide">
            PREDICT{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI
            </span>
          </h1>
          <p className="text-[var(--text-dim)] text-sm">登录账户</p>
        </div>

        <div className="laser-panel p-8 scanline-overlay">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                id="login-error"
                role="alert"
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3"
              >
                {error}
              </div>
            )}

            {/* 激光边框输入框 */}
            <div>
              <label
                htmlFor="login-phone"
                className="block text-xs text-[var(--text-label)] mb-2 uppercase tracking-wider"
              >
                手机号
              </label>
              <input
                id="login-phone"
                type="tel"
                required
                aria-required="true"
                maxLength={11}
                placeholder="请输入手机号"
                className={`input-terminal ${fieldErrors.phone ? 'border-red-500/50' : ''}`}
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'login-phone-error' : undefined}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }))
                }}
              />
              {fieldErrors.phone && (
                <p id="login-phone-error" role="alert" className="text-red-400 text-xs mt-1 transition-opacity">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs text-[var(--text-label)] mb-2 uppercase tracking-wider"
              >
                密码
              </label>
              <input
                id="login-password"
                type="password"
                required
                aria-required="true"
                placeholder="请输入密码"
                className={`input-terminal ${fieldErrors.password ? 'border-red-500/50' : ''}`}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
              />
              {fieldErrors.password && (
                <p id="login-password-error" role="alert" className="text-red-400 text-xs mt-1 transition-opacity">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-[var(--neon-cyan)]/80 hover:text-[var(--neon-cyan)] transition-colors text-xs"
              >
                忘记密码？
              </Link>
            </div>

            {/* 全息 CTA 按钮 */}
            <button type="submit" disabled={loading} className="btn-holo w-full justify-center">
              {loading ? '登录中...' : '登录'}
            </button>

            <p className="text-center text-sm text-[var(--text-dim)]">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors"
              >
                立即注册
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
