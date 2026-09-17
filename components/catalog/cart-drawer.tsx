'use client'

import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/components/catalog/cart-context'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CartDrawer() {
  const { itens, total, totalItens, atualizarQuantidade, removerItem, cartOpen, setCartOpen } = useCart()

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger render={<Button variant="outline" className="relative" />}>
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Carrinho</span>
        {totalItens > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {totalItens}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Seu pedido</SheetTitle>
          <SheetDescription>Revise os itens antes de enviar o pedido pelo WhatsApp.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {itens.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              {itens.map((item) => (
                <div key={item.produto_id} className="flex items-start justify-between gap-3 border-b border-border pb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.time} · Tam. {item.tamanho}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary">{formatBRL(item.preco_unitario)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      aria-label="Remover item"
                      onClick={() => removerItem(item.produto_id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center rounded-md border border-input">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{item.quantidade}</span>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
          <Button
            size="lg"
            disabled={itens.length === 0}
            className="w-full"
            render={<a href={buildWhatsAppOrderUrl(itens, total)} target="_blank" rel="noopener noreferrer" />}
          >
            Finalizar pedido no WhatsApp
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
