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

  const produtoIds = Array.from(new Set(itens.map((item) => item.produto_id)))
  const { data: variacoes, error: variacoesError } = await supabase
    .from('produto_tamanhos')
    .select('id, produto_id, tamanho, estoque_atual')
    .in('produto_id', produtoIds)

  if (variacoesError || !variacoes) {
    return { error: 'Não foi possível validar o estoque.', success: false }
  }

  // Chave composta produto_id + tamanho para estoque e id da variação
  const chave = (produtoId: string, tamanho: string) => `${produtoId}::${tamanho}`
  const estoquePorChave = new Map(variacoes.map((v) => [chave(v.produto_id, v.tamanho), v.estoque_atual]))
  const idPorChave = new Map(variacoes.map((v) => [chave(v.produto_id, v.tamanho), v.id]))

  // Agrega quantidade por produto+tamanho para validar linhas repetidas
  const quantidadePorChave = new Map<string, number>()
  const rotuloPorChave = new Map<string, string>()
  for (const item of itens) {
    const k = chave(item.produto_id, item.tamanho)
    quantidadePorChave.set(k, (quantidadePorChave.get(k) ?? 0) + item.quantidade)
    rotuloPorChave.set(k, `${item.nome} (tam. ${item.tamanho})`)
  }

  for (const [k, qtd] of quantidadePorChave) {
    const disponivel = estoquePorChave.get(k)
    if (disponivel === undefined) {
      return { error: `Variação não encontrada para "${rotuloPorChave.get(k) ?? 'produto'}".`, success: false }
    }
    if (qtd > disponivel) {
      return {
        error: `Estoque insuficiente para "${rotuloPorChave.get(k)}". Disponível: ${disponivel} un.`,
        success: false,
      }
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

  // Dá baixa por produto+tamanho usando o total agregado
  for (const [k, qtd] of quantidadePorChave) {
    const variacaoId = idPorChave.get(k)
    const disponivel = estoquePorChave.get(k) ?? 0
    if (!variacaoId) continue

    await supabase
      .from('produto_tamanhos')
      .update({ estoque_atual: disponivel - qtd })
      .eq('id', variacaoId)

    const [produtoId, tamanho] = k.split('::')
    await supabase.from('movimentacoes_estoque').insert({
      produto_id: produtoId,
      tamanho,
      tipo: 'saida',
      quantidade: qtd,
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
