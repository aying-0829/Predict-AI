import { NextResponse } from 'next/server'

const bracket = {
  roundOf32: [],
  roundOf16: [],
  quarters: [],
  semis: [],
  thirdPlace: null,
  final: null,
  champion: null,
}

export async function GET() {
  return NextResponse.json(bracket)
}
