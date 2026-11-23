import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export type Theme = 'system' | 'light' | 'dark'

export const getSetting = async <T>(key: string, fallback: T): Promise<T> =>
  ((await db.settings.get(key))?.value as T | undefined) ?? fallback

export const setSetting = (key: string, value: unknown) => db.settings.put({ key, value })

export function useSetting<T>(key: string, fallback: T): T {
  return useLiveQuery(() => getSetting(key, fallback), [key], fallback)
}
