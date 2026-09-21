'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { VendaFormDialog } from '@/components/admin/venda-form-dialog'
import { excluirVendaAction } from '@/app/admin/vendas/actions'
import type { Produto, Venda } from '@/lib/types'

export function VendaRowActions({ venda, produtos }: { venda: Venda; produtos: Produto[] }) {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleExcluir() {
    startTransition(async () => {
      const result = await excluirVendaAction(venda.id)
      if (result.success) {
        toast.success('Venda excluída e estoque estornado.')
        setConfirmOpen(false)
      } else {
        toast.error(result.error ?? 'Não foi possível excluir a venda.')
      }
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <VendaFormDialog
        produtos={produtos}
        venda={venda}
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar venda">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Excluir venda">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta venda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As unidades vendidas voltam para o estoque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleExcluir()
              }}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
