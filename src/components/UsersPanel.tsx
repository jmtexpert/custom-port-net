'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'CLIENT'
  themePrimary: string
  createdAt: Date
  organizationId: number | null
  organization: { name: string } | null
}

type Props = {
  users: User[]
  currentUserId: number
  isAdmin: boolean
  organizations: { id: number; name: string }[]
}

export default function UsersPanel({ users, currentUserId, isAdmin, organizations }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const form = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      email: form.get('email'),
      password: form.get('password'),
      name: form.get('name'),
    }

    if (isAdmin) {
      body.role = form.get('role')
      const orgId = form.get('organizationId')
      body.organizationId = orgId ? parseInt(orgId as string, 10) : null
    }

    startTransition(async () => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create user')
        return
      }

      setSuccess('User created successfully')
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    })
  }

  async function handleDelete(userId: number) {
    if (!confirm('Delete this user?')) return
    setLoadingId(userId)
    await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    setLoadingId(null)
    router.refresh()
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors'
  const inputStyle = {
    background: 'var(--surface-3)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  }
  const labelStyle = { color: 'var(--text-secondary)' }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border p-6 space-y-5"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isAdmin ? 'Create New User' : 'Add Team Member'}
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Full Name *</label>
              <input name="name" required className={inputClass} style={inputStyle} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Email *</label>
              <input name="email" type="email" required className={inputClass} style={inputStyle} placeholder="john@example.com" />
            </div>
          </div>

          <div className={`grid gap-4 ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Password *</label>
              <input name="password" type="password" required minLength={8} className={inputClass} style={inputStyle} placeholder="Min 8 characters" />
            </div>
            {isAdmin && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Role *</label>
                  <select name="role" className={inputClass} style={inputStyle}>
                    <option value="CLIENT">Client</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Organization</label>
                  <select name="organizationId" className={inputClass} style={inputStyle}>
                    <option value="">None (Admin)</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm bg-red-950/50 border border-red-900/50 text-red-400">{error}</div>
          )}
          {success && (
            <div className="rounded-lg px-4 py-3 text-sm bg-green-950/50 border border-green-900/50 text-green-400">{success}</div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-lg font-medium text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--primary-accent)' }}
          >
            {isPending ? 'Creating…' : isAdmin ? 'Create User' : 'Add Member'}
          </button>
        </form>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isAdmin ? 'All Users' : 'Team Members'}
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Role', isAdmin ? 'Organization' : null, 'Joined', 'Actions']
                .filter(Boolean)
                .map((h) => (
                  <th key={h!} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-950/50 text-purple-400 border-purple-900/40'
                      : 'bg-blue-950/50 text-blue-400 border-blue-900/40'
                  }`}>
                    {user.role}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {user.organization?.name ?? <span className="italic">None</span>}
                  </td>
                )}
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  {user.id !== currentUserId ? (
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={loadingId === user.id}
                      className="px-2.5 py-1 rounded-md text-xs text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-40"
                    >
                      {loadingId === user.id ? '…' : 'Delete'}
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>You</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
