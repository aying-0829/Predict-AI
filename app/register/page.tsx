'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ phone: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    phone?: string
    password?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const errors: { phone?: string; password?: string; confirmPassword?: string } = {}
    if (!form.phone.trim()) errors.phone = '请输入手机号'
    if (!form.password) {
      errors.password = '请输入密码'
    } else if (form.password.length < 6) {
      errors.password = '密码至少 6 位'
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = '请确认密码'
    } else if (form.password && form.password !== form.confirmPassword) {
      errors.confirmPassword = '两次密码不一致'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (data.code === 0) {
        window.location.href = '/'
        return
      }
      setError(data.message || '注册失败')
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
          <p className="text-[var(--text-dim)] text-sm">创建新账户</p>
        </div>

        <div className="laser-panel p-8 scanline-overlay">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                id="register-error"
                role="alert"
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="register-phone"
                className="block text-xs text-[var(--text-label)] mb-2 uppercase tracking-wider"
              >
                手机号
              </label>
              <input
                id="register-phone"
                type="tel"
                required
                aria-required="true"
                placeholder="请输入手机号"
                className={`input-terminal ${fieldErrors.phone ? 'border-red-500/50' : ''}`}
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'register-phone-error' : undefined}
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value })
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }))
                }}
              />
              {fieldErrors.phone && (
                <p id="register-phone-error" role="alert" className="text-red-400 text-xs mt-1 transition-opacity">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs text-[var(--text-label)] mb-2 uppercase tracking-wider"
              >
                密码
              </label>
              <input
                id="register-password"
                type="password"
                required
                aria-required="true"
                placeholder="最少6位字符"
                className={`input-terminal ${fieldErrors.password ? 'border-red-500/50' : ''}`}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value })
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
              />
              {fieldErrors.password && (
                <p id="register-password-error" role="alert" className="text-red-400 text-xs mt-1 transition-opacity">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-xs text-[var(--text-label)] mb-2 uppercase tracking-wider"
              >
                确认密码
              </label>
              <input
                id="register-confirm"
                type="password"
                required
                aria-required="true"
                placeholder="再次输入密码"
                className={`input-terminal ${fieldErrors.confirmPassword ? 'border-red-500/50' : ''}`}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-error' : undefined}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value })
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }}
              />
              {fieldErrors.confirmPassword && (
                <p id="register-confirm-error" role="alert" className="text-red-400 text-xs mt-1 transition-opacity">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* 全息 CTA 按钮 */}
            <button type="submit" disabled={loading} className="btn-holo w-full justify-center">
              {loading ? '注册中...' : '注册'}
            </button>

            <p className="text-center text-sm text-[var(--text-dim)]">
              已有账户？{' '}
              <Link
                href="/login"
                className="text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors"
              >
                立即登录
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
