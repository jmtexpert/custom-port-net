import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import JobForm from '@/components/JobForm'

export default async function NewJobPage() {
  const session = await getSession()
  if (session?.role !== 'ADMIN') redirect('/dashboard/jobs')

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          New Clearance Job
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Create a new custom clearance job entry
        </p>
      </div>
      <JobForm />
    </div>
  )
}
