'use client'

import { useCart } from '@/components/catalog/cart-context'
import { buildWhatsAppContactUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.910c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.150l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.88.86-.88 2.090s.9 2.42 1.03 2.59c.12.17 1.77 2.7 4.29 3.79.6.26 1.070.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
    </svg>
  )
}

export function WhatsAppFab({ alwaysRaisedOnMobile = false }: { alwaysRaisedOnMobile?: boolean }) {
  const { totalItens } = useCart()
  const href = buildWhatsAppContactUrl()

  // A barra do carrinho aparece em todas as larguras; a barra de compra do produto só no mobile
  const position =
    totalItens > 0 ? 'bottom-24' : alwaysRaisedOnMobile ? 'bottom-24 sm:bottom-6' : 'bottom-6'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className={cn(
        'group fixed right-4 z-40 flex h-14 items-center overflow-hidden rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-all duration-300 hover:bg-[#1ebe5b] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:right-6',
        position,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping [animation-duration:2.5s] group-hover:hidden"
      />
      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <WhatsAppIcon className="h-7 w-7" />
      </span>
      <span className="relative max-w-0 whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:pr-5 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:pr-5 group-focus-visible:opacity-100">
        Fale conosco
      </span>
    </a>
  )
}
