'use client'

import Link from 'next/link'
import { AlertTriangle, Bell, CameraOff, CheckCircle2, PackageX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

type Pendencia = { id: string; titulo: string; descricao: string; href: string; tipo: 'estoque' | 'foto' | 'inativo' }

const icons = { estoque: AlertTriangle, foto: CameraOff, inativo: PackageX }

export function NotificationCenter({ pendencias }: { pendencias: Pendencia[] }) {
  return <Sheet><SheetTrigger render={<Button variant="outline" size="icon" className="relative" aria-label={`${pendencias.length} pendências`} />}><Bell />{pendencias.length > 0 && <Badge variant="destructive" className="absolute -right-2 -top-2 min-w-5 justify-center px-1 text-[10px]">{pendencias.length > 9 ? '9+' : pendencias.length}</Badge>}</SheetTrigger><SheetContent className="overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>Central de pendências</SheetTitle><SheetDescription>Prioridades operacionais identificadas automaticamente.</SheetDescription></SheetHeader><div className="flex flex-col gap-3 p-4">{pendencias.length === 0 ? <div className="flex flex-col items-center gap-3 py-16 text-center"><CheckCircle2 className="size-10 text-primary"/><div><p className="font-semibold">Tudo em dia</p><p className="text-sm text-muted-foreground">Nenhuma pendência crítica agora.</p></div></div> : pendencias.map(pendencia => { const Icon = icons[pendencia.tipo]; return <Link key={pendencia.id} href={pendencia.href} className="group flex gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Icon className="size-4"/></span><span className="min-w-0 flex-1"><span className="block font-medium">{pendencia.titulo}</span><span className="mt-1 block text-sm text-muted-foreground">{pendencia.descricao}</span></span></Link> })}</div></SheetContent></Sheet>
}
