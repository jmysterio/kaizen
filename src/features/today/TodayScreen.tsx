import { useState } from 'react'
import { Card, Screen } from '../../components/Screen'

const QUESTIONS = [
  'What is one small thing you can do better today than yesterday?',
  'Which task today matters most for the person you want to become?',
  'What would make today feel well spent?',
  'Where can you remove one step of friction today?',
  'What are you putting off, and what is the smallest first move?',
  'Who could you help today?',
  'What will you do today to rest and recharge?',
]

export function TodayScreen() {
  const [now] = useState(() => new Date())
  const dayOfYear = Math.floor((+now - +new Date(now.getFullYear(), 0, 0)) / 86_400_000)
  return (
    <Screen title="Today">
      <p className="-mt-4 mb-8 text-muted">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <Card>
        <p className="mb-1 text-xs tracking-wide text-muted">Today’s question</p>
        <p className="text-lg leading-snug">{QUESTIONS[dayOfYear % QUESTIONS.length]}</p>
      </Card>
      <p className="mt-8 text-sm text-muted">Habits, timer and priorities appear here in Phase 1.</p>
    </Screen>
  )
}
