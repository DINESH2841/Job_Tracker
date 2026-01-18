"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  DocumentData,
} from "firebase/firestore"
import ApplicationRow from "./ApplicationRow"

export interface Application {
  id: string
  company?: string
  role?: string
  status?: string
  appliedAt?: Date | null
  [key: string]: unknown
}

interface Props {
  userId: string
}

export default function ApplicationTable({ userId }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const appsRef = collection(db, "users", userId, "applications")
    const q = query(appsRef)

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => normalizeApplication(doc.id, doc.data()))
        // Client-side sort: desc
        items.sort((a, b) => {
          const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
          const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
          return dateB - dateA;
        })
        setApplications(items)
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => unsub()
  }, [userId])

  if (loading) {
    return <div className="p-6">Loading applications...</div>
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
            <ApplicationRow key={app.id} application={app} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function normalizeApplication(id: string, data: DocumentData): Application {
  const appliedAt = data.appliedAt?.toDate ? data.appliedAt.toDate() : data.appliedAt ?? null
  return {
    id,
    company: data.company ?? data.companyName ?? "Unknown",
    role: data.role ?? data.jobRole ?? "Unknown",
    status: data.status ?? "applied",
    appliedAt,
    ...data,
  }
}
