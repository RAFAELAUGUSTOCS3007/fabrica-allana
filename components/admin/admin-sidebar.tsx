'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Shirt, Boxes, Receipt, LogOut, Store, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/catalog/logo'
import { logoutAction } from '@/app/admin/actions/auth'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Shirt },
  { href: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { href: '/admin/vendas', label: 'Vendas', icon: Receipt },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <div className="px-5 py-6">
        <Logo onDark />
        <p className="mt-3 font-display text-lg font-extrabold">Painel da fábrica</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
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
                'flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-gold bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-sidebar-border px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
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
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
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

export function AdminMobileBar() {
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
      <Sheet open={open} onOpenChange={setOpen}>
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
      </Sheet>
    </header>
  )
}
