'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const SplashCursor = dynamic(() => import('./SplashCursor'), { ssr: false })

export default function SplashCursorWrapper() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <Suspense fallback={null}>
        <SplashCursor />
      </Suspense>
    </div>
  )
}
