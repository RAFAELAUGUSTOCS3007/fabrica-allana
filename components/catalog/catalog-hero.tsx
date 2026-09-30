import Image from 'next/image'
import { ArrowDown, Factory, Truck, BadgePercent } from 'lucide-react'

// Troque para '/images/hero.jpg' quando a foto for adicionada em public/images.
const HERO_IMAGE: string | null = null

const destaques = [
  { icon: Factory, label: 'Fábrica própria' },
  { icon: BadgePercent, label: 'Preço de atacado' },
  { icon: Truck, label: 'Envio para todo o Brasil' },
]

type CatalogHeroProps = {
  totalModelos: number
  totalTimes: number
}

export function CatalogHero({ totalModelos, totalTimes }: CatalogHeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #fff 0 80px, transparent 80px 160px)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-10 md:py-16">
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">
            Coleção nova
          </span>
          <h1 className="font-display text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Conjuntinhos de futebol que{' '}
            <span className="text-gold">vendem sozinhos</span>
          </h1>
          <p className="max-w-md text-pretty text-sm text-primary-foreground/80 sm:text-base">
            Camisa e bermuda dos maiores times, direto da fábrica. Monte seu pedido e finalize pelo
            WhatsApp.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-bold text-gold-foreground transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Ver catálogo
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
          <dl className="mt-2 grid max-w-md grid-cols-3 gap-3 border-t border-white/15 pt-5">
            <div>
              <dt className="text-xs text-primary-foreground/70">Modelos</dt>
              <dd className="font-display text-2xl font-extrabold">{totalModelos}</dd>
            </div>
            <div>
              <dt className="text-xs text-primary-foreground/70">Times</dt>
              <dd className="font-display text-2xl font-extrabold">{totalTimes}</dd>
            </div>
            <div>
              <dt className="text-xs text-primary-foreground/70">Pedido</dt>
              <dd className="font-display text-2xl font-extrabold">Livre</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl md:aspect-[4/5]">
            {HERO_IMAGE ? (
              <Image
                src={HERO_IMAGE}
                alt="Crianças vestindo conjuntinhos de futebol A&A Sports"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div aria-hidden="true" className="absolute inset-0">
                <div className="absolute inset-6 rounded-2xl border-2 border-white/20" />
                <div className="absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-white/20" />
                <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
                <div className="absolute left-1/2 top-6 h-16 w-40 -translate-x-1/2 rounded-b-xl border-2 border-t-0 border-white/20" />
                <div className="absolute bottom-6 left-1/2 h-16 w-40 -translate-x-1/2 rounded-t-xl border-2 border-b-0 border-white/20" />
              </div>
            )}
          </div>
          <ul className="absolute -bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2 sm:left-auto sm:right-6 sm:justify-end">
            {destaques.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-lg"
              >
                <Icon className="size-3.5 text-primary" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
