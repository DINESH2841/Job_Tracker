import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { enabled } = await request.json()

  try {
    const account = await prisma.gmailAccount.findUnique({
      where: {
        id: params.accountId,
        userId: session.user.id,
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updated = await prisma.gmailAccount.update({
      where: { id: params.accountId },
      data: { enabled },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error toggling account:', error)
    return NextResponse.json({ error: 'Failed to toggle account' }, { status: 500 })
  }
}
