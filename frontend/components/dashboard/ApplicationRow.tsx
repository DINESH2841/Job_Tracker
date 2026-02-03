import { Application } from "./ApplicationTable"
import { useState } from "react"
import { updateApplication } from "@/lib/api"

interface Props {
  application: Application
  onUpdate?: () => void
}

export default function ApplicationRow({ application, onUpdate }: Props) {
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      await updateApplication(application.id, { status: newStatus })
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to update status", error)
    } finally {
      setUpdating(false)
    }
  }

  const gmailLink = (application as any).gmailLink;

  return (
    <tr>
      <td className="px-4 py-2">{application.company || "Unknown"}</td>
      <td className="px-4 py-2">{application.role || "Unknown"}</td>
      <td className="px-4 py-2">
        {gmailLink ? (
          <a href={gmailLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="Open in Gmail">
            ✉️
          </a>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      <td className="px-4 py-2">
        <select
          value={application.status || "Applied"}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="px-2 py-1 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
          <option value="Offer">Offer</option>
        </select>
      </td>
      <td className="px-4 py-2">
        {application.appliedAt
          ? new Date(application.appliedAt).toLocaleDateString()
          : "—"}
      </td>
    </tr>
  )
}
