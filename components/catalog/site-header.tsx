import { CartDrawer } from '@/components/catalog/cart-drawer'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <p className="text-lg font-bold leading-none text-primary">A&amp;A Sports</p>
          <p className="text-xs text-muted-foreground">Catálogo de atacado</p>
        </div>
        <CartDrawer />
      </div>
    </header>
  )
}
