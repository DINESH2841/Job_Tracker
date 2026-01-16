'use client'

import { useState } from 'react'
import type { GmailAccount } from '@prisma/client'
import { format } from 'date-fns'

interface GmailAccountsClientProps {
  gmailAccounts: GmailAccount[]
}

export default function GmailAccountsClient({ gmailAccounts: initialAccounts }: GmailAccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isLoading, setIsLoading] = useState(false)

  const handleLinkAccount = async () => {
    setIsLoading(true)
    // Redirect to Google OAuth flow with Gmail scope
    window.location.href = '/api/gmail/link'
  }

  const handleToggleEnabled = async (accountId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/gmail/${accountId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      })

      if (response.ok) {
        setAccounts(accounts.map(acc => 
          acc.id === accountId ? { ...acc, enabled: !currentEnabled } : acc
        ))
      }
    } catch (error) {
      console.error('Failed to toggle account:', error)
    }
  }

  const handleRemoveAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this Gmail account? This will not delete associated job applications.')) {
      return
    }

    try {
      const response = await fetch(`/api/gmail/${accountId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAccounts(accounts.filter(acc => acc.id !== accountId))
      }
    } catch (error) {
      console.error('Failed to remove account:', error)
    }
  }

  const handleSyncNow = async (accountId: string) => {
    try {
      const response = await fetch(`/api/gmail/${accountId}/sync`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Sync started! This may take a few minutes.')
      }
    } catch (error) {
      console.error('Failed to start sync:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gmail Accounts</h1>
              <p className="text-sm text-gray-600">Manage your linked Gmail accounts</p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={handleLinkAccount}
            disabled={isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <span>+ Link New Gmail Account</span>
          </button>
        </div>

        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No Gmail accounts linked yet.</p>
              <p className="text-gray-400 text-sm mt-2">
                Link your Gmail account to start tracking job applications automatically.
              </p>
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{account.email}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          account.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {account.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Added: {format(new Date(account.createdAt), 'MMM d, yyyy')}
                      </p>
                      {account.lastSyncAt && (
                        <p>
                          Last synced: {format(new Date(account.lastSyncAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleEnabled(account.id, account.enabled)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {account.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleSyncNow(account.id)}
                      disabled={!account.enabled}
                      className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50"
                    >
                      Sync Now
                    </button>
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
