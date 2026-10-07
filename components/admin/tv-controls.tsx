'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Maximize, Minimize, X } from 'lucide-react'

export function TvControls({ intervalSeconds = 60 }: { intervalSeconds?: number }) {
  const router = useRouter()
  const [now, setNow] = useState<Date | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    setNow(new Date())
    const clock = setInterval(() => setNow(new Date()), 1000)
    const refresh = setInterval(() => router.refresh(), intervalSeconds * 1000)
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      clearInterval(clock)
      clearInterval(refresh)
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [router, intervalSeconds])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  return (
    <div className="flex items-center gap-3">
      <time className="font-display text-2xl font-bold tabular-nums lg:text-3xl" suppressHydrationWarning>
        {now ? now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
      </time>
      <button
        type="button"
        onClick={toggleFullscreen}
        className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
      >
        {fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
      </button>
      <Link href="/admin" className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20" aria-label="Sair do Modo TV">
        <X className="size-5" />
      </Link>
    </div>
  )
}
