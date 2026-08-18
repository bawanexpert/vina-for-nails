import type { CSSProperties } from 'react'
import type { Design } from '../context/BookingContext'
import { LazyImage } from './LazyImage'

type SwatchStickProps = {
  design: Design
  active?: boolean
  onClick?: () => void
  className?: string
  style?: CSSProperties
  label?: string
}

/**
 * A realistic salon swatch stick: white plastic stem crowned with a polished
 * almond nail tip carrying the design artwork, finished with an acrylic-gloss
 * shine overlay. Pure CSS — GPU-accelerated transforms only.
 */
export function SwatchStick({
  design,
  active = false,
  onClick,
  className = '',
  style,
  label,
}: SwatchStickProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={design.name_en}
      title={label ?? design.name_en}
      onClick={onClick}
      style={style}
      className={`swatch ${active ? 'swatch--active' : ''} ${className} tap-target`}
    >
      <span className="swatch__tip">
        <LazyImage
          src={design.imagePath}
          alt=""
          className="h-full w-full object-cover"
          width={56}
          height={120}
        />
        <span className="swatch__gloss" aria-hidden />
        <span className="swatch__gloss swatch__gloss--sweep" aria-hidden />
        <span className="swatch__shade" aria-hidden />
      </span>
      <span className="swatch__stem" aria-hidden>
        <span className="swatch__stem-shine" />
      </span>
      <span className="swatch__base" aria-hidden />
    </button>
  )
}
