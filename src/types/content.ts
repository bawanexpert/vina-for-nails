import type { Design } from '../context/BookingContext'
import type { Service } from '../data/salonInfo'

export type ContentData = {
  swatchDesigns: Design[]
  galleryDesigns: Design[]
  services: Service[]
}
