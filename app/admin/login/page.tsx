import { Logo } from '@/components/catalog/logo'
import { LoginForm } from './login-form'

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh bg-sidebar lg:grid-cols-2">
      <section className="relative hidden min-h-dvh overflow-hidden lg:flex lg:flex-col lg:justify-end lg:p-14">
        <img src="/images/hero.png" alt="Coleção esportiva A&A Sports" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-sidebar/60 to-sidebar/20" />
        <div className="relative max-w-lg text-sidebar-foreground"><p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-gold">A&A Sports · Gestão da fábrica</p><h2 className="font-display text-5xl font-extrabold leading-tight">Grandes resultados começam nos detalhes.</h2><p className="mt-6 text-base leading-relaxed text-sidebar-foreground/80">Do primeiro conjunto ao próximo grande pedido. Tudo organizado para o seu negócio crescer.</p><div className="mt-10 h-1 w-16 rounded-full bg-gold" /></div>
      </section>
      <section className="flex items-center justify-center px-6 py-16 lg:border-l lg:border-sidebar-border">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo onDark className="items-center" />
          <h1 className="mt-4 text-2xl font-bold text-sidebar-foreground">Área administrativa</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/70">
            Entre com a senha da fábrica para gerenciar estoque, produtos e vendas.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-sidebar-foreground/60">Acesso restrito à equipe A&A Sports.</p>
        <a href="/" className="mt-6 block text-center text-sm text-gold underline-offset-4 hover:underline">Voltar ao catálogo</a>
      </div>
      </section>
    </main>
  )
}
