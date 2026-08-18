export const salonInfo = {
  brandName: 'vina_for_nails',
  brandDisplay: 'vina_for_nails 💅',
  profileImage: '/assets/profile.webp',
  location: {
    city: 'Sulaymaniyah',
    area: 'Zerinok',
    cityKu: 'سلێمانی',
    areaKu: 'زەرینۆک',
    fullEn: 'Sulaymaniyah, Zerinok - Behind Private Hospital',
    fullKu: 'سلێمانی - گەڕەکی زەرینۆک، پشت نەخۆشخانەی تایبەت',
    mapQuery: 'Zerinok, Behind Private Hospital, Sulaymaniyah, Iraq',
    coordinates: { lat: 35.536303850097575, lng: 45.43732873163701 },
  },
  instagram: '@vina_for_nails',
  instagramUrl: 'https://www.instagram.com/vina_for_nails/',
  phones: ['+9647766939291', '+9647501684893'] as const,
  whatsappNumbers: ['9647766939291', '9647501684893'] as const,
  viberNumber: '9647766939291',
  viberDisplay: '+9647766939291',
} as const

export type Service = {
  id: string
  nameEn: string
  nameKu: string
  price: number
  durationMin: number
  popular?: boolean
}

export const services: Service[] = [
  {
    id: 'extensions',
    nameEn: 'Gel / Nail Extensions',
    nameKu: 'نینۆک دانان',
    price: 25000,
    durationMin: 90,
    popular: true,
  },
  {
    id: 'gel-polish',
    nameEn: 'Gel Polish',
    nameKu: 'جێڵ پۆڵیش',
    price: 15000,
    durationMin: 45,
  },
  {
    id: 'refill',
    nameEn: 'Refill',
    nameKu: 'پڕ کردنەوە',
    price: 15000,
    durationMin: 60,
  },
  {
    id: 'toenail',
    nameEn: 'Toenail Care / Gel',
    nameKu: 'نینۆکی قاچ',
    price: 15000,
    durationMin: 45,
  },
  {
    id: 'removal',
    nameEn: 'Nail Removal',
    nameKu: 'لێکردنەوە',
    price: 5000,
    durationMin: 20,
  },
]

export type NailShape = 'almond' | 'coffin' | 'square' | 'oval' | 'stiletto'

export const nailShapes: { id: NailShape; nameEn: string; nameKu: string }[] = [
  { id: 'almond', nameEn: 'Almond', nameKu: 'بادەم' },
  { id: 'coffin', nameEn: 'Coffin', nameKu: 'تابوت' },
  { id: 'square', nameEn: 'Square', nameKu: 'چوارگۆشە' },
  { id: 'oval', nameEn: 'Oval', nameKu: 'هێلکەیی' },
  { id: 'stiletto', nameEn: 'Stiletto', nameKu: 'ستیلێتۆ' },
]

export type DesignCategory = 'french' | 'holiday' | 'animal' | 'hearts' | 'glitter'

export const categoryOrder: DesignCategory[] = [
  'french',
  'holiday',
  'animal',
  'hearts',
  'glitter',
]

export const timeSlots = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
]
