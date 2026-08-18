import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { LazyImage } from './LazyImage'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import type { Design } from '../context/BookingContext'

type SwatchInspectorProps = {
  design: Design | null
  onClose: () => void
}

export function SwatchInspector({ design, onClose }: SwatchInspectorProps) {
  const { t, lang } = useLanguage()
  const { setDesign, scrollToBooking } = useBooking()

  const containerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [isTouch, setIsTouch] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (!design || !isTouch) return
    let frame: number
    const t0 = performance.now()
    const animate = (now: number) => {
      const elapsed = (now - t0) / 1000
      setTilt({
        rotateX: Math.sin(elapsed * 0.7) * 6,
        rotateY: Math.cos(elapsed * 0.5) * 8,
      })
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [design, isTouch])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouch) return
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        setTilt({ rotateX: -y * 22, rotateY: x * 22 })
      })
    },
    [isTouch],
  )

  const handleMouseLeave = useCallback(() => {
    if (isTouch) return
    setTilt({ rotateX: 0, rotateY: 0 })
  }, [isTouch])

  const handleSelect = () => {
    if (design) {
      setDesign(design)
      onClose()
      scrollToBooking()
    }
  }

  useEffect(() => {
    if (!design) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [design, onClose])

  useEffect(() => {
    document.body.style.overflow = design ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [design])

  return (
    <AnimatePresence>
      {design && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: 'rgba(13,13,17,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 end-5 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-muted transition hover:bg-white/15 hover:text-bright"
            aria-label={t.modal.close}
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            className="pointer-events-none absolute"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -55%)',
              width: 'min(80vw, 560px)',
              height: 'min(80vw, 560px)',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(224,169,109,0.28) 0%, rgba(244,194,194,0.12) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            aria-hidden
          />

          <motion.div
            ref={containerRef}
            className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ scale: 0.35, y: 80, opacity: 0, rotateX: 15 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.7, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.8 }}
          >
            <div
              className="mb-10 flex items-center justify-center"
              style={{
                perspective: '1400px',
                width: '100%',
                height: 'clamp(280px, 55vh, 420px)',
              }}
            >
              <motion.div
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 18, stiffness: 180 }}
                style={{
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: isTouch ? 'none' : 'transform 0.12s ease-out',
                  willChange: 'transform',
                }}
              >
                <button
                  type="button"
                  className="swatch swatch--active pointer-events-none"
                  style={
                    {
                      '--stick-w': 'clamp(80px, 16vw, 120px)',
                      '--stick-h': 'clamp(280px, 55vh, 420px)',
                    } as React.CSSProperties
                  }
                  tabIndex={-1}
                  aria-hidden
                >
                  <span className="swatch__tip">
                    <LazyImage
                      src={design.imagePath}
                      alt={lang === 'ku' ? design.name_ku : design.name_en}
                      className="h-full w-full object-cover"
                      priority
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
              </motion.div>
            </div>

            <motion.div
              className="flex w-full flex-col items-center gap-5 px-4 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
            >
              <div>
                <p className="mb-1 text-xs font-medium tracking-widest uppercase text-rose-gold">
                  {t.catalog.swatchFan}
                </p>
                <h3 className="font-display text-3xl font-bold text-gradient sm:text-4xl">
                  {lang === 'ku' ? design.name_ku : design.name_en}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleSelect}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-gold to-blush px-10 py-4 text-base font-semibold text-onyx shadow-[0_0_50px_rgba(224,169,109,0.5)] transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                {t.catalog.selectModel}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
