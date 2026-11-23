import type { ReactNode } from 'react'

/** Standard page frame for every feature screen: large title, optional action, content. */
export function Screen({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-32 pt-6 md:px-10 md:pb-12 md:pt-12">
      <header className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {action}
      </header>
      {children}
    </main>
  )
}

/** Quiet surface for grouping content. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-line bg-surface p-4 ${className}`}>{children}</section>
}

export function Placeholder({ phase }: { phase: string }) {
  return <p className="text-muted">Arrives in {phase}.</p>
}
