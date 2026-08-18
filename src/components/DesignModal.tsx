import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import type { Design } from '../context/BookingContext'
import { categoryOrder, type DesignCategory } from '../data/salonInfo'

type DesignModalProps = {
  design: Design | null
  onClose: () => void
}

export function DesignModal({ design, onClose }: DesignModalProps) {
  const { t, lang } = useLanguage()
  const { setDesign, scrollToBooking } = useBooking()

  const category: DesignCategory | undefined = categoryOrder.includes(
    design?.category as DesignCategory,
  )
    ? (design?.category as DesignCategory)
    : undefined

  const handleChoose = () => {
    if (design) {
      setDesign(design)
      onClose()
      scrollToBooking()
    }
  }

  return (
    <AnimatePresence>
      {design && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-onyx/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass glow-ring relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 end-4 z-10 rounded-full bg-onyx/60 p-2 text-muted hover:text-bright"
              aria-label={t.modal.close}
            >
              <X className="h-5 w-5" />
            </button>

            <img
              src={design.imagePath}
              alt={lang === 'ku' ? design.name_ku : design.name_en}
              className="aspect-[4/5] w-full object-cover"
            />

            <div className="p-6">
              <h3 className="font-display mb-2 text-2xl font-semibold text-gradient">
                {lang === 'ku' ? design.name_ku : design.name_en}
              </h3>
              {category && (
                <p className="mb-6 text-sm text-muted">
                  {t.modal.category}: {t.categories[category]}
                </p>
              )}
              <button
                type="button"
                onClick={handleChoose}
                className="w-full rounded-full bg-gradient-to-r from-rose-gold to-blush py-3.5 font-semibold text-onyx transition hover:scale-[1.02]"
              >
                {t.catalog.choose}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
