import type { Table, UpdateSpec } from 'dexie'
import type { Base } from './types'

export type NewRecord<T extends Base> = Omit<T, keyof Base> & Partial<Pick<Base, 'goalId'>>

/** Shared CRUD for every user table. Feature repos (src/data/repos/*) build on this. */
export function makeRepo<T extends Base>(table: Table<T, string>) {
  return {
    get: async (id: string) => {
      const r = await table.get(id)
      return r && !r.deletedAt ? r : undefined
    },
    all: () => table.filter((r) => !r.deletedAt).toArray(),
    create: async (data: NewRecord<T>): Promise<T> => {
      const now = Date.now()
      const record = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as T
      await table.add(record)
      return record
    },
    update: (id: string, changes: Partial<Omit<T, keyof Base>> & Partial<Pick<Base, 'goalId'>>) =>
      table.update(id, { ...changes, updatedAt: Date.now() } as UpdateSpec<T>),
    /** Soft delete: the record stays for recovery and future sync. */
    remove: (id: string) => {
      const now = Date.now()
      return table.update(id, { deletedAt: now, updatedAt: now } as unknown as UpdateSpec<T>)
    },
  }
}
