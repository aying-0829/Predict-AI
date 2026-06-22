import { getAIAnalysis } from '@/lib/services'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = getAIAnalysis()
  return Response.json({ code: 0, data })
}
