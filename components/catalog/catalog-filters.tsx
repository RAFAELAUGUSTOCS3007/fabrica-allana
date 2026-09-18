'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type Filtros = {
  busca: string
  time: string
  tamanho: string
  categoria: string
}

function Chip({
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
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-primary/40',
      )}
    >
      {children}
    </button>
  )
}

export function CatalogFilters({
  filtros,
  onChange,
  times,
  tamanhos,
  categorias,
}: {
  filtros: Filtros
  onChange: (filtros: Filtros) => void
  times: string[]
  tamanhos: string[]
  categorias: string[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Chip selected={filtros.time === 'todos'} onClick={() => onChange({ ...filtros, time: 'todos' })}>
            Todos os times
          </Chip>
          {times.map((time) => (
            <Chip key={time} selected={filtros.time === time} onClick={() => onChange({ ...filtros, time })}>
              {time}
            </Chip>
          ))}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={filtros.tamanho} onValueChange={(value) => onChange({ ...filtros, tamanho: value })}>
            <SelectTrigger className="w-full rounded-full bg-card sm:w-32">
              <SelectValue placeholder="Tamanho" />
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="catalogo-busca"
              value={filtros.busca}
              onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
              placeholder="Buscar por nome ou time..."
              className="w-full rounded-full border-border bg-card pl-9 sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip selected={filtros.categoria === 'todos'} onClick={() => onChange({ ...filtros, categoria: 'todos' })}>
          Todas as categorias
        </Chip>
        {categorias.map((categoria) => (
          <Chip
            key={categoria}
            selected={filtros.categoria === categoria}
            onClick={() => onChange({ ...filtros, categoria })}
          >
            {categoria}
          </Chip>
        ))}
      </div>
    </div>
  )
}
