export const CART_TRIGGER_ID = 'cart-trigger'

export function flyToCart(source: HTMLElement | null) {
  if (!source || typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const target = document.getElementById(CART_TRIGGER_ID)
  if (!target) return

  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const size = Math.min(from.width, from.height, 120)

  const ghost = source.cloneNode(true) as HTMLElement
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '9999px',
    overflow: 'hidden',
    zIndex: '9999',
    pointerEvents: 'none',
    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
  })
  ghost.setAttribute('aria-hidden', 'true')
  document.body.appendChild(ghost)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)

  const animation = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.4 - 60}px) scale(0.6)`, opacity: 0.9, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.3 },
    ],
    { duration: 700, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
  )
  animation.onfinish = () => {
    ghost.remove()
    target.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
      { duration: 300, easing: 'ease-out' },
    )
  }
}
