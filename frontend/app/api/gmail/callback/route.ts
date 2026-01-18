import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Route disabled. Use Cloud Functions oauthCallback.' }, { status: 410 })
}
