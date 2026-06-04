'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Org = {
  id: number
  name: string
  createdAt: Date
  _count: { users: number; jobs: number }
}

type Props = {
  organizations: Org[]
}

export default function OrganizationsPanel({ organizations }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors'
  const inputStyle = {
    background: 'var(--surface-3)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.get('name') }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create organization')
        return
      }

      setSuccess('Organization created')
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Create New Organization
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            name="name"
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Company name"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-lg font-medium text-sm text-white whitespace-nowrap transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--primary-accent)' }}
          >
            {isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {error && (
          <div className="rounded-lg px-4 py-3 text-sm bg-red-950/50 border border-red-900/50 text-red-400">{error}</div>
        )}
        {success && (
          <div className="rounded-lg px-4 py-3 text-sm bg-green-950/50 border border-green-900/50 text-green-400">{success}</div>
        )}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>All Organizations</h2>
        </div>
        {organizations.length === 0 ? (
          <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            No organizations yet. Create one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Users', 'Jobs', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{org.name}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{org._count.users}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{org._count.jobs}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
