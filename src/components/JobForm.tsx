'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type ExtraField = { key: string; value: string }

type Props = {
  initialData?: {
    id: number
    blNumber: string
    clientName: string
    clientEmail: string
    dirNumber: string
    eirNumber: string
    returnDate: string
    advanceAmount: number
    totalAmount: number
    containerReturnDate?: string | null
    extraFields?: Record<string, unknown> | null
    status: 'PENDING' | 'RECEIVED'
  }
  organizations?: { id: number; name: string }[]
}

export default function JobForm({ initialData, organizations }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [extraFields, setExtraFields] = useState<ExtraField[]>(() => {
    if (!initialData?.extraFields) return []
    return Object.entries(initialData.extraFields).map(([key, value]) => ({
      key,
      value: String(value),
    }))
  })

  function addExtraField() {
    setExtraFields((prev) => [...prev, { key: '', value: '' }])
  }

  function removeExtraField(index: number) {
    setExtraFields((prev) => prev.filter((_, i) => i !== index))
  }

  function updateExtraField(index: number, field: 'key' | 'value', val: string) {
    setExtraFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const extraFieldsObj = extraFields.reduce<Record<string, string>>((acc, { key, value }) => {
      if (key.trim()) acc[key.trim()] = value
      return acc
    }, {})

    const body: Record<string, unknown> = {
      blNumber: form.get('blNumber') as string,
      clientName: form.get('clientName') as string,
      clientEmail: form.get('clientEmail') as string,
      dirNumber: form.get('dirNumber') as string,
      eirNumber: form.get('eirNumber') as string,
      returnDate: new Date(form.get('returnDate') as string).toISOString(),
      advanceAmount: parseFloat(form.get('advanceAmount') as string),
      totalAmount: parseFloat(form.get('totalAmount') as string),
      containerReturnDate: form.get('containerReturnDate')
        ? new Date(form.get('containerReturnDate') as string).toISOString()
        : null,
      extraFields: Object.keys(extraFieldsObj).length ? extraFieldsObj : null,
    }

    if (!initialData && organizations) {
      const orgId = form.get('organizationId')
      body.organizationId = orgId ? parseInt(orgId as string, 10) : null
    }

    startTransition(async () => {
      const url = initialData ? `/api/jobs/${initialData.id}` : '/api/jobs'
      const method = initialData ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }

      router.push('/dashboard/jobs')
      router.refresh()
    })
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors'
  const inputStyle = {
    background: 'var(--surface-3)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  }
  const labelStyle = { color: 'var(--text-secondary)' }

  function formatDateForInput(dateStr?: string | null) {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl h-full space-y-6">
      {!initialData && organizations && (
        <div
          className="rounded-xl border p-6"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Organization *</label>
          <select name="organizationId" required className={inputClass} style={inputStyle}>
            <option value="">Select organization…</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      <div
        className="rounded-xl border p-6 space-y-5"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Job Details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>BL Number *</label>
            <input
              name="blNumber"
              required
              defaultValue={initialData?.blNumber}
              className={inputClass}
              style={inputStyle}
              placeholder="MAEU1234567"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>DIR Number *</label>
            <input
              name="dirNumber"
              required
              defaultValue={initialData?.dirNumber}
              className={inputClass}
              style={inputStyle}
              placeholder="DIR-2024-001"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>EIR Number *</label>
          <input
            name="eirNumber"
            required
            defaultValue={initialData?.eirNumber}
            className={inputClass}
            style={inputStyle}
            placeholder="EIR-2024-001"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Client Name *</label>
            <input
              name="clientName"
              required
              defaultValue={initialData?.clientName}
              className={inputClass}
              style={inputStyle}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Client Email *</label>
            <input
              name="clientEmail"
              type="email"
              required
              defaultValue={initialData?.clientEmail}
              className={inputClass}
              style={inputStyle}
              placeholder="client@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Return Deadline *</label>
            <input
              name="returnDate"
              type="datetime-local"
              required
              defaultValue={formatDateForInput(initialData?.returnDate)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Container Return Date</label>
            <input
              name="containerReturnDate"
              type="datetime-local"
              defaultValue={formatDateForInput(initialData?.containerReturnDate)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Advance Amount *</label>
            <input
              name="advanceAmount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initialData?.advanceAmount}
              className={inputClass}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Total Amount *</label>
            <input
              name="totalAmount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initialData?.totalAmount}
              className={inputClass}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Extra Fields
          </h2>
          <button
            type="button"
            onClick={addExtraField}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface-3)', color: 'var(--primary-accent)', border: '1px solid var(--border)' }}
          >
            + Add Field
          </button>
        </div>

        {extraFields.length === 0 && (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            No extra fields. Click "Add Field" to add custom key-value data.
          </p>
        )}

        {extraFields.map((field, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              value={field.key}
              onChange={(e) => updateExtraField(i, 'key', e.target.value)}
              placeholder="Field name"
              className={inputClass + ' flex-1'}
              style={inputStyle}
            />
            <input
              value={field.value}
              onChange={(e) => updateExtraField(i, 'value', e.target.value)}
              placeholder="Value"
              className={inputClass + ' flex-1'}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => removeExtraField(i)}
              className="p-2 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors mt-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm bg-red-950/50 border border-red-900/50 text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-lg font-medium text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: 'var(--primary-accent)' }}
        >
          {isPending ? 'Saving…' : initialData ? 'Update Job' : 'Create Job'}
        </button>
        <a
          href="/dashboard/jobs"
          className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors border"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
