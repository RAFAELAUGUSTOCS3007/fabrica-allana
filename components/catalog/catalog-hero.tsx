import Image from 'next/image'
import { ArrowDown, Factory, Truck, BadgePercent } from 'lucide-react'

const destaques = [
  { icon: Factory, label: 'Fábrica própria' },
  { icon: BadgePercent, label: 'Preço de atacado' },
  { icon: Truck, label: 'Envio para todo o Brasil' },
]

const blurMask =
  '[mask-image:linear-gradient(to_top,black_40%,transparent_70%)] [-webkit-mask-image:linear-gradient(to_top,black_40%,transparent_70%)] md:[mask-image:linear-gradient(to_right,black_30%,transparent_58%)] md:[-webkit-mask-image:linear-gradient(to_right,black_30%,transparent_58%)]'

export function CatalogHero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <Image
        src="/images/hero.png"
        alt="Crianças jogando futebol vestindo conjuntinhos de times A&A Sports"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[70%_center] md:object-right"
      />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 backdrop-blur-md ${blurMask}`} />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-primary via-primary/75 to-transparent md:bg-gradient-to-r md:from-primary/95 md:via-primary/60 md:via-40% md:to-transparent md:to-65%"
      />

      <div className="mx-auto flex min-h-[560px] max-w-6xl items-end px-4 pb-10 pt-48 sm:px-6 md:min-h-[600px] md:items-center md:py-16">
        <div className="flex max-w-xl flex-col gap-5">
          <span className="w-fit rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">
            Coleção nova
          </span>
          <h1 className="font-display text-balance text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
            Pequenos craques, <span className="text-gold">grandes torcedores</span>
          </h1>
          <p className="max-w-md text-pretty text-sm text-primary-foreground/90 sm:text-base">
            Conjuntinhos infantis com camisa e bermuda dos maiores times do Brasil e do mundo,
            direto da fábrica. Escolha os modelos e finalize seu pedido pelo WhatsApp.
          </p>
          <div>
            <a
              href="#catalogo"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-bold text-gold-foreground shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Ver catálogo
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
          <ul className="flex flex-wrap gap-2 pt-1">
            {destaques.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm"
              >
                <Icon className="size-3.5 text-gold" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
