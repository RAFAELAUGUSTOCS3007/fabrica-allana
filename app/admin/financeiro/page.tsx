import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, Receipt, Percent, AlertTriangle, ArrowUpRight, ArrowDownRight, PackageCheck } from 'lucide-react'
import { FaturamentoMensalChart } from '@/components/admin/dashboard-charts'
import { FinanceReports, type CustomerReport, type ProductReport } from '@/components/admin/finance-reports'
import type { Produto, Venda } from '@/lib/types'

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (value: number) => `${value.toFixed(1).replace('.', ',')}%`

export default async function FinanceiroPage() {
  const supabase = createServiceClient()
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth() - 5, 1)
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const fimComparacaoAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, Math.min(agora.getDate() + 1, new Date(agora.getFullYear(), agora.getMonth(), 0).getDate() + 1))

  const [{ data: vendasData }, { data: produtosData }] = await Promise.all([
    supabase.from('vendas').select('id, itens, total, data, cliente').gte('data', inicio.toISOString()).order('data', { ascending: false }),
    supabase.from('produtos').select('id, custo, preco_atacado, nome, time, produto_tamanhos(estoque_atual, estoque_minimo)'),
  ])

  const vendas = (vendasData ?? []) as Venda[]
  const produtos = (produtosData ?? []) as unknown as (Produto & { produto_tamanhos: { estoque_atual: number; estoque_minimo: number }[] })[]
  const custos = new Map(produtos.map((produto) => [produto.id, Number(produto.custo ?? 0)]))
  const custoItem = (produtoId: string, quantidade: number) => quantidade * (custos.get(produtoId) ?? 0)
  const custoVenda = (venda: Venda) => venda.itens.reduce((sum, item) => sum + custoItem(item.produto_id, item.quantidade), 0)
  const receitaVenda = (venda: Venda) => Number(venda.total)
  const pecasVenda = (venda: Venda) => venda.itens.reduce((total, item) => total + item.quantidade, 0)

  const vendasMes = vendas.filter((venda) => new Date(venda.data) >= inicioMes)
  const vendasComparacao = vendas.filter((venda) => {
    const data = new Date(venda.data)
    return data >= inicioMesAnterior && data < fimComparacaoAnterior
  })
  const somaReceita = (lista: Venda[]) => lista.reduce((sum, venda) => sum + receitaVenda(venda), 0)
  const receitaAtual = somaReceita(vendasMes)
  const receitaAnterior = somaReceita(vendasComparacao)
  const variacaoReceita = receitaAnterior > 0 ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100 : null

  const receita = somaReceita(vendas)
  const custo = vendas.reduce((sum, venda) => sum + custoVenda(venda), 0)
  const lucro = receita - custo
  const pecas = vendas.reduce((sum, venda) => sum + pecasVenda(venda), 0)
  const semCusto = produtos.filter((produto) => produto.custo == null).length

  const mensal = Array.from({ length: 6 }, (_, index) => {
    const mes = new Date(agora.getFullYear(), agora.getMonth() - 5 + index, 1)
    const fim = new Date(mes.getFullYear(), mes.getMonth() + 1, 1)
    const lista = vendas.filter((venda) => { const data = new Date(venda.data); return data >= mes && data < fim })
    const faturamento = somaReceita(lista)
    return { mes: mes.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), faturamento, lucro: faturamento - lista.reduce((sum, venda) => sum + custoVenda(venda), 0) }
  })

  const times = new Map<string, { receita: number; lucro: number }>()
  const tamanhos = new Map<string, number>()
  const produtosRanking = new Map<string, ProductReport>()
  for (const venda of vendas) {
    for (const item of venda.itens) {
      const receitaItem = item.preco_unitario * item.quantidade
      const lucroItem = receitaItem - custoItem(item.produto_id, item.quantidade)
      const time = times.get(item.time) ?? { receita: 0, lucro: 0 }
      time.receita += receitaItem
      time.lucro += lucroItem
      times.set(item.time, time)
      tamanhos.set(item.tamanho, (tamanhos.get(item.tamanho) ?? 0) + item.quantidade)
      const produto = produtosRanking.get(item.produto_id) ?? { nome: item.nome, time: item.time, pecas: 0, receita: 0, lucro: 0, margem: 0 }
      produto.pecas += item.quantidade
      produto.receita += receitaItem
      produto.lucro += lucroItem
      produto.margem = produto.receita > 0 ? (produto.lucro / produto.receita) * 100 : 0
      produtosRanking.set(item.produto_id, produto)
    }
  }

  const clientesMap = new Map<string, { nome: string; pedidos: number; receita: number; ultimo: Date }>()
  for (const venda of vendas) {
    const nome = venda.cliente?.trim()
    if (!nome) continue
    const chave = nome.toLocaleLowerCase('pt-BR')
    const atual = clientesMap.get(chave) ?? { nome, pedidos: 0, receita: 0, ultimo: new Date(0) }
    atual.pedidos += 1
    atual.receita += receitaVenda(venda)
    const data = new Date(venda.data)
    if (data > atual.ultimo) atual.ultimo = data
    clientesMap.set(chave, atual)
  }

  const porTime = Array.from(times, ([time, valores]) => ({ time, ...valores })).sort((a, b) => b.receita - a.receita).slice(0, 8)
  const porTamanho = Array.from(tamanhos, ([tamanho, quantidade]) => ({ tamanho, pecas: quantidade })).sort((a, b) => Number(a.tamanho) - Number(b.tamanho))
  const rankingProdutos = Array.from(produtosRanking.values()).sort((a, b) => b.receita - a.receita).slice(0, 10)
  const clientes: CustomerReport[] = Array.from(clientesMap.values()).filter((cliente) => cliente.pedidos > 1).sort((a, b) => b.receita - a.receita).slice(0, 9).map((cliente) => ({ nome: cliente.nome, pedidos: cliente.pedidos, receita: cliente.receita, ultimoPedido: cliente.ultimo.toLocaleDateString('pt-BR') }))

  const cards = [
    { label: 'Receita no mês', value: brl(receitaAtual), hint: variacaoReceita == null ? 'sem base no mês anterior' : 'vs. mesmo período anterior', icon: Wallet, trend: variacaoReceita },
    { label: 'Lucro bruto (6 meses)', value: brl(lucro), hint: 'receita menos custo cadastrado', icon: TrendingUp },
    { label: 'Margem bruta', value: receita ? pct((lucro / receita) * 100) : '0%', hint: `${pecas} peças em 6 meses`, icon: Percent },
    { label: 'Ticket médio', value: brl(vendas.length ? receita / vendas.length : 0), hint: `${vendas.length} pedidos registrados`, icon: Receipt },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Controle do negócio</p><h1 className="text-2xl font-bold">Financeiro e desempenho</h1><p className="text-sm text-muted-foreground">Descubra o que vende, o que dá margem e quais clientes voltam a comprar.</p></div>
      {semCusto > 0 && <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" /><p><strong>{semCusto} produtos sem custo cadastrado.</strong> O lucro desses itens considera custo zero. Cadastre o custo para manter os relatórios confiáveis.</p></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Card key={card.label}><CardContent className="flex flex-col gap-3 pt-6"><div className="flex justify-between gap-3"><p className="text-sm text-muted-foreground">{card.label}</p><card.icon className="size-4 shrink-0 text-primary" /></div><p className="text-2xl font-bold tabular-nums">{card.value}</p><div className="flex items-center gap-2 text-xs text-muted-foreground">{'trend' in card && typeof card.trend === 'number' && <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${card.trend >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{card.trend >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(card.trend).toFixed(0)}%</span>}<span>{card.hint}</span></div></CardContent></Card>)}</div>
      <FaturamentoMensalChart data={mensal} />
      <FinanceReports porTime={porTime} porTamanho={porTamanho} produtos={rankingProdutos} clientes={clientes} />
      <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Saúde da operação</CardTitle><CardDescription>Números para decisões rápidas</CardDescription></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex justify-between border-b pb-3"><span className="text-muted-foreground">Custo dos produtos vendidos</span><strong>{brl(custo)}</strong></div><div className="flex justify-between border-b pb-3"><span className="text-muted-foreground">Peças por pedido</span><strong>{vendas.length ? (pecas / vendas.length).toFixed(1).replace('.', ',') : '0'}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Produtos com estoque baixo</span><strong>{produtos.filter((produto) => produto.produto_tamanhos.some((tamanho) => tamanho.estoque_atual <= tamanho.estoque_minimo)).length}</strong></div></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><PackageCheck className="size-4 text-primary" />Como usar estes dados</CardTitle><CardDescription>Ações sugeridas para a Allana</CardDescription></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>Reponha primeiro os tamanhos com maior saída nos times de maior receita.</p><p>Divulgue novamente para clientes recorrentes quando chegar reposição dos times preferidos.</p><p>Revise produtos com bom volume e margem baixa antes de fazer promoção.</p></CardContent></Card></div>
      <p className="text-xs text-muted-foreground">Margens são estimadas pelo custo atual cadastrado. Para histórico contábil exato, o custo precisa ser gravado no momento de cada venda.</p>
    </div>
  )
}

export const dynamic = 'force-dynamic'
