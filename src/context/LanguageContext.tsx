import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../i18n/translations'
import { translations } from '../i18n/translations'

type Translation = (typeof translations)[Lang]

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translation
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ku')

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    document.documentElement.lang = next === 'ku' ? 'ku' : 'en'
    document.documentElement.dir = next === 'ku' ? 'rtl' : 'ltr'
  }, [])

  useEffect(() => {
    document.documentElement.lang = 'ku'
    document.documentElement.dir = 'rtl'
  }, [])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
      dir: lang === 'ku' ? ('rtl' as const) : ('ltr' as const),
    }),
    [lang, setLang],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
