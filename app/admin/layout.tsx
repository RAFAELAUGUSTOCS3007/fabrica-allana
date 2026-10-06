import type React from 'react'
import { QuickSearch } from '@/components/admin/quick-search'
import { AdminDesktopBar, AdminMobileBar, AdminSidebar } from '@/components/admin/admin-sidebar'
import { isAdminSession } from '@/lib/admin-guard'

export const metadata = {
  title: 'Administração | A&A Sports',
  description: 'Gestão de produtos, estoque, vendas e desempenho da A&A Sports.',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const logado = await isAdminSession()

  if (!logado) return <>{children}</>

  return (
    <div className="flex min-h-dvh bg-muted/40">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminDesktopBar />
        <AdminMobileBar />
        <main className="admin-workspace mx-auto w-full min-w-0 max-w-6xl px-4 py-6 md:px-6 md:py-8"><QuickSearch />{children}</main>
      </div>
    </div>
  )
}
