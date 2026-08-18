import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DesignCategory, NailShape } from '../data/salonInfo'

export type Design = {
  id: string
  name_en: string
  name_ku: string
  category: DesignCategory
  imagePath: string
}

export type BookingState = {
  services: string[]
  shape: NailShape | null
  design: Design | null
  date: string
  time: string
  name: string
  phone: string
}

type BookingContextValue = {
  booking: BookingState
  toggleService: (id: string) => void
  setShape: (shape: NailShape) => void
  setDesign: (design: Design | null) => void
  setDate: (date: string) => void
  setTime: (time: string) => void
  setName: (name: string) => void
  setPhone: (phone: string) => void
  scrollToBooking: () => void
}

const defaultBooking: BookingState = {
  services: [],
  shape: null,
  design: null,
  date: '',
  time: '',
  name: '',
  phone: '',
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(defaultBooking)

  const toggleService = useCallback((id: string) => {
    setBooking((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((s) => s !== id)
        : [...prev.services, id],
    }))
  }, [])

  const setShape = useCallback((shape: NailShape) => {
    setBooking((prev) => ({ ...prev, shape }))
  }, [])

  const setDesign = useCallback((design: Design | null) => {
    setBooking((prev) => ({ ...prev, design }))
  }, [])

  const setDate = useCallback((date: string) => {
    setBooking((prev) => ({ ...prev, date }))
  }, [])

  const setTime = useCallback((time: string) => {
    setBooking((prev) => ({ ...prev, time }))
  }, [])

  const setName = useCallback((name: string) => {
    setBooking((prev) => ({ ...prev, name }))
  }, [])

  const setPhone = useCallback((phone: string) => {
    setBooking((prev) => ({ ...prev, phone }))
  }, [])

  const scrollToBooking = useCallback(() => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const value = useMemo(
    () => ({
      booking,
      toggleService,
      setShape,
      setDesign,
      setDate,
      setTime,
      setName,
      setPhone,
      scrollToBooking,
    }),
    [
      booking,
      toggleService,
      setShape,
      setDesign,
      setDate,
      setTime,
      setName,
      setPhone,
      scrollToBooking,
    ],
  )

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
