'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { Logo } from '@/components/catalog/logo'
import { CartDrawer } from '@/components/catalog/cart-drawer'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Ir para o início" className="group flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Logo className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="hidden text-xs text-muted-foreground sm:inline">Catálogo direto da fábrica</span>
        </Link>
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
