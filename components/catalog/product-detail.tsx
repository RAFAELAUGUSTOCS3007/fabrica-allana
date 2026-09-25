'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/catalog/cart-context'
import { ShareProduct } from '@/components/catalog/share-product'
import { buildWhatsAppContactUrl } from '@/lib/whatsapp'
import type { Produto } from '@/lib/types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProductDetail({ produto }: { produto: Produto }) {
  const { adicionarItem, setCartOpen } = useCart()

  const tamanhos = useMemo(
    () => (produto.tamanhos ?? []).slice().sort((a, b) => Number(a.tamanho) - Number(b.tamanho)),
    [produto.tamanhos],
  )
  const estoqueTotal = tamanhos.reduce((sum, t) => sum + t.estoque_atual, 0)
  const semEstoque = estoqueTotal === 0
  const tamanhosComEstoque = tamanhos.filter((t) => t.estoque_atual > 0)
  const tamanhoUnico = tamanhosComEstoque.length === 1 ? tamanhosComEstoque[0].tamanho : null

  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string | null>(tamanhoUnico)
  const [quantidade, setQuantidade] = useState(1)

  const tamanhoAtual = tamanhos.find((t) => t.tamanho === tamanhoSelecionado) ?? null
  const estoqueDoTamanho = tamanhoAtual?.estoque_atual ?? 0
  const estoqueMaximo = tamanhoAtual
    ? estoqueDoTamanho
    : Math.max(0, ...tamanhosComEstoque.map((t) => t.estoque_atual))

  function handleAdicionar(abrirCarrinho: boolean) {
    if (!tamanhoSelecionado) {
      toast.error('Escolha um tamanho antes de adicionar.')
      return
    }
    adicionarItem(produto, tamanhoSelecionado, quantidade)
    toast.success(`${produto.nome} (tam. ${tamanhoSelecionado}) adicionado ao carrinho.`)
    if (abrirCarrinho) setCartOpen(true)
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao catálogo
      </Link>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-tint">
          {produto.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={produto.foto_url || '/placeholder.svg'}
              alt={`${produto.nome} do ${produto.time}`}
              className={cn('h-full w-full object-cover', semEstoque && 'opacity-60')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute left-3 top-3 border-transparent bg-primary text-primary-foreground">
            {produto.categoria}
          </Badge>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">
            {produto.time}
            {produto.cor ? ` · ${produto.cor}` : ''}
          </p>
          <h1 className="font-display mt-1 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
            {produto.nome}
          </h1>
          <p className="font-display mt-3 text-3xl font-extrabold text-primary">{formatBRL(produto.preco_atacado)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Preço de atacado por unidade</p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Escolha o tamanho</p>
              {semEstoque && (
                <Badge variant="destructive" className="border-transparent">
                  Esgotado
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tamanhos.map((t) => {
                const indisponivel = t.estoque_atual <= 0
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={indisponivel}
                    aria-pressed={tamanhoSelecionado === t.tamanho}
                    onClick={() => {
                      setTamanhoSelecionado(t.tamanho)
                      setQuantidade(1)
                    }}
                    className={cn(
                      'flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors',
                      indisponivel && 'cursor-not-allowed border-dashed border-input text-muted-foreground/50 line-through',
                      !indisponivel && tamanhoSelecionado === t.tamanho
                        ? 'border-primary bg-primary text-primary-foreground'
                        : !indisponivel && 'border-input text-foreground hover:border-primary',
                    )}
                  >
                    {t.tamanho}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-input">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                disabled={semEstoque}
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantidade}</span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                disabled={semEstoque}
                onClick={() => setQuantidade((q) => Math.min(estoqueMaximo, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1" disabled={semEstoque} onClick={() => handleAdicionar(false)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao carrinho
            </Button>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="mt-3 w-full"
            disabled={semEstoque}
            onClick={() => handleAdicionar(true)}
          >
            Adicionar e ver carrinho
          </Button>

          <ShareProduct produto={produto} variant="outline" className="mt-3 w-full" />

          <a
            href={buildWhatsAppContactUrl(`Olá! Tenho uma dúvida sobre o ${produto.nome} (${produto.time}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Tirar dúvida sobre este produto no WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
