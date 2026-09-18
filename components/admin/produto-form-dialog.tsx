'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Plus, Pencil, ImagePlus, Copy } from 'lucide-react'
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

const inputTouch = 'h-11 text-base sm:h-9 sm:text-sm'
const selectTouch =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-9 sm:text-sm'

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CurrencyField({
  id,
  name,
  label,
  defaultValue,
  required,
}: {
  id: string
  name: string
  label: string
  defaultValue?: number | string | null
  required?: boolean
}) {
  const initialCents = defaultValue ? Math.round(Number(defaultValue) * 100) : 0
  const [cents, setCents] = useState(initialCents)
  const [touched, setTouched] = useState(false)
  const displayValue = touched || cents > 0 ? `R$ ${centsToBRL(cents)}` : ''

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="numeric"
        placeholder="R$ 0,00"
        className={inputTouch}
        value={displayValue}
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D/g, '')
          setTouched(true)
          setCents(digitsOnly ? Number.parseInt(digitsOnly, 10) : 0)
        }}
      />
      <input type="hidden" name={name} value={(cents / 100).toFixed(2)} required={required} />
    </div>
  )
}

export function ProdutoFormDialog({ produto, duplicarDe }: { produto?: Produto; duplicarDe?: Produto }) {
  const isEdit = Boolean(produto)
  const isDuplicado = Boolean(duplicarDe) && !isEdit
  const base = produto ?? duplicarDe
  const action = isEdit ? updateProdutoAction : createProdutoAction
  const [state, formAction] = useActionState(action, initialState)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(base?.foto_url ?? null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? 'Produto atualizado.' : 'Produto cadastrado.')
      setOpen(false)
      formRef.current?.reset()
      setPreview(base?.foto_url ?? null)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, isEdit, base?.foto_url])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon" aria-label="Editar produto" />
          ) : isDuplicado ? (
            <Button variant="ghost" size="sm" aria-label="Duplicar produto" />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil className="h-4 w-4" />
        ) : isDuplicado ? (
          <>
            <Copy className="mr-1.5 h-4 w-4" />
            Duplicar
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar produto' : isDuplicado ? 'Duplicar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações deste conjuntinho.'
              : isDuplicado
                ? 'Os dados foram copiados. Preencha o tamanho e o estoque desta variação.'
                : 'Cadastre um novo conjuntinho, camisa ou bermuda no catálogo.'}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={produto?.id} />}
          {isDuplicado && duplicarDe?.foto_url && (
            <input type="hidden" name="foto_url_existente" value={duplicarDe.foto_url} />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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
                className={inputTouch}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) setPreview(URL.createObjectURL(file))
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="nome">Nome do produto</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={base?.nome}
                placeholder="Conjuntinho Infantil"
                className={inputTouch}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" name="time" defaultValue={base?.time} placeholder="Flamengo" className={inputTouch} required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                name="categoria"
                defaultValue={base?.categoria ?? 'Conjuntinho'}
                className={selectTouch}
              >
                <option value="Conjuntinho">Conjuntinho</option>
                <option value="Camisa">Camisa</option>
                <option value="Bermuda">Bermuda</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tamanho">Tamanho</Label>
              <Input
                id="tamanho"
                name="tamanho"
                defaultValue={isDuplicado ? '' : base?.tamanho}
                placeholder="4"
                className={inputTouch}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cor">Cor (opcional)</Label>
              <Input id="cor" name="cor" defaultValue={base?.cor ?? ''} placeholder="Vermelho" className={inputTouch} />
            </div>

            <CurrencyField
              id="preco_atacado"
              name="preco_atacado"
              label="Preço no atacado"
              defaultValue={base?.preco_atacado}
              required
            />

            <CurrencyField
              id="custo"
              name="custo"
              label="Custo de produção"
              defaultValue={isDuplicado ? '' : base?.custo ?? ''}
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="estoque_atual">Estoque atual</Label>
              <Input
                id="estoque_atual"
                name="estoque_atual"
                type="number"
                min="0"
                defaultValue={isDuplicado ? '' : base?.estoque_atual ?? 0}
                placeholder={isDuplicado ? '0' : undefined}
                className={inputTouch}
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
                defaultValue={base?.estoque_minimo ?? 3}
                className={inputTouch}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3">
            <div>
              <p className="text-sm font-medium">Ativo no catálogo</p>
              <p className="text-xs text-muted-foreground">Produtos inativos não aparecem para os lojistas.</p>
            </div>
            <Switch name="ativo" defaultChecked={base?.ativo ?? true} />
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
