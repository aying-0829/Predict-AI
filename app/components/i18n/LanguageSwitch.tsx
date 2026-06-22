'use client'

import { useTranslation } from '@/lib/i18n'
import { useLocale } from '@/lib/i18n'

export default function LanguageSwitch() {
  const { locale: _locale, setLocale } = useTranslation() as { locale: string; setLocale: (l: string) => void; t: unknown }
  const currentLocale = useLocale()

  const toggle = () => {
    setLocale(currentLocale === 'zh' ? 'en' : 'zh')
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-[#0c0c18] bg-gray-800 border border-[rgba(0,229,255,0.1)] border-[rgba(0,229,255,0.1)] text-[#505870] text-[#9098b0] hover:border-[var(--neon-cyan)]/50 hover:text-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-colors"
      aria-label={currentLocale === 'zh' ? 'Switch to English' : '切换到中文'}
      title={currentLocale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {currentLocale === 'zh' ? 'EN' : '中'}
    </button>
  )
}
