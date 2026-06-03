import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersPanel from '@/components/UsersPanel'

export default async function UsersPage() {
  const session = await getSession()
  if (session?.role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, themePrimary: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          User Management
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {users.length} registered users
        </p>
      </div>

      <UsersPanel users={users} currentUserId={session!.userId} />
    </div>
  )
}
