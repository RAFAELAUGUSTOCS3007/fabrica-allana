'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Plus, Trash2 } from 'lucide-react'
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
import {
  registrarVendaAction,
  atualizarVendaAction,
  type VendaFormState,
} from '@/app/admin/vendas/actions'
import type { ItemVenda, Produto, Venda } from '@/lib/types'

const initialState: VendaFormState = { error: null, success: false }

const selectClass =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-9 sm:text-sm'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function SubmitButton({ disabled, modo }: { disabled: boolean; modo: 'criar' | 'editar' }) {
  const { pending } = useFormStatus()
  const rotulo = modo === 'editar' ? 'Salvar alterações' : 'Registrar venda'
  const rotuloPendente = modo === 'editar' ? 'Salvando...' : 'Registrando...'
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? rotuloPendente : rotulo}
    </Button>
  )
}

export function VendaFormDialog({
  produtos,
  venda,
  trigger,
}: {
  produtos: Produto[]
  venda?: Venda
  trigger?: React.ReactNode
}) {
  const modo: 'criar' | 'editar' = venda ? 'editar' : 'criar'
  const action = venda ? atualizarVendaAction : registrarVendaAction
  const [state, formAction] = useActionState(action, initialState)
  const [open, setOpen] = useState(false)
  const [itens, setItens] = useState<ItemVenda[]>(venda?.itens ?? [])
  const [produtoId, setProdutoId] = useState('')
  const [tamanho, setTamanho] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const formRef = useRef<HTMLFormElement>(null)

  // Ao abrir em modo edição, recarrega os itens da venda
  useEffect(() => {
    if (open && venda) setItens(venda.itens ?? [])
  }, [open, venda])

  const total = useMemo(() => itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0), [itens])

  const produtoSelecionado = useMemo(() => produtos.find((p) => p.id === produtoId) ?? null, [produtos, produtoId])
  const tamanhosDoProduto = useMemo(
    () => (produtoSelecionado?.tamanhos ?? []).slice().sort((a, b) => Number(a.tamanho) - Number(b.tamanho)),
    [produtoSelecionado],
  )

  useEffect(() => {
    if (state.success) {
      toast.success(modo === 'editar' ? 'Venda atualizada.' : 'Venda registrada.')
      setOpen(false)
      if (modo === 'criar') {
        setItens([])
        formRef.current?.reset()
      }
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, modo])

  function handleAddItem() {
    const produto = produtos.find((p) => p.id === produtoId)
    const variacao = produto?.tamanhos?.find((t) => t.tamanho === tamanho)
    const qtd = Number(quantidade)
    if (!produto || !variacao || !qtd || qtd <= 0) {
      toast.error('Selecione produto, tamanho e uma quantidade válida.')
      return
    }
    setItens((prev) => [
      ...prev,
      {
        produto_id: produto.id,
        nome: produto.nome,
        time: produto.time,
        tamanho: variacao.tamanho,
        quantidade: qtd,
        preco_unitario: produto.preco_atacado,
      },
    ])
    setProdutoId('')
    setTamanho('')
    setQuantidade('1')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar venda
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{modo === 'editar' ? 'Editar venda' : 'Registrar venda manual'}</DialogTitle>
          <DialogDescription>
            {modo === 'editar'
              ? 'Ajuste itens, tamanhos ou cliente. O estoque é corrigido automaticamente.'
              : 'Adicione os produtos vendidos e confirme para dar baixa no estoque.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-md border border-border p-3">
          <select
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <select
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
            <Input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="h-11 w-full text-base sm:h-9 sm:w-20 sm:text-sm"
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleAddItem} className="h-11 sm:h-8">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar item
          </Button>
        </div>

        {itens.length > 0 && (
          <div className="flex flex-col gap-2">
            {itens.map((item, index) => (
              <div
                key={`${item.produto_id}-${item.tamanho}-${index}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.time} · Tam. {item.tamanho} · {item.quantidade}x {formatBRL(item.preco_unitario)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <p className="font-medium">{formatBRL(item.quantidade * item.preco_unitario)}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    onClick={() => setItens((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>
        )}

        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          {venda && <input type="hidden" name="venda_id" value={venda.id} />}
          <input type="hidden" name="itens" value={JSON.stringify(itens)} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente">Cliente (opcional)</Label>
            <Input
              id="cliente"
              name="cliente"
              defaultValue={venda?.cliente ?? ''}
              placeholder="Nome da loja ou cliente"
              className="h-11 text-base sm:h-9 sm:text-sm"
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <SubmitButton disabled={itens.length === 0} modo={modo} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
