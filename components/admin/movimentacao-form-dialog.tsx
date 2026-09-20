'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
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

const selectClass =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-9 sm:text-sm'

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
  const [produtoId, setProdutoId] = useState('')
  const [tamanho, setTamanho] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const produtoSelecionado = useMemo(
    () => produtos.find((p) => p.id === produtoId) ?? null,
    [produtos, produtoId],
  )
  const tamanhosDoProduto = useMemo(
    () => (produtoSelecionado?.tamanhos ?? []).slice().sort((a, b) => Number(a.tamanho) - Number(b.tamanho)),
    [produtoSelecionado],
  )

  useEffect(() => {
    if (state.success) {
      toast.success('Movimentação registrada.')
      setOpen(false)
      formRef.current?.reset()
      setTipo('entrada')
      setProdutoId('')
      setTamanho('')
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Registrar movimentação</DialogTrigger>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar movimentação de estoque</DialogTitle>
          <DialogDescription>Lance entradas de produção ou saídas manuais do estoque.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo('entrada')}
              className={`flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
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
              className={`flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
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
              value={produtoId}
              onChange={(e) => {
                setProdutoId(e.target.value)
                setTamanho('')
              }}
              className={selectClass}
            >
              <option value="">Selecione um produto</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} · {produto.time}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tamanho">Tamanho</Label>
            <select
              id="tamanho"
              name="tamanho"
              required
              value={tamanho}
              onChange={(e) => setTamanho(e.target.value)}
              disabled={!produtoSelecionado}
              className={selectClass}
            >
              <option value="">{produtoSelecionado ? 'Selecione o tamanho' : 'Escolha um produto primeiro'}</option>
              {tamanhosDoProduto.map((t) => (
                <option key={t.id} value={t.tamanho}>
                  Tam. {t.tamanho} (estoque: {t.estoque_atual})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              name="quantidade"
              type="number"
              min="1"
              required
              placeholder="10"
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Input
              id="motivo"
              name="motivo"
              placeholder="Produção nova, ajuste, perda..."
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
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
