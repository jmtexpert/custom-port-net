import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getSession()

  const [totalJobs, pendingJobs, receivedJobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: 'PENDING' } }),
    prisma.job.count({ where: { status: 'RECEIVED' } }),
  ])

  const overdueJobs = await prisma.job.count({
    where: { status: 'PENDING', returnDate: { lt: new Date() } },
  })

  const recentJobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Welcome back, {session?.name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={totalJobs} color="var(--primary-accent)" />
        <StatCard label="Pending" value={pendingJobs} color="#f59e0b" />
        <StatCard label="Received" value={receivedJobs} color="#22c55e" />
        <StatCard label="Overdue" value={overdueJobs} color="#ef4444" />
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Jobs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['BL Number', 'Client', 'Return Date', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                    {job.blNumber}
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-primary)' }}>
                    {job.clientName}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(job.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={job.status} returnDate={job.returnDate} />
                  </td>
                </tr>
              ))}
              {recentJobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No jobs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="text-3xl font-bold mt-2" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status, returnDate }: { status: string; returnDate: Date }) {
  const isOverdue = status === 'PENDING' && new Date(returnDate) < new Date()
  const label = isOverdue ? 'Overdue' : status
  const colors: Record<string, string> = {
    Overdue: 'bg-red-950/50 text-red-400 border-red-900/40',
    PENDING: 'bg-amber-950/50 text-amber-400 border-amber-900/40',
    RECEIVED: 'bg-green-950/50 text-green-400 border-green-900/40',
  }

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${colors[label] ?? colors.PENDING}`}>
      {label}
    </span>
  )
}
