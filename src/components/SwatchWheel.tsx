import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, ZoomIn } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import type { Design } from '../context/BookingContext'
import { SwatchStick } from './SwatchStick'

const MAX_ANGLE = 72
const SWIPE_THRESHOLD = 50
const VELOCITY_THRESHOLD = 0.3

type SwatchWheelProps = {
  designs: Design[]
  onInspect?: (design: Design) => void
}

export function SwatchWheel({ designs, onInspect }: SwatchWheelProps) {
  const { t, lang } = useLanguage()
  const { setDesign, scrollToBooking } = useBooking()

  const [active, setActive] = useState(0)
  const [spin, setSpin] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{
    startX: number
    startIdx: number
    moved: boolean
    lastX: number
    lastTime: number
    velocity: number
  } | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  const count = designs.length
  const step = count > 1 ? Math.min(160 / (count - 1), 34) : 0

  useEffect(() => {
    setActive(0)
    setSpin(0)
  }, [designs])

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(count - 1, target))
      setSpin(0)
      setActive(clamped)
    },
    [count],
  )

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    goTo(active - 1)
  }

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    goTo(active + 1)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.swatch-wheel__arrow')) return
    const now = performance.now()
    dragRef.current = {
      startX: e.clientX,
      startIdx: active,
      moved: false,
      lastX: e.clientX,
      lastTime: now,
      velocity: 0,
    }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const now = performance.now()
    const dt = now - drag.lastTime
    if (dt > 0) {
      drag.velocity = (e.clientX - drag.lastX) / dt
    }
    drag.lastX = e.clientX
    drag.lastTime = now

    const dx = e.clientX - drag.startX
    if (Math.abs(dx) > 6) drag.moved = true
    const next = Math.max(0, Math.min(count - 1, drag.startIdx + dx / 70))
    setSpin(next - drag.startIdx)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (drag && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (!drag) return

    const dx = drag.lastX - drag.startX
    let target = Math.round(drag.startIdx + spin)

    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(drag.velocity) > VELOCITY_THRESHOLD) {
      const flick = drag.velocity > 0.3 ? -1 : drag.velocity < -0.3 ? 1 : 0
      if (flick !== 0) {
        target = active + flick
      } else if (dx > SWIPE_THRESHOLD) {
        target = active - 1
      } else if (dx < -SWIPE_THRESHOLD) {
        target = active + 1
      }
    }

    dragRef.current = null
    setDragging(false)
    goTo(target)
  }

  const items = designs.map((design, i) => {
    const angle = (i - active - spin) * step
    const abs = Math.abs(angle)
    const fade =
      abs > MAX_ANGLE * 0.6
        ? 1 - Math.min(1, (abs - MAX_ANGLE * 0.6) / (MAX_ANGLE * 0.4))
        : 1
    return {
      design,
      i,
      angle,
      opacity: abs > MAX_ANGLE ? 0 : fade,
      scale: abs < 6 ? 1.16 : Math.max(0.72, 1.16 - (abs / MAX_ANGLE) * 0.62),
      isActive: i === active,
      z: 40 - Math.round(abs),
    }
  })

  const activeDesign = designs[active]

  return (
    <div className="swatch-wheel-wrap">
      <div
        ref={wheelRef}
        className={`swatch-wheel${dragging ? ' is-dragging' : ''}`}
        role="region"
        aria-label={t.catalog.title}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        <div className="swatch-wheel__fan">
          {items.map(({ design, i, angle, opacity, scale, isActive, z }) => (
            <div
              key={design.id}
              className="swatch-wheel__slot"
              style={{
                transform: `rotate(${angle}deg) translateZ(0)`,
                opacity,
                zIndex: z,
              }}
            >
              <SwatchStick
                design={design}
                active={isActive}
                className={dragging ? 'is-dragging' : undefined}
                style={{ transform: `scale(${scale}) translateZ(0)` }}
                onClick={() => {
                  if (dragRef.current?.moved) return
                  if (isActive) {
                    onInspect?.(design)
                  } else {
                    goTo(i)
                  }
                }}
              />
            </div>
          ))}
        </div>

        <div className="swatch-wheel__floor" aria-hidden />

        <button
          type="button"
          aria-label={t.booking.back}
          onClick={goPrev}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={active === 0}
          className="swatch-wheel__arrow swatch-wheel__arrow--prev tap-target"
        >
          {lang === 'ku' ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          aria-label={t.booking.next}
          onClick={goNext}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={active >= count - 1}
          className="swatch-wheel__arrow swatch-wheel__arrow--next tap-target"
        >
          {lang === 'ku' ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {activeDesign && (
        <div className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-3 px-2 text-center md:mt-8 md:gap-4">
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-champagne">
            <Sparkles className="h-4 w-4 text-rose-gold" />
            {t.catalog.selected}
          </div>
          <h3 className="font-display text-xl font-semibold text-gradient sm:text-2xl md:text-3xl">
            {lang === 'ku' ? activeDesign.name_ku : activeDesign.name_en}
          </h3>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              onClick={() => onInspect?.(activeDesign)}
              className="tap-target glass flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-bright"
            >
              <ZoomIn className="h-4 w-4" />
              {t.catalog.inspect}
            </button>
            <button
              type="button"
              onClick={() => setDesign(activeDesign)}
              className="tap-target glass rounded-full px-5 py-3 text-sm font-medium text-bright"
            >
              {t.catalog.choose}
            </button>
            <button
              type="button"
              onClick={() => {
                setDesign(activeDesign)
                scrollToBooking()
              }}
              className="tap-target rounded-full bg-gradient-to-r from-rose-gold to-blush px-6 py-3 text-sm font-semibold text-onyx shadow-[0_0_30px_rgba(224,169,109,0.35)]"
            >
              {t.catalog.bookDesign}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
