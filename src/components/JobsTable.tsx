'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Job, JobStatus } from '@prisma/client'

type Props = {
  jobs: Job[]
  isAdmin: boolean
}

export default function JobsTable({ jobs, isAdmin }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  async function markReceived(jobId: number) {
    setLoadingId(jobId)
    await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RECEIVED', containerReturnDate: new Date().toISOString() }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function deleteJob(jobId: number) {
    if (!confirm('Delete this job? This cannot be undone.')) return
    setLoadingId(jobId)
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['BL #', 'Client', 'Email', 'DIR #', 'EIR #', 'Return Date', 'Advance', 'Total', 'Status', isAdmin ? 'Actions' : ''].filter(Boolean).map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const isOverdue = job.status === 'PENDING' && new Date(job.returnDate) < new Date()
              return (
                <tr
                  key={job.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    {job.blNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    {job.clientName}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {job.clientEmail}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {job.dirNumber}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {job.eirNumber}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: isOverdue ? '#ef4444' : 'var(--text-secondary)' }}>
                    {new Date(job.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    ${Number(job.advanceAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    ${Number(job.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={job.status} isOverdue={isOverdue} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {job.status === 'PENDING' && (
                          <button
                            onClick={() => markReceived(job.id)}
                            disabled={loadingId === job.id}
                            className="px-2.5 py-1 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                            style={{ background: '#22c55e' }}
                          >
                            {loadingId === job.id ? '…' : 'Mark Received'}
                          </button>
                        )}
                        <a
                          href={`/dashboard/jobs/${job.id}/edit`}
                          className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors border"
                          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteJob(job.id)}
                          disabled={loadingId === job.id}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-red-400 transition-colors hover:bg-red-950/30 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status, isOverdue }: { status: JobStatus; isOverdue: boolean }) {
  if (isOverdue) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-950/50 text-red-400 border border-red-900/40">Overdue</span>
  }
  if (status === 'RECEIVED') {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-950/50 text-green-400 border border-green-900/40">Received</span>
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-900/40">Pending</span>
}
