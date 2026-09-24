'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import type { ItemVenda } from '@/lib/types'

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

const chaveVar = (produtoId: string, tamanho: string) => `${produtoId}::${tamanho}`

function agregarQuantidades(itens: { produto_id: string; tamanho: string; quantidade: number }[]) {
  const mapa = new Map<string, number>()
  for (const item of itens) {
    const k = chaveVar(item.produto_id, item.tamanho)
    mapa.set(k, (mapa.get(k) ?? 0) + item.quantidade)
  }
  return mapa
}

export async function atualizarVendaAction(
  _prevState: VendaFormState,
  formData: FormData,
): Promise<VendaFormState> {
  const vendaId = String(formData.get('venda_id') ?? '')
  if (!z.string().uuid().safeParse(vendaId).success) {
    return { error: 'Venda inválida.', success: false }
  }

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

  const { data: vendaAtual, error: vendaAtualError } = await supabase
    .from('vendas')
    .select('id, itens')
    .eq('id', vendaId)
    .single()

  if (vendaAtualError || !vendaAtual) {
    return { error: 'Venda não encontrada.', success: false }
  }

  const itensAntigos = (vendaAtual.itens ?? []) as ItemVenda[]
  const qtdAntigas = agregarQuantidades(itensAntigos)
  const qtdNovas = agregarQuantidades(itens)

  // Variações envolvidas (antigas + novas)
  const produtoIds = Array.from(
    new Set([...itensAntigos.map((i) => i.produto_id), ...itens.map((i) => i.produto_id)]),
  )
  const { data: variacoes, error: variacoesError } = await supabase
    .from('produto_tamanhos')
    .select('id, produto_id, tamanho, estoque_atual')
    .in('produto_id', produtoIds)

  if (variacoesError || !variacoes) {
    return { error: 'Não foi possível validar o estoque.', success: false }
  }

  const estoquePorChave = new Map(variacoes.map((v) => [chaveVar(v.produto_id, v.tamanho), v.estoque_atual]))
  const idPorChave = new Map(variacoes.map((v) => [chaveVar(v.produto_id, v.tamanho), v.id]))
  const rotuloPorChave = new Map<string, string>()
  for (const item of itens) rotuloPorChave.set(chaveVar(item.produto_id, item.tamanho), `${item.nome} (tam. ${item.tamanho})`)

  // Estoque disponível para validar = estoque atual + quantidade antiga (que será estornada)
  for (const [k, qtd] of qtdNovas) {
    const disponivel = (estoquePorChave.get(k) ?? undefined)
    if (disponivel === undefined) {
      return { error: `Variação não encontrada para "${rotuloPorChave.get(k) ?? 'produto'}".`, success: false }
    }
    const disponivelComEstorno = disponivel + (qtdAntigas.get(k) ?? 0)
    if (qtd > disponivelComEstorno) {
      return {
        error: `Estoque insuficiente para "${rotuloPorChave.get(k)}". Disponível: ${disponivelComEstorno} un.`,
        success: false,
      }
    }
  }

  const total = itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0)

  const { error: updateError } = await supabase
    .from('vendas')
    .update({ itens, total, cliente: cliente || null })
    .eq('id', vendaId)

  if (updateError) {
    console.log('[v0] atualizarVendaAction update error:', updateError.message)
    return { error: 'Não foi possível atualizar a venda.', success: false }
  }

  // Ajusta estoque pelo delta (nova - antiga) por variação
  const chaves = new Set([...qtdAntigas.keys(), ...qtdNovas.keys()])
  for (const k of chaves) {
    const variacaoId = idPorChave.get(k)
    if (!variacaoId) continue
    const atual = estoquePorChave.get(k) ?? 0
    const delta = (qtdNovas.get(k) ?? 0) - (qtdAntigas.get(k) ?? 0)
    if (delta === 0) continue

    await supabase
      .from('produto_tamanhos')
      .update({ estoque_atual: atual - delta })
      .eq('id', variacaoId)

    const [produtoId, tamanho] = k.split('::')
    await supabase.from('movimentacoes_estoque').insert({
      produto_id: produtoId,
      tamanho,
      tipo: delta > 0 ? 'saida' : 'entrada',
      quantidade: Math.abs(delta),
      motivo: 'Ajuste por edição de venda',
    })
  }

  revalidatePath('/admin/vendas')
  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null, success: true }
}

export async function excluirVendaAction(vendaId: string): Promise<{ error: string | null; success: boolean }> {
  if (!z.string().uuid().safeParse(vendaId).success) {
    return { error: 'Venda inválida.', success: false }
  }

  const supabase = createServiceClient()

  const { data: venda, error: vendaError } = await supabase
    .from('vendas')
    .select('id, itens')
    .eq('id', vendaId)
    .single()

  if (vendaError || !venda) {
    return { error: 'Venda não encontrada.', success: false }
  }

  const itens = (venda.itens ?? []) as ItemVenda[]
  const qtdPorChave = agregarQuantidades(itens)

  const produtoIds = Array.from(new Set(itens.map((i) => i.produto_id)))
  if (produtoIds.length > 0) {
    const { data: variacoes } = await supabase
      .from('produto_tamanhos')
      .select('id, produto_id, tamanho, estoque_atual')
      .in('produto_id', produtoIds)

    const estoquePorChave = new Map((variacoes ?? []).map((v) => [chaveVar(v.produto_id, v.tamanho), v.estoque_atual]))
    const idPorChave = new Map((variacoes ?? []).map((v) => [chaveVar(v.produto_id, v.tamanho), v.id]))

    // Estorna o estoque das variações vendidas
    for (const [k, qtd] of qtdPorChave) {
      const variacaoId = idPorChave.get(k)
      if (!variacaoId) continue
      const atual = estoquePorChave.get(k) ?? 0
      await supabase
        .from('produto_tamanhos')
        .update({ estoque_atual: atual + qtd })
        .eq('id', variacaoId)

      const [produtoId, tamanho] = k.split('::')
      await supabase.from('movimentacoes_estoque').insert({
        produto_id: produtoId,
        tamanho,
        tipo: 'entrada',
        quantidade: qtd,
        motivo: 'Estorno por exclusão de venda',
      })
    }
  }

  const { error: deleteError } = await supabase.from('vendas').delete().eq('id', vendaId)
  if (deleteError) {
    console.log('[v0] excluirVendaAction delete error:', deleteError.message)
    return { error: 'Não foi possível excluir a venda.', success: false }
  }

  revalidatePath('/admin/vendas')
  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null, success: true }
}
