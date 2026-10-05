import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, Receipt, Percent, AlertTriangle } from 'lucide-react'
import { FaturamentoMensalChart } from '@/components/admin/dashboard-charts'
import type { Produto, Venda } from '@/lib/types'

function brl(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function pct(value: number) { return `${value.toFixed(1).replace('.', ',')}%` }

export default async function FinanceiroPage() {
  const supabase = createServiceClient()
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth() - 5, 1)
  const [{ data: vendasData }, { data: produtosData }] = await Promise.all([
    supabase.from('vendas').select('id, itens, total, data, cliente').gte('data', inicio.toISOString()).order('data', { ascending: false }),
    supabase.from('produtos').select('id, custo, preco_atacado, nome, time, produto_tamanhos(estoque_atual, estoque_minimo)'),
  ])
  const vendas = (vendasData ?? []) as Venda[]
  const produtos = (produtosData ?? []) as unknown as (Produto & { produto_tamanhos: { estoque_atual: number; estoque_minimo: number }[] })[]
  const custos = new Map(produtos.map((p) => [p.id, Number(p.custo ?? 0)]))
  const custoVenda = (v: Venda) => v.itens.reduce((sum, i) => sum + i.quantidade * (custos.get(i.produto_id) ?? 0), 0)
  const receita = vendas.reduce((sum, v) => sum + Number(v.total), 0)
  const custo = vendas.reduce((sum, v) => sum + custoVenda(v), 0)
  const lucro = receita - custo
  const pecas = vendas.reduce((sum, v) => sum + v.itens.reduce((n, i) => n + i.quantidade, 0), 0)
  const semCusto = produtos.filter((p) => p.custo == null).length
  const mensal = Array.from({ length: 6 }, (_, i) => {
    const mes = new Date(agora.getFullYear(), agora.getMonth() - 5 + i, 1)
    const fim = new Date(mes.getFullYear(), mes.getMonth() + 1, 1)
    const lista = vendas.filter((v) => { const d = new Date(v.data); return d >= mes && d < fim })
    const faturamento = lista.reduce((s, v) => s + Number(v.total), 0)
    return { mes: mes.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), faturamento, lucro: faturamento - lista.reduce((s, v) => s + custoVenda(v), 0) }
  })
  const cards = [
    { label: 'Receita bruta', value: brl(receita), hint: `${vendas.length} pedidos registrados`, icon: Wallet },
    { label: 'Lucro bruto estimado', value: brl(lucro), hint: 'receita menos custo dos produtos', icon: TrendingUp },
    { label: 'Margem bruta', value: receita ? pct((lucro / receita) * 100) : '0%', hint: `${pecas} peças vendidas`, icon: Percent },
    { label: 'Ticket médio', value: brl(vendas.length ? receita / vendas.length : 0), hint: 'média por pedido', icon: Receipt },
  ]
  return <div className="flex flex-col gap-6">
    <div><h1 className="text-2xl font-bold">Financeiro</h1><p className="text-sm text-muted-foreground">Visão prática do dinheiro que entra, custos e rentabilidade da Allana.</p></div>
    {semCusto > 0 && <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" /><p><strong>{semCusto} produtos sem custo cadastrado.</strong> O lucro estimado desses itens considera custo zero. Cadastre o custo para uma margem confiável.</p></div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <Card key={card.label}><CardContent className="flex flex-col gap-3 pt-6"><div className="flex justify-between"><p className="text-sm text-muted-foreground">{card.label}</p><card.icon className="size-4 text-primary" /></div><p className="text-2xl font-bold tabular-nums">{card.value}</p><p className="text-xs text-muted-foreground">{card.hint}</p></CardContent></Card>)}</div>
    <FaturamentoMensalChart data={mensal} />
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Leitura do negócio</CardTitle><CardDescription>Indicadores para decisões rápidas</CardDescription></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex justify-between border-b pb-3"><span className="text-muted-foreground">Custo dos produtos vendidos</span><strong>{brl(custo)}</strong></div><div className="flex justify-between border-b pb-3"><span className="text-muted-foreground">Peças por pedido</span><strong>{vendas.length ? (pecas / vendas.length).toFixed(1).replace('.', ',') : '0'}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Produtos com estoque baixo</span><strong>{produtos.filter((p) => p.produto_tamanhos.some((t) => t.estoque_atual <= t.estoque_minimo)).length}</strong></div></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Próximas decisões</CardTitle><CardDescription>Checklist operacional</CardDescription></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>• Atualizar custos quando houver mudança de fornecedor.</p><p>• Comparar a margem dos times mais vendidos.</p><p>• Separar despesas de frete e embalagem das vendas.</p></CardContent></Card></div>
  </div>
}

export const dynamic = 'force-dynamic'
