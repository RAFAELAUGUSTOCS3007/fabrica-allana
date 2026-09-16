'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { registrarMovimentacaoAction, type MovimentacaoFormState } from '@/app/admin/estoque/actions'
import type { Produto } from '@/lib/types'

const initialState: MovimentacaoFormState = { error: null, success: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Registrando...' : 'Registrar movimentação'}
    </Button>
  )
}

export function MovimentacaoFormDialog({ produtos }: { produtos: Produto[] }) {
  const [state, formAction] = useActionState(registrarMovimentacaoAction, initialState)
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success('Movimentação registrada.')
      setOpen(false)
      formRef.current?.reset()
      setTipo('entrada')
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Registrar movimentação</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar movimentação de estoque</DialogTitle>
          <DialogDescription>Lance entradas de produção ou saídas manuais do estoque.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                tipo === 'entrada'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input text-foreground hover:bg-muted'
              }`}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo('saida')}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                tipo === 'saida'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input text-foreground hover:bg-muted'
              }`}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Saída
            </button>
          </div>
          <input type="hidden" name="tipo" value={tipo} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="produto_id">Produto</Label>
            <select
              id="produto_id"
              name="produto_id"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="">Selecione um produto</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} · {produto.time} · Tam. {produto.tamanho} (estoque: {produto.estoque_atual})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input id="quantidade" name="quantidade" type="number" min="1" required placeholder="10" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Input id="motivo" name="motivo" placeholder="Produção nova, ajuste, perda..." />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
