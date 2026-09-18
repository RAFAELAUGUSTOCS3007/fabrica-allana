'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const produtoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do produto.'),
  time: z.string().trim().min(2, 'Informe o time.'),
  tamanho: z.string().trim().min(1, 'Informe o tamanho.'),
  cor: z.string().trim().optional(),
  categoria: z.enum(['Conjuntinho', 'Camisa', 'Bermuda']),
  preco_atacado: z.coerce.number().min(0, 'Preço inválido.'),
  custo: z.coerce.number().min(0).optional(),
  estoque_atual: z.coerce.number().int().min(0, 'Estoque inválido.'),
  estoque_minimo: z.coerce.number().int().min(0, 'Estoque mínimo inválido.'),
  ativo: z.coerce.boolean(),
})

export type ProdutoFormState = { error: string | null; success: boolean }

export async function createProdutoAction(
  _prevState: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  const parsed = produtoSchema.safeParse({
    nome: formData.get('nome'),
    time: formData.get('time'),
    tamanho: formData.get('tamanho'),
    cor: formData.get('cor') || undefined,
    categoria: formData.get('categoria'),
    preco_atacado: formData.get('preco_atacado'),
    custo: formData.get('custo') || undefined,
    estoque_atual: formData.get('estoque_atual') || 0,
    estoque_minimo: formData.get('estoque_minimo') || 3,
    ativo: formData.get('ativo') === 'on' || formData.get('ativo') === 'true',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.', success: false }
  }

  try {
    const fotoUrl = String(formData.get('foto_url') ?? '') || null
    const supabase = createServiceClient()
    const { error } = await supabase.from('produtos').insert({
      ...parsed.data,
      cor: parsed.data.cor || null,
      custo: parsed.data.custo ?? null,
      foto_url: fotoUrl,
    })

    if (error) {
      console.log('[v0] createProdutoAction error:', error.message)
      return { error: 'Não foi possível salvar o produto.', success: false }
    }
  } catch (err) {
    console.log('[v0] createProdutoAction exception:', err)
    return { error: 'Não foi possível salvar o produto.', success: false }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { error: null, success: true }
}

export async function updateProdutoAction(
  _prevState: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Produto inválido.', success: false }

  const parsed = produtoSchema.safeParse({
    nome: formData.get('nome'),
    time: formData.get('time'),
    tamanho: formData.get('tamanho'),
    cor: formData.get('cor') || undefined,
    categoria: formData.get('categoria'),
    preco_atacado: formData.get('preco_atacado'),
    custo: formData.get('custo') || undefined,
    estoque_atual: formData.get('estoque_atual') || 0,
    estoque_minimo: formData.get('estoque_minimo') || 3,
    ativo: formData.get('ativo') === 'on' || formData.get('ativo') === 'true',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.', success: false }
  }

  try {
    const fotoUrl = String(formData.get('foto_url') ?? '') || null
    const supabase = createServiceClient()
    const updatePayload: Record<string, unknown> = {
      ...parsed.data,
      cor: parsed.data.cor || null,
      custo: parsed.data.custo ?? null,
      foto_url: fotoUrl,
    }

    const { error } = await supabase.from('produtos').update(updatePayload).eq('id', id)

    if (error) {
      console.log('[v0] updateProdutoAction error:', error.message)
      return { error: 'Não foi possível atualizar o produto.', success: false }
    }
  } catch (err) {
    console.log('[v0] updateProdutoAction exception:', err)
    return { error: 'Não foi possível atualizar o produto.', success: false }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { error: null, success: true }
}

export async function deleteProdutoAction(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  if (error) {
    console.log('[v0] deleteProdutoAction error:', error.message)
    return { error: 'Não foi possível excluir o produto.' }
  }
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { error: null }
}

export async function toggleAtivoAction(id: string, ativo: boolean) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('produtos').update({ ativo }).eq('id', id)
  if (error) {
    console.log('[v0] toggleAtivoAction error:', error.message)
    return { error: 'Não foi possível atualizar o status.' }
  }
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { error: null }
}
