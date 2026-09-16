'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Plus, Pencil, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createProdutoAction, updateProdutoAction, type ProdutoFormState } from '@/app/admin/produtos/actions'
import type { Produto } from '@/lib/types'

const initialState: ProdutoFormState = { error: null, success: false }

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar produto'}
    </Button>
  )
}

export function ProdutoFormDialog({ produto }: { produto?: Produto }) {
  const isEdit = Boolean(produto)
  const action = isEdit ? updateProdutoAction : createProdutoAction
  const [state, formAction] = useActionState(action, initialState)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(produto?.foto_url ?? null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? 'Produto atualizado.' : 'Produto cadastrado.')
      setOpen(false)
      formRef.current?.reset()
      setPreview(produto?.foto_url ?? null)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, isEdit, produto?.foto_url])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Editar produto" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações deste conjuntinho.'
              : 'Cadastre um novo conjuntinho, camisa ou bermuda no catálogo.'}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={produto?.id} />}

          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Pré-visualização do produto" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="foto">Foto do produto</Label>
              <Input
                id="foto"
                name="foto"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) setPreview(URL.createObjectURL(file))
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="nome">Nome do produto</Label>
              <Input id="nome" name="nome" defaultValue={produto?.nome} placeholder="Conjuntinho Infantil" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" defaultValue={produto?.time} placeholder="Flamengo" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                name="categoria"
                defaultValue={produto?.categoria ?? 'Conjuntinho'}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <option value="Conjuntinho">Conjuntinho</option>
                <option value="Camisa">Camisa</option>
                <option value="Bermuda">Bermuda</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tamanho">Tamanho</Label>
              <Input id="tamanho" name="tamanho" defaultValue={produto?.tamanho} placeholder="4" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cor">Cor (opcional)</Label>
              <Input id="cor" name="cor" defaultValue={produto?.cor ?? ''} placeholder="Vermelho" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="preco_atacado">Preço no atacado (R$)</Label>
              <Input
                id="preco_atacado"
                name="preco_atacado"
                type="number"
                step="0.01"
                min="0"
                defaultValue={produto?.preco_atacado}
                placeholder="39.90"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="custo">Custo de produção (R$)</Label>
              <Input
                id="custo"
                name="custo"
                type="number"
                step="0.01"
                min="0"
                defaultValue={produto?.custo ?? ''}
                placeholder="18.00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="estoque_atual">Estoque atual</Label>
              <Input
                id="estoque_atual"
                name="estoque_atual"
                type="number"
                min="0"
                defaultValue={produto?.estoque_atual ?? 0}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="estoque_minimo">Estoque mínimo</Label>
              <Input
                id="estoque_minimo"
                name="estoque_minimo"
                type="number"
                min="0"
                defaultValue={produto?.estoque_minimo ?? 3}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Ativo no catálogo</p>
              <p className="text-xs text-muted-foreground">Produtos inativos não aparecem para os lojistas.</p>
            </div>
            <Switch name="ativo" defaultChecked={produto?.ativo ?? true} />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
