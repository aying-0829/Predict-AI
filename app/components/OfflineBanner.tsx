'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const handleOffline = () => setOffline(true)
    const handleOnline = () => setOffline(false)

    if (!navigator.onLine) setOffline(true)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="offline-banner fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-black text-center py-2 text-sm font-medium">
      <span className="inline-flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M16.95 7.05a7 7 0 010 9.9M15.536 8.464a5 5 0 010 7.072" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364L12 12l6.364 6.364" />
        </svg>
        当前处于离线状态，部分功能可能不可用
      </span>
    </div>
  )
}
