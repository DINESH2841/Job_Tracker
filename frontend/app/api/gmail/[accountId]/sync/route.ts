import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  const session = await getServerSession(authOptions)
  const { accountId } = await context.params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.warn('Gmail sync stubbed (Firebase backend pending)', { accountId })
  return NextResponse.json({ success: true, processed: 0, newApplications: 0 })
}
