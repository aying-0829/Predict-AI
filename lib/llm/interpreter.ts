/**
 * LLM Text Interpreter
 *
 * Converts engine statistical output into natural-language analysis
 * via the configured AI API, with database caching.
 */

import { getDB } from '../db'

const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const AI_API_KEY = process.env.AI_API_KEY || ''

const SYSTEM_PROMPT = '你是 Predict AI 的体育/彩票分析助手。基于统计数据生成专业分析文案，不超过200字，标注置信度。'

// ── Ensure ai_analysis table exists ──────────────────────────────────

function ensureAiAnalysisTable(): void {
  const db = getDB()
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      match_id TEXT NOT NULL,
      content TEXT,
      engine_output TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    )
  `)
}

// ── Core LLM call ────────────────────────────────────────────────────

export async function generatePredictionText(engineOutput: any): Promise<string | null> {
  if (!AI_API_KEY) return null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const body = JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(engineOutput, null, 2) },
      ],
      max_tokens: 400,
      temperature: 0.7,
    })

    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) return null

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data?.choices?.[0]?.message?.content

    return typeof content === 'string' && content.trim().length > 0
      ? content.trim()
      : null
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

// ── Cached generation with DB persistence ────────────────────────────

export async function generateCachedPrediction(
  type: string,
  matchId: string,
  engineOutput: { prediction: string; numbers?: string; reasoning?: string },
): Promise<string | null> {
  ensureAiAnalysisTable()

  const text = await generatePredictionText(engineOutput)

  if (!text) return null

  const db = getDB()

  db.prepare(
    `INSERT OR REPLACE INTO ai_analysis (id, type, match_id, content, engine_output, created_at)
     VALUES (
       (SELECT id FROM ai_analysis WHERE match_id = ?),
       ?, ?, ?, ?,
       datetime('now','localtime')
     )`
  ).run(matchId, type, matchId, text, JSON.stringify(engineOutput))

  return text
}
