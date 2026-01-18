// TASK:
// Build a simple applications dashboard using Firestore data.
// Do NOT create or modify files outside dashboard and lib directories.
// Use existing Firebase client from lib/firebase.ts.
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import ApplicationTable from '@/components/dashboard/ApplicationTable'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-sm text-gray-500">Tracking your job applications from Firestore</p>
        </div>
        <div className="text-sm text-gray-600">
          {user.displayName || user.email}
        </div>
      </header>

      <section className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <ApplicationTable userId={user.uid} />
      </section>
    </main>
  )
}
