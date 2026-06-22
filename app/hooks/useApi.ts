'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchJson, FetchError } from '@/lib/fetch'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  /** Enable on mount (default: true) */
  immediate?: boolean
  /** Cache key to deduplicate concurrent requests */
  cacheKey?: string
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  /** Re-fetch with the same URL */
  refresh: () => void
  /** Fetch with a different URL */
  execute: (url: string, options?: RequestInit) => Promise<T>
}

const inFlightRequests = new Map<string, Promise<unknown>>()

export function useApi<T = unknown>(
  url: string,
  options?: RequestInit,
  opts?: UseApiOptions
): UseApiReturn<T> {
  const { immediate = true, cacheKey } = opts || {}

  const key = cacheKey || url

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  const isMounted = useRef(true)
  const urlRef = useRef(url)
  urlRef.current = url

  const fetchData = useCallback(
    async (fetchUrl: string, fetchOptions?: RequestInit): Promise<T> => {
      setState(s => ({ ...s, loading: true, error: null }))

      try {
        // Deduplicate concurrent requests with the same key
        let promise = inFlightRequests.get(key)
        if (!promise) {
          promise = fetchJson<T>(fetchUrl, fetchOptions)
          inFlightRequests.set(key, promise)
        }

        const data = await promise as T

        if (isMounted.current) {
          setState({ data, loading: false, error: null })
        }
        return data
      } catch (err) {
        const message =
          err instanceof FetchError
            ? `请求失败 (${err.status}): ${err.message}`
            : err instanceof Error
              ? err.message
              : '未知错误'

        if (isMounted.current) {
          setState({ data: null, loading: false, error: message })
        }
        throw err
      } finally {
        inFlightRequests.delete(key)
      }
    },
    [key]
  )

  const refresh = useCallback(() => {
    fetchData(urlRef.current, options)
  }, [fetchData, options])

  const execute = useCallback(
    (executeUrl: string, executeOptions?: RequestInit) => {
      return fetchData(executeUrl, executeOptions)
    },
    [fetchData]
  )

  useEffect(() => {
    if (immediate) {
      fetchData(url, options)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh,
    execute,
  }
}
