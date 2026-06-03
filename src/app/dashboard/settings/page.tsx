import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ThemePicker from '@/components/ThemePicker'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Manage your account preferences
        </p>
      </div>

      <div
        className="rounded-xl border p-6 space-y-6 max-w-lg"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Account
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Name</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{session?.name}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Email</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{session?.email}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Role</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{session?.role}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Accent Color
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Choose your personal accent color. This color will be used for buttons, links, and highlights across the dashboard.
          </p>
          <ThemePicker userId={session!.userId} currentColor={session!.themePrimary} />
        </div>

        {session?.role === 'ADMIN' && (
          <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Automated Email Alerts
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              The system automatically sends daily overdue alerts to clients whose container return date has passed and status is still PENDING.
              To trigger manually, call the cron endpoint with your <code className="font-mono bg-black/30 px-1 rounded">CRON_SECRET</code>.
            </p>
            <code
              className="block text-xs font-mono p-3 rounded-lg overflow-x-auto"
              style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
            >
              GET /api/cron/alerts<br/>
              Authorization: Bearer {'<CRON_SECRET>'}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}
