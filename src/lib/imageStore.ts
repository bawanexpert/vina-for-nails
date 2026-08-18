const DB_NAME = 'vina_nails_images'
const STORE = 'images'
const DB_VERSION = 1

export const IDB_PREFIX = 'idb://'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export function isIdbPath(path: string): boolean {
  return path.startsWith(IDB_PREFIX)
}

export function idFromPath(path: string): string {
  return path.slice(IDB_PREFIX.length)
}

export async function saveImage(id: string, dataUrl: string): Promise<string> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(dataUrl, id)
    tx.oncomplete = () => {
      db.close()
      resolve(`${IDB_PREFIX}${id}`)
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function getImage(id: string): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => {
      db.close()
      resolve((req.result as string) ?? null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function storeUploadedImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const id = `img-${Date.now()}`
  return saveImage(id, dataUrl)
}
