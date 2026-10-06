'use client'

import { useEffect, useState } from 'react'
import { Home, LayoutGrid, MessageCircle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildWhatsAppContactUrl } from '@/lib/whatsapp'

const itemClass =
  'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-ring'

export function MobileNavBar() {
  const [active, setActive] = useState<'inicio' | 'catalogo'>('inicio')

  useEffect(() => {
    const catalog = document.getElementById('catalogo')
    if (!catalog) return
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting ? 'catalogo' : 'inicio'),
      { rootMargin: '-35% 0px -35% 0px' },
    )
    observer.observe(catalog)
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(18,33,31,0.08)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch gap-1">
        <button
          type="button"
          aria-current={active === 'inicio' ? 'page' : undefined}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={cn(itemClass, active === 'inicio' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
        >
          <Home className="size-5" aria-hidden="true" />
          Início
        </button>
        <a
          href="#catalogo"
          aria-current={active === 'catalogo' ? 'page' : undefined}
          className={cn(itemClass, active === 'catalogo' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
        >
          <LayoutGrid className="size-5" aria-hidden="true" />
          Catálogo
        </a>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('aa:open-search'))}
          className={cn(itemClass, 'text-muted-foreground')}
        >
          <Search className="size-5" aria-hidden="true" />
          Buscar
        </button>
        <a
          href={buildWhatsAppContactUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(itemClass, 'text-[#128C4A]')}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          Contato
        </a>
      </div>
    </nav>
  )
}
