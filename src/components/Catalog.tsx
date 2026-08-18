import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { categoryOrder, type DesignCategory } from '../data/salonInfo'
import { useContent } from '../context/ContentContext'
import type { Design } from '../context/BookingContext'
import { SwatchWheel } from './SwatchWheel'
import { TiltCard } from './TiltCard'
import { DesignModal } from './DesignModal'
import { SwatchInspector } from './SwatchInspector'
import { LazyImage } from './LazyImage'

export function Catalog() {
  const { t, lang } = useLanguage()
  const { swatchDesigns, galleryDesigns } = useContent()
  const [filter, setFilter] = useState<DesignCategory | 'all'>('all')
  const [modalDesign, setModalDesign] = useState<Design | null>(null)
  const [inspectDesign, setInspectDesign] = useState<Design | null>(null)

  const allDesigns = galleryDesigns
  const filtered =
    filter === 'all'
      ? allDesigns
      : allDesigns.filter((d) => d.category === filter)

  const catList: { id: DesignCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.catalog.all },
    ...categoryOrder.map((id) => ({ id, label: t.categories[id] })),
  ]

  return (
    <section id="catalog" className="section-padding relative">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="font-display mb-3 text-3xl font-bold text-gradient md:text-4xl">
            {t.catalog.title}
          </h2>
          <p className="text-muted">{t.catalog.subtitle}</p>
        </motion.div>

        <div className="swatch-section -mx-4 overflow-hidden rounded-none p-0 sm:mx-0 sm:rounded-3xl sm:p-4 md:p-8 glass glow-ring">
          <SwatchWheel designs={swatchDesigns} onInspect={setInspectDesign} />
        </div>

        <div className="mt-20">
          <div className="mb-10 text-center">
            <h2 className="font-display mb-6 text-2xl font-bold text-gradient md:text-3xl">
              {lang === 'ku' ? 'گالەری دیزاینەکان' : 'Design Gallery'}
            </h2>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {catList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`tap-target rounded-full px-4 py-2.5 text-sm transition-all min-h-[44px] ${
                  filter === cat.id
                    ? 'bg-rose-gold/20 text-champagne ring-1 ring-rose-gold/40'
                    : 'glass text-muted hover:text-bright'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="font-display text-xl font-semibold text-gradient md:text-2xl">
              {filter === 'all' ? t.catalog.all : catList.find((c) => c.id === filter)?.label}
            </h3>
            <span className="glass rounded-full px-4 py-1.5 text-xs text-muted">
              {filtered.length} {lang === 'ku' ? 'دیزاین' : 'designs'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {filtered.map((design, i) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <TiltCard
                  className="glass glow-ring group cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() => setModalDesign(design)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
                    <LazyImage
                      src={design.imagePath}
                      alt={lang === 'ku' ? design.name_ku : design.name_en}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      aspectRatio="3/4"
                    />
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-onyx/90 to-transparent p-3 transition duration-300 group-hover:translate-y-0">
                      <p className="text-sm font-medium text-bright">
                        {lang === 'ku' ? design.name_ku : design.name_en}
                      </p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <DesignModal design={modalDesign} onClose={() => setModalDesign(null)} />
      <SwatchInspector design={inspectDesign} onClose={() => setInspectDesign(null)} />
    </section>
  )
}
