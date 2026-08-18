import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import { Home, LayoutGrid, Phone, MapPin } from 'lucide-react'

const links = [
  { id: 'hero', icon: Home, labelKey: 'home' as const },
  { id: 'catalog', icon: LayoutGrid, labelKey: 'catalog' as const },
  { id: 'booking', icon: Phone, labelKey: 'book' as const },
  { id: 'contact', icon: MapPin, labelKey: 'contact' as const },
]

export function MobileNavBar() {
  const { t } = useLanguage()
  const { scrollToBooking } = useBooking()

  const scrollTo = (id: string) => {
    if (id === 'booking') {
      scrollToBooking()
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const labels: Record<string, string> = {
    home: t.nav.home,
    catalog: t.nav.catalog,
    book: t.nav.book,
    contact: t.nav.contact,
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-onyx/95 backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {links.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className="tap-target flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] text-muted transition hover:bg-white/5 hover:text-champagne active:scale-95"
          >
            <Icon className="h-5 w-5" />
            <span>{labels[labelKey]}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
