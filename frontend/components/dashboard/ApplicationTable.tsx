"use client"

import { useEffect, useState } from "react"
import { getApplications } from "@/lib/api"
import ApplicationRow from "./ApplicationRow"

export interface Application {
  id: string
  company?: string
  role?: string
  status?: string
  appliedAt?: Date | null
  [key: string]: unknown
}

export default function ApplicationTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    try {
      const apps = await getApplications()
      const normalized = apps.map((app: any) => ({
        id: app._id || app.id,
        company: app.company || "Unknown",
        role: app.role || "Unknown",
        status: app.status || "applied",
        appliedAt: app.appliedAt ? new Date(app.appliedAt) : null,
        ...app
      }))
      // Sort by appliedAt descending
      normalized.sort((a: Application, b: Application) => {
        const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0
        const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0
        return dateB - dateA
      })
      setApplications(normalized)
      setLoading(false)
    } catch (err: any) {
      console.error("Failed to load applications", err)
      setError(err.response?.data?.error || "Failed to load applications")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  if (loading) {
    return <div className="p-6">Loading applications...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  if (!applications.length) {
    return <div className="p-6 text-sm text-gray-500">No applications yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Gmail</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Applied</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
          {applications.map((app) => (
            <ApplicationRow key={app.id} application={app} onUpdate={fetchApplications} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
