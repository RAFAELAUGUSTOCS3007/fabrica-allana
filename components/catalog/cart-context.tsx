'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ItemVenda, Produto } from '@/lib/types'

const STORAGE_KEY = 'aa-sports-carrinho'

type CartContextValue = {
  itens: ItemVenda[]
  totalItens: number
  total: number
  adicionarItem: (produto: Produto, quantidade: number) => void
  removerItem: (produtoId: string) => void
  atualizarQuantidade: (produtoId: string, quantidade: number) => void
  limparCarrinho: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setItens(JSON.parse(stored))
    } catch {
      // ignore malformed cart data
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
  }, [itens, hydrated])

  const adicionarItem = useCallback((produto: Produto, quantidade: number) => {
    setItens((prev) => {
      const existente = prev.find((item) => item.produto_id === produto.id)
      if (existente) {
        return prev.map((item) =>
          item.produto_id === produto.id ? { ...item, quantidade: item.quantidade + quantidade } : item,
        )
      }
      return [
        ...prev,
        {
          produto_id: produto.id,
          nome: produto.nome,
          time: produto.time,
          tamanho: produto.tamanho,
          quantidade,
          preco_unitario: produto.preco_atacado,
        },
      ]
    })
  }, [])

  const removerItem = useCallback((produtoId: string) => {
    setItens((prev) => prev.filter((item) => item.produto_id !== produtoId))
  }, [])

  const atualizarQuantidade = useCallback((produtoId: string, quantidade: number) => {
    setItens((prev) =>
      quantidade <= 0
        ? prev.filter((item) => item.produto_id !== produtoId)
        : prev.map((item) => (item.produto_id === produtoId ? { ...item, quantidade } : item)),
    )
  }, [])

  const limparCarrinho = useCallback(() => setItens([]), [])

  const totalItens = useMemo(() => itens.reduce((sum, item) => sum + item.quantidade, 0), [itens])
  const total = useMemo(() => itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0), [itens])

  const value = useMemo(
    () => ({ itens, totalItens, total, adicionarItem, removerItem, atualizarQuantidade, limparCarrinho }),
    [itens, totalItens, total, adicionarItem, removerItem, atualizarQuantidade, limparCarrinho],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider')
  return context
}
