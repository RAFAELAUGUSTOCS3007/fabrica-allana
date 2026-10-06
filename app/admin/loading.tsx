import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return <div role="status" aria-label="Carregando painel" className="flex flex-col gap-6"><Skeleton className="h-32 w-full rounded-2xl" /><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map(item => <Skeleton key={item} className="h-28 rounded-2xl" />)}</div><Skeleton className="h-80 w-full rounded-2xl" /><span className="sr-only">Carregando informações…</span></div>
}
