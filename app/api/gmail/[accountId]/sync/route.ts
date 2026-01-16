import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma/client'
import { 
  GmailService,
  extractCompanyName,
  extractJobRole,
  detectApplicationStatus,
  extractApplicationDate,
  detectReferral,
} from '@/lib/gmail/gmail-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    if (!account.enabled) {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 400 })
    }

    // Initialize Gmail service
    const gmailService = new GmailService(account.accessToken, account.refreshToken)

    // Fetch job-related emails
    const messages = await gmailService.fetchJobRelatedEmails(100)

    let processedCount = 0
    let newApplications = 0

    // Process each message
    for (const message of messages) {
      try {
        // Check if already processed
        const existing = await prisma.jobApplication.findFirst({
          where: {
            messageId: message.id,
            userId: session.user.id,
          },
        })

        if (existing) {
          continue
        }

        // Extract email content
        const { subject, from, body } = gmailService.extractEmailContent(message)

        // Extract job information
        const companyInfo = extractCompanyName(subject, from, body)
        const roleInfo = extractJobRole(subject, body)
        const statusInfo = detectApplicationStatus(subject, body)
        const applicationDate = extractApplicationDate(message)
        const referralInfo = detectReferral(subject, body)

        // Determine if needs review (any field has LOW confidence)
        const needsReview = 
          companyInfo.confidence === 'LOW' ||
          roleInfo.confidence === 'LOW' ||
          statusInfo.confidence === 'LOW'

        // Create job application
        await prisma.jobApplication.create({
          data: {
            userId: session.user.id,
            gmailAccountId: account.id,
            messageId: message.id,
            companyName: companyInfo.company,
            jobRole: roleInfo.role,
            applicationDate,
            status: statusInfo.status,
            companyConfidence: companyInfo.confidence,
            roleConfidence: roleInfo.confidence,
            dateConfidence: 'HIGH', // Date from email metadata is always accurate
            hasReferral: referralInfo.hasReferral,
            emailSubject: subject,
            emailSender: from,
            emailBody: body.substring(0, 5000), // Limit body length
            emailLink: `https://mail.google.com/mail/u/${account.email}/#all/${message.id}`,
            needsReview,
            timeline: {
              create: {
                eventType: 'APPLICATION_SUBMITTED',
                status: statusInfo.status,
                description: `Application detected from email: ${subject}`,
                eventDate: applicationDate,
              },
            },
          },
        })

        newApplications++
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
      }

      processedCount++
    }

    // Update last sync time
    await prisma.gmailAccount.update({
      where: { id: params.accountId },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      processed: processedCount,
      newApplications,
    })
  } catch (error) {
    console.error('Error syncing emails:', error)
    return NextResponse.json({ error: 'Failed to sync emails' }, { status: 500 })
  }
}
