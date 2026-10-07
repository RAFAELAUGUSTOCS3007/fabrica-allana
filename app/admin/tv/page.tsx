import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/admin-guard'
import { getMetaMensal } from '@/app/admin/actions/meta'
import { GoalRing } from '@/components/admin/goal-card'
import { TvControls } from '@/components/admin/tv-controls'
import type { Venda } from '@/lib/types'

export const metadata = { title: 'Modo TV | A&A Sports' }

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export default async function ModoTvPage() {
  if (!(await isAdminSession())) redirect('/admin/login')

  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

  const supabase = createServiceClient()
  const [{ data }, meta] = await Promise.all([
    supabase.from('vendas').select('id, itens, total, data, cliente').gte('data', inicioMes.toISOString()).order('data', { ascending: false }).limit(5000),
    getMetaMensal(),
  ])
  const vendasMes = (data ?? []) as Venda[]
  const vendasHoje = vendasMes.filter((v) => new Date(v.data) >= inicioDia)

  const faturadoMes = vendasMes.reduce((s, v) => s + Number(v.total ?? 0), 0)
  const faturadoHoje = vendasHoje.reduce((s, v) => s + Number(v.total ?? 0), 0)
  const pecasHoje = vendasHoje.reduce((s, v) => s + (v.itens ?? []).reduce((a, i) => a + i.quantidade, 0), 0)
  const percent = meta > 0 ? (faturadoMes / meta) * 100 : 0

  const ranking = new Map<string, { nome: string; time: string; quantidade: number }>()
  for (const venda of vendasMes) {
    for (const item of venda.itens ?? []) {
      const atual = ranking.get(item.produto_id) ?? { nome: item.nome, time: item.time, quantidade: 0 }
      atual.quantidade += item.quantidade
      ranking.set(item.produto_id, atual)
    }
  }
  const top = Array.from(ranking.values()).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)
  const maxTop = top[0]?.quantidade ?? 1

  return (
    <div className="sport-texture fixed inset-0 z-[90] flex flex-col gap-6 overflow-auto bg-primary p-6 text-primary-foreground lg:p-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">A&amp;A Sports · Ao vivo</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight lg:text-5xl">Placar de vendas</h1>
        </div>
        <TvControls />
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/5 p-8 ring-1 ring-white/10" aria-label="Meta do mês">
          <div className="relative flex items-center justify-center">
            <GoalRing percent={percent} size={260} stroke={20} />
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-6xl font-extrabold tabular-nums">{percent.toFixed(0)}%</span>
              <span className="text-sm text-primary-foreground/70">da meta</span>
            </div>
          </div>
          <p className="text-center text-lg text-primary-foreground/80">
            <span className="font-bold text-primary-foreground">{formatBRL(faturadoMes)}</span>
            {meta > 0 ? ` de ${formatBRL(meta)}` : ' no mês'}
          </p>
        </section>

        <section className="flex flex-col gap-6" aria-label="Hoje">
          {[
            { label: 'Faturado hoje', value: formatBRL(faturadoHoje) },
            { label: 'Vendas hoje', value: vendasHoje.length },
            { label: 'Peças hoje', value: pecasHoje },
          ].map((item) => (
            <div key={item.label} className="flex flex-1 flex-col justify-center rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">{item.label}</p>
              <p className="font-display text-5xl font-extrabold tabular-nums lg:text-6xl">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10" aria-label="Mais vendidos do mês">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Trophy className="size-5 text-gold" aria-hidden="true" />
            Mais vendidos do mês
          </h2>
          {top.length === 0 ? (
            <p className="text-primary-foreground/70">Nenhuma venda registrada neste mês.</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {top.map((produto, index) => (
                <li key={`${produto.nome}-${index}`} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-lg font-semibold">
                      <span className="mr-2 text-gold">{index + 1}.</span>
                      {produto.nome}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums">{produto.quantidade} un.</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${(produto.quantidade / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
          {vendasHoje[0] && (
            <p className="mt-auto border-t border-white/10 pt-4 text-sm text-primary-foreground/70">
              Última venda: <span className="font-semibold text-primary-foreground">{vendasHoje[0].cliente || 'Cliente'}</span> · {formatBRL(Number(vendasHoje[0].total))} às{' '}
              {new Date(vendasHoje[0].data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </section>
      </div>
      <p className="text-center text-xs text-primary-foreground/50">Atualiza automaticamente a cada minuto</p>
    </div>
  )
}
