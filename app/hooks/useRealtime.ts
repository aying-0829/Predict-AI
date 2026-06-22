'use client'

import { useEffect, useRef, useCallback } from 'react'

interface EventHandlers {
  onLiveMatchUpdate?: (data: unknown) => void
  onPredictionResult?: (data: unknown) => void
  onLeaderboardUpdate?: (data: unknown) => void
  onConnected?: (data: unknown) => void
  onError?: (error: Event) => void
}

/**
 * SSE 实时推送 Hook
 * - 自动连接 /api/sse
 * - 断线自动重连（指数退避，最大 30 秒间隔）
 * - 支持按事件类型注册回调
 */
export function useRealtime(handlers: EventHandlers, enabled = true) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryCountRef = useRef(0)
  const maxRetryDelay = 30000

  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource('/api/sse')
    eventSourceRef.current = es

    es.addEventListener('connected', (e) => {
      retryCountRef.current = 0
      try {
        const data = JSON.parse(e.data)
        handlersRef.current.onConnected?.(data)
      } catch { /* ignore parse errors */ }
    })

    es.addEventListener('live_match_update', (e) => {
      try {
        const data = JSON.parse(e.data)
        handlersRef.current.onLiveMatchUpdate?.(data)
      } catch { /* ignore */ }
    })

    es.addEventListener('prediction_result', (e) => {
      try {
        const data = JSON.parse(e.data)
        handlersRef.current.onPredictionResult?.(data)
      } catch { /* ignore */ }
    })

    es.addEventListener('leaderboard_update', (e) => {
      try {
        const data = JSON.parse(e.data)
        handlersRef.current.onLeaderboardUpdate?.(data)
      } catch { /* ignore */ }
    })

    es.onerror = (e) => {
      handlersRef.current.onError?.(e)
      es.close()
      eventSourceRef.current = null

      // 指数退避重连
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), maxRetryDelay)
      retryCountRef.current++
      setTimeout(() => {
        if (enabled) connect()
      }, delay)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      return
    }
    connect()
    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
    }
  }, [connect, enabled])
}
