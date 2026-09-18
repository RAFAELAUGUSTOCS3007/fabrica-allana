import { cn } from '@/lib/utils'

export function Logo({
  className,
  onDark = false,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <div className={cn('flex flex-col leading-none', className)}>
      <span
        className={cn(
          'font-display text-xl font-extrabold tracking-tight',
          onDark ? 'text-white' : 'text-[#12211f]',
        )}
      >
        A&amp;A
      </span>
      <span aria-hidden="true" className="mt-1 h-px w-8 bg-gold" />
      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Sports</span>
    </div>
  )
}
