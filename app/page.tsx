import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/catalog/site-header'
import { CatalogHero } from '@/components/catalog/catalog-hero'
import { CartProvider } from '@/components/catalog/cart-context'
import { CatalogClient } from '@/components/catalog/catalog-client'
import { CartBottomBar } from '@/components/catalog/cart-bottom-bar'
import { WhatsAppFab } from '@/components/catalog/whatsapp-fab'
import { HowToBuy } from '@/components/catalog/how-to-buy'
import type { Produto } from '@/lib/types'

export default async function CatalogPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(
      'id, nome, time, cor, categoria, preco_atacado, custo, foto_url, ativo, criado_em, produto_tamanhos(id, produto_id, tamanho, estoque_atual, estoque_minimo)',
    )
    .eq('ativo', true)
    .order('time', { ascending: true })

  if (error) {
    console.log('[v0] CatalogPage error:', error.message)
  }

  const produtos = ((data ?? []) as unknown as (Produto & { produto_tamanhos: Produto['tamanhos'] })[]).map(
    (p) => ({ ...p, tamanhos: p.produto_tamanhos ?? [] }),
  ) as Produto[]

  return (
    <CartProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <SiteHeader />
        <CatalogHero />
        <main id="catalogo" className="flex flex-1 scroll-mt-16 flex-col">
          <CatalogClient produtos={produtos} />
        </main>
        <HowToBuy />
        <footer className="border-t border-primary-foreground/10 bg-primary py-6 text-center text-xs text-primary-foreground/60">
          A&amp;A Sports · Conjuntos infantis direto da fábrica
        </footer>
        <CartBottomBar />
        <WhatsAppFab />
      </div>
    </CartProvider>
  )
}
