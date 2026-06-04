import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersPanel from '@/components/UsersPanel'

export default async function UsersPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isAdmin = session.role === 'ADMIN'

  const where = isAdmin ? {} : { organizationId: session.organizationId ?? -1 }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      themePrimary: true,
      createdAt: true,
      organizationId: true,
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const organizations = isAdmin
    ? await prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
    : []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {isAdmin ? 'User Management' : 'Team Members'}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {users.length} {isAdmin ? 'registered users' : 'members in your organization'}
        </p>
      </div>

      <UsersPanel
        users={users}
        currentUserId={session.userId}
        isAdmin={isAdmin}
        organizations={organizations}
      />
    </div>
  )
}
