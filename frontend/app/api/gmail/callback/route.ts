import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

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

  // Firebase-first stub: just complete the OAuth handshake and redirect without persistence
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/gmail/callback`
    )

    await oauth2Client.getToken(code)

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?success=true`)
  } catch (err) {
    console.error('Gmail link stub error:', err)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/gmail-accounts?error=linking_failed`
    )
  }
}
