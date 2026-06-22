'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type FormatType = 'number' | 'currency' | 'percent'

interface UseCountUpOptions {
  target: number
  duration?: number
  format?: FormatType
}

interface UseCountUpReturn {
  displayValue: string
  isAnimating: boolean
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function formatValue(value: number, format: FormatType): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value)
    case 'percent':
      return `${Math.round(value * 100)}%`
    case 'number':
    default:
      return new Intl.NumberFormat('zh-CN').format(Math.round(value))
  }
}

export default function useCountUp({
  target,
  duration = 1500,
  format = 'number',
}: UseCountUpOptions): UseCountUpReturn {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevTargetRef = useRef(target)

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      const value = easedProgress * target

      setCurrent(value)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCurrent(target)
        setIsAnimating(false)
      }
    },
    [target, duration],
  )

  useEffect(() => {
    // Reset if target changed
    if (prevTargetRef.current !== target) {
      prevTargetRef.current = target
      startTimeRef.current = null
      setIsAnimating(true)

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(animate)
    } else {
      rafRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [target, duration, animate])

  return {
    displayValue: formatValue(current, format),
    isAnimating,
  }
}
