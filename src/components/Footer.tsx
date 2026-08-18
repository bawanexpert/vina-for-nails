import { Heart, Lock } from 'lucide-react'
import { salonInfo } from '../data/salonInfo'
import { useLanguage } from '../context/LanguageContext'

export function Footer() {
  const { t, lang } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 py-12 pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <img
              src={salonInfo.profileImage}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-2 ring-rose-gold/30"
              width={48}
              height={48}
            />
            <span className="font-display text-2xl font-semibold text-gradient">
              {salonInfo.brandDisplay}
            </span>
          </div>

          <p className="text-sm text-muted">{t.footer.tagline}</p>

          <p className="flex items-center gap-1 text-xs text-muted">
            © {year} {salonInfo.brandName}. {t.footer.rights}
            <Heart className="mx-1 h-3 w-3 fill-blush text-blush" />
            {lang === 'ku' ? 'سلێمانی · زەرینۆک' : 'Sulaymaniyah · Zerinok'}
          </p>

          <a
            href="/admin"
            className="mt-2 flex items-center gap-1.5 text-[10px] text-muted/40 transition hover:text-muted/70"
            title={t.admin.title}
          >
            <Lock className="h-3 w-3" />
            Admin
          </a>
        </div>
      </div>
    </footer>
  )
}
