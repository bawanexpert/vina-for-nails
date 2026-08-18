const FALLBACK_IMAGE = '/assets/profile.webp'

/** Normalize image paths for mobile Safari/Chrome — always root-absolute or HTTPS */
export function resolveImageUrl(path: string | undefined | null): string {
  if (!path || path.trim() === '') return FALLBACK_IMAGE
  const trimmed = path.trim()

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('idb://')
  ) {
    return trimmed
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function getImageFallback(): string {
  return FALLBACK_IMAGE
}
