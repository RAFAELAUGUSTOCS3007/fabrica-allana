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

function ChipGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: string[]
  value: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect('todos')}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === 'todos'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-foreground hover:border-primary/40',
          )}
        >
          Todos
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              value === option
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/40',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filtros.busca}
            onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
            placeholder="Buscar por nome ou time..."
            className="rounded-full border-border bg-card pl-9"
          />
        </div>
        <Select value={filtros.tamanho} onValueChange={(value) => onChange({ ...filtros, tamanho: value })}>
          <SelectTrigger className="w-full rounded-full bg-card sm:w-36">
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
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <ChipGroup
          label="Categoria"
          options={categorias}
          value={filtros.categoria}
          onSelect={(value) => onChange({ ...filtros, categoria: value })}
        />
        <ChipGroup
          label="Time"
          options={times}
          value={filtros.time}
          onSelect={(value) => onChange({ ...filtros, time: value })}
        />
      </div>
    </div>
  )
}
