import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrganizationsPanel from '@/components/OrganizationsPanel'

export default async function OrganizationsPage() {
  const session = await getSession()
  if (session?.role !== 'ADMIN') redirect('/dashboard')

  const organizations = await prisma.organization.findMany({
    include: { _count: { select: { users: true, jobs: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Client Organizations
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {organizations.length} organizations
        </p>
      </div>

      <OrganizationsPanel organizations={organizations} />
    </div>
  )
}
