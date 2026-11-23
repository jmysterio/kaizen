import type { Theme } from '../../app/theme'
import { setSetting, useSetting } from './settings'

const key = (theme: Theme) => `photo.${theme}`
export const defaultPhoto = (theme: Theme) => `${import.meta.env.BASE_URL}photos/${theme}.webp`

/** The user's own photo for a theme, or the bundled default. */
export const usePhoto = (theme: Theme) => useSetting<string | null>(key(theme), null) ?? defaultPhoto(theme)
export const useCustomPhoto = (theme: Theme) => useSetting<string | null>(key(theme), null)

/** Scale (w, h) down to fit within `max` on its longest side, never up. */
export const fitWithin = (w: number, h: number, max: number) => {
  const s = Math.min(1, max / Math.max(w, h))
  return { width: Math.round(w * s), height: Math.round(h * s) }
}

/**
 * Shrinks a picked photo on the device and stores it as a data URL in settings, so it works offline
 * and travels inside backups. Phone photos are ~3–8 MB; this keeps each one around 200–400 KB.
 */
export async function setPhoto(theme: Theme, file: File) {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height, 1600)
  const canvas = Object.assign(document.createElement('canvas'), { width, height })
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  await setSetting(key(theme), canvas.toDataURL('image/jpeg', 0.82))
}

export const clearPhoto = (theme: Theme) => setSetting(key(theme), null)
