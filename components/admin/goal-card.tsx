'use client'

import { useState, useTransition } from 'react'
import { Pencil, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateMetaMensalAction } from '@/app/admin/actions/meta'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function GoalRing({ percent, size = 132, stroke = 12, className }: { percent: number; size?: number; stroke?: number; className?: string }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(percent, 0), 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label={`${clamped.toFixed(0)}% da meta`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-[stroke-dashoffset] duration-1000 ease-out"
      />
    </svg>
  )
}

export function GoalCard({ faturado, meta }: { faturado: number; meta: number }) {
  const [open, setOpen] = useState(false)
  const [valor, setValor] = useState(String(meta || ''))
  const [isPending, startTransition] = useTransition()

  const agora = new Date()
  const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate()
  const diaAtual = agora.getDate()
  const diasRestantes = Math.max(diasNoMes - diaAtual, 0)
  const percent = meta > 0 ? (faturado / meta) * 100 : 0
  const projecao = (faturado / diaAtual) * diasNoMes
  const falta = Math.max(meta - faturado, 0)
  const porDia = diasRestantes > 0 ? falta / diasRestantes : falta
  const noRitmo = meta > 0 && projecao >= meta

  const salvar = () =>
    startTransition(async () => {
      const result = await updateMetaMensalAction(Number(valor.replace(',', '.')))
      if (result.error) toast.error(result.error)
      else {
        toast.success('Meta atualizada.')
        setOpen(false)
      }
    })

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" aria-hidden="true" />
            Meta do mês
          </CardTitle>
          <CardDescription>
            {meta > 0 ? `${diasRestantes} ${diasRestantes === 1 ? 'dia restante' : 'dias restantes'} em ${agora.toLocaleDateString('pt-BR', { month: 'long' })}` : 'Defina uma meta para acompanhar o ritmo de vendas.'}
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            <Pencil data-icon="inline-start" />
            {meta > 0 ? 'Editar' : 'Definir meta'}
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Meta de faturamento</DialogTitle>
              <DialogDescription>Quanto você quer faturar neste mês?</DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                salvar()
              }}
            >
              <Label htmlFor="meta-valor">Valor (R$)</Label>
              <Input id="meta-valor" inputMode="decimal" autoFocus value={valor} onChange={(event) => setValor(event.target.value)} placeholder="20000" />
              <DialogFooter className="mt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Salvando...' : 'Salvar meta'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex shrink-0 items-center justify-center text-primary">
          <GoalRing percent={percent} />
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-3xl font-extrabold tabular-nums text-foreground">{percent.toFixed(0)}%</span>
            <span className="text-xs text-muted-foreground">atingido</span>
          </div>
        </div>
        <dl className="grid w-full grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">Faturado</dt>
            <dd className="text-lg font-bold tabular-nums">{formatBRL(faturado)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Meta</dt>
            <dd className="text-lg font-bold tabular-nums">{meta > 0 ? formatBRL(meta) : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Projeção do mês</dt>
            <dd className={noRitmo ? 'text-lg font-bold tabular-nums text-primary' : 'text-lg font-bold tabular-nums'}>{formatBRL(projecao)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{falta > 0 ? 'Necessário por dia' : 'Status'}</dt>
            <dd className="text-lg font-bold tabular-nums">{meta === 0 ? '—' : falta > 0 ? formatBRL(porDia) : 'Meta batida'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
