import { useEffect, useState } from 'react'
import { getImage, isIdbPath, idFromPath } from '../lib/imageStore'

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
  const [resolved, setResolved] = useState(src)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!isIdbPath(src)) {
      setResolved(src)
      return
    }
    getImage(idFromPath(src)).then((url) => {
      if (!cancelled && url) setResolved(url)
    })
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <img
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  )
}
