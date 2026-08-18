import { useLanguage } from '../context/LanguageContext'

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="glass flex rounded-full p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLang('ku')}
        className={`rounded-full px-3 py-1.5 transition-all ${
          lang === 'ku'
            ? 'bg-rose-gold/20 text-champagne shadow-[0_0_20px_rgba(224,169,109,0.3)]'
            : 'text-muted hover:text-bright'
        }`}
      >
        کوردی
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-full px-3 py-1.5 transition-all ${
          lang === 'en'
            ? 'bg-rose-gold/20 text-champagne shadow-[0_0_20px_rgba(224,169,109,0.3)]'
            : 'text-muted hover:text-bright'
        }`}
      >
        English
      </button>
    </div>
  )
}
