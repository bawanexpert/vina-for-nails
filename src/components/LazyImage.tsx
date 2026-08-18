import { useEffect, useState } from 'react'
import { getImage, isIdbPath, idFromPath } from '../lib/imageStore'
import { getImageFallback, resolveImageUrl } from '../lib/resolveImageUrl'

type LazyImageProps = {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  aspectRatio?: string
}

export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  aspectRatio,
}: LazyImageProps) {
  const [resolved, setResolved] = useState(() => resolveImageUrl(src))
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setErrored(false)

    let cancelled = false

    async function resolve() {
      if (isIdbPath(src)) {
        const url = await getImage(idFromPath(src))
        if (!cancelled) setResolved(url ?? getImageFallback())
        return
      }
      if (!cancelled) setResolved(resolveImageUrl(src))
    }

    void resolve()
    return () => {
      cancelled = true
    }
  }, [src])

  const displaySrc = errored ? getImageFallback() : resolved

  return (
    <span
      className="relative block overflow-hidden bg-white/5"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && !errored && (
        <span
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 via-white/10 to-white/5"
          aria-hidden
        />
      )}
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored) {
            setErrored(true)
            setLoaded(true)
          }
        }}
        className={`${className} h-full w-full transition-all duration-500 ${
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.02] opacity-0 blur-sm'
        }`}
      />
    </span>
  )
}
