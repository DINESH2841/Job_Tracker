import { google } from 'googleapis'

export interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body: { data?: string }
    parts?: Array<{
      mimeType: string
      body: { data?: string }
      parts?: any[]
    }>
  }
  internalDate: string
}

export class GmailService {
  private oauth2Client: any

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  async fetchJobRelatedEmails(maxResults: number = 100): Promise<GmailMessage[]> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

    // Keywords and domains to filter job-related emails
    const query = [
      'subject:(job application interview offer position)',
      'from:(*@linkedin.com OR *@indeed.com OR *@glassdoor.com OR noreply)',
      '(applied OR interview OR offer OR rejected OR assessment)',
    ].join(' OR ')

    try {
      // List messages
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      })

      if (!response.data.messages) {
        return []
      }

      // Fetch full message details
      const messages = await Promise.all(
        response.data.messages.map(async (message) => {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          })
          return details.data as GmailMessage
        })
      )

      return messages
    } catch (error) {
      console.error('Error fetching emails:', error)
      throw error
    }
  }

  async getMessageById(messageId: string): Promise<GmailMessage | null> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })
      return response.data as GmailMessage
    } catch (error) {
      console.error('Error fetching message:', error)
      return null
    }
  }

  extractEmailContent(message: GmailMessage): {
    subject: string
    from: string
    to: string
    date: string
    body: string
  } {
    const headers = message.payload.headers
    const subject = headers.find(h => h.name === 'Subject')?.value || ''
    const from = headers.find(h => h.name === 'From')?.value || ''
    const to = headers.find(h => h.name === 'To')?.value || ''
    const date = headers.find(h => h.name === 'Date')?.value || ''

    let body = ''

    // Extract body from various locations
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8')
          break
        } else if (part.mimeType === 'text/html' && part.body.data && !body) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8')
        }
      }
    }

    return { subject, from, to, date, body }
  }

  async testConnection(): Promise<boolean> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

    try {
      await gmail.users.getProfile({ userId: 'me' })
      return true
    } catch (error) {
      console.error('Gmail connection test failed:', error)
      return false
    }
  }
}

export function extractCompanyName(subject: string, from: string, body: string): {
  company: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
} {
  // Common patterns for extracting company names
  const companyPatterns = [
    /application (?:to|at|for) ([A-Z][a-zA-Z0-9\s&.]+)/i,
    /position (?:at|with) ([A-Z][a-zA-Z0-9\s&.]+)/i,
    /interview (?:at|with) ([A-Z][a-zA-Z0-9\s&.]+)/i,
    /offer from ([A-Z][a-zA-Z0-9\s&.]+)/i,
    /([A-Z][a-zA-Z0-9\s&.]+) is (?:hiring|recruiting)/i,
  ]

  // Try to extract from subject first
  for (const pattern of companyPatterns) {
    const match = subject.match(pattern)
    if (match) {
      return { company: match[1].trim(), confidence: 'HIGH' }
    }
  }

  // Extract from email domain
  const emailMatch = from.match(/@([^.]+)\./i)
  if (emailMatch) {
    const domain = emailMatch[1]
    if (!['noreply', 'no-reply', 'notifications', 'mail', 'email'].includes(domain.toLowerCase())) {
      return { 
        company: domain.charAt(0).toUpperCase() + domain.slice(1), 
        confidence: 'MEDIUM' 
      }
    }
  }

  // Try body text
  for (const pattern of companyPatterns) {
    const match = body.match(pattern)
    if (match) {
      return { company: match[1].trim(), confidence: 'LOW' }
    }
  }

  return { company: 'Unknown Company', confidence: 'LOW' }
}

export function extractJobRole(subject: string, body: string): {
  role: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
} {
  const rolePatterns = [
    /(?:application for|applied for|position:|role:) ([A-Z][a-zA-Z0-9\s/-]+?)(?:\s(?:at|with|position|role)|$)/i,
    /([A-Z][a-zA-Z0-9\s/-]+?) (?:position|role|opening)/i,
    /applied to ([A-Z][a-zA-Z0-9\s/-]+)/i,
  ]

  // Try subject first
  for (const pattern of rolePatterns) {
    const match = subject.match(pattern)
    if (match) {
      return { role: match[1].trim(), confidence: 'HIGH' }
    }
  }

  // Try body
  for (const pattern of rolePatterns) {
    const match = body.match(pattern)
    if (match) {
      return { role: match[1].trim(), confidence: 'MEDIUM' }
    }
  }

  return { role: 'Unknown Role', confidence: 'LOW' }
}

export function detectApplicationStatus(subject: string, body: string): {
  status: 'APPLIED' | 'PHONE_SCREEN' | 'INTERVIEW' | 'TECHNICAL_INTERVIEW' | 'FINAL_INTERVIEW' | 'OFFER' | 'REJECTED'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
} {
  const text = (subject + ' ' + body).toLowerCase()

  // Offer detection
  if (
    text.includes('offer letter') ||
    text.includes('job offer') ||
    text.includes('congratulations') && text.includes('offer')
  ) {
    return { status: 'OFFER', confidence: 'HIGH' }
  }

  // Rejection detection
  if (
    text.includes('unfortunately') ||
    text.includes('not moving forward') ||
    text.includes('other candidates') ||
    text.includes('not selected') ||
    text.includes('declined your application')
  ) {
    return { status: 'REJECTED', confidence: 'HIGH' }
  }

  // Interview detection
  if (
    text.includes('final interview') ||
    text.includes('final round')
  ) {
    return { status: 'FINAL_INTERVIEW', confidence: 'HIGH' }
  }

  if (
    text.includes('technical interview') ||
    text.includes('coding interview') ||
    text.includes('technical assessment')
  ) {
    return { status: 'TECHNICAL_INTERVIEW', confidence: 'HIGH' }
  }

  if (
    text.includes('schedule an interview') ||
    text.includes('interview invitation') ||
    text.includes('would like to interview')
  ) {
    return { status: 'INTERVIEW', confidence: 'HIGH' }
  }

  // Phone screen detection
  if (
    text.includes('phone screen') ||
    text.includes('phone call') ||
    text.includes('quick chat')
  ) {
    return { status: 'PHONE_SCREEN', confidence: 'HIGH' }
  }

  // Application confirmation
  if (
    text.includes('application received') ||
    text.includes('thank you for applying') ||
    text.includes('application submitted')
  ) {
    return { status: 'APPLIED', confidence: 'HIGH' }
  }

  // Default to APPLIED with LOW confidence
  return { status: 'APPLIED', confidence: 'LOW' }
}

export function extractApplicationDate(message: GmailMessage): Date {
  return new Date(parseInt(message.internalDate))
}

export function detectReferral(subject: string, body: string): {
  hasReferral: boolean
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
} {
  const text = (subject + ' ' + body).toLowerCase()

  if (
    text.includes('referred by') ||
    text.includes('referral from') ||
    text.includes('recommended by')
  ) {
    return { hasReferral: true, confidence: 'HIGH' }
  }

  if (text.includes('referral') || text.includes('referred')) {
    return { hasReferral: true, confidence: 'MEDIUM' }
  }

  return { hasReferral: false, confidence: 'HIGH' }
}
