import { createServiceClient } from '@/lib/supabase/service'
import { ProdutoFormDialog } from '@/components/admin/produto-form-dialog'
import { ProdutosTable } from '@/components/admin/produtos-table'
import type { Produto } from '@/lib/types'

export default async function AdminProdutosPage() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(
      'id, nome, time, cor, categoria, preco_atacado, custo, foto_url, ativo, criado_em, produto_tamanhos(id, produto_id, tamanho, estoque_atual, estoque_minimo)',
    )
    .order('criado_em', { ascending: false })

  if (error) {
    console.log('[v0] AdminProdutosPage error:', error.message)
  }

  const produtos = ((data ?? []) as unknown as (Produto & {
    produto_tamanhos: Produto['tamanhos']
  })[]).map((p) => ({ ...p, tamanhos: p.produto_tamanhos ?? [] })) as Produto[]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">Cadastre e gerencie o catálogo de atacado.</p>
        </div>
        <ProdutoFormDialog />
      </div>
      <ProdutosTable produtos={produtos} />
    </div>
  )
}
