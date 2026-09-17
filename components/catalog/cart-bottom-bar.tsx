'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/catalog/cart-context'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CartBottomBar() {
  const { totalItens, total, setCartOpen } = useCart()

  if (totalItens === 0) return null

  return (
    <>
      {/* Spacer to keep page content from being hidden behind the fixed bar */}
      <div className="h-20" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </p>
            <p className="text-base font-bold leading-tight text-primary">{formatBRL(total)}</p>
          </div>
          <Button size="lg" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ver carrinho
          </Button>
        </div>
      </div>
    </>
  )
}
