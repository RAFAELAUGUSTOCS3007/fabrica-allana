'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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

  const tamanhosComEstoque = useMemo(
    () =>
      (produto.tamanhos ?? [])
        .filter((t) => t.estoque_atual > 0)
        .sort((a, b) => Number(a.tamanho) - Number(b.tamanho)),
    [produto.tamanhos],
  )

  const semEstoque = tamanhosComEstoque.length === 0

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string | null>(null)
  const [quantidade, setQuantidade] = useState(1)

  const tamanhoAtual = tamanhosComEstoque.find((t) => t.tamanho === tamanhoSelecionado) ?? null
  const estoqueDoTamanho = tamanhoAtual?.estoque_atual ?? 0

  function handleAdicionar() {
    if (!tamanhoSelecionado) {
      toast.error('Escolha um tamanho antes de adicionar.')
      return
    }
    adicionarItem(produto, tamanhoSelecionado, quantidade)
    setQuantidade(1)
    setTamanhoSelecionado(null)
    toast.success(`${produto.nome} (tam. ${tamanhoSelecionado}) adicionado ao carrinho.`)
  }

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border-border py-0 shadow-none">
      <Link
        href={`/produto/${produto.id}`}
        className="relative block aspect-square bg-surface-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Ver detalhes de ${produto.nome} do ${produto.time}`}
      >
        {produto.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.foto_url || '/placeholder.svg'}
            alt={`${produto.nome} do ${produto.time}`}
            className={cn('h-full w-full object-cover', semEstoque && 'opacity-60')}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute left-2 top-2 border-transparent bg-primary text-primary-foreground">
          {produto.categoria}
        </Badge>
        {semEstoque && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <Badge
              variant="destructive"
              className="-rotate-12 border-transparent bg-foreground/90 px-4 py-1 text-sm font-bold uppercase tracking-wide text-background"
            >
              Esgotado
            </Badge>
          </div>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-1 px-4 pt-4">
        <Link href={`/produto/${produto.id}`} className="hover:underline">
          <h3 className="font-display font-bold leading-tight text-foreground">{produto.nome}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {produto.time}
          {produto.cor ? ` · ${produto.cor}` : ''}
        </p>
        <p className="font-display mt-2 text-lg font-extrabold text-primary">{formatBRL(produto.preco_atacado)}</p>

        {!semEstoque && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Tamanho</p>
            <div className="flex flex-wrap gap-1.5">
              {tamanhosComEstoque.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={tamanhoSelecionado === t.tamanho}
                  onClick={() => {
                    setTamanhoSelecionado(t.tamanho)
                    setQuantidade(1)
                  }}
                  className={cn(
                    'flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors',
                    tamanhoSelecionado === t.tamanho
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input text-foreground hover:border-primary',
                  )}
                >
                  {t.tamanho}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center gap-2 pt-0">
        <div className="flex items-center rounded-md border border-input">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            disabled={semEstoque || !tamanhoSelecionado}
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantidade}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            disabled={semEstoque || !tamanhoSelecionado}
            onClick={() => setQuantidade((q) => Math.min(estoqueDoTamanho, q + 1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button className="flex-1" disabled={semEstoque} onClick={handleAdicionar}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  )
}
