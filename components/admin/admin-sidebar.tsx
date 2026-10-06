'use client'

import type React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Shirt, Boxes, Receipt, LogOut, Store, Menu, WalletCards, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/catalog/logo'
import { logoutAction } from '@/app/admin/actions/auth'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Shirt },
  { href: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { href: '/admin/vendas', label: 'Pedidos e vendas', icon: Receipt },
  { href: '/admin/financeiro', label: 'Financeiro', icon: WalletCards },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <div className="sport-texture relative overflow-hidden border-b border-sidebar-border/60 bg-gradient-to-br from-sidebar to-black/20 px-5 py-6">
        <Trophy className="absolute -right-3 -top-3 size-20 rotate-12 text-gold/10" aria-hidden="true" />
        <div className="relative">
          <Logo onDark />
          <p className="mt-3 font-display text-lg font-extrabold">Painel da fábrica</p>
          <span className="mt-2 block h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {links.map((link) => {
          const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gold/15 text-gold shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--gold)_35%,transparent)]'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-gold' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground')} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent/40 px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-gold-foreground">
            A
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Allana</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Administradora</p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <Store className="h-4 w-4" />
          Ver catálogo
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logoutAction()
            onNavigate?.()
            router.push('/admin/login')
            router.refresh()
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  )
}

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <SidebarContent />
    </aside>
  )
}

export function AdminDesktopBar({ notificationCenter }: { notificationCenter?: React.ReactNode }) {
  const pathname = usePathname()
  const current = links.find((link) => link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href))

  return (
    <header className="hidden items-center justify-between gap-4 border-b border-border bg-card px-6 py-4 md:flex">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Área administrativa</span>
        <span aria-hidden="true" className="text-border">/</span>
        <span className="font-semibold" aria-current="page">{current?.label ?? 'Painel'}</span>
      </div>
      <div className="flex items-center gap-2">{notificationCenter}<Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><Store className="size-3.5" aria-hidden="true" />Abrir catálogo</Link></div>
    </header>
  )
}

export function AdminMobileBar({ notificationCenter }: { notificationCenter?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const atual =
    links.find((l) => (l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)))?.label ??
    'Painel'

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground md:hidden">
      <div className="flex items-center gap-3">
        <Logo onDark />
        <span className="h-5 w-px bg-sidebar-border" aria-hidden="true" />
        <span className="text-sm font-medium">{atual}</span>
      </div>
      <div className="flex items-center gap-1">{notificationCenter}<Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="Abrir menu"
          className="flex size-10 items-center justify-center rounded-md hover:bg-sidebar-accent"
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-72 flex-col gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Menu do painel</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet></div>
    </header>
  )
}
