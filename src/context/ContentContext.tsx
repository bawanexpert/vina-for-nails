import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Design } from './BookingContext'
import type { Service } from '../data/salonInfo'
import type { ContentData } from '../types/content'
import { services as defaultServices } from '../data/salonInfo'
import { swatchDesigns as defaultSwatchDesigns } from '../data/swatchDesigns'
import defaultGalleryDesigns from '../data/designs.json'
import {
  fetchCloudContent,
  subscribeToCloudContent,
  syncCloudContent,
  updateAdminPin,
} from '../lib/cloudSync'

const PIN_KEY = 'vina_nails_admin_pin_local'
export const DEFAULT_ADMIN_PIN = '1234'

export type { ContentData }

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

function loadLocalFallback(): ContentData {
  try {
    const raw = localStorage.getItem('vina_nails_cms_v1')
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

type ContentContextValue = {
  swatchDesigns: Design[]
  galleryDesigns: Design[]
  services: Service[]
  draft: ContentData | null
  hasPendingChanges: boolean
  loading: boolean
  syncing: boolean
  cloudConnected: boolean
  initDraft: () => void
  saveAndApply: () => Promise<void>
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
  setPin: (pin: string) => Promise<void>
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<ContentData>(loadLocalFallback)
  const [draft, setDraft] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [cloudConnected, setCloudConnected] = useState(false)
  const [cloudAdminPin, setCloudAdminPin] = useState(DEFAULT_ADMIN_PIN)
  const draftRef = useRef<ContentData | null>(null)

  draftRef.current = draft

  const working = draft ?? live

  const hasPendingChanges = useMemo(() => {
    if (!draft) return false
    return JSON.stringify(draft) !== JSON.stringify(live)
  }, [draft, live])

  const refreshFromCloud = useCallback(async () => {
    try {
      const { data, adminPin } = await fetchCloudContent()
      setCloudConnected(true)
      setCloudAdminPin(adminPin)
      localStorage.setItem(PIN_KEY, adminPin)
      if (!draftRef.current) {
        setLive(data)
        localStorage.setItem('vina_nails_cms_v1', JSON.stringify(data))
      }
    } catch {
      setCloudConnected(false)
      if (!draftRef.current) setLive(loadLocalFallback())
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      await refreshFromCloud()
      setLoading(false)
    })()
  }, [refreshFromCloud])

  useEffect(() => {
    const unsubscribe = subscribeToCloudContent(() => {
      void refreshFromCloud()
    })
    return unsubscribe
  }, [refreshFromCloud])

  const initDraft = useCallback(() => {
    setDraft(cloneData(live))
  }, [live])

  const saveAndApply = useCallback(async () => {
    if (!draft) return
    setSyncing(true)
    try {
      await syncCloudContent(draft, localStorage.getItem(PIN_KEY) ?? cloudAdminPin)
      setLive(draft)
      localStorage.setItem('vina_nails_cms_v1', JSON.stringify(draft))
      setDraft(null)
      setCloudConnected(true)
    } catch (err) {
      console.error('Cloud sync failed:', err)
      setLive(draft)
      localStorage.setItem('vina_nails_cms_v1', JSON.stringify(draft))
      setDraft(null)
    } finally {
      setSyncing(false)
    }
  }, [draft, cloudAdminPin])

  const discardDraft = useCallback(() => {
    setDraft(null)
  }, [])

  const mutate = useCallback(
    (fn: (prev: ContentData) => ContentData) => {
      setDraft((prev) => fn(prev ?? cloneData(live)))
    },
    [live],
  )

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
        setDraft(parsed)
        return true
      } catch {
        return false
      }
    },
    [],
  )

  const resetToDefaults = useCallback(() => {
    setDraft(loadDefaults())
  }, [])

  const verifyPin = useCallback(
    (pin: string) => {
      const local = localStorage.getItem(PIN_KEY) ?? cloudAdminPin
      return pin === local || pin === cloudAdminPin || pin === DEFAULT_ADMIN_PIN
    },
    [cloudAdminPin],
  )

  const getPin = useCallback(
    () => localStorage.getItem(PIN_KEY) ?? cloudAdminPin,
    [cloudAdminPin],
  )

  const setPin = useCallback(async (pin: string) => {
    localStorage.setItem(PIN_KEY, pin)
    setCloudAdminPin(pin)
    try {
      await updateAdminPin(pin)
    } catch (err) {
      console.error('Failed to update cloud PIN:', err)
    }
  }, [])

  const value = useMemo(
    () => ({
      swatchDesigns: live.swatchDesigns,
      galleryDesigns: live.galleryDesigns,
      services: live.services,
      draft,
      hasPendingChanges,
      loading,
      syncing,
      cloudConnected,
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
      loading,
      syncing,
      cloudConnected,
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

export function useAdminContent() {
  const ctx = useContent()
  const data = ctx.draft ?? {
    swatchDesigns: ctx.swatchDesigns,
    galleryDesigns: ctx.galleryDesigns,
    services: ctx.services,
  }
  return { ...ctx, ...data }
}
