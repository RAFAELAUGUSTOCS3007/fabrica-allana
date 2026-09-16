'use client'

import { Search } from 'lucide-react'
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filtros.busca}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
          placeholder="Buscar por nome ou time..."
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Select value={filtros.time} onValueChange={(value) => onChange({ ...filtros, time: value })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os times</SelectItem>
            {times.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.tamanho} onValueChange={(value) => onChange({ ...filtros, tamanho: value })}>
          <SelectTrigger className="w-full sm:w-32">
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

        <Select value={filtros.categoria} onValueChange={(value) => onChange({ ...filtros, categoria: value })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Categorias</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
