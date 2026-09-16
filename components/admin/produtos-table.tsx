'use client'

import { useState, useTransition } from 'react'
import { Trash2, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ProdutoFormDialog } from '@/components/admin/produto-form-dialog'
import { deleteProdutoAction, toggleAtivoAction } from '@/app/admin/produtos/actions'
import type { Produto } from '@/lib/types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProdutosTable({ produtos }: { produtos: Produto[] }) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)

  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <PackageX className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Nenhum produto cadastrado</p>
        <p className="text-sm text-muted-foreground">Cadastre o primeiro conjuntinho para começar.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14"></TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tamanho / Cor</TableHead>
            <TableHead className="text-right">Preço atacado</TableHead>
            <TableHead className="text-right">Estoque</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.map((produto) => {
            const isLow = produto.estoque_atual <= produto.estoque_minimo
            return (
              <TableRow key={produto.id}>
                <TableCell>
                  <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-muted">
                    {produto.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.foto_url || '/placeholder.svg'}
                        alt={produto.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{produto.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {produto.time} · {produto.categoria}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {produto.tamanho}
                  {produto.cor ? ` · ${produto.cor}` : ''}
                </TableCell>
                <TableCell className="text-right font-medium">{formatBRL(produto.preco_atacado)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={isLow ? 'destructive' : 'secondary'}>{produto.estoque_atual} un.</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={produto.ativo}
                    disabled={isPending && pendingId === produto.id}
                    onCheckedChange={(checked) => {
                      setPendingId(produto.id)
                      startTransition(async () => {
                        const result = await toggleAtivoAction(produto.id, checked)
                        if (result?.error) toast.error(result.error)
                        setPendingId(null)
                      })
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ProdutoFormDialog produto={produto} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Excluir produto">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir &quot;{produto.nome}&quot;? Essa ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => {
                              startTransition(async () => {
                                const result = await deleteProdutoAction(produto.id)
                                if (result?.error) toast.error(result.error)
                                else toast.success('Produto excluído.')
                              })
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
