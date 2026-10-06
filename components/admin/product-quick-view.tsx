'use client'

import { Eye, Package, Ruler } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ProdutoFormDialog } from '@/components/admin/produto-form-dialog'
import type { Produto } from '@/lib/types'

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProductQuickView({ produto }: { produto: Produto }) {
  const total = (produto.tamanhos ?? []).reduce((sum, item) => sum + item.estoque_atual, 0)
  return <Sheet><SheetTrigger render={<Button variant="ghost" size="icon" aria-label={`Abrir detalhes de ${produto.nome}`} />}><Eye /></SheetTrigger><SheetContent className="overflow-y-auto sm:max-w-lg"><SheetHeader><SheetTitle>{produto.nome}</SheetTitle><SheetDescription>{produto.time} · {produto.categoria}</SheetDescription></SheetHeader><div className="flex flex-col gap-5 p-4">{produto.foto_url ? <img src={produto.foto_url} alt={produto.nome} className="aspect-[4/3] w-full rounded-2xl object-cover"/> : <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted"><Package className="size-12 text-muted-foreground"/></div>}<div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Preço de atacado</p><p className="mt-1 font-display text-xl font-bold">{brl(Number(produto.preco_atacado))}</p></div><div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Estoque total</p><p className="mt-1 font-display text-xl font-bold">{total} peças</p></div></div><Separator/><div><div className="mb-3 flex items-center gap-2"><Ruler className="size-4 text-primary"/><h3 className="font-semibold">Estoque por tamanho</h3></div><div className="grid grid-cols-3 gap-2">{(produto.tamanhos ?? []).slice().sort((a,b) => Number(a.tamanho)-Number(b.tamanho)).map(item => <div key={item.id} className="rounded-lg border p-3 text-center"><p className="text-xs text-muted-foreground">Tam. {item.tamanho}</p><Badge className="mt-2" variant={item.estoque_atual <= item.estoque_minimo ? 'destructive' : 'secondary'}>{item.estoque_atual} un.</Badge></div>)}</div></div><Separator/><div className="flex justify-end"><ProdutoFormDialog produto={produto}/></div></div></SheetContent></Sheet>
}
