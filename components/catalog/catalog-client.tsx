'use client'

import { useMemo, useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { CatalogFilters, type Filtros } from '@/components/catalog/catalog-filters'
import { ProductCard } from '@/components/catalog/product-card'
import type { Produto } from '@/lib/types'

const filtrosIniciais: Filtros = { busca: '', time: 'todos', tamanho: 'todos', categoria: 'todos' }

export function CatalogClient({ produtos }: { produtos: Produto[] }) {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais)

  const times = useMemo(() => Array.from(new Set(produtos.map((p) => p.time))).sort(), [produtos])
  const tamanhos = useMemo(() => Array.from(new Set(produtos.map((p) => p.tamanho))).sort(), [produtos])
  const categorias = useMemo(() => Array.from(new Set(produtos.map((p) => p.categoria))).sort(), [produtos])

  const produtosFiltrados = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase()
    return produtos.filter((produto) => {
      if (busca && !`${produto.nome} ${produto.time}`.toLowerCase().includes(busca)) return false
      if (filtros.time !== 'todos' && produto.time !== filtros.time) return false
      if (filtros.tamanho !== 'todos' && produto.tamanho !== filtros.tamanho) return false
      if (filtros.categoria !== 'todos' && produto.categoria !== filtros.categoria) return false
      return true
    })
  }, [produtos, filtros])

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-[61px] z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <CatalogFilters
            filtros={filtros}
            onChange={setFiltros}
            times={times}
            tamanhos={tamanhos}
            categorias={categorias}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {produtosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
            <PackageSearch className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {produtosFiltrados.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
