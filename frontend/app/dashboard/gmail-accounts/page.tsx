import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma/client'
import GmailAccountsClient from '@/components/dashboard/gmail-accounts-client'

export default async function GmailAccountsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const gmailAccounts = await prisma.gmailAccount.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return <GmailAccountsClient gmailAccounts={gmailAccounts} />
}
