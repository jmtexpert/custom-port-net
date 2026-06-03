export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div
      className="flex min-h-screen"
      style={
        {
          '--primary-accent': session.themePrimary,
          background: 'var(--background)',
        } as React.CSSProperties
      }
    >
      <Sidebar role={session.role} name={session.name} userId={session.userId} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
