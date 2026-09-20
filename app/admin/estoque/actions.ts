'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const movimentacaoSchema = z.object({
  produto_id: z.string().uuid('Selecione um produto.'),
  tamanho: z.string().trim().min(1, 'Selecione o tamanho.'),
  tipo: z.enum(['entrada', 'saida']),
  quantidade: z.coerce.number().int().positive('Informe uma quantidade válida.'),
  motivo: z.string().trim().optional(),
})

export type MovimentacaoFormState = { error: string | null; success: boolean }

export async function registrarMovimentacaoAction(
  _prevState: MovimentacaoFormState,
  formData: FormData,
): Promise<MovimentacaoFormState> {
  const parsed = movimentacaoSchema.safeParse({
    produto_id: formData.get('produto_id'),
    tamanho: formData.get('tamanho'),
    tipo: formData.get('tipo'),
    quantidade: formData.get('quantidade'),
    motivo: formData.get('motivo') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.', success: false }
  }

  const { produto_id, tamanho, tipo, quantidade, motivo } = parsed.data
  const supabase = createServiceClient()

  const { data: variacao, error: variacaoError } = await supabase
    .from('produto_tamanhos')
    .select('id, estoque_atual')
    .eq('produto_id', produto_id)
    .eq('tamanho', tamanho)
    .maybeSingle()

  if (variacaoError || !variacao) {
    return { error: 'Variação de tamanho não encontrada.', success: false }
  }

  if (tipo === 'saida' && quantidade > variacao.estoque_atual) {
    return { error: `Estoque insuficiente. Disponível: ${variacao.estoque_atual} un.`, success: false }
  }

  const novoEstoque = tipo === 'entrada' ? variacao.estoque_atual + quantidade : variacao.estoque_atual - quantidade

  const { error: updateError } = await supabase
    .from('produto_tamanhos')
    .update({ estoque_atual: novoEstoque })
    .eq('id', variacao.id)

  if (updateError) {
    console.log('[v0] registrarMovimentacaoAction update error:', updateError.message)
    return { error: 'Não foi possível atualizar o estoque.', success: false }
  }

  const { error: movError } = await supabase.from('movimentacoes_estoque').insert({
    produto_id,
    tamanho,
    tipo,
    quantidade,
    motivo: motivo || null,
  })

  if (movError) {
    console.log('[v0] registrarMovimentacaoAction insert error:', movError.message)
    return { error: 'Não foi possível registrar a movimentação.', success: false }
  }

  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: null, success: true }
}
