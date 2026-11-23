import { useState } from 'react'
import { href } from '../../app/router'
import { Hero } from '../../components/Hero'
import { Screen } from '../../components/Screen'
import { primary, quiet } from '../../components/styles'
import { toDateKey } from '../../data/dates'
import { useTodayHabits } from '../../data/repos/habits'
import { useEntries } from '../../data/repos/journal'
import { useActiveTimer, useTodayTotal } from '../../data/repos/time'
import { HabitRow } from '../habits/HabitsScreen'
import { Running } from '../timer/TimerScreen'

const QUESTIONS = [
  'What is one small thing you can do better today than yesterday?',
  'Which task today matters most for the person you want to become?',
  'What would make today feel well spent?',
  'Where can you remove one step of friction today?',
  'What are you putting off, and what is the smallest first move?',
  'Who could you help today?',
  'What will you do today to rest and recharge?',
]

const dur = (ms: number) => {
  const m = Math.round(ms / 60000)
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`
}

function Section({ title, link, children }: { title: string; link?: [string, string]; children: React.ReactNode }) {
  return (
    <section className="glass mt-6 rounded-sheet p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        {link && <a href={href(link[0])} className="min-h-11 content-center text-sm text-ink-muted underline-offset-4 hover:underline">{link[1]}</a>}
      </div>
      {children}
    </section>
  )
}

export function TodayScreen() {
  const [now] = useState(() => new Date())
  const dayOfYear = Math.floor((+now - +new Date(now.getFullYear(), 0, 0)) / 86_400_000)
  const habits = useTodayHabits()?.filter((r) => r.dueToday)
  const timer = useActiveTimer()
  const tracked = useTodayTotal()
  const today = toDateKey(now)
  const written = useEntries()?.filter((e) => e.date === today).length ?? 0
  const doneCount = habits?.filter((r) => r.completion).length ?? 0

  return (
    <Screen>
      <Hero>
        <section aria-label="Today’s question" className="mt-5 border-t border-line pt-4">
          <p className="text-xs tracking-wide text-ink-muted">Today’s question</p>
          <p className="mt-1 font-display text-xl leading-snug">{QUESTIONS[dayOfYear % QUESTIONS.length]}</p>
        </section>
      </Hero>

      <Section
        title="Habits"
        link={['habits', habits?.length ? `${doneCount} of ${habits.length}` : 'Add a habit']}
      >
        {habits && habits.length > 0 ? (
          <ul className="space-y-2">
            {habits.map((r) => (
              <li key={r.habit.id}>
                <HabitRow r={r} edit={() => (location.hash = href('habits'))} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">Small habits, done daily, compound. Start with one.</p>
        )}
      </Section>

      <Section title="Time" link={['timer', tracked > 0 ? `${dur(tracked)} today` : 'Open timer']}>
        {timer ? (
          <Running timer={timer} />
        ) : (
          <a href={href('timer')} className={`${quiet} flex items-center justify-center`}>Start a timer</a>
        )}
      </Section>

      <Section title="Journal" link={written ? ['journal', `${written} ${written === 1 ? 'entry' : 'entries'} today`] : undefined}>
        <a href={href('journal')} className={`${primary} flex items-center justify-center`}>
          {written ? 'Write another entry' : 'Write today’s entry'}
        </a>
      </Section>
    </Screen>
  )
}
