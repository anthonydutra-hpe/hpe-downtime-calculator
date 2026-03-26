import { NextResponse } from 'next/server'
import { calculate } from '../../../lib/calc'

export async function POST(req: Request) {
  try {
    const inputs = await req.json()
    const out = calculate(inputs)
    return NextResponse.json(out)
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
