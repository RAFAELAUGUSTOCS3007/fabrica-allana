'use client'

import { FormEvent, type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, Search, Shirt, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/catalog/logo'
import { CartDrawer } from '@/components/catalog/cart-drawer'
import { buildWhatsAppContactUrl } from '@/lib/whatsapp'

export type HeaderProduct = { id: string; nome: string; time: string; foto_url: string | null }

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function SiteHeader({ produtos = [] }: { produtos?: HeaderProduct[] }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [query, setQuery] = useState('')
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 56)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const open = () => setSearchOpen(true)
    window.addEventListener('aa:open-search', open)
    return () => window.removeEventListener('aa:open-search', open)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMegaOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const overHero = isHome && !scrolled && !megaOpen && !searchOpen

  const teams = useMemo(() => {
    const map = new Map<string, { time: string; total: number; foto: string | null }>()
    for (const produto of produtos) {
      const current = map.get(produto.time)
      if (current) {
        current.total += 1
        if (!current.foto && produto.foto_url) current.foto = produto.foto_url
      } else {
        map.set(produto.time, { time: produto.time, total: 1, foto: produto.foto_url })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time))
  }, [produtos])

  const suggestions = useMemo(() => {
    const term = normalize(query.trim())
    if (term.length < 2) return []
    return produtos.filter((produto) => normalize(`${produto.nome} ${produto.time}`).includes(term)).slice(0, 5)
  }, [produtos, query])

  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    setSearchOpen(false)
    setMenuOpen(false)
    setMegaOpen(false)
    setQuery('')

    if (!isHome) return

    event.preventDefault()
    window.history.replaceState(null, '', '/')
    window.dispatchEvent(new Event('aa:reset-catalog'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectTeam(time: string) {
    setMegaOpen(false)
    setMenuOpen(false)
    if (!isHome) {
      window.location.href = '/#catalogo'
      return
    }
    window.dispatchEvent(new CustomEvent('aa:set-team', { detail: time }))
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

  function openMega() {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    if (teams.length > 0) setMegaOpen(true)
  }

  function closeMega() {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    megaTimer.current = setTimeout(() => setMegaOpen(false), 140)
  }

  const navLink = 'rounded-full px-4 py-2 text-xs font-bold transition-colors hover:bg-current/10'

  return (
    <header className={cn('inset-x-0 top-0 z-40 transition-all duration-300', isHome ? 'fixed' : 'sticky', !overHero && 'border-b border-border bg-card/95 text-foreground shadow-sm backdrop-blur-xl')}>
      <div className={cn('overflow-hidden border-b transition-all duration-300', overHero ? 'max-h-9 border-white/10 bg-primary/75 text-primary-foreground backdrop-blur-md' : 'max-h-0 border-transparent')}>
        <p className="mx-auto max-w-6xl px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
          Venda para revenda <span className="mx-2 text-gold">•</span> Atendimento direto <span className="mx-2 text-gold">•</span> Envio para todo o Brasil
        </p>
      </div>

      <div className={cn('mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-all sm:px-6', scrolled ? 'h-16' : 'h-20')}>
        <Link href="/" onClick={goHome} aria-label="Voltar ao início e limpar filtros" className="group flex shrink-0 items-center rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Logo onDark={overHero} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </Link>

        <nav aria-label="Navegação principal" className={cn('hidden items-center gap-1 rounded-full border p-1 lg:flex', overHero ? 'border-white/15 bg-black/15 text-white backdrop-blur-md' : 'border-border bg-muted/60')}>
          <Link href="/" onClick={goHome} className={navLink}>Home</Link>
          <div onMouseEnter={openMega} onMouseLeave={closeMega} onFocus={openMega} onBlur={closeMega}>
            <a href="/#catalogo" aria-haspopup={teams.length > 0 ? 'true' : undefined} aria-expanded={teams.length > 0 ? megaOpen : undefined} className={cn(navLink, 'inline-flex items-center gap-1', megaOpen && 'bg-current/10')}>
              Catálogo
              {teams.length > 0 && <ChevronDown className={cn('size-3 transition-transform', megaOpen && 'rotate-180')} aria-hidden="true" />}
            </a>
          </div>
          <a href="/#como-comprar" className={navLink}>Como comprar</a>
          <a href={buildWhatsAppContactUrl()} target="_blank" rel="noopener noreferrer" className={navLink}>Falar com a fábrica</a>
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

      {megaOpen && teams.length > 0 && (
        <div onMouseEnter={openMega} onMouseLeave={closeMega} className="hidden border-t border-border bg-card text-foreground shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 lg:block">
          <div className="mx-auto grid max-w-6xl grid-cols-[220px_1fr] gap-8 px-6 py-7">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">Explore por time</p>
                <h2 className="font-display mt-2 text-2xl font-extrabold leading-tight">Escolha o time e monte o pedido.</h2>
                <p className="mt-2 text-sm text-muted-foreground">{produtos.length} modelos disponíveis direto da fábrica.</p>
              </div>
              <Link href="/#catalogo" onClick={() => setMegaOpen(false)} className="mt-6 inline-flex w-fit items-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.03]">Ver catálogo completo</Link>
            </div>
            <ul className="grid grid-cols-3 gap-3 xl:grid-cols-4">
              {teams.slice(0, 8).map((team) => (
                <li key={team.time}>
                  <button type="button" onClick={() => selectTeam(team.time)} className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md">
                    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-tint">
                      {team.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.foto} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <Shirt className="size-5 text-muted-foreground" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{team.time}</span>
                      <span className="block text-xs text-muted-foreground">{team.total} {team.total === 1 ? 'modelo' : 'modelos'}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="border-t border-border bg-card p-3 text-foreground shadow-xl motion-safe:animate-in motion-safe:slide-in-from-top-2">
          <form onSubmit={search} className="mx-auto flex max-w-2xl gap-2">
            <label htmlFor="header-search" className="sr-only">Buscar por produto ou time</label>
            <div className="control-surface flex flex-1 items-center gap-2 px-4"><Search className="size-4 text-muted-foreground" /><input id="header-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por time, modelo ou cor" autoComplete="off" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div>
            <button type="submit" className="rounded-xl bg-gold px-5 text-sm font-extrabold text-gold-foreground">Buscar</button>
          </form>

          {suggestions.length > 0 && (
            <ul className="mx-auto mt-3 grid max-w-2xl gap-1" aria-label="Sugestões de produtos">
              {suggestions.map((produto) => (
                <li key={produto.id}>
                  <Link href={`/produto/${produto.id}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-tint">
                      {produto.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={produto.foto_url} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <Shirt className="size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{produto.nome}</span>
                      <span className="block text-xs text-muted-foreground">{produto.time}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length >= 2 && suggestions.length === 0 && produtos.length > 0 && (
            <p className="mx-auto mt-3 max-w-2xl px-2 text-sm text-muted-foreground" role="status">Nenhum modelo encontrado para &quot;{query}&quot;.</p>
          )}
        </div>
      )}

      {menuOpen && (
        <nav aria-label="Menu móvel" className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border bg-card p-4 text-foreground shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <Link href="/" onClick={goHome} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Home</Link>
            <a href="/#catalogo" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Catálogo</a>
            {teams.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-2 pt-1" role="list" aria-label="Times">
                {teams.map((team) => (
                  <button key={team.time} type="button" role="listitem" onClick={() => selectTeam(team.time)} className="shrink-0 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-gold">
                    {team.time}
                  </button>
                ))}
              </div>
            )}
            <a href="/#como-comprar" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Como comprar</a>
            <a href={buildWhatsAppContactUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-muted">Falar com a fábrica</a>
          </div>
        </nav>
      )}
    </header>
  )
}
