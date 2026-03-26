import { NextResponse } from 'next/server'
import { advise } from '../../../lib/advisor'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Accept optional overrides in body; pass as third argument to advise()
    // Overrides are in-memory only and not persisted to disk
    const out = advise(body.inputs, body.calc, body.overrides || {})
    return NextResponse.json(out)
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
