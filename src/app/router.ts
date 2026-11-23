import { useSyncExternalStore } from 'react'

// Hash routing: works on GitHub Pages and offline with no server rewrites.
const subscribe = (cb: () => void) => {
  addEventListener('hashchange', cb)
  return () => removeEventListener('hashchange', cb)
}
const current = () => location.hash.replace(/^#\/?/, '') || 'today'

export const useRoute = () => useSyncExternalStore(subscribe, current)
export const href = (route: string) => `#/${route}`
