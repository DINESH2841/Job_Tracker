import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma/client'
import DashboardClient from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch user's job applications
  const applications = await prisma.jobApplication.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      gmailAccount: true,
      timeline: {
        orderBy: {
          eventDate: 'desc',
        },
        take: 5,
      },
    },
    orderBy: {
      applicationDate: 'desc',
    },
  })

  // Fetch Gmail accounts
  const gmailAccounts = await prisma.gmailAccount.findMany({
    where: {
      userId: session.user.id,
    },
  })

  // Calculate statistics
  const stats = {
    total: applications.length,
    applied: applications.filter((app: any) => app.status === 'APPLIED').length,
    phoneScreen: applications.filter((app: any) => app.status === 'PHONE_SCREEN').length,
    interview: applications.filter((app: any) => 
      app.status === 'INTERVIEW' || 
      app.status === 'TECHNICAL_INTERVIEW' || 
      app.status === 'FINAL_INTERVIEW'
    ).length,
    offer: applications.filter((app: any) => app.status === 'OFFER').length,
    rejected: applications.filter((app: any) => app.status === 'REJECTED').length,
    referrals: applications.filter((app: any) => app.hasReferral).length,
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
