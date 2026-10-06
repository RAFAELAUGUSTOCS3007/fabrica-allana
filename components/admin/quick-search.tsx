'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowUpRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'

const pages = [
  { title: 'Dashboard', hint: 'Visão geral da fábrica', href: '/admin' },
  { title: 'Produtos', hint: 'Buscar produtos e gerenciar o catálogo', href: '/admin/produtos' },
  { title: 'Estoque', hint: 'Tamanhos, reposições e movimentações', href: '/admin/estoque' },
  { title: 'Vendas', hint: 'Buscar clientes, produtos vendidos e pedidos', href: '/admin/vendas' },
  { title: 'Financeiro', hint: 'Receita, custos e desempenho', href: '/admin/financeiro' },
]

export function QuickSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.isComposing) {
        event.preventDefault()
        setOpen(value => !value)
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const results = pages.filter(page => normalize(page.title + page.hint).includes(normalize(query)))
  return (
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) setQuery('') }}>
      <DialogTrigger className="mb-6 flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/40">
        <Search className="size-4" aria-hidden="true" /> Ir para uma seção… <kbd className="ml-auto rounded border border-border px-2 py-1 text-xs">Ctrl K</kbd>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Busca rápida</DialogTitle><DialogDescription>Encontre uma seção. Produtos e vendas têm filtros próprios.</DialogDescription></DialogHeader>
        <input aria-label="Buscar seção" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Produtos, estoque, financeiro…" className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
        <div className="flex flex-col gap-1">
          {results.map(page => <Link key={page.href} href={page.href} onClick={() => { setOpen(false); setQuery('') }} className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted focus-visible:bg-muted"><div className="flex-1"><p className="font-semibold">{page.title}</p><p className="text-xs text-muted-foreground">{page.hint}</p></div><ArrowUpRight className="size-4" aria-hidden="true" /></Link>)}
          {!results.length && <p role="status" className="p-6 text-center text-muted-foreground">Nenhuma seção encontrada.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
