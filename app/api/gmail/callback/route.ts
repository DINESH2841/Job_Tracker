import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?error=invalid_request`)
  }

  const userId = state

  try {
    // Exchange authorization code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/gmail/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user email from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    if (!userInfo.data.email) {
      throw new Error('Failed to get user email')
    }

    // Check if account already linked
    const existing = await prisma.gmailAccount.findUnique({
      where: {
        userId_email: {
          userId,
          email: userInfo.data.email,
        },
      },
    })

    if (existing) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?error=account_already_linked`
      )
    }

    // Store Gmail account
    await prisma.gmailAccount.create({
      data: {
        userId,
        email: userInfo.data.email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000),
        enabled: true,
      },
    })

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?success=true`)
  } catch (error) {
    console.error('Error linking Gmail account:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?error=linking_failed`
    )
  }
}
