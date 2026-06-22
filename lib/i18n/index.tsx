'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import zh, { type TranslationKeys } from './zh'
import en from './en'

type Locale = 'zh' | 'en'

const translations: Record<Locale, TranslationKeys> = { zh, en }

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function useTranslation(): { t: TranslationKeys; locale: Locale } {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return { t: zh, locale: 'zh' }
  }
  return { t: ctx.t, locale: ctx.locale }
}

export function useLocale(): Locale {
  const ctx = useContext(I18nContext)
  return ctx?.locale || 'zh'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh')

  useEffect(() => {
    const stored = localStorage.getItem('lang') || getCookie('lang')
    if (stored === 'en' || stored === 'zh') {
      setLocale(stored)
    } else {
      const browserLang = navigator.language.toLowerCase()
      setLocale(browserLang.startsWith('en') ? 'en' : 'zh')
    }
  }, [])

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next)
    localStorage.setItem('lang', next)
    document.cookie = `lang=${next};path=/;max-age=31536000`
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  )
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Server-side translation helper
export function getTranslation(locale: Locale = 'zh'): TranslationKeys {
  return translations[locale]
}
