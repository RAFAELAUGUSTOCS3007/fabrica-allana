'use client'

import { useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

function clamp(value: number, min: number, max?: number) {
  const upper = typeof max === 'number' ? Math.max(min, max) : Number.POSITIVE_INFINITY
  return Math.min(upper, Math.max(min, value))
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  className,
  label = 'Quantidade',
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  label?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft === null) return
    const parsed = Number.parseInt(draft, 10)
    const next = Number.isNaN(parsed) ? value : clamp(parsed, min, max)
    setDraft(null)
    if (next !== value) onChange(next)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      commit()
      e.currentTarget.blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(clamp(value + 1, min, max))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(clamp(value - 1, min, max))
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      aria-label={label}
      disabled={disabled}
      value={draft ?? String(value)}
      onFocus={(e) => {
        setDraft(String(value))
        e.currentTarget.select()
      }}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-transparent text-center font-bold tabular-nums text-foreground outline-none focus:rounded-md focus:bg-muted disabled:opacity-40',
        className,
      )}
    />
  )
}
