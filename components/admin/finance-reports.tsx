'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const teamConfig = {
  receita: { label: 'Receita', color: 'var(--chart-1)' },
  lucro: { label: 'Lucro', color: 'var(--chart-3)' },
} satisfies ChartConfig

const sizeConfig = {
  pecas: { label: 'Peças', color: 'var(--chart-2)' },
} satisfies ChartConfig

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const compact = (value: number) => value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })

export type ProductReport = {
  nome: string
  time: string
  pecas: number
  receita: number
  lucro: number
  margem: number
}

export type CustomerReport = {
  nome: string
  pedidos: number
  receita: number
  ultimoPedido: string
}

export function FinanceReports({
  porTime,
  porTamanho,
  produtos,
  clientes,
}: {
  porTime: { time: string; receita: number; lucro: number }[]
  porTamanho: { tamanho: string; pecas: number }[]
  produtos: ProductReport[]
  clientes: CustomerReport[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receita e lucro por time</CardTitle>
          <CardDescription>Quais clubes realmente movimentam e rentabilizam o catálogo</CardDescription>
        </CardHeader>
        <CardContent>
          {porTime.length === 0 ? (
            <Empty />
          ) : (
            <ChartContainer config={teamConfig} className="aspect-auto h-72 w-full">
              <BarChart data={porTime} layout="vertical" margin={{ left: 0, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={compact} />
                <YAxis dataKey="time" type="category" tickLine={false} axisLine={false} width={92} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => brl(Number(value))} />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="lucro" fill="var(--color-lucro)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tamanhos com maior saída</CardTitle>
          <CardDescription>Peças vendidas por tamanho no período analisado</CardDescription>
        </CardHeader>
        <CardContent>
          {porTamanho.length === 0 ? (
            <Empty />
          ) : (
            <ChartContainer config={sizeConfig} className="aspect-auto h-72 w-full">
              <BarChart data={porTamanho} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="tamanho" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} peças`} />} />
                <Bar dataKey="pecas" fill="var(--color-pecas)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Rentabilidade por produto</CardTitle>
          <CardDescription>Ranking por receita, com volume e margem estimada</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {produtos.length === 0 ? <Empty /> : (
            <table className="w-full min-w-[680px] text-sm">
              <thead className="border-b text-left text-xs text-muted-foreground">
                <tr><th className="pb-3 font-medium">Produto</th><th className="pb-3 font-medium">Peças</th><th className="pb-3 font-medium">Receita</th><th className="pb-3 font-medium">Lucro</th><th className="pb-3 text-right font-medium">Margem</th></tr>
              </thead>
              <tbody>{produtos.map((produto, index) => (
                <tr key={`${produto.nome}-${produto.time}`} className="border-b last:border-0">
                  <td className="py-3"><div className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><div><p className="font-medium">{produto.nome}</p><p className="text-xs text-muted-foreground">{produto.time}</p></div></div></td>
                  <td className="py-3 tabular-nums">{produto.pecas}</td><td className="py-3 tabular-nums">{brl(produto.receita)}</td><td className="py-3 tabular-nums">{brl(produto.lucro)}</td><td className="py-3 text-right"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${produto.margem >= 30 ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold-foreground'}`}>{produto.margem.toFixed(1).replace('.', ',')}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Clientes recorrentes</CardTitle>
          <CardDescription>Quem já comprou mais de uma vez e merece atenção de pós-venda</CardDescription>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Cadastre o nome do cliente nas vendas para acompanhar recompra.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{clientes.map((cliente) => (
              <div key={cliente.nome} className="rounded-xl border bg-secondary/35 p-4">
                <div className="flex items-start justify-between gap-3"><p className="font-semibold text-pretty">{cliente.nome}</p><span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{cliente.pedidos} pedidos</span></div>
                <p className="mt-3 text-lg font-bold tabular-nums">{brl(cliente.receita)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Último pedido em {cliente.ultimoPedido}</p>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Empty() {
  return <p className="py-20 text-center text-sm text-muted-foreground">Ainda não há vendas suficientes para este relatório.</p>
}
