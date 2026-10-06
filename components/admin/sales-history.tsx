'use client'

import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { VendaRowActions } from '@/components/admin/venda-row-actions'
import { VendaFormDialog } from '@/components/admin/venda-form-dialog'
import type { Produto, Venda } from '@/lib/types'

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function SalesHistory({ vendas, produtos }: { vendas: Venda[]; produtos: Produto[] }) {
  const [query, setQuery] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const week = new Date(today); week.setDate(week.getDate() - (week.getDay() + 6) % 7)
  const month = new Date(now.getFullYear(), now.getMonth(), 1)
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filtered = vendas.filter(venda => {
    const date = new Date(venda.data)
    return normalize(`${venda.cliente ?? ''} ${venda.id} ${venda.itens.map(item => item.nome).join(' ')}`).includes(normalize(query)) && (!start || date >= new Date(`${start}T00:00:00`)) && (!end || date <= new Date(`${end}T23:59:59.999`))
  })
  return <div className="flex flex-col gap-5">
    <dl className="grid gap-4 sm:grid-cols-3">{[{ label: 'Hoje', from: today }, { label: 'Nesta semana', from: week }, { label: 'Neste mês', from: month }].map(period => <div key={period.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><dt className="text-sm text-muted-foreground">{period.label}</dt><dd className="mt-3 font-display text-2xl font-bold tabular-nums">{brl(vendas.filter(venda => new Date(venda.data) >= period.from && new Date(venda.data) <= now).reduce((sum, venda) => sum + Number(venda.total), 0))}</dd></div>)}</dl>
    <p className="text-xs text-muted-foreground">Resumo e filtros referentes às últimas {vendas.length} vendas carregadas (máximo de 50).</p>
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs font-medium">Buscar venda<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cliente, produto ou código" className="min-w-40 rounded-lg border border-input bg-background px-3 py-2.5 text-sm" /></label>
      <label className="flex flex-col gap-2 text-xs font-medium">De<input type="date" value={start} max={end || undefined} onChange={e => setStart(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
      <label className="flex flex-col gap-2 text-xs font-medium">Até<input type="date" value={end} min={start || undefined} onChange={e => setEnd(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
      <button type="button" onClick={() => { setQuery(''); setStart(''); setEnd('') }} className="px-3 py-2 text-sm underline underline-offset-4">Limpar</button>
    </div>
    <div className="flex items-center justify-between gap-3 text-sm" role="status"><span className="text-muted-foreground">{filtered.length} vendas encontradas</span><strong>{brl(filtered.reduce((sum, venda) => sum + Number(venda.total), 0))}</strong></div>
    <ol className="flex flex-col gap-3">{filtered.map(venda => <li key={venda.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"><Receipt className="size-5" aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{new Date(venda.data).toLocaleDateString('pt-BR')} · Registro #{venda.id.slice(0, 8)}</p><h2 className="mt-1 font-semibold">{venda.cliente || 'Cliente não informado'}</h2></div><strong className="text-lg tabular-nums">{brl(Number(venda.total))}</strong></div><p className="mt-2 text-sm text-muted-foreground">{venda.itens.map(item => `${item.quantidade}× ${item.nome} · Tam. ${item.tamanho}`).join(' / ')}</p><div className="mt-3 flex justify-end border-t border-border pt-3"><VendaRowActions venda={venda} produtos={produtos} /></div></div></li>)}</ol>
    {!filtered.length && <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center"><Receipt className="size-10 text-muted-foreground" aria-hidden="true" /><h2 className="font-semibold">{vendas.length ? 'Nenhuma venda neste filtro' : 'Sua próxima venda começa aqui'}</h2><p className="text-sm text-muted-foreground">{vendas.length ? 'Altere a busca ou o período para ver outros registros.' : 'Registre um pedido para acompanhar seu desempenho.'}</p>{!vendas.length && <VendaFormDialog produtos={produtos} />}</div>}
  </div>
}
