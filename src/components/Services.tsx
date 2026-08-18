import { motion } from 'framer-motion'
import { Clock, Sparkles } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'

function formatPrice(price: number) {
  return price.toLocaleString('en-US')
}

export function Services() {
  const { t, lang } = useLanguage()
  const { services } = useContent()
  const { toggleService, scrollToBooking } = useBooking()

  return (
    <section id="prices" className="section-padding relative">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display mb-3 text-3xl font-bold text-gradient md:text-4xl">
            {t.prices.title}
          </h2>
          <p className="text-muted">{t.prices.subtitle}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass glow-ring group relative overflow-hidden rounded-2xl p-6 transition hover:border-rose-gold/30 ${
                service.popular ? 'ring-1 ring-rose-gold/40' : ''
              }`}
            >
              <div className="absolute -top-8 -end-8 h-24 w-24 rounded-full bg-rose-gold/10 blur-2xl transition group-hover:bg-rose-gold/20" />

              {service.popular && (
                <span className="absolute top-4 start-4 rounded-full bg-rose-gold/20 px-3 py-1 text-[11px] font-semibold text-champagne ring-1 ring-rose-gold/40">
                  {t.prices.popular}
                </span>
              )}

              <div className="mb-4 flex items-start justify-between">
                <Sparkles className="h-5 w-5 text-rose-gold" />
                <span className="font-display text-2xl font-bold text-gradient">
                  {formatPrice(service.price)}
                  <span className="ms-1 text-sm font-normal text-muted">IQD</span>
                </span>
              </div>

              <h3 className="mb-1 text-lg font-semibold text-bright">
                {lang === 'ku' ? service.nameKu : service.nameEn}
              </h3>
              <p className="mb-1 text-sm text-muted">
                {lang === 'ku' ? service.nameEn : service.nameKu}
              </p>

              <div className="mb-6 flex items-center gap-2 text-sm text-muted">
                <Clock className="h-4 w-4" />
                ~{service.durationMin} {t.prices.duration}
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleService(service.id)
                  scrollToBooking()
                }}
                className="w-full rounded-full border border-rose-gold/30 py-2.5 text-sm font-medium text-champagne transition hover:bg-rose-gold/15"
              >
                {t.prices.book}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
