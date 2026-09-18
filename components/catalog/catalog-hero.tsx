const badges = ['Fábrica própria', 'Preço de atacado', 'Envio para todo o Brasil']

export function CatalogHero() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Conjuntinhos de futebol para revenda
        </h1>
        <p className="max-w-xl text-sm text-primary-foreground/80 sm:text-base">
          Monte seu pedido de atacado e finalize direto pelo WhatsApp.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {badges.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
