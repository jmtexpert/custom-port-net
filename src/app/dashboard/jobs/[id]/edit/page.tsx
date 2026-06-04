import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import JobForm from '@/components/JobForm'

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await props.params
  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) notFound()

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) notFound()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Edit Job
        </h1>
        <p className="text-sm mt-0.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
          BL# {job.blNumber}
        </p>
      </div>
      <JobForm
        initialData={{
          id: job.id,
          blNumber: job.blNumber,
          clientName: job.clientName,
          clientEmail: job.clientEmail,
          dirNumber: job.dirNumber,
          eirNumber: job.eirNumber,
          returnDate: job.returnDate.toISOString(),
          advanceAmount: Number(job.advanceAmount),
          totalAmount: Number(job.totalAmount),
          containerReturnDate: job.containerReturnDate?.toISOString() ?? null,
          extraFields: job.extraFields as Record<string, unknown> | null,
          status: job.status,
        }}
      />
    </div>
  )
}
