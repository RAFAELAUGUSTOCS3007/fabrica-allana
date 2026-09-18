import type { ItemVenda } from './types'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function buildWhatsAppOrderUrl(itens: ItemVenda[], total: number) {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

  const linhas = itens.map((item) => `- ${item.quantidade}x ${item.nome}, tamanho ${item.tamanho}`)

  const mensagem = [
    'Olá! Gostaria de finalizar a compra de:',
    ...linhas,
    '',
    `Total estimado: ${formatBRL(total)}`,
  ].join('\n')

  const encoded = encodeURIComponent(mensagem)
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}
