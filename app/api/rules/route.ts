import { NextResponse } from 'next/server'
import rules from '../../../lib/rules.json'

export async function GET() {
  try {
    return NextResponse.json(rules)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
