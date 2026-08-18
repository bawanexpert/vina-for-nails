import { motion } from 'framer-motion'
import { Sparkles, MapPin, Star, Phone } from 'lucide-react'
import { salonInfo } from '../data/salonInfo'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import designs from '../data/designs.json'
import type { Design } from '../context/BookingContext'
import { SwatchStick } from './SwatchStick'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Hero() {
  const { t } = useLanguage()
  const { scrollToBooking } = useBooking()
  const preview = (designs as Design[]).slice(0, 3)

  return (
    <section id="hero" className="relative overflow-hidden pt-32 pb-16 md:pt-36">
      <div className="section-padding mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-champagne">
            <MapPin className="h-4 w-4 text-rose-gold" />
            {t.hero.badge}
          </div>

          <h1 className="font-display mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
            <span className="text-gradient">{t.hero.title}</span>
          </h1>

          <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={scrollToBooking}
              className="rounded-full bg-gradient-to-r from-rose-gold to-blush px-8 py-4 font-semibold text-onyx shadow-[0_0_40px_rgba(224,169,109,0.4)] transition hover:scale-105"
            >
              {t.hero.cta}
            </button>
            <button
              type="button"
              onClick={() =>
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="glass rounded-full px-8 py-4 font-medium text-bright transition hover:border-rose-gold/40"
            >
              {t.hero.explore}
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            {[t.hero.proof1, t.hero.proof2, t.hero.proof3].map((label) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted">
                <Star className="h-4 w-4 fill-rose-gold text-rose-gold" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* Decorative mini swatch fan */}
          <div className="hero-fan mb-8" aria-hidden>
            {preview.map((design, i) => (
              <div
                key={design.id}
                className="hero-fan__slot"
                style={{
                  transform: `rotate(${(i - 1) * 22}deg)`,
                  zIndex: 3 - Math.abs(i - 1),
                  opacity: i === 1 ? 1 : 0.85,
                }}
              >
                <SwatchStick design={design} active={i === 1} />
              </div>
            ))}
          </div>

          {/* About badge — profile picture lives ONLY here and in the header */}
          <div className="glass glow-ring relative overflow-hidden rounded-3xl p-6">
            <div
              className="pointer-events-none absolute -top-16 -end-16 h-48 w-48 rounded-full bg-rose-gold/15 blur-3xl"
              aria-hidden
            />
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={salonInfo.profileImage}
                  alt={salonInfo.brandName}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-rose-gold/60"
                />
                <span
                  className="absolute -bottom-1 -end-1 rounded-full bg-gradient-to-br from-rose-gold to-blush p-1.5"
                  aria-hidden
                >
                  <Sparkles className="h-3.5 w-3.5 text-onyx" />
                </span>
              </div>
              <div>
                <p className="text-xs tracking-wide text-muted uppercase">{t.hero.profileHint}</p>
                <h2 className="font-display text-2xl font-semibold text-gradient">
                  {salonInfo.brandName}
                </h2>
                <p className="mt-1 text-sm text-muted">{salonInfo.location.fullKu}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={salonInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm text-champagne transition hover:border-rose-gold/40"
              >
                <InstagramIcon className="h-4 w-4 text-rose-gold" />
                {salonInfo.instagram}
              </a>
              <a
                href={`tel:${salonInfo.phones[0]}`}
                className="glass flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm text-champagne transition hover:border-rose-gold/40"
                dir="ltr"
              >
                <Phone className="h-4 w-4 text-rose-gold" />
                {salonInfo.phones[0]}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
