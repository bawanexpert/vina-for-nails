export function SectionFallback({ height = '12rem' }: { height?: string }) {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse rounded-2xl bg-white/5"
      style={{ minHeight: height }}
      aria-hidden
    />
  )
}
