'use client'

import { useState, useTransition } from 'react'
import { Trash2, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ProdutoFormDialog } from '@/components/admin/produto-form-dialog'
import { deleteProdutoAction, toggleAtivoAction } from '@/app/admin/produtos/actions'
import type { Produto } from '@/lib/types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProdutosTable({ produtos }: { produtos: Produto[] }) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filtered = produtos.filter(produto => normalize(`${produto.nome} ${produto.time} ${produto.cor ?? ''}`).includes(normalize(query)))

  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <PackageX className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Nenhum produto cadastrado</p>
        <p className="mb-5 text-sm text-muted-foreground">Cadastre o primeiro conjuntinho para começar.</p>
        <ProdutoFormDialog />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input aria-label="Buscar produto" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nome, time ou cor…" className="min-w-0 flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-ring" />
        <label className="sr-only" htmlFor="product-view">Visualização</label><select id="product-view" value={view} onChange={event => setView(event.target.value)} className="rounded-xl border border-input bg-card px-3 py-3 text-sm"><option value="grid">Grade</option><option value="list">Lista</option></select>
      </div>
      <p className="text-xs text-muted-foreground" role="status">{filtered.length} de {produtos.length} produtos</p>
      {view === 'grid' && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(produto => {
        const total = (produto.tamanhos ?? []).reduce((sum, t) => sum + t.estoque_atual, 0)
        const low = (produto.tamanhos ?? []).some(t => t.estoque_atual <= t.estoque_minimo)
        return <article key={produto.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">{produto.foto_url ? <img src={produto.foto_url} alt={produto.nome} loading="lazy" className="size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : <div className="flex size-full items-center justify-center"><PackageX className="size-12 text-muted-foreground" aria-label="Sem foto" /></div>}<div className="absolute left-3 top-3"><Badge variant={!total || low ? 'destructive' : 'secondary'}>{!total ? 'Esgotado' : low ? 'Estoque baixo' : 'Em estoque'}</Badge></div></div>
          <div className="flex flex-col gap-3 p-4"><div><p className="text-xs text-muted-foreground">{produto.time} · {produto.categoria}</p><h2 className="mt-1 font-display text-lg font-bold">{produto.nome}</h2></div><div className="flex items-center justify-between gap-2"><strong className="text-lg tabular-nums">{formatBRL(produto.preco_atacado)}</strong><span className="text-xs text-muted-foreground">{total} peças</span></div><div className="flex items-center justify-between border-t border-border pt-3"><Badge variant="outline">{produto.ativo ? 'Ativo' : 'Inativo'}</Badge><div className="flex gap-1"><ProdutoFormDialog duplicarDe={produto} /><ProdutoFormDialog produto={produto} /></div></div></div>
        </article>
      })}</div>}
      {!filtered.length && <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Nenhum produto encontrado. Tente outro nome ou time.</p>}
      {view === 'list' && <div className="overflow-hidden rounded-xl border border-border"><Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14"></TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tamanhos / Cor</TableHead>
            <TableHead className="text-right">Preço atacado</TableHead>
            <TableHead className="text-right">Estoque total</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((produto) => {
            const tamanhos = (produto.tamanhos ?? [])
              .slice()
              .sort((a, b) => Number(a.tamanho) - Number(b.tamanho))
            const estoqueTotal = tamanhos.reduce((sum, t) => sum + t.estoque_atual, 0)
            const algumBaixo = tamanhos.some((t) => t.estoque_atual <= t.estoque_minimo)
            return (
              <TableRow key={produto.id}>
                <TableCell>
                  <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-muted">
                    {produto.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.foto_url || '/placeholder.svg'}
                        alt={produto.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{produto.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {produto.time} · {produto.categoria}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {tamanhos.length === 0 ? (
                      <span>—</span>
                    ) : (
                      tamanhos.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border px-1 text-xs font-medium"
                          title={`Tam. ${t.tamanho}: ${t.estoque_atual} un.`}
                        >
                          {t.tamanho}
                        </span>
                      ))
                    )}
                  </div>
                  {produto.cor ? <span className="mt-1 block text-xs">{produto.cor}</span> : null}
                </TableCell>
                <TableCell className="text-right font-medium">{formatBRL(produto.preco_atacado)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={algumBaixo ? 'destructive' : 'secondary'}>{estoqueTotal} un.</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={produto.ativo}
                    disabled={isPending && pendingId === produto.id}
                    onCheckedChange={(checked) => {
                      setPendingId(produto.id)
                      startTransition(async () => {
                        const result = await toggleAtivoAction(produto.id, checked)
                        if (result?.error) toast.error(result.error)
                        else toast.success(checked ? 'Produto ativado.' : 'Produto desativado.')
                        setPendingId(null)
                      })
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ProdutoFormDialog duplicarDe={produto} />
                    <ProdutoFormDialog produto={produto} />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" aria-label="Excluir produto" />}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir &quot;{produto.nome}&quot;? Essa ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => {
                              startTransition(async () => {
                                const result = await deleteProdutoAction(produto.id)
                                if (result?.error) toast.error(result.error)
                                else toast.success('Produto excluído.')
                              })
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table></div>}
    </div>
  )
}
