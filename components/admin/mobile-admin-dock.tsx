'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes, Camera, LayoutDashboard, Plus, Receipt, Shirt } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const items = [{ href: '/admin', label: 'Início', icon: LayoutDashboard }, { href: '/admin/produtos', label: 'Produtos', icon: Shirt }, { href: '/admin/estoque', label: 'Estoque', icon: Boxes }, { href: '/admin/vendas', label: 'Vendas', icon: Receipt }]

export function MobileAdminDock() {
  const pathname = usePathname()
  const [scannerOpen, setScannerOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => { if (!scannerOpen) return; let stream: MediaStream | undefined; navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } }).then(value => { stream = value; if (videoRef.current) videoRef.current.srcObject = value }).catch(() => toast.error('Não foi possível acessar a câmera. Verifique a permissão do navegador.')); return () => stream?.getTracks().forEach(track => track.stop()) }, [scannerOpen])
  return <><nav aria-label="Navegação administrativa mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">{items.slice(0,2).map(item => <DockItem key={item.href} {...item} active={item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)}/>)}<Sheet><SheetTrigger render={<Button size="icon" className="mx-auto -mt-6 size-14 rounded-full shadow-lg" aria-label="Abrir ações rápidas"/>}><Plus /></SheetTrigger><SheetContent side="bottom" className="rounded-t-3xl"><SheetHeader><SheetTitle>Ação rápida</SheetTitle><SheetDescription>O que você quer registrar agora?</SheetDescription></SheetHeader><div className="grid grid-cols-2 gap-3 p-4"><Link href="/admin/produtos" className="rounded-xl border p-4 font-medium hover:bg-muted"><Shirt className="mb-3 size-5 text-primary"/>Novo produto</Link><Link href="/admin/vendas" className="rounded-xl border p-4 font-medium hover:bg-muted"><Receipt className="mb-3 size-5 text-primary"/>Nova venda</Link><Link href="/admin/estoque" className="rounded-xl border p-4 font-medium hover:bg-muted"><Boxes className="mb-3 size-5 text-primary"/>Movimentar estoque</Link><button type="button" onClick={() => setScannerOpen(true)} className="rounded-xl border p-4 text-left font-medium hover:bg-muted"><Camera className="mb-3 size-5 text-primary"/>Ler etiqueta</button></div></SheetContent></Sheet>{items.slice(2).map(item => <DockItem key={item.href} {...item} active={pathname.startsWith(item.href)}/>)}</nav><Dialog open={scannerOpen} onOpenChange={setScannerOpen}><DialogContent><DialogHeader><DialogTitle>Leitor de etiquetas</DialogTitle><DialogDescription>Aponte a câmera para a etiqueta. O leitor prepara o fluxo para identificação por código de barras.</DialogDescription></DialogHeader><div className="overflow-hidden rounded-2xl bg-black"><video ref={videoRef} autoPlay muted playsInline className="aspect-[3/4] w-full object-cover"/></div><Button onClick={() => { setScannerOpen(false); window.location.href = '/admin/estoque' }}>Continuar para movimentação manual</Button></DialogContent></Dialog></>
}

function DockItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof LayoutDashboard; active: boolean }) { return <Link href={href} aria-current={active ? 'page' : undefined} className={cn('flex flex-col items-center gap-1 text-[10px] font-medium text-muted-foreground', active && 'text-primary')}><Icon className="size-5"/><span>{label}</span></Link> }
