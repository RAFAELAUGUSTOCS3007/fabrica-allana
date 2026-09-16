import { LoginForm } from './login-form'

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            A&amp;A Sports
          </p>
          <h1 className="mt-2 text-2xl font-bold text-sidebar-foreground">Área administrativa</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/70">
            Entre com a senha da fábrica para gerenciar estoque, produtos e vendas.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
