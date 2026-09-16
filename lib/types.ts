export type Categoria = 'Conjuntinho' | 'Camisa' | 'Bermuda'

export type Produto = {
  id: string
  nome: string
  time: string
  tamanho: string
  cor: string | null
  categoria: Categoria
  preco_atacado: number
  custo: number | null
  estoque_atual: number
  estoque_minimo: number
  foto_url: string | null
  ativo: boolean
  criado_em: string
}

export type TipoMovimentacao = 'entrada' | 'saida'

export type MovimentacaoEstoque = {
  id: string
  produto_id: string
  tipo: TipoMovimentacao
  quantidade: number
  motivo: string | null
  data: string
}

export type ItemVenda = {
  produto_id: string
  nome: string
  time: string
  tamanho: string
  quantidade: number
  preco_unitario: number
}

export type Venda = {
  id: string
  itens: ItemVenda[]
  total: number
  data: string
  cliente: string | null
}
