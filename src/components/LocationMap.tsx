import { MapPin, Phone } from 'lucide-react'
import { salonInfo } from '../data/salonInfo'
import { useLanguage } from '../context/LanguageContext'

export function LocationMap() {
  const { t, lang } = useLanguage()
  const { lat, lng } = salonInfo.location.coordinates
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <section id="contact" className="section-padding relative">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass glow-ring overflow-hidden rounded-3xl">
            <iframe
              title="Salon location"
              src={mapSrc}
              className="h-[320px] w-full border-0 md:h-[400px]"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div>
              <h3 className="font-display mb-2 text-2xl font-semibold text-gradient">
                {t.footer.location}
              </h3>
              <div className="flex items-start gap-3 text-muted">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-rose-gold" />
                <div>
                  <p className="text-lg text-bright">
                    {lang === 'ku'
                      ? salonInfo.location.fullKu
                      : salonInfo.location.fullEn}
                  </p>
                  <p className="text-sm">{salonInfo.location.mapQuery}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display mb-2 text-2xl font-semibold text-gradient">
                {t.footer.contact}
              </h3>
              <div className="flex flex-col gap-3">
                {salonInfo.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 text-muted transition hover:text-champagne"
                    dir="ltr"
                  >
                    <Phone className="h-5 w-5 text-rose-gold" />
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display mb-2 text-2xl font-semibold text-gradient">
                {t.footer.follow}
              </h3>
              <a
                href={salonInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-muted transition hover:text-champagne"
              >
                <svg
                  className="h-5 w-5 text-rose-gold"
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
                {salonInfo.instagram}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
