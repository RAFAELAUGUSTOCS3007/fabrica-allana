'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Produto } from '@/lib/types'

const tamanhos = ['0', '2', '4', '6', '8', '10', '12', '14']
export function StockGrid({ produtos }: { produtos: Produto[] }) {
  const [busca, setBusca] = useState('')
  const filtrados = useMemo(() => produtos.filter((p) => `${p.nome} ${p.time}`.toLowerCase().includes(busca.toLowerCase())), [produtos, busca])
  return <div className="space-y-3"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conjunto ou time" className="pl-9" /></div><div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground"><th className="sticky left-0 z-10 bg-muted/40 px-4 py-3">Produto</th>{tamanhos.map((t) => <th key={t} className="px-3 py-3 text-center">{t}</th>)}<th className="px-3 py-3 text-center">Total</th></tr></thead><tbody>{filtrados.map((p) => { const map = new Map((p.tamanhos ?? []).map((t) => [t.tamanho, t])); const total = tamanhos.reduce((n, t) => n + Number(map.get(t)?.estoque_atual ?? 0), 0); return <tr key={p.id} className="border-b last:border-0"><td className="sticky left-0 bg-background px-4 py-3"><p className="max-w-48 truncate font-medium">{p.nome}</p><p className="text-xs text-muted-foreground">{p.time}</p></td>{tamanhos.map((t) => { const item = map.get(t); const baixo = item && item.estoque_atual <= item.estoque_minimo; return <td key={t} className="px-3 py-3 text-center">{item ? <Badge variant={baixo ? 'destructive' : 'secondary'}>{item.estoque_atual}</Badge> : <span className="text-muted-foreground">—</span>}</td>})}<td className="px-3 py-3 text-center font-bold">{total}</td></tr>})}</tbody></table>{filtrados.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</p>}</div></div>
}
