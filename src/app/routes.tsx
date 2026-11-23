import { BookOpen, CalendarDays, Circle, Ellipsis, NotebookPen, Settings, Sun, Timer, type LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import { CalendarScreen } from '../features/calendar/CalendarScreen'
import { HabitsScreen } from '../features/habits/HabitsScreen'
import { JournalScreen } from '../features/journal/JournalScreen'
import { MoreScreen } from '../features/more/MoreScreen'
import { ReviewScreen } from '../features/review/ReviewScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { TimerScreen } from '../features/timer/TimerScreen'
import { TodayScreen } from '../features/today/TodayScreen'

export interface Route {
  id: string
  label: string
  icon: LucideIcon
  screen: ComponentType
  /** Shown in the iPhone tab bar (max 5). Everything is in the desktop sidebar. */
  tab?: boolean
  /** Lives under More on iPhone. */
  more?: boolean
}

export const ROUTES: Route[] = [
  { id: 'today', label: 'Today', icon: Sun, screen: TodayScreen, tab: true },
  { id: 'journal', label: 'Journal', icon: NotebookPen, screen: JournalScreen, tab: true },
  { id: 'habits', label: 'Habits', icon: Circle, screen: HabitsScreen, tab: true },
  { id: 'timer', label: 'Timer', icon: Timer, screen: TimerScreen, tab: true },
  { id: 'calendar', label: 'Year', icon: CalendarDays, screen: CalendarScreen, more: true },
  { id: 'review', label: 'Weekly Review', icon: BookOpen, screen: ReviewScreen, more: true },
  { id: 'settings', label: 'Settings', icon: Settings, screen: SettingsScreen, more: true },
  { id: 'more', label: 'More', icon: Ellipsis, screen: MoreScreen, tab: true },
]
