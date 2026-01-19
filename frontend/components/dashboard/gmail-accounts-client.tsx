'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { getGmailAuthUrl, getGmailAccounts, syncGmailNow } from '@/lib/api'

interface GmailAccountLite {
  email: string
  connected: boolean
}

export default function GmailAccountsClient() {
  const [accounts, setAccounts] = useState<GmailAccountLite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async () => {
    try {
      const data = await getGmailAccounts()
      setAccounts(data)
      setIsLoading(false)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch accounts', err)
      setError(err.response?.data?.error || 'Failed to load accounts')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleLinkAccount = async () => {
    try {
      const url = await getGmailAuthUrl()
      window.open(url, '_blank', 'width=600,height=700')
      setTimeout(() => {
        fetchAccounts()
      }, 3000)
    } catch (err: any) {
      console.error('Failed to start auth', err)
      alert(err.response?.data?.error || 'Failed to start connection process')
    }
  }

  const handleSyncNow = async () => {
    setIsSyncing(true)
    try {
      const result = await syncGmailNow()
      await fetchAccounts()
      alert(result.message || 'Sync successful!')
    } catch (err: any) {
      console.error('Sync failed', err)
      alert(err.response?.data?.error || 'Failed to sync emails. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center">Loading accounts...</div>

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
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <button
            onClick={handleLinkAccount}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Connect Gmail</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing || accounts.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-sm ${isSyncing || accounts.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No accounts linked</h3>
              <p className="text-gray-500 mt-1">
                Link your Gmail account to start tracking job applications automatically.
              </p>
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.email} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {account.email.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{account.email}</h3>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${account.connected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {account.connected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {account.connected && (
                      <button
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 rounded border border-red-200"
                        onClick={() => alert('Disconnect feature coming soon')}
                      >
                        Disconnect
                      </button>
                    )}
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
