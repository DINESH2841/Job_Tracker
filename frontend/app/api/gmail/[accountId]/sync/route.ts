import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Route disabled. Use backend API.' }, { status: 410 })
}
