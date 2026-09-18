import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/catalog/site-header'
import { CatalogHero } from '@/components/catalog/catalog-hero'
import { CartProvider } from '@/components/catalog/cart-context'
import { CatalogClient } from '@/components/catalog/catalog-client'
import { CartBottomBar } from '@/components/catalog/cart-bottom-bar'
import type { Produto } from '@/lib/types'

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(
      'id, nome, time, tamanho, cor, categoria, preco_atacado, custo, estoque_atual, estoque_minimo, foto_url, ativo, criado_em',
    )
    .eq('ativo', true)
    .order('time', { ascending: true })

  if (error) {
    console.log('[v0] CatalogPage error:', error.message)
  }

  const produtos = (data ?? []) as Produto[]

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <SiteHeader />
        <CatalogHero />
        <main className="flex flex-1 flex-col">
          <CatalogClient produtos={produtos} />
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          A&amp;A Sports · Preços exclusivos para revenda no atacado
        </footer>
        <CartBottomBar />
      </div>
    </CartProvider>
  )
}
