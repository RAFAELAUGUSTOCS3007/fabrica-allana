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

export function buildWhatsAppContactUrl(mensagem?: string) {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  const texto = mensagem ?? 'Olá! Tenho uma dúvida sobre os conjuntos.'
  const encoded = encodeURIComponent(texto)
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}

// Compartilhamento aberto: sem número fixo, para o cliente escolher com quem dividir.
export function buildWhatsAppShareUrl(mensagem: string) {
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`
}
