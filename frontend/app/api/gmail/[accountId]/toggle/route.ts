import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  const session = await getServerSession(authOptions)
  const { accountId } = await context.params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { enabled } = await request.json()

  console.warn('Toggle Gmail account not implemented (Firebase backend pending)', { accountId, enabled })
  return NextResponse.json({ success: true, accountId, enabled })
}
