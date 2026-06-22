export class FetchError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.data = data
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''

export async function fetchJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    let data: unknown
    try {
      data = await res.json()
    } catch {
      // ignore parse error
    }
    throw new FetchError(
      `HTTP ${res.status}: ${res.statusText}`,
      res.status,
      data
    )
  }

  return res.json()
}
