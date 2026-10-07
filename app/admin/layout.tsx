import type React from 'react'
import { QuickSearch } from '@/components/admin/quick-search'
import { AdminDesktopBar, AdminMobileBar, AdminSidebar } from '@/components/admin/admin-sidebar'
import { MobileAdminDock } from '@/components/admin/mobile-admin-dock'
import { NotificationCenter } from '@/components/admin/notification-center'
import { RouteProgress } from '@/components/admin/route-progress'
import { isAdminSession } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = {
  title: 'Administração | A&A Sports',
  description: 'Gestão de produtos, estoque, vendas e desempenho da A&A Sports.',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const logado = await isAdminSession()

  if (!logado) return <>{children}</>

  const supabase = createServiceClient()
  const { data: produtos } = await supabase.from('produtos').select('id, nome, foto_url, ativo, produto_tamanhos(id, tamanho, estoque_atual, estoque_minimo)').limit(100)
  const pendencias = (produtos ?? []).flatMap(produto => {
    const itens = []
    if (!produto.foto_url) itens.push({ id: `foto-${produto.id}`, titulo: 'Produto sem foto', descricao: produto.nome, href: '/admin/produtos', tipo: 'foto' as const })
    if (!produto.ativo) itens.push({ id: `inativo-${produto.id}`, titulo: 'Produto inativo', descricao: produto.nome, href: '/admin/produtos', tipo: 'inativo' as const })
    for (const tamanho of produto.produto_tamanhos ?? []) if (tamanho.estoque_atual <= tamanho.estoque_minimo) itens.push({ id: `estoque-${tamanho.id}`, titulo: tamanho.estoque_atual === 0 ? 'Tamanho esgotado' : 'Estoque abaixo do mínimo', descricao: `${produto.nome} · Tam. ${tamanho.tamanho} · ${tamanho.estoque_atual} un.`, href: '/admin/estoque', tipo: 'estoque' as const })
    return itens
  }).slice(0, 30)

  return (
    <div className="flex min-h-dvh bg-muted/40">
      <RouteProgress />
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminDesktopBar notificationCenter={<NotificationCenter pendencias={pendencias} />} />
        <AdminMobileBar notificationCenter={<NotificationCenter pendencias={pendencias} />} />
        <main className="admin-workspace mx-auto w-full min-w-0 max-w-6xl px-4 py-6 pb-28 md:px-6 md:py-8"><QuickSearch />{children}</main>
        <MobileAdminDock />
      </div>
    </div>
  )
}
