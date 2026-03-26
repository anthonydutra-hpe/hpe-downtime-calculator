import { NextResponse } from 'next/server'
import { advise } from '../../../lib/advisor'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const out = advise(body.inputs, body.calc)
    return NextResponse.json(out)
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
