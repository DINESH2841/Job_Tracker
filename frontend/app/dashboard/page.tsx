import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import DashboardClient from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Firebase-first: placeholder data until Firebase integration is wired
  const applications: any[] = []
  const gmailAccounts: any[] = []
  const stats = {
    total: 0,
    applied: 0,
    phoneScreen: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    referrals: 0,
  }

  return (
    <DashboardClient 
      applications={applications}
      gmailAccounts={gmailAccounts}
      stats={stats}
      user={session.user}
    />
  )
}
