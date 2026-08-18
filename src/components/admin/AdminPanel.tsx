import { useState, useRef } from 'react'
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Home,
  Palette,
  DollarSign,
  Image,
  Settings,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useAdminContent, DEFAULT_ADMIN_PIN } from '../../context/ContentContext'
import { storeUploadedImage } from '../../lib/imageStore'
import { LazyImage } from '../LazyImage'
import type { Design } from '../../context/BookingContext'
import type { DesignCategory, Service } from '../../data/salonInfo'
import { categoryOrder } from '../../data/salonInfo'
import type { Lang } from '../../i18n/translations'
import { translations } from '../../i18n/translations'

type T = (typeof translations)[Lang]

type Tab = 'swatch' | 'gallery' | 'services' | 'settings'

function newId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AdminPanel() {
  const { t } = useLanguage()
  const content = useAdminContent()
  const fileRef = useRef<HTMLInputElement>(null)

  const [authed, setAuthed] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<Tab>('swatch')
  const [newPin, setNewPin] = useState('')
  const [importText, setImportText] = useState('')
  const [msg, setMsg] = useState('')

  const flash = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.verifyPin(pinInput)) {
      setAuthed(true)
      setPinError(false)
      content.initDraft()
    } else {
      setPinError(true)
    }
  }

  const handleExport = () => {
    const blob = new Blob([content.exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vina_nails_data.json'
    a.click()
    URL.revokeObjectURL(url)
    flash(t.admin.exported)
  }

  const handleImport = () => {
    if (content.importData(importText)) {
      flash(t.admin.imported)
      setImportText('')
    } else {
      flash(t.admin.importError)
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-onyx p-4">
        <form
          onSubmit={handleLogin}
          className="glass glow-ring w-full max-w-sm rounded-3xl p-8 text-center"
        >
          <Lock className="mx-auto mb-4 h-10 w-10 text-rose-gold" />
          <h1 className="font-display mb-2 text-2xl font-bold text-gradient">{t.admin.title}</h1>
          <p className="mb-6 text-sm text-muted">{t.admin.pinPrompt}</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value)
              setPinError(false)
            }}
            className="glass mb-2 w-full rounded-xl px-4 py-3 text-center text-bright outline-none focus:ring-1 focus:ring-rose-gold/50"
            placeholder="••••"
            autoFocus
          />
          {pinError && <p className="mb-2 text-sm text-red-400">{t.admin.pinWrong}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-gold to-blush py-3 font-semibold text-onyx"
          >
            {t.admin.login}
          </button>
          <a href="/" className="mt-4 inline-block text-sm text-muted hover:text-champagne">
            ← {t.admin.backHome}
          </a>
        </form>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof Palette }[] = [
    { id: 'swatch', label: t.admin.tabSwatch, icon: Palette },
    { id: 'gallery', label: t.admin.tabGallery, icon: Image },
    { id: 'services', label: t.admin.tabServices, icon: DollarSign },
    { id: 'settings', label: t.admin.tabSettings, icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-onyx pb-28">
      <header className="glass sticky top-0 z-50 border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Unlock className="h-5 w-5 text-rose-gold" />
            <h1 className="font-display text-xl font-bold text-gradient">{t.admin.title}</h1>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-muted hover:text-bright"
          >
            <Home className="h-4 w-4" />
            {t.admin.backHome}
          </a>
        </div>
      </header>

      {msg && (
        <div className="mx-auto mt-4 max-w-5xl px-4">
          <div className="rounded-xl bg-rose-gold/20 px-4 py-2 text-center text-sm text-champagne">
            {msg}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                tab === id
                  ? 'bg-rose-gold/25 text-champagne ring-1 ring-rose-gold/50'
                  : 'glass text-muted hover:text-bright'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'swatch' && (
          <DesignManager
            designs={content.swatchDesigns}
            onAdd={content.addSwatchDesign}
            onUpdate={content.updateSwatchDesign}
            onDelete={content.deleteSwatchDesign}
            prefix="swatch"
            t={t}
          />
        )}

        {tab === 'gallery' && (
          <DesignManager
            designs={content.galleryDesigns}
            onAdd={content.addGalleryDesign}
            onUpdate={content.updateGalleryDesign}
            onDelete={content.deleteGalleryDesign}
            prefix="gallery"
            t={t}
          />
        )}

        {tab === 'services' && (
          <ServiceManager
            services={content.services}
            onAdd={content.addService}
            onUpdate={content.updateService}
            onDelete={content.deleteService}
            t={t}
          />
        )}

        {tab === 'settings' && (
          <div className="glass glow-ring space-y-6 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-bright">{t.admin.settings}</h2>

            <div>
              <label className="mb-2 block text-sm text-muted">{t.admin.changePin}</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="glass flex-1 rounded-xl px-4 py-2 text-bright outline-none"
                  placeholder={DEFAULT_ADMIN_PIN}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPin.length >= 4) {
                      content.setPin(newPin)
                      setNewPin('')
                      flash(t.admin.pinChanged)
                    }
                  }}
                  className="rounded-xl bg-rose-gold/20 px-4 py-2 text-sm text-champagne"
                >
                  {t.admin.save}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">{t.admin.export}</label>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-bright hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                {t.admin.exportBtn}
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">{t.admin.import}</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={4}
                className="glass mb-2 w-full rounded-xl px-4 py-2 text-sm text-bright outline-none"
                placeholder="JSON..."
              />
              <button
                type="button"
                onClick={handleImport}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-bright hover:bg-white/10"
              >
                <Upload className="h-4 w-4" />
                {t.admin.importBtn}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm(t.admin.resetConfirm)) {
                  content.resetToDefaults()
                  flash(t.admin.resetDone)
                }
              }}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
            >
              <RotateCcw className="h-4 w-4" />
              {t.admin.reset}
            </button>

            <input ref={fileRef} type="file" accept=".json" className="hidden" />
          </div>
        )}
      </div>

      {/* Sticky Save & Apply bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-onyx/95 p-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl gap-2">
          {content.hasPendingChanges && (
            <button
              type="button"
              onClick={() => {
                content.discardDraft()
                content.initDraft()
                flash(t.admin.discarded)
              }}
              className="tap-target flex-1 rounded-full border border-white/10 py-3 text-sm text-muted"
            >
              {t.admin.discard}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              content.saveAndApply()
              flash(t.admin.applied)
            }}
            disabled={!content.hasPendingChanges}
            className="tap-target flex-[2] rounded-full bg-gradient-to-r from-rose-gold to-blush py-3 text-sm font-semibold text-onyx shadow-[0_0_30px_rgba(224,169,109,0.35)] disabled:opacity-40"
          >
            {t.admin.saveApply}
          </button>
        </div>
      </div>
    </div>
  )
}

function DesignManager({
  designs,
  onAdd,
  onUpdate,
  onDelete,
  prefix,
  t,
}: {
  designs: Design[]
  onAdd: (d: Design) => void
  onUpdate: (id: string, patch: Partial<Design>) => void
  onDelete: (id: string) => void
  prefix: string
  t: T
}) {
  const [editing, setEditing] = useState<Partial<Design> | null>(null)

  const startNew = () =>
    setEditing({
      id: newId(prefix),
      name_en: '',
      name_ku: '',
      category: 'french',
      imagePath: '',
    })

  const save = () => {
    if (!editing?.id || !editing.name_en || !editing.imagePath) return
    const exists = designs.find((d) => d.id === editing.id)
    if (exists) {
      onUpdate(editing.id, editing)
    } else {
      onAdd(editing as Design)
    }
    setEditing(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    try {
      const path = await storeUploadedImage(file)
      setEditing({ ...editing, imagePath: path })
    } catch {
      const dataUrl = await fileToDataUrl(file)
      setEditing({ ...editing, imagePath: dataUrl })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="font-display text-lg font-semibold text-bright">
          {prefix === 'swatch' ? t.admin.swatchList : t.admin.galleryList}
        </h2>
        <button
          type="button"
          onClick={startNew}
          className="flex items-center gap-2 rounded-full bg-rose-gold/20 px-4 py-2 text-sm text-champagne"
        >
          <Plus className="h-4 w-4" />
          {t.admin.addDesign}
        </button>
      </div>

      {editing && (
        <div className="glass glow-ring space-y-3 rounded-2xl p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder={t.admin.nameEn}
              value={editing.name_en ?? ''}
              onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
              className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
            />
            <input
              placeholder={t.admin.nameKu}
              value={editing.name_ku ?? ''}
              onChange={(e) => setEditing({ ...editing, name_ku: e.target.value })}
              className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
            />
            <select
              value={editing.category ?? 'french'}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value as DesignCategory })
              }
              className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
            >
              {categoryOrder.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              placeholder={t.admin.imagePath}
              value={editing.imagePath ?? ''}
              onChange={(e) => setEditing({ ...editing, imagePath: e.target.value })}
              className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <Upload className="h-4 w-4" />
            {t.admin.uploadImage}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {editing.imagePath && (
            <img src={editing.imagePath} alt="" className="h-20 w-20 rounded-lg object-cover" />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-gradient-to-r from-rose-gold to-blush px-6 py-2 text-sm font-semibold text-onyx"
            >
              {t.admin.save}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full bg-white/5 px-6 py-2 text-sm text-muted"
            >
              {t.admin.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {designs.map((d) => (
          <div
            key={d.id}
            className="glass flex items-center gap-4 rounded-xl p-3"
          >
            <LazyImage src={d.imagePath} alt="" className="h-14 w-14 rounded-lg object-cover" width={56} height={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-bright">{d.name_en}</p>
              <p className="truncate text-sm text-muted">{d.name_ku}</p>
              <p className="text-xs text-rose-gold">{d.category}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing({ ...d })}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-champagne"
            >
              {t.admin.edit}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(t.admin.deleteConfirm)) onDelete(d.id)
              }}
              className="rounded-lg bg-red-500/10 p-2 text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceManager({
  services,
  onAdd,
  onUpdate,
  onDelete,
  t,
}: {
  services: Service[]
  onAdd: (s: Service) => void
  onUpdate: (id: string, patch: Partial<Service>) => void
  onDelete: (id: string) => void
  t: T
}) {
  const [editing, setEditing] = useState<Partial<Service> | null>(null)

  const startNew = () =>
    setEditing({
      id: newId('svc'),
      nameEn: '',
      nameKu: '',
      price: 15000,
      durationMin: 45,
    })

  const save = () => {
    if (!editing?.id || !editing.nameEn) return
    const exists = services.find((s) => s.id === editing.id)
    if (exists) {
      onUpdate(editing.id, editing)
    } else {
      onAdd(editing as Service)
    }
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="font-display text-lg font-semibold text-bright">{t.admin.serviceList}</h2>
        <button
          type="button"
          onClick={startNew}
          className="flex items-center gap-2 rounded-full bg-rose-gold/20 px-4 py-2 text-sm text-champagne"
        >
          <Plus className="h-4 w-4" />
          {t.admin.addService}
        </button>
      </div>

      {editing && (
        <div className="glass glow-ring grid gap-3 rounded-2xl p-4 sm:grid-cols-2">
          <input
            placeholder={t.admin.nameEn}
            value={editing.nameEn ?? ''}
            onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
            className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
          />
          <input
            placeholder={t.admin.nameKu}
            value={editing.nameKu ?? ''}
            onChange={(e) => setEditing({ ...editing, nameKu: e.target.value })}
            className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
          />
          <input
            type="number"
            placeholder="IQD"
            value={editing.price ?? ''}
            onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
            className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
          />
          <input
            type="number"
            placeholder={t.admin.duration}
            value={editing.durationMin ?? ''}
            onChange={(e) => setEditing({ ...editing, durationMin: Number(e.target.value) })}
            className="glass rounded-xl px-3 py-2 text-sm text-bright outline-none"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-gradient-to-r from-rose-gold to-blush px-6 py-2 text-sm font-semibold text-onyx"
            >
              {t.admin.save}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full bg-white/5 px-6 py-2 text-sm text-muted"
            >
              {t.admin.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {services.map((s) => (
          <div key={s.id} className="glass flex items-center justify-between rounded-xl p-4">
            <div>
              <p className="font-medium text-bright">{s.nameEn}</p>
              <p className="text-sm text-muted">{s.nameKu}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-champagne">{s.price.toLocaleString()} IQD</span>
              <span className="text-sm text-muted">~{s.durationMin}m</span>
              <button
                type="button"
                onClick={() => setEditing({ ...s })}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-champagne"
              >
                {t.admin.edit}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(t.admin.deleteConfirm)) onDelete(s.id)
                }}
                className="rounded-lg bg-red-500/10 p-2 text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
