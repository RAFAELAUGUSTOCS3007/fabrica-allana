'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatCompact(value: number) {
  return value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
}

const mensalConfig = {
  faturamento: { label: 'Faturamento', color: 'var(--chart-1)' },
  lucro: { label: 'Lucro estimado', color: 'var(--chart-3)' },
} satisfies ChartConfig

const diarioConfig = {
  faturamento: { label: 'Faturamento', color: 'var(--chart-1)' },
} satisfies ChartConfig

const timeConfig = {
  pecas: { label: 'Peças vendidas', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function FaturamentoMensalChart({ data }: { data: { mes: string; faturamento: number; lucro: number }[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Faturamento e lucro</CardTitle>
        <CardDescription>Últimos 6 meses · lucro calculado pelo custo cadastrado</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={mensalConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillFaturamento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-faturamento)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-faturamento)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-lucro)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-lucro)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={formatCompact} />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value, name) => `${mensalConfig[name as keyof typeof mensalConfig]?.label}: ${formatBRL(Number(value))}`} />}
            />
            <Area dataKey="faturamento" type="monotone" stroke="var(--color-faturamento)" strokeWidth={2} fill="url(#fillFaturamento)" />
            <Area dataKey="lucro" type="monotone" stroke="var(--color-lucro)" strokeWidth={2} fill="url(#fillLucro)" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function VendasDiariasChart({ data }: { data: { dia: string; faturamento: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vendas por dia</CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={diarioConfig} className="aspect-auto h-56 w-full">
          <BarChart data={data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatCompact} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatBRL(Number(value))} />} />
            <Bar dataKey="faturamento" fill="var(--color-faturamento)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function VendasPorTimeChart({ data }: { data: { time: string; pecas: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Times que mais vendem</CardTitle>
        <CardDescription>Peças vendidas nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
        ) : (
          <ChartContainer config={timeConfig} className="aspect-auto h-56 w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="time" type="category" tickLine={false} axisLine={false} width={96} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} peças`} />} />
              <Bar dataKey="pecas" fill="var(--color-pecas)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
