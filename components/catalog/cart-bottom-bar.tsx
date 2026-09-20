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
      <div className="fixed inset-x-0 bottom-0 z-50 bg-[#12211f] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.25)] sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/60">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </p>
            <p className="font-display text-base font-extrabold leading-tight text-white">{formatBRL(total)}</p>
          </div>
          <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ver carrinho
          </Button>
        </div>
      </div>
    </>
  )
}
