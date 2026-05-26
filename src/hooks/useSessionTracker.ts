import { useState, useCallback, useMemo } from 'react'

const SESSIONS_KEY = 'speaking-sessions'
const SETTINGS_KEY = 'speaking-settings'

export type SessionRecord = {
  id: string
  date: string
  category: string
  difficulty: string
  promptText: string
  durationSeconds: number
}

export type UserSettings = {
  preferredCategory: string
  preferredDifficulty: string
  preferredDuration: 60 | 120
}

const defaultSettings: UserSettings = {
  preferredCategory: 'all',
  preferredDifficulty: 'all',
  preferredDuration: 120,
}

export function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function subtractOneDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return toLocalDateStr(d)
}

export function calculateStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const today = toLocalDateStr(new Date())
  const yesterday = subtractOneDay(today)
  if (!dates.has(today) && !dates.has(yesterday)) return 0

  let cursor = dates.has(today) ? today : yesterday
  let streak = 0
  while (dates.has(cursor)) {
    streak++
    cursor = subtractOneDay(cursor)
  }
  return streak
}

export function calculateLongestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const sorted = Array.from(dates).sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T12:00:00')
    const curr = new Date(sorted[i] + 'T12:00:00')
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000)
    if (diff === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }
  return longest
}

function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? (JSON.parse(raw) as SessionRecord[]) : []
  } catch {
    return []
  }
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<UserSettings>) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function useSessionTracker() {
  const [sessions, setSessions] = useState<SessionRecord[]>(loadSessions)
  const [settings, setSettings] = useState<UserSettings>(loadSettings)

  const completedDates = useMemo(() => new Set(sessions.map(s => s.date)), [sessions])
  const streak = calculateStreak(completedDates)
  const longestStreak = calculateLongestStreak(completedDates)
  const totalSessions = sessions.length

  const logSession = useCallback((record: Omit<SessionRecord, 'id' | 'date'>) => {
    const full: SessionRecord = {
      id: Date.now().toString(),
      date: toLocalDateStr(new Date()),
      ...record,
    }
    setSessions(prev => {
      const next = [...prev, full]
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setSessions([])
    localStorage.removeItem(SESSIONS_KEY)
  }, [])

  return {
    sessions,
    logSession,
    streak,
    longestStreak,
    totalSessions,
    completedDates,
    settings,
    updateSettings,
    clearHistory,
  }
}
