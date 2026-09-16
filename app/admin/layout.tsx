import type React from 'react'
import { Toaster } from 'sonner'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-muted/40">
      <AdminSidebar />
      <div className="flex-1">
        <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
