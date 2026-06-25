import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDB()

  const match = db
    .prepare(
      `SELECT * FROM wc_matches WHERE id = ? OR source_id = ?`
    )
    .get(id, id) as Record<string, unknown> | undefined

  if (!match) {
    return NextResponse.json({ code: 404, message: 'Match not found' }, { status: 404 })
  }

  return NextResponse.json({ code: 0, data: match })
}
