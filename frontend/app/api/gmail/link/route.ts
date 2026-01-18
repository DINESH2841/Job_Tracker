import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Route disabled. Use Cloud Functions startGmailAuth.' }, { status: 410 })
}
