import { NextResponse } from 'next/server'

export async function DELETE() {
  return NextResponse.json({ error: 'Route disabled. Use backend API.' }, { status: 410 })
}
