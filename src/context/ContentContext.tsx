import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Design } from './BookingContext'
import type { Service } from '../data/salonInfo'
import { services as defaultServices } from '../data/salonInfo'
import { swatchDesigns as defaultSwatchDesigns } from '../data/swatchDesigns'
import defaultGalleryDesigns from '../data/designs.json'

const STORAGE_KEY = 'vina_nails_cms_v1'
const PIN_KEY = 'vina_nails_admin_pin'
export const DEFAULT_ADMIN_PIN = '1234'

export type ContentData = {
  swatchDesigns: Design[]
  galleryDesigns: Design[]
  services: Service[]
}

function cloneData(data: ContentData): ContentData {
  return structuredClone(data)
}

function loadDefaults(): ContentData {
  return {
    swatchDesigns: [...defaultSwatchDesigns],
    galleryDesigns: [...(defaultGalleryDesigns as Design[])],
    services: defaultServices.map((s) => ({ ...s })),
  }
}

function loadFromStorage(): ContentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return loadDefaults()
    const parsed = JSON.parse(raw) as ContentData
    if (!parsed.swatchDesigns || !parsed.galleryDesigns || !parsed.services) {
      return loadDefaults()
    }
    return parsed
  } catch {
    return loadDefaults()
  }
}

function saveToStorage(data: ContentData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

type ContentContextValue = {
  swatchDesigns: Design[]
  galleryDesigns: Design[]
  services: Service[]
  draft: ContentData | null
  hasPendingChanges: boolean
  initDraft: () => void
  saveAndApply: () => void
  discardDraft: () => void
  addSwatchDesign: (design: Design) => void
  updateSwatchDesign: (id: string, patch: Partial<Design>) => void
  deleteSwatchDesign: (id: string) => void
  addGalleryDesign: (design: Design) => void
  updateGalleryDesign: (id: string, patch: Partial<Design>) => void
  deleteGalleryDesign: (id: string) => void
  addService: (service: Service) => void
  updateService: (id: string, patch: Partial<Service>) => void
  deleteService: (id: string) => void
  exportData: () => string
  importData: (json: string) => boolean
  resetToDefaults: () => void
  verifyPin: (pin: string) => boolean
  getPin: () => string
  setPin: (pin: string) => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<ContentData>(loadFromStorage)
  const [draft, setDraft] = useState<ContentData | null>(null)

  const working = draft ?? live

  const hasPendingChanges = useMemo(() => {
    if (!draft) return false
    return JSON.stringify(draft) !== JSON.stringify(live)
  }, [draft, live])

  const initDraft = useCallback(() => {
    setDraft(cloneData(live))
  }, [live])

  const saveAndApply = useCallback(() => {
    if (!draft) return
    setLive(draft)
    saveToStorage(draft)
    setDraft(null)
  }, [draft])

  const discardDraft = useCallback(() => {
    setDraft(null)
  }, [])

  const mutateDraft = useCallback((fn: (prev: ContentData) => ContentData) => {
    setDraft((prev) => fn(prev ?? live))
  }, [live])

  const mutateLive = useCallback((fn: (prev: ContentData) => ContentData) => {
    setLive((prev) => {
      const next = fn(prev)
      saveToStorage(next)
      return next
    })
  }, [])

  const mutate = draft ? mutateDraft : mutateLive

  const addSwatchDesign = useCallback(
    (design: Design) => mutate((p) => ({ ...p, swatchDesigns: [...p.swatchDesigns, design] })),
    [mutate],
  )
  const updateSwatchDesign = useCallback(
    (id: string, patch: Partial<Design>) =>
      mutate((p) => ({
        ...p,
        swatchDesigns: p.swatchDesigns.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      })),
    [mutate],
  )
  const deleteSwatchDesign = useCallback(
    (id: string) =>
      mutate((p) => ({ ...p, swatchDesigns: p.swatchDesigns.filter((d) => d.id !== id) })),
    [mutate],
  )

  const addGalleryDesign = useCallback(
    (design: Design) => mutate((p) => ({ ...p, galleryDesigns: [...p.galleryDesigns, design] })),
    [mutate],
  )
  const updateGalleryDesign = useCallback(
    (id: string, patch: Partial<Design>) =>
      mutate((p) => ({
        ...p,
        galleryDesigns: p.galleryDesigns.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      })),
    [mutate],
  )
  const deleteGalleryDesign = useCallback(
    (id: string) =>
      mutate((p) => ({ ...p, galleryDesigns: p.galleryDesigns.filter((d) => d.id !== id) })),
    [mutate],
  )

  const addService = useCallback(
    (service: Service) => mutate((p) => ({ ...p, services: [...p.services, service] })),
    [mutate],
  )
  const updateService = useCallback(
    (id: string, patch: Partial<Service>) =>
      mutate((p) => ({
        ...p,
        services: p.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })),
    [mutate],
  )
  const deleteService = useCallback(
    (id: string) => mutate((p) => ({ ...p, services: p.services.filter((s) => s.id !== id) })),
    [mutate],
  )

  const exportData = useCallback(() => JSON.stringify(working, null, 2), [working])

  const importData = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as ContentData
        if (!parsed.swatchDesigns || !parsed.galleryDesigns || !parsed.services) return false
        if (draft) setDraft(parsed)
        else {
          setLive(parsed)
          saveToStorage(parsed)
        }
        return true
      } catch {
        return false
      }
    },
    [draft],
  )

  const resetToDefaults = useCallback(() => {
    const defaults = loadDefaults()
    if (draft) setDraft(defaults)
    else {
      setLive(defaults)
      saveToStorage(defaults)
    }
  }, [draft])

  const verifyPin = useCallback((pin: string) => {
    const stored = localStorage.getItem(PIN_KEY) ?? DEFAULT_ADMIN_PIN
    return pin === stored
  }, [])

  const getPin = useCallback(() => localStorage.getItem(PIN_KEY) ?? DEFAULT_ADMIN_PIN, [])

  const setPin = useCallback((pin: string) => {
    localStorage.setItem(PIN_KEY, pin)
  }, [])

  const value = useMemo(
    () => ({
      swatchDesigns: live.swatchDesigns,
      galleryDesigns: live.galleryDesigns,
      services: live.services,
      draft,
      hasPendingChanges,
      initDraft,
      saveAndApply,
      discardDraft,
      addSwatchDesign,
      updateSwatchDesign,
      deleteSwatchDesign,
      addGalleryDesign,
      updateGalleryDesign,
      deleteGalleryDesign,
      addService,
      updateService,
      deleteService,
      exportData,
      importData,
      resetToDefaults,
      verifyPin,
      getPin,
      setPin,
    }),
    [
      live,
      draft,
      hasPendingChanges,
      initDraft,
      saveAndApply,
      discardDraft,
      addSwatchDesign,
      updateSwatchDesign,
      deleteSwatchDesign,
      addGalleryDesign,
      updateGalleryDesign,
      deleteGalleryDesign,
      addService,
      updateService,
      deleteService,
      exportData,
      importData,
      resetToDefaults,
      verifyPin,
      getPin,
      setPin,
    ],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}

/** Admin-only: returns draft data when editing, otherwise live */
export function useAdminContent() {
  const ctx = useContent()
  const data = ctx.draft ?? {
    swatchDesigns: ctx.swatchDesigns,
    galleryDesigns: ctx.galleryDesigns,
    services: ctx.services,
  }
  return { ...ctx, ...data }
}
