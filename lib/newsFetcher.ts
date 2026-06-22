/**
 * Real news data fetcher.
 * Attempts to fetch live sports news from free RSS/API sources.
 * Falls back gracefully when sources are unavailable.
 */

import type Database from 'better-sqlite3'
import type { NewsItem } from './mock-news'

/**
 * Fetch latest sports news. Returns null if real sources unavailable,
 * allowing callers to fall back to mock data.
 */
export async function fetchLatestNews(_db?: Database.Database): Promise<NewsItem[] | null> {
  // Try ESPN Football API (RSS feed, no key needed)
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)

    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news',
      { signal: ctrl.signal },
    )

    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const articles = data?.articles ?? []

      if (Array.isArray(articles) && articles.length > 0) {
        return articles.slice(0, 12).map((a: { headline?: string; title?: string; description?: string; summary?: string; images?: Array<{ url?: string }>; categories?: string; sport?: string; league?: string; published?: string; publishedAt?: string; links?: { web?: { href?: string } }; link?: string; source?: string; body?: string; date?: string; url?: string }, i: number) => {
          const cat = determineCategory(a?.categories ?? a?.sport ?? a?.league ?? '')
          return {
            id: `espn-${i}-${Date.now()}`,
            title: a.headline ?? a.title ?? '',
            summary: a.description ?? a.summary ?? '',
            thumbnail: a.images?.[0]?.url ?? '',
            category: cat,
            source: 'ESPN',
            publishedAt: a.published ?? a.publishedAt ?? new Date().toISOString(),
            url: a.links?.web?.href ?? a.link ?? '#',
            breaking: i < 2,
          }
        })
      }
    }
  } catch {
    // Source unavailable, will fall back
  }

  // Try BBC Sport RSS as secondary
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)

    const res = await fetch(
      'https://feeds.bbci.co.uk/sport/football/rss.xml',
      { signal: ctrl.signal },
    )

    clearTimeout(timer)

    if (res.ok) {
      const text = await res.text()
      // Very basic RSS extraction
      const items = text.match(/<item>[\s\S]*?<\/item>/g) ?? []
      if (items.length > 0) {
        return items.slice(0, 12).map((itemStr, i) => {
          const title = extractTag(itemStr, 'title')
          const desc = extractTag(itemStr, 'description')
          const pubDate = extractTag(itemStr, 'pubDate')
          return {
            id: `bbc-${i}-${Date.now()}`,
            title: decodeEntities(title),
            summary: decodeEntities(desc).slice(0, 120),
            thumbnail: '',
            category: '英超',
            source: 'BBC Sport',
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            url: extractTag(itemStr, 'link'),
            breaking: false,
          }
        })
      }
    }
  } catch {
    // Source unavailable
  }

  return null
}

function determineCategory(input: string | string[]): string {
  const str = Array.isArray(input) ? input.join(' ') : input
  const lower = str.toLowerCase()
  if (lower.includes('premier') || lower.includes('eng.1')) return '英超'
  if (lower.includes('laliga') || lower.includes('esp.1')) return '西甲'
  if (lower.includes('serie') || lower.includes('ita.1')) return '意甲'
  if (lower.includes('bundesliga') || lower.includes('ger.1')) return '德甲'
  if (lower.includes('world cup') || lower.includes('fifa')) return '世界杯'
  if (lower.includes('lottery') || lower.includes('彩票')) return '彩票'
  return '世界杯'
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const cdata = xml.match(re)
  if (cdata) return cdata[1].trim()

  const re2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(re2)
  return match ? match[1].trim() : ''
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
