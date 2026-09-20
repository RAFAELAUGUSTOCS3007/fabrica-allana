import { createServiceClient } from '@/lib/supabase/service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { VendaFormDialog } from '@/components/admin/venda-form-dialog'
import type { Produto, Venda } from '@/lib/types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminVendasPage() {
  const supabase = createServiceClient()

  const [produtosResult, vendasResult] = await Promise.all([
    supabase
      .from('produtos')
      .select(
        'id, nome, time, cor, categoria, preco_atacado, ativo, produto_tamanhos(id, produto_id, tamanho, estoque_atual, estoque_minimo)',
      )
      .order('nome', { ascending: true }),
    supabase.from('vendas').select('id, itens, total, data, cliente').order('data', { ascending: false }).limit(50),
  ])

  const produtos = ((produtosResult.data ?? []) as unknown as (Produto & {
    produto_tamanhos: Produto['tamanhos']
  })[])
    .map((p) => ({ ...p, tamanhos: (p.produto_tamanhos ?? []).filter((t) => t.estoque_atual > 0) }))
    .filter((p) => (p.tamanhos ?? []).length > 0) as Produto[]
  const vendas = (vendasResult.data ?? []) as Venda[]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-sm text-muted-foreground">Histórico de vendas e registro manual de pedidos.</p>
        </div>
        <VendaFormDialog produtos={produtos} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  Nenhuma venda registrada ainda.
                </TableCell>
              </TableRow>
            ) : (
              vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(venda.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-sm">{venda.cliente || 'Não informado'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {venda.itens.map((item) => `${item.quantidade}x ${item.nome} (${item.tamanho})`).join(', ')}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(Number(venda.total))}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
