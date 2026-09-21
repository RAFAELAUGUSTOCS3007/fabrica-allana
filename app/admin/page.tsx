import Link from 'next/link'
import { Package, AlertTriangle, TrendingUp, Wallet, Boxes, Trophy } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Produto, Venda } from '@/lib/types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminDashboardPage() {
  const supabase = createServiceClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [produtosResult, vendasMesResult, vendasRecentesResult, vendasTodasResult] = await Promise.all([
    supabase
      .from('produtos')
      .select('id, nome, time, ativo, preco_atacado, custo, produto_tamanhos(id, tamanho, estoque_atual, estoque_minimo)'),
    supabase.from('vendas').select('id, total, data').gte('data', startOfMonth.toISOString()),
    supabase.from('vendas').select('id, itens, total, data, cliente').order('data', { ascending: false }).limit(5),
    supabase.from('vendas').select('itens').order('data', { ascending: false }).limit(500),
  ])

  const produtos = (produtosResult.data ?? []) as unknown as {
    id: string
    nome: string
    time: string
    ativo: boolean
    preco_atacado: number
    custo: number | null
    produto_tamanhos: { id: string; tamanho: string; estoque_atual: number; estoque_minimo: number }[]
  }[]
  const vendasMes = vendasMesResult.data ?? []
  const vendasRecentes = (vendasRecentesResult.data ?? []) as Venda[]
  const vendasTodas = (vendasTodasResult.data ?? []) as { itens: Venda['itens'] }[]

  const produtosAtivos = produtos.filter((p) => p.ativo)
  const estoqueBaixo = produtos
    .flatMap((p) =>
      (p.produto_tamanhos ?? [])
        .filter((t) => t.estoque_atual <= t.estoque_minimo)
        .map((t) => ({ id: t.id, nome: p.nome, time: p.time, tamanho: t.tamanho, estoque_atual: t.estoque_atual })),
    )
  const totalVendidoMes = vendasMes.reduce((sum, v) => sum + Number(v.total ?? 0), 0)

  // Valor total do estoque (a preço de atacado e a custo)
  const valorEstoqueAtacado = produtos.reduce(
    (sum, p) => sum + (p.produto_tamanhos ?? []).reduce((s, t) => s + t.estoque_atual, 0) * Number(p.preco_atacado ?? 0),
    0,
  )
  const valorEstoqueCusto = produtos.reduce(
    (sum, p) => sum + (p.produto_tamanhos ?? []).reduce((s, t) => s + t.estoque_atual, 0) * Number(p.custo ?? 0),
    0,
  )
  const unidadesEmEstoque = produtos.reduce(
    (sum, p) => sum + (p.produto_tamanhos ?? []).reduce((s, t) => s + t.estoque_atual, 0),
    0,
  )

  // Ranking de itens mais vendidos (agregado por produto)
  const vendasPorProduto = new Map<string, { nome: string; time: string; quantidade: number; total: number }>()
  for (const venda of vendasTodas) {
    for (const item of venda.itens ?? []) {
      const atual = vendasPorProduto.get(item.produto_id) ?? {
        nome: item.nome,
        time: item.time,
        quantidade: 0,
        total: 0,
      }
      atual.quantidade += item.quantidade
      atual.total += item.quantidade * item.preco_unitario
      vendasPorProduto.set(item.produto_id, atual)
    }
  }
  const maisVendidos = Array.from(vendasPorProduto.values())
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 6)

  const stats = [
    { label: 'Produtos ativos', value: produtosAtivos.length, icon: Package },
    { label: 'Estoque baixo', value: estoqueBaixo.length, icon: AlertTriangle, alert: estoqueBaixo.length > 0 },
    { label: 'Vendas no mês', value: vendasMes.length, icon: TrendingUp },
    { label: 'Faturado no mês', value: formatBRL(totalVendidoMes), icon: Wallet },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da fábrica A&amp;A Sports.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.alert ? 'text-destructive' : ''}`}>{stat.value}</p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  stat.alert ? 'bg-destructive/10' : 'bg-primary/10'
                }`}
              >
                <stat.icon className={`h-5 w-5 ${stat.alert ? 'text-destructive' : 'text-primary'}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Boxes className="h-4 w-4 text-primary" />
              Valor do estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A preço de atacado</p>
                <p className="text-2xl font-bold">{formatBRL(valorEstoqueAtacado)}</p>
              </div>
              <Badge variant="secondary">{unidadesEmEstoque} un.</Badge>
            </div>
            {valorEstoqueCusto > 0 && (
              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">Investido (a custo)</p>
                <p className="text-sm font-medium">{formatBRL(valorEstoqueCusto)}</p>
              </div>
            )}
            {valorEstoqueCusto > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Margem potencial</p>
                <p className="text-sm font-medium text-primary">{formatBRL(valorEstoqueAtacado - valorEstoqueCusto)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              Mais vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {maisVendidos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
            ) : (
              maisVendidos.map((produto, index) => (
                <div key={`${produto.nome}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">{produto.time}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium">{produto.quantidade} un.</p>
                    <p className="text-xs text-muted-foreground">{formatBRL(produto.total)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estoque baixo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {estoqueBaixo.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo.</p>
            ) : (
              estoqueBaixo.slice(0, 6).map((produto) => (
                <div key={produto.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{produto.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {produto.time} · Tam. {produto.tamanho}
                    </p>
                  </div>
                  <Badge variant="destructive">{produto.estoque_atual} un.</Badge>
                </div>
              ))
            )}
            <Link href="/admin/estoque" className="text-sm font-medium text-primary hover:underline">
              Ver estoque completo →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {vendasRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
            ) : (
              vendasRecentes.map((venda) => (
                <div key={venda.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{venda.cliente || 'Cliente não informado'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(venda.data).toLocaleDateString('pt-BR')} · {venda.itens.length} item(ns)
                    </p>
                  </div>
                  <p className="font-medium">{formatBRL(Number(venda.total))}</p>
                </div>
              ))
            )}
            <Link href="/admin/vendas" className="text-sm font-medium text-primary hover:underline">
              Ver todas as vendas →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
