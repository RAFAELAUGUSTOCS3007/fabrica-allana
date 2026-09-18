'use client'

import { useState } from 'react'
import { ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useCart } from '@/components/catalog/cart-context'
import type { Produto } from '@/lib/types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProductCard({ produto }: { produto: Produto }) {
  const { adicionarItem } = useCart()
  const [quantidade, setQuantidade] = useState(1)
  const semEstoque = produto.estoque_atual <= 0
  const estoqueBaixo = produto.estoque_atual > 0 && produto.estoque_atual <= 5

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {produto.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.foto_url || '/placeholder.svg'}
            alt={`${produto.nome} do ${produto.time}, tamanho ${produto.tamanho}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {semEstoque && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Badge variant="destructive">Sem estoque</Badge>
          </div>
        )}
        {estoqueBaixo && (
          <Badge className="absolute left-2 top-2 border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Últimas {produto.estoque_atual} unidades
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{produto.categoria}</p>
        <h3 className="font-semibold leading-tight">{produto.nome}</h3>
        <p className="text-sm text-muted-foreground">
          {produto.time} · Tam. {produto.tamanho}
          {produto.cor ? ` · ${produto.cor}` : ''}
        </p>
        <p className="mt-2 text-lg font-bold text-primary">{formatBRL(produto.preco_atacado)}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-2 pt-0">
        <div className="flex items-center rounded-md border border-input">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            disabled={semEstoque}
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantidade}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            disabled={semEstoque}
            onClick={() => setQuantidade((q) => Math.min(produto.estoque_atual, q + 1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button
          className="flex-1"
          disabled={semEstoque}
          onClick={() => {
            adicionarItem(produto, quantidade)
            setQuantidade(1)
            toast.success(`${produto.nome} adicionado ao carrinho.`)
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  )
}
