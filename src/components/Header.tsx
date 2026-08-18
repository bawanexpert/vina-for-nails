import { useEffect, useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { salonInfo } from '../data/salonInfo'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import { LanguageSwitcher } from './LanguageSwitcher'

const navIds = ['hero', 'catalog', 'prices', 'booking', 'contact'] as const

export function Header() {
  const { t } = useLanguage()
  const { scrollToBooking } = useBooking()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLabels = [
    t.nav.home,
    t.nav.catalog,
    t.nav.prices,
    t.nav.booking,
    t.nav.contact,
  ]

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass glow-ring py-1.5 md:py-2' : 'bg-transparent py-2 md:py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 md:px-8">
        <button
          type="button"
          onClick={() => scrollTo('hero')}
          className="tap-target flex min-h-[44px] items-center gap-2 md:gap-3"
          aria-label={salonInfo.brandName}
        >
          <span className="relative">
            <img
              src={salonInfo.profileImage}
              alt={salonInfo.brandName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-rose-gold/50"
              width={44}
              height={44}
            />
            <span
              className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-rose-gold ring-2 ring-onyx"
              aria-hidden
            />
          </span>
          <span className="font-display hidden font-semibold tracking-wide text-gradient sm:inline sm:text-xl">
            {salonInfo.brandDisplay}
          </span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          {navIds.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="text-sm text-muted transition-colors hover:text-champagne"
            >
              {navLabels[i]}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={scrollToBooking}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-gold/90 to-blush/80 px-5 py-2.5 text-sm font-semibold text-onyx shadow-[0_0_30px_rgba(224,169,109,0.35)] transition hover:scale-105"
          >
            <Phone className="h-4 w-4" />
            {t.nav.book}
          </button>
        </div>

        <button
          type="button"
          className="tap-target flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-bright lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              {navIds.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className="tap-target min-h-[44px] text-start text-muted hover:text-champagne"
                >
                  {navLabels[i]}
                </button>
              ))}
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  scrollToBooking()
                }}
                className="rounded-full bg-gradient-to-r from-rose-gold/90 to-blush/80 px-5 py-3 font-semibold text-onyx"
              >
                {t.nav.book}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
