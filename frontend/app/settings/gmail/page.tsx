'use client'

import GmailAccountsClient from '@/components/dashboard/gmail-accounts-client'

export default function SettingsGmailPage() {
    return (
        <div className="space-y-4">
            <GmailAccountsClient />
            <p className="text-sm text-gray-500 italic">
                Note: Initial sync shows the 10 most recent emails only. Use "Sync Again" to fetch more.
            </p>
        </div>
    )
}
