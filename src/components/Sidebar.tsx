'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Props = {
  role: 'ADMIN' | 'CLIENT'
  name: string
  userId: number
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬛', roles: ['ADMIN', 'CLIENT'] },
  { href: '/dashboard/jobs', label: 'Jobs', icon: '📦', roles: ['ADMIN', 'CLIENT'] },
  { href: '/dashboard/jobs/new', label: 'New Job', icon: '➕', roles: ['ADMIN', 'CLIENT'] },
  { href: '/dashboard/organizations', label: 'Organizations', icon: '🏢', roles: ['ADMIN'] },
  { href: '/dashboard/users', label: 'Users', icon: '👥', roles: ['ADMIN', 'CLIENT'] },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', roles: ['ADMIN', 'CLIENT'] },
]

export default function Sidebar({ role, name, userId }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const visible = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside
      className="w-56 flex flex-col shrink-0 border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm mb-3"
          style={{ background: 'var(--primary-accent)' }}
        >
          CP
        </div>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Custom Port
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {name}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {visible.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                color: active ? 'var(--primary-accent)' : 'var(--text-secondary)',
                background: active ? 'color-mix(in srgb, var(--primary-accent) 12%, transparent)' : 'transparent',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-red-400 hover:bg-red-950/30"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
