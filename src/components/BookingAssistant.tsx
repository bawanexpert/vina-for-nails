import { useState } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, MessageCircle, Phone } from 'lucide-react'
import { nailShapes, timeSlots, salonInfo } from '../data/salonInfo'
import { useLanguage } from '../context/LanguageContext'
import { useBooking } from '../context/BookingContext'
import { useContent } from '../context/ContentContext'

const TOTAL_STEPS = 3

function formatDate(date: string, lang: 'ku' | 'en') {
  if (!date) return '—'
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString(lang === 'ku' ? 'ckb' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildMessage(
  lang: 'ku' | 'en',
  booking: ReturnType<typeof useBooking>['booking'],
  services: ReturnType<typeof useContent>['services'],
) {
  const selectedServices = services.filter((s) => booking.services.includes(s.id))
  const shape = nailShapes.find((s) => s.id === booking.shape)
  const design = booking.design

  if (lang === 'ku') {
    return [
      '💅 سڵاو! داواکاری نۆرە — vina_for_nails',
      '',
      `📋 خزمەتگوزاری: ${selectedServices.map((s) => s.nameKu).join('، ') || '—'}`,
      `💎 شێوەی نینۆک: ${shape?.nameKu ?? '—'}`,
      `🎨 ستایل / دیزاین: ${design ? design.name_ku : '—'}`,
      `📅 بەروار: ${formatDate(booking.date, lang)}`,
      `🕐 کات: ${booking.time || '—'}`,
      '',
      `👤 ناو: ${booking.name || '—'}`,
      `📱 ژمارە: ${booking.phone || '—'}`,
      '',
      `📍 ${salonInfo.location.fullKu}`,
      '',
      'زۆر سوپاس! 🙏',
    ].join('\n')
  }

  return [
    '💅 Hello! Booking request — vina_for_nails',
    '',
    `📋 Service: ${selectedServices.map((s) => s.nameEn).join(', ') || '—'}`,
    `💎 Nail shape: ${shape?.nameEn ?? '—'}`,
    `🎨 Style / Design: ${design ? design.name_en : '—'}`,
    `📅 Date: ${formatDate(booking.date, lang)}`,
    `🕐 Time: ${booking.time || '—'}`,
    '',
    `👤 Name: ${booking.name || '—'}`,
    `📱 Phone: ${booking.phone || '—'}`,
    '',
    `📍 ${salonInfo.location.fullEn}`,
    '',
    'Thank you! 🙏',
  ].join('\n')
}

export function BookingAssistant() {
  const { t, lang } = useLanguage()
  const { services, swatchDesigns } = useContent()
  const {
    booking,
    toggleService,
    setShape,
    setDesign,
    setDate,
    setTime,
    setName,
    setPhone,
  } = useBooking()

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const stepLabels = [t.booking.step1, t.booking.step2, t.booking.step3]
  const minDate = new Date().toISOString().split('T')[0]

  const canNext = () => {
    if (step === 1) return booking.services.length > 0
    if (step === 2) return !!booking.design
    return false
  }

  const canSubmit = () =>
    !!booking.date &&
    !!booking.time &&
    booking.name.trim().length >= 2 &&
    booking.phone.trim().length >= 8

  const handleSubmit = () => {
    if (!canSubmit()) return
    setSubmitted(true)
    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#E0A96D', '#F4C2C2', '#F7E7CE', '#FAFAFA'],
    })
  }

  const message = buildMessage(lang, booking, services)
  const makeWhatsAppUrl = (number: string) =>
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  const handleViber = async () => {
    try {
      await navigator.clipboard.writeText(message)
      alert(t.booking.viberCopy)
    } catch {
      alert(message)
    }
    window.location.href = `viber://chat?number=%2B${salonInfo.viberNumber}`
  }

  const inputClass =
    'luxury-input w-full rounded-xl px-4 py-3 text-bright outline-none focus:ring-1 focus:ring-rose-gold/50'

  return (
    <section id="booking" className="section-padding relative pb-28 md:pb-16">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="font-display mb-3 text-3xl font-bold text-gradient md:text-4xl">
            {t.booking.title}
          </h2>
          <p className="text-muted">{t.booking.subtitle}</p>
        </motion.div>

        <div className="glass glow-ring rounded-3xl p-6 md:p-8">
          <div className="mb-8 flex justify-between gap-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                    i + 1 <= step
                      ? 'bg-rose-gold/30 text-champagne ring-1 ring-rose-gold/50 shadow-[0_0_20px_rgba(224,169,109,0.25)]'
                      : 'bg-white/5 text-muted'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-center text-[10px] text-muted sm:text-xs">{label}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 1: Services */}
              {step === 1 && (
                <div>
                  <h3 className="mb-4 font-medium text-bright">{t.booking.selectService}</h3>
                  <div className="grid gap-3">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-start transition ${
                          booking.services.includes(s.id)
                            ? 'border-rose-gold/50 bg-rose-gold/20 shadow-[0_0_20px_rgba(224,169,109,0.15)]'
                            : 'border-white/10 bg-white/5 hover:border-rose-400/30 hover:bg-white/10'
                        }`}
                      >
                        <span>{lang === 'ku' ? s.nameKu : s.nameEn}</span>
                        <span className="text-sm font-semibold text-champagne">
                          {s.price.toLocaleString()} IQD
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Swatch + Shape */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 font-medium text-bright">{t.booking.selectDesign}</h3>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
                      {swatchDesigns.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDesign(d)}
                          className={`group overflow-hidden rounded-xl border-2 transition ${
                            booking.design?.id === d.id
                              ? 'border-rose-gold shadow-[0_0_20px_rgba(224,169,109,0.35)]'
                              : 'border-white/10 hover:border-rose-400/40'
                          }`}
                        >
                          <img
                            src={d.imagePath}
                            alt={lang === 'ku' ? d.name_ku : d.name_en}
                            loading="lazy"
                            className="aspect-[3/4] w-full object-cover"
                          />
                          <span className="block truncate bg-onyx/80 px-1.5 py-1 text-[10px] text-champagne">
                            {lang === 'ku' ? d.name_ku : d.name_en}
                          </span>
                        </button>
                      ))}
                    </div>
                    {!booking.design && (
                      <p className="mt-2 text-sm text-muted">{t.booking.noDesign}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-4 font-medium text-bright">{t.booking.selectShape}</h3>
                    <div className="flex flex-wrap gap-2">
                      {nailShapes.map((shape) => (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => setShape(shape.id)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            booking.shape === shape.id
                              ? 'border-rose-gold/50 bg-rose-gold/25 text-champagne shadow-[0_0_15px_rgba(224,169,109,0.2)]'
                              : 'border-white/10 bg-white/5 text-muted hover:border-rose-400/30 hover:text-bright'
                          }`}
                        >
                          {lang === 'ku' ? shape.nameKu : shape.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Date, Time, Contact, Send */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm text-muted">{t.booking.selectDate}</label>
                    <input
                      type="date"
                      min={minDate}
                      value={booking.date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm text-muted">{t.booking.selectTime}</label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                            booking.time === slot
                              ? 'border-rose-gold/60 bg-rose-gold/25 text-champagne shadow-[0_0_20px_rgba(224,169,109,0.3)]'
                              : 'border-white/10 bg-white/5 text-bright hover:border-rose-400/40 hover:bg-white/10'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-muted">{t.booking.name}</label>
                      <input
                        type="text"
                        value={booking.name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        placeholder={lang === 'ku' ? 'ناوی تۆ' : 'Your name'}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-muted">{t.booking.phone}</label>
                      <input
                        type="tel"
                        value={booking.phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                        dir="ltr"
                        placeholder="07XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-medium text-bright">{t.booking.summary}</h3>
                    <pre className="glass mb-4 max-h-40 overflow-auto rounded-xl p-4 text-xs whitespace-pre-wrap text-muted">
                      {message}
                    </pre>

                    {!submitted ? (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit()}
                        className="w-full rounded-full bg-gradient-to-r from-rose-gold to-blush py-3.5 font-semibold text-onyx transition hover:scale-[1.02] disabled:opacity-40"
                      >
                        {t.booking.submit}
                      </button>
                    ) : (
                      <div>
                        <p className="mb-4 text-center text-sm text-champagne">
                          {t.booking.confirm}
                        </p>
                        <div className="flex flex-col gap-3">
                          <a
                            href={makeWhatsAppUrl(salonInfo.whatsappNumbers[0])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white transition hover:scale-[1.02]"
                          >
                            <MessageCircle className="h-5 w-5" />
                            {t.booking.whatsapp}
                          </a>
                          <a
                            href={makeWhatsAppUrl(salonInfo.whatsappNumbers[1])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-full border border-[#25D366]/60 bg-[#25D366]/15 py-3.5 font-semibold text-[#6BE38A] transition hover:scale-[1.02]"
                          >
                            <MessageCircle className="h-5 w-5" />
                            {t.booking.whatsappAlt}
                          </a>
                          <button
                            type="button"
                            onClick={handleViber}
                            className="flex items-center justify-center gap-2 rounded-full bg-[#7360F2] py-3.5 font-semibold text-white transition hover:scale-[1.02]"
                          >
                            <Phone className="h-5 w-5" />
                            {t.booking.viber}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < TOTAL_STEPS && (
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.booking.back}
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                disabled={!canNext()}
                className="flex items-center gap-1 rounded-full bg-rose-gold/20 px-6 py-2 text-sm font-medium text-champagne disabled:opacity-30"
              >
                {t.booking.next}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === TOTAL_STEPS && step > 1 && (
            <div className="mt-6 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.booking.back}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
