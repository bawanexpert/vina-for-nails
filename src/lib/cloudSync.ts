import type { Design } from '../context/BookingContext'
import type { Service } from '../data/salonInfo'
import { services as defaultServices } from '../data/salonInfo'
import { swatchDesigns as defaultSwatchDesigns } from '../data/swatchDesigns'
import defaultGalleryDesigns from '../data/designs.json'
import { supabase } from './supabase'
import type { ContentData } from '../types/content'

export type DbDesign = {
  id: string
  kind: 'swatch' | 'gallery'
  name_en: string
  name_ku: string
  category: string
  image_url: string
  featured: boolean
  sort_order: number
}

export type DbSettings = {
  id: number
  services: Service[]
  admin_pin: string
  updated_at: string
}

function loadDefaults(): ContentData {
  return {
    swatchDesigns: [...defaultSwatchDesigns],
    galleryDesigns: [...(defaultGalleryDesigns as Design[])],
    services: defaultServices.map((s) => ({ ...s })),
  }
}

function designToRow(d: Design, kind: 'swatch' | 'gallery', sortOrder: number): DbDesign {
  return {
    id: d.id,
    kind,
    name_en: d.name_en,
    name_ku: d.name_ku,
    category: d.category,
    image_url: d.imagePath,
    featured: 'featured' in d ? Boolean((d as Design & { featured?: boolean }).featured) : false,
    sort_order: sortOrder,
  }
}

function rowToDesign(row: DbDesign): Design {
  return {
    id: row.id,
    name_en: row.name_en,
    name_ku: row.name_ku,
    category: row.category as Design['category'],
    imagePath: row.image_url,
  }
}

function mapRowsToContent(designs: DbDesign[], settings: DbSettings | null): ContentData {
  const swatchDesigns = designs
    .filter((d) => d.kind === 'swatch')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(rowToDesign)

  const galleryDesigns = designs
    .filter((d) => d.kind === 'gallery')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(rowToDesign)

  return {
    swatchDesigns,
    galleryDesigns,
    services: settings?.services?.length ? settings.services : loadDefaults().services,
  }
}

export async function fetchCloudContent(): Promise<{
  data: ContentData
  adminPin: string
}> {
  const [designsRes, settingsRes] = await Promise.all([
    supabase.from('designs').select('*').order('sort_order', { ascending: true }),
    supabase.from('salon_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  if (designsRes.error) throw designsRes.error

  const designs = (designsRes.data ?? []) as DbDesign[]
  const settings = settingsRes.data as DbSettings | null

  if (designs.length === 0) {
    const defaults = loadDefaults()
    await seedCloudContent(defaults)
    return { data: defaults, adminPin: settings?.admin_pin ?? '1234' }
  }

  return {
    data: mapRowsToContent(designs, settings),
    adminPin: settings?.admin_pin ?? '1234',
  }
}

export async function seedCloudContent(data: ContentData): Promise<void> {
  const rows: DbDesign[] = [
    ...data.swatchDesigns.map((d, i) => designToRow(d, 'swatch', i)),
    ...data.galleryDesigns.map((d, i) => designToRow(d, 'gallery', i)),
  ]

  const { error: designError } = await supabase.from('designs').upsert(rows)
  if (designError) throw designError

  const { error: settingsError } = await supabase.from('salon_settings').upsert({
    id: 1,
    services: data.services,
    admin_pin: '1234',
    updated_at: new Date().toISOString(),
  })
  if (settingsError) throw settingsError
}

export async function syncCloudContent(data: ContentData, adminPin?: string): Promise<void> {
  const rows: DbDesign[] = [
    ...data.swatchDesigns.map((d, i) => designToRow(d, 'swatch', i)),
    ...data.galleryDesigns.map((d, i) => designToRow(d, 'gallery', i)),
  ]

  const allIds = rows.map((r) => r.id)

  const { data: existing } = await supabase.from('designs').select('id')
  const toDelete = (existing ?? [])
    .map((r) => r.id as string)
    .filter((id) => !allIds.includes(id))

  if (toDelete.length > 0) {
    const { error } = await supabase.from('designs').delete().in('id', toDelete)
    if (error) throw error
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('designs').upsert(rows)
    if (error) throw error
  }

  const { data: currentSettings } = await supabase
    .from('salon_settings')
    .select('admin_pin')
    .eq('id', 1)
    .maybeSingle()

  const pin = adminPin ?? (currentSettings as { admin_pin?: string } | null)?.admin_pin ?? '1234'

  const { error: settingsError } = await supabase.from('salon_settings').upsert({
    id: 1,
    services: data.services,
    admin_pin: pin,
    updated_at: new Date().toISOString(),
  })
  if (settingsError) throw settingsError
}

export async function uploadNailImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'webp'
  const filePath = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`

  const { error } = await supabase.storage
    .from('nail-images')
    .upload(filePath, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || `image/${safeExt}`,
    })

  if (error) throw error

  const { data } = supabase.storage.from('nail-images').getPublicUrl(filePath)
  return data.publicUrl
}

export async function updateAdminPin(pin: string): Promise<void> {
  const { error } = await supabase.from('salon_settings').upsert({
    id: 1,
    admin_pin: pin,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export function subscribeToCloudContent(onChange: () => void) {
  const channel = supabase
    .channel('vina-content-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'designs' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_settings' }, onChange)
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
