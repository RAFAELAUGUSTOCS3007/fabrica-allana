import { Skeleton } from '@/components/ui/skeleton'
import { CartProvider } from '@/components/catalog/cart-context'
import { SiteHeader } from '@/components/catalog/site-header'
import { CatalogHero } from '@/components/catalog/catalog-hero'

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-5 w-1/3" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 pb-4 pt-4">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>
    </div>
  )
}

export default function CatalogLoading() {
  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <SiteHeader />
        <CatalogHero />
        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-6xl px-4 py-6">
            <div className="mb-6 flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-40 rounded-md" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </CartProvider>
  )
}
