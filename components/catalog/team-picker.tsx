'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const HIDE_SCROLLBAR = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function TeamChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-selected={selected || undefined}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-surface-tint',
      )}
    >
      {children}
    </button>
  )
}

function AllTeamsSheet({
  times,
  value,
  onChange,
}: {
  times: string[]
  value: string
  onChange: (time: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const termo = normalizar(busca.trim())
  const filtrados = termo ? times.filter((t) => normalizar(t).includes(termo)) : times

  function escolher(time: string) {
    onChange(time)
    setOpen(false)
    setBusca('')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-surface-tint"
          />
        }
      >
        Ver todos
        <span className="rounded-full bg-muted px-1.5 text-[11px] font-bold text-muted-foreground">{times.length}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-xl">Escolha o time</SheetTitle>
          <SheetDescription>{times.length} times disponíveis no catálogo.</SheetDescription>
          <div className="relative mt-2">
            <label htmlFor="busca-time" className="sr-only">
              Buscar time
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="busca-time"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar time ou seleção..."
              className="h-10 rounded-full bg-card pl-9"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <button
            type="button"
            onClick={() => escolher('todos')}
            className={cn(
              'mb-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors',
              value === 'todos'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-surface-tint',
            )}
          >
            Todos os times
            {value === 'todos' && <Check className="h-4 w-4" />}
          </button>

          {filtrados.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum time encontrado para &quot;{busca}&quot;.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {filtrados.map((time) => {
                const ativo = value === time
                return (
                  <li key={time}>
                    <button
                      type="button"
                      onClick={() => escolher(time)}
                      aria-pressed={ativo}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        ativo
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-surface-tint',
                      )}
                    >
                      <span className="truncate">{time}</span>
                      {ativo && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function TeamPicker({
  times,
  value,
  onChange,
}: {
  times: string[]
  value: string
  onChange: (time: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [podeEsquerda, setPodeEsquerda] = useState(false)
  const [podeDireita, setPodeDireita] = useState(false)

  function atualizarSetas() {
    const el = scrollRef.current
    if (!el) return
    setPodeEsquerda(el.scrollLeft > 4)
    setPodeDireita(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    atualizarSetas()
    const observer = new ResizeObserver(atualizarSetas)
    observer.observe(el)
    return () => observer.disconnect()
  }, [times.length])

  useEffect(() => {
    const ativo = scrollRef.current?.querySelector<HTMLElement>('[data-selected]')
    ativo?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [value])

  function rolar(direcao: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direcao * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  const mascara =
    podeEsquerda && podeDireita
      ? '[mask-image:linear-gradient(to_right,transparent,black_2.5rem,black_calc(100%-2.5rem),transparent)]'
      : podeDireita
        ? '[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)]'
        : podeEsquerda
          ? '[mask-image:linear-gradient(to_right,transparent,black_2.5rem)]'
          : ''

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="relative flex min-w-0 flex-1 items-center">
        <button
          type="button"
          aria-label="Ver times anteriores"
          onClick={() => rolar(-1)}
          className={cn(
            'absolute left-0 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-md transition-opacity hover:bg-surface-tint md:flex',
            podeEsquerda ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          onScroll={atualizarSetas}
          className={cn('flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-0.5', HIDE_SCROLLBAR, mascara)}
        >
          <TeamChip selected={value === 'todos'} onClick={() => onChange('todos')}>
            Todos os times
          </TeamChip>
          {times.map((time) => (
            <TeamChip key={time} selected={value === time} onClick={() => onChange(time)}>
              {time}
            </TeamChip>
          ))}
        </div>

        <button
          type="button"
          aria-label="Ver mais times"
          onClick={() => rolar(1)}
          className={cn(
            'absolute right-0 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-md transition-opacity hover:bg-surface-tint md:flex',
            podeDireita ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <AllTeamsSheet times={times} value={value} onChange={onChange} />
    </div>
  )
}
