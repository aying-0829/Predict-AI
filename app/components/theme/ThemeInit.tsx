'use client'

import { useEffect } from 'react'
import OfflineBanner from '@/app/components/OfflineBanner'

export default function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      document.documentElement.classList.remove('dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return <OfflineBanner />
}
