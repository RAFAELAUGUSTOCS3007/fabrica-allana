import type React from 'react'
import { AdminDesktopBar, AdminMobileBar, AdminSidebar } from '@/components/admin/admin-sidebar'
import { isAdminSession } from '@/lib/admin-guard'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const logado = await isAdminSession()

  if (!logado) return <>{children}</>

  return (
    <div className="flex min-h-dvh bg-muted/40">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminDesktopBar />
        <AdminMobileBar />
        <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  )
}
