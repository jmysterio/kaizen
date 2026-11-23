import type { ReactNode } from 'react'

/** Page frame: large serif title, optional action, content. Without a title it starts flush (Today, under its Hero). */
export function Screen({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <main className={`mx-auto w-full max-w-2xl px-5 pb-32 md:px-10 md:pb-12 ${title ? 'pt-6 md:pt-12' : 'md:pt-10'}`}>
      {title && (
      <header className="glass mb-6 flex items-end justify-between gap-4 rounded-sheet px-5 py-4">
        <h1 className="font-display text-3xl font-normal tracking-tight">{title}</h1>
        {action}
      </header>
      )}
      {children}
    </main>
  )
}

/** Quiet surface for grouping content. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`glass rounded-card p-4 ${className}`}>{children}</section>
}

export function Placeholder({ phase }: { phase: string }) {
  return <p className="text-ink-muted">Arrives in {phase}.</p>
}
