'use client'

import { Search } from 'lucide-react'
import { Logo } from '@/components/catalog/logo'
import { CartDrawer } from '@/components/catalog/cart-drawer'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden text-xs text-muted-foreground sm:inline">Catálogo de atacado</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar produtos"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              const input = document.getElementById('catalogo-busca')
              input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              ;(input as HTMLInputElement | null)?.focus()
            }}
          >
            <Search className="h-4 w-4" />
          </button>
          <CartDrawer />
        </div>
      </div>
    </header>
  )
}
