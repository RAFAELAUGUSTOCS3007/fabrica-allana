import { cn } from '@/lib/utils'

export function Logo({
  className,
  onDark = false,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <div className={cn('flex min-w-[4.75rem] flex-col justify-center leading-none', className)}>
      <span
        className={cn(
          'font-display text-2xl font-extrabold tracking-tight',
          onDark ? 'text-white' : 'text-[#12211f]',
        )}
      >
        A&amp;A
      </span>
      <span aria-hidden="true" className="mt-1.5 h-0.5 w-9 bg-gold" />
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Sports</span>
    </div>
  )
}
