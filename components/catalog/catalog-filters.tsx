'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TeamPicker } from '@/components/catalog/team-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export type Ordenacao = 'recentes' | 'menor-preco' | 'maior-preco'

const ROTULOS_ORDENACAO: Record<Ordenacao, string> = {
  recentes: 'Mais recentes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
}

export type Filtros = {
  busca: string
  time: string
  tamanho: string
  ordenar: Ordenacao
}

function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-surface-tint',
        className,
      )}
    >
      {children}
    </button>
  )
}

function BuscaInput({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <label htmlFor="catalogo-busca" className="sr-only">
        Buscar produtos
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="catalogo-busca"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nome ou time..."
        className="h-9 w-full rounded-full border-border bg-card pl-9 pr-8"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function CatalogFilters({
  filtros,
  onChange,
  times,
  tamanhos,
}: {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
  times: string[]
  tamanhos: string[]
}) {
  const filtrosExtrasAtivos = (filtros.tamanho !== 'todos' ? 1 : 0) + (filtros.ordenar !== 'recentes' ? 1 : 0)

  const timesRow = (
    <TeamPicker times={times} value={filtros.time} onChange={(time) => onChange({ ...filtros, time })} />
  )

  return (
    <div className="flex flex-col gap-2.5">
      {/* Mobile / tablet */}
      <div className="flex items-center gap-2 lg:hidden">
        <BuscaInput
          value={filtros.busca}
          onChange={(busca) => onChange({ ...filtros, busca })}
          className="flex-1"
        />
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" size="sm" className="relative h-9 shrink-0 rounded-full px-3" />}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="ml-1.5">Filtros</span>
            {filtrosExtrasAtivos > 0 && (
              <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {filtrosExtrasAtivos}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85svh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-display">Filtrar catálogo</SheetTitle>
              <SheetDescription>Escolha o tamanho e a ordem dos produtos.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 overflow-y-auto px-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    selected={filtros.tamanho === 'todos'}
                    onClick={() => onChange({ ...filtros, tamanho: 'todos' })}
                  >
                    Todos
                  </Chip>
                  {tamanhos.map((tamanho) => (
                    <Chip
                      key={tamanho}
                      selected={filtros.tamanho === tamanho}
                      onClick={() => onChange({ ...filtros, tamanho })}
                      className="min-w-11 justify-center"
                    >
                      {tamanho}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">Ordenar por</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ROTULOS_ORDENACAO) as Ordenacao[]).map((ordem) => (
                    <Chip
                      key={ordem}
                      selected={filtros.ordenar === ordem}
                      onClick={() => onChange({ ...filtros, ordenar: ordem })}
                    >
                      {ROTULOS_ORDENACAO[ordem]}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onChange({ ...filtros, tamanho: 'todos', ordenar: 'recentes' })}
              >
                Limpar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div className="lg:hidden">{timesRow}</div>

      {/* Desktop */}
      <div className="hidden items-center gap-3 lg:flex">
        {timesRow}
        <div className="flex shrink-0 items-center gap-2">
          <Select value={filtros.tamanho} onValueChange={(value) => onChange({ ...filtros, tamanho: value ?? 'todos' })}>
            <SelectTrigger className="h-9 w-32 rounded-full bg-card" aria-label="Filtrar por tamanho">
              <SelectValue placeholder="Tamanho">
                {(value: string) => (value === 'todos' ? 'Tamanhos' : `Tam. ${value}`)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Tamanhos</SelectItem>
              {tamanhos.map((tamanho) => (
                <SelectItem key={tamanho} value={tamanho}>
                  {tamanho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filtros.ordenar}
            onValueChange={(value) => onChange({ ...filtros, ordenar: value as Ordenacao })}
          >
            <SelectTrigger className="h-9 w-40 rounded-full bg-card" aria-label="Ordenar produtos">
              <SelectValue placeholder="Ordenar">
                {(value: Ordenacao) => ROTULOS_ORDENACAO[value] ?? 'Ordenar'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
          <BuscaInput
            value={filtros.busca}
            onChange={(busca) => onChange({ ...filtros, busca })}
            className="w-56"
          />
        </div>
      </div>
    </div>
  )
}
