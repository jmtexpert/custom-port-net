import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import JobsTable from '@/components/JobsTable'

export default async function JobsPage() {
  const session = await getSession()
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Jobs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {jobs.length} total clearance jobs
          </p>
        </div>
        {session?.role === 'ADMIN' && (
          <a
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: 'var(--primary-accent)' }}
          >
            + New Job
          </a>
        )}
      </div>

      <JobsTable jobs={jobs} isAdmin={session?.role === 'ADMIN'} />
    </div>
  )
}
