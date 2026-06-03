'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  userId: number
  currentColor: string
}

const PRESETS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#f97316', // orange
]

export default function ThemePicker({ userId, currentColor }: Props) {
  const router = useRouter()
  const [color, setColor] = useState(currentColor)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = useCallback(
    (hex: string) => {
      setSaved(false)
      startTransition(async () => {
        const res = await fetch(`/api/users/${userId}/theme`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themePrimary: hex }),
        })
        if (res.ok) {
          setSaved(true)
          document.documentElement.style.setProperty('--primary-accent', hex)
          router.refresh()
        }
      })
    },
    [userId, router]
  )

  function handleColorChange(hex: string) {
    setColor(hex)
    document.documentElement.style.setProperty('--primary-accent', hex)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-xl border-2 border-white/10 cursor-pointer overflow-hidden shadow-lg transition-transform hover:scale-105"
            style={{ background: color }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Pick a color"
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{color}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Click the swatch to open color picker</p>
        </div>
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleColorChange(preset)}
              className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
              style={{
                background: preset,
                borderColor: color === preset ? 'white' : 'transparent',
              }}
              title={preset}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => save(color)}
          disabled={isPending || color === currentColor}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: 'var(--primary-accent)' }}
        >
          {isPending ? 'Saving…' : 'Save Color'}
        </button>
        {saved && (
          <span className="text-xs text-green-400">Saved!</span>
        )}
      </div>
    </div>
  )
}
