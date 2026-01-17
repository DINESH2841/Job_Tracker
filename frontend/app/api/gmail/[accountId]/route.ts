import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  const session = await getServerSession(authOptions)
  const { accountId } = await context.params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.warn('Delete Gmail account not implemented (Firebase backend pending)', { accountId })
  return NextResponse.json({ success: true, accountId })
}
