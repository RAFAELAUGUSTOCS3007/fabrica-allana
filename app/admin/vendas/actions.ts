'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const itemSchema = z.object({
  produto_id: z.string().uuid(),
  nome: z.string(),
  time: z.string(),
  tamanho: z.string(),
  quantidade: z.coerce.number().int().positive(),
  preco_unitario: z.coerce.number().min(0),
})

const vendaSchema = z.object({
  itens: z.array(itemSchema).min(1, 'Adicione ao menos um item à venda.'),
  cliente: z.string().trim().optional(),
})

export type VendaFormState = { error: string | null; success: boolean }

export async function registrarVendaAction(
  _prevState: VendaFormState,
  formData: FormData,
): Promise<VendaFormState> {
  let parsedItens: unknown
  try {
    parsedItens = JSON.parse(String(formData.get('itens') ?? '[]'))
  } catch {
    return { error: 'Itens inválidos.', success: false }
  }

  const parsed = vendaSchema.safeParse({
    itens: parsedItens,
    cliente: formData.get('cliente') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.', success: false }
  }

  const { itens, cliente } = parsed.data
  const supabase = createServiceClient()

  const produtoIds = itens.map((item) => item.produto_id)
  const { data: produtos, error: produtosError } = await supabase
    .from('produtos')
    .select('id, estoque_atual')
    .in('id', produtoIds)

  if (produtosError || !produtos) {
    return { error: 'Não foi possível validar o estoque.', success: false }
  }

  const estoquePorId = new Map(produtos.map((p) => [p.id, p.estoque_atual]))

  for (const item of itens) {
    const disponivel = estoquePorId.get(item.produto_id) ?? 0
    if (item.quantidade > disponivel) {
      return { error: `Estoque insuficiente para "${item.nome}". Disponível: ${disponivel} un.`, success: false }
    }
  }

  const total = itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0)

  const { error: vendaError } = await supabase.from('vendas').insert({
    itens,
    total,
    cliente: cliente || null,
  })

  if (vendaError) {
    console.log('[v0] registrarVendaAction insert error:', vendaError.message)
    return { error: 'Não foi possível registrar a venda.', success: false }
  }

  for (const item of itens) {
    const disponivel = estoquePorId.get(item.produto_id) ?? 0
    await supabase
      .from('produtos')
      .update({ estoque_atual: disponivel - item.quantidade })
      .eq('id', item.produto_id)

    await supabase.from('movimentacoes_estoque').insert({
      produto_id: item.produto_id,
      tipo: 'saida',
      quantidade: item.quantidade,
      motivo: 'Venda registrada',
    })
  }

  revalidatePath('/admin/vendas')
  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null, success: true }
}
