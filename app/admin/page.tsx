import Link from 'next/link'
import { Package, AlertTriangle, TrendingUp, Wallet } from 'lucide-react'
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

  const [produtosResult, vendasMesResult, vendasRecentesResult] = await Promise.all([
    supabase.from('produtos').select('id, nome, time, tamanho, estoque_atual, estoque_minimo, ativo'),
    supabase.from('vendas').select('id, total, data').gte('data', startOfMonth.toISOString()),
    supabase.from('vendas').select('id, itens, total, data, cliente').order('data', { ascending: false }).limit(5),
  ])

  const produtos = (produtosResult.data ?? []) as Pick<
    Produto,
    'id' | 'nome' | 'time' | 'tamanho' | 'estoque_atual' | 'estoque_minimo' | 'ativo'
  >[]
  const vendasMes = vendasMesResult.data ?? []
  const vendasRecentes = (vendasRecentesResult.data ?? []) as Venda[]

  const produtosAtivos = produtos.filter((p) => p.ativo)
  const estoqueBaixo = produtos.filter((p) => p.estoque_atual <= p.estoque_minimo)
  const totalVendidoMes = vendasMes.reduce((sum, v) => sum + Number(v.total ?? 0), 0)

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
