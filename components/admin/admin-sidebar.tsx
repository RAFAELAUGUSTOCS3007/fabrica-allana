'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Shirt, Boxes, Receipt, LogOut, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/admin/actions/auth'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Shirt },
  { href: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { href: '/admin/vendas', label: 'Vendas', icon: Receipt },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="flex h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">A&amp;A Sports</p>
        <p className="text-lg font-bold">Painel da fábrica</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => {
          const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
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
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <Store className="h-4 w-4" />
          Ver catálogo
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logoutAction()
            router.push('/admin/login')
            router.refresh()
          }}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
