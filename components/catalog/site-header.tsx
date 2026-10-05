'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/catalog/logo'
import { CartDrawer } from '@/components/catalog/cart-drawer'
import { buildWhatsAppContactUrl } from '@/lib/whatsapp'

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 56)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const overHero = isHome && !scrolled

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const catalogInput = document.getElementById('catalogo-busca') as HTMLInputElement | null
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (catalogInput) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(catalogInput, query)
      catalogInput.dispatchEvent(new Event('input', { bubbles: true }))
      catalogInput.focus({ preventScroll: true })
    }
    setSearchOpen(false)
  }

  return (
    <header className={cn('inset-x-0 top-0 z-40 transition-all duration-300', isHome ? 'fixed' : 'sticky', !overHero && 'border-b border-border bg-card/95 text-foreground shadow-sm backdrop-blur-xl')}>
      <div className={cn('overflow-hidden border-b transition-all duration-300', overHero ? 'max-h-9 border-white/10 bg-primary/75 text-primary-foreground backdrop-blur-md' : 'max-h-0 border-transparent')}>
        <p className="mx-auto max-w-6xl px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
          Venda para revenda <span className="mx-2 text-gold">•</span> Atendimento direto <span className="mx-2 text-gold">•</span> Envio para todo o Brasil
        </p>
      </div>

      <div className={cn('mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-all sm:px-6', scrolled ? 'h-16' : 'h-20')}>
        <Link href="/" aria-label="Ir para o início" className="group flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Logo onDark={overHero} className="scale-110 transition-transform duration-300 group-hover:-translate-y-0.5 sm:scale-125" />
        </Link>

        <nav aria-label="Navegação principal" className={cn('hidden items-center gap-1 rounded-full border p-1 lg:flex', overHero ? 'border-white/15 bg-black/15 text-white backdrop-blur-md' : 'border-border bg-muted/60')}>
          <a href="/#catalogo" className="rounded-full px-4 py-2 text-xs font-bold transition-colors hover:bg-current/10">Catálogo</a>
          <a href="/#como-comprar" className="rounded-full px-4 py-2 text-xs font-bold transition-colors hover:bg-current/10">Como comprar</a>
          <a href={buildWhatsAppContactUrl()} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-xs font-bold transition-colors hover:bg-current/10">Falar com a fábrica</a>
        </nav>

        <div className={cn('flex items-center gap-1.5', overHero && 'text-white')}>
          <button type="button" aria-label="Buscar produtos" aria-expanded={searchOpen} onClick={() => setSearchOpen((value) => !value)} className="flex size-11 items-center justify-center rounded-full border border-current/15 bg-current/5 transition-colors hover:bg-current/10">
            {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </button>
          <CartDrawer />
          <button type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} className="flex size-11 items-center justify-center rounded-full border border-current/15 bg-current/5 lg:hidden">
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={search} className="border-t border-border bg-card p-3 text-foreground shadow-xl motion-safe:animate-in motion-safe:slide-in-from-top-2">
          <div className="mx-auto flex max-w-2xl gap-2">
            <label htmlFor="header-search" className="sr-only">Buscar por produto ou time</label>
            <div className="control-surface flex flex-1 items-center gap-2 px-4"><Search className="size-4 text-muted-foreground" /><input id="header-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por time, modelo ou cor" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div>
            <button type="submit" className="rounded-xl bg-gold px-5 text-sm font-extrabold text-gold-foreground">Buscar</button>
          </div>
        </form>
      )}

      {menuOpen && (
        <nav aria-label="Menu móvel" className="border-t border-border bg-card p-4 text-foreground shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <a href="/#catalogo" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Catálogo</a>
            <a href="/#como-comprar" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Como comprar</a>
            <a href={buildWhatsAppContactUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Falar com a fábrica</a>
          </div>
        </nav>
      )}
    </header>
  )
}
