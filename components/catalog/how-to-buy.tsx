import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react'

const steps = [
  { number: '01', icon: ShoppingBag, title: 'Escolha os conjuntos', description: 'Navegue pelo catálogo, selecione os tamanhos e informe as quantidades.' },
  { number: '02', icon: CheckCircle2, title: 'Revise seu pedido', description: 'Confira modelos, peças e o valor total diretamente no carrinho.' },
  { number: '03', icon: MessageCircle, title: 'Finalize com a fábrica', description: 'Envie o resumo pelo WhatsApp para combinar pagamento, frete e prazo.' },
]

export function HowToBuy() {
  return (
    <section id="como-comprar" className="sport-texture relative isolate overflow-hidden bg-primary py-16 text-primary-foreground sm:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">Simples do início ao fim</p>
          <h2 className="font-display mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">Como comprar com a A&amp;A Sports</h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70 sm:text-base">Monte seu pedido com tranquilidade e finalize diretamente com quem fabrica.</p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <li key={number} className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gold text-gold-foreground"><Icon className="size-5" aria-hidden="true" /></span>
                <span className="font-display text-4xl font-extrabold text-white/10">{number}</span>
              </div>
              <h3 className="font-display mt-8 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/65">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
