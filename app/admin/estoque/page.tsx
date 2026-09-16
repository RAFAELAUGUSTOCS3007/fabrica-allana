import { createServiceClient } from '@/lib/supabase/service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MovimentacaoFormDialog } from '@/components/admin/movimentacao-form-dialog'
import type { MovimentacaoEstoque, Produto } from '@/lib/types'

export default async function AdminEstoquePage() {
  const supabase = createServiceClient()

  const [produtosResult, movimentacoesResult] = await Promise.all([
    supabase
      .from('produtos')
      .select('id, nome, time, tamanho, cor, categoria, estoque_atual, estoque_minimo, ativo')
      .order('nome', { ascending: true }),
    supabase
      .from('movimentacoes_estoque')
      .select('id, produto_id, tipo, quantidade, motivo, data')
      .order('data', { ascending: false })
      .limit(30),
  ])

  const produtos = (produtosResult.data ?? []) as Produto[]
  const movimentacoes = (movimentacoesResult.data ?? []) as MovimentacaoEstoque[]
  const produtosPorId = new Map(produtos.map((p) => [p.id, p]))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground">Controle entradas e saídas de cada produto.</p>
        </div>
        <MovimentacaoFormDialog produtos={produtos} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Estoque atual por produto</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Tamanho / Cor</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => {
                const isLow = produto.estoque_atual <= produto.estoque_minimo
                return (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">{produto.time}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {produto.tamanho}
                      {produto.cor ? ` · ${produto.cor}` : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={isLow ? 'destructive' : 'secondary'}>{produto.estoque_atual} un.</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {produto.estoque_minimo} un.
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Histórico de movimentações</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Nenhuma movimentação registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                movimentacoes.map((mov) => {
                  const produto = produtosPorId.get(mov.produto_id)
                  return (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(mov.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-sm">{produto ? `${produto.nome} (${produto.time})` : '—'}</TableCell>
                      <TableCell>
                        <Badge variant={mov.tipo === 'entrada' ? 'secondary' : 'outline'}>
                          {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{mov.quantidade} un.</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{mov.motivo || '—'}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
