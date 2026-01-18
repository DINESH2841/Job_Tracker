'use client'

import { useState } from 'react'
import { format } from 'date-fns'

// Lightweight types for Firebase-first placeholder data
interface GmailAccountLite {
  id: string
  email: string
  enabled?: boolean
  lastSyncAt?: string | Date | null
}

interface ApplicationTimelineLite {
  id: string
  eventType: string
  status?: string | null
  description?: string | null
  eventDate: string | Date
}

interface JobApplicationLite {
  id: string
  companyName: string
  jobRole: string
  status: ApplicationStatus
  applicationDate: string | Date
  hasReferral?: boolean
  gmailAccount: GmailAccountLite | null
  timeline: ApplicationTimelineLite[]
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW'
  needsReview?: boolean
  applicationSource?: string | null
  manuallyEdited?: boolean
  companyConfidence?: 'HIGH' | 'MEDIUM' | 'LOW'
  roleConfidence?: 'HIGH' | 'MEDIUM' | 'LOW'
  dateConfidence?: 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string | null
  emailLink?: string | null
}

type ApplicationWithRelations = JobApplicationLite

interface DashboardClientProps {
  applications: ApplicationWithRelations[]
  gmailAccounts: GmailAccountLite[]
  stats: {
    total: number
    applied: number
    phoneScreen: number
    interview: number
    offer: number
    rejected: number
    referrals: number
  }
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const statusColors = {
  APPLIED: 'bg-blue-100 text-blue-800',
  PHONE_SCREEN: 'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-orange-100 text-orange-800',
  TECHNICAL_INTERVIEW: 'bg-orange-100 text-orange-800',
  FINAL_INTERVIEW: 'bg-orange-100 text-orange-800',
  OFFER: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
} as const

type ApplicationStatus = keyof typeof statusColors

const confidenceColors = {
  HIGH: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-red-600',
}

export default function DashboardClient({ applications, gmailAccounts, stats, user }: DashboardClientProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Job Tracker</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard/gmail-accounts'}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-600 rounded-lg hover:bg-purple-50"
              >
                Gmail Accounts ({gmailAccounts.length})
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.applied}</div>
            <div className="text-sm text-gray-600">Applied</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">{stats.phoneScreen}</div>
            <div className="text-sm text-gray-600">Phone Screen</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600">{stats.interview}</div>
            <div className="text-sm text-gray-600">Interviews</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{stats.offer}</div>
            <div className="text-sm text-gray-600">Offers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.referrals}</div>
            <div className="text-sm text-gray-600">Referrals</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="APPLIED">Applied</option>
                <option value="PHONE_SCREEN">Phone Screen</option>
                <option value="INTERVIEW">Interview</option>
                <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
                <option value="FINAL_INTERVIEW">Final Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="ACCEPTED">Accepted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No applications found.</p>
              <p className="text-gray-400 text-sm mt-2">
                {applications.length === 0 
                  ? 'Link a Gmail account to start tracking your job applications automatically.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{app.jobRole}</h3>
                      {app.needsReview && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                          Needs Review
                        </span>
                      )}
                      {app.hasReferral && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          🤝 Referral
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-purple-600 font-medium">{app.companyName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Applied:</span>
                    <p className="font-medium text-gray-900">{format(new Date(app.applicationDate), 'MMM d, yyyy')}</p>
                  </div>
                  {app.applicationSource && (
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <p className="font-medium text-gray-900">{app.applicationSource}</p>
                    </div>
                  )}
                  {app.gmailAccount && (
                    <div>
                      <span className="text-gray-600">Gmail:</span>
                      <p className="font-medium text-gray-900 truncate">{app.gmailAccount.email}</p>
                    </div>
                  )}
                  {app.manuallyEdited && (
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-blue-600">Manually Edited</p>
                    </div>
                  )}
                </div>

                {/* Confidence Indicators */}
                {(app.companyConfidence !== 'HIGH' || app.roleConfidence !== 'HIGH' || app.dateConfidence !== 'HIGH') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Confidence Scores:</p>
                    <div className="flex space-x-4 text-xs">
                      <span className={`${confidenceColors[app.companyConfidence ?? 'HIGH']}`}>
                        Company: {app.companyConfidence ?? 'HIGH'}
                      </span>
                      <span className={`${confidenceColors[app.roleConfidence ?? 'HIGH']}`}>
                        Role: {app.roleConfidence ?? 'HIGH'}
                      </span>
                      <span className={`${confidenceColors[app.dateConfidence ?? 'HIGH']}`}>
                        Date: {app.dateConfidence ?? 'HIGH'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {app.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{app.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => window.location.href = `/dashboard/applications/${app.id}`}
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                  >
                    View Details
                  </button>
                  {app.emailLink && (
                    <a
                      href={app.emailLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      View Email →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
