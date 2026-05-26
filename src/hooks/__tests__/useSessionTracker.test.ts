import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSessionTracker, calculateStreak, calculateLongestStreak, toLocalDateStr } from '../useSessionTracker'

describe('toLocalDateStr', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toLocalDateStr(new Date('2026-05-26T12:00:00'))).toBe('2026-05-26')
  })
})

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T12:00:00'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('returns 0 for empty set', () => {
    expect(calculateStreak(new Set())).toBe(0)
  })

  it('returns 1 when only today has a session', () => {
    expect(calculateStreak(new Set(['2026-05-26']))).toBe(1)
  })

  it('returns 3 for three consecutive days including today', () => {
    expect(calculateStreak(new Set(['2026-05-24', '2026-05-25', '2026-05-26']))).toBe(3)
  })

  it('returns 0 when last session was 3+ days ago', () => {
    expect(calculateStreak(new Set(['2026-05-20']))).toBe(0)
  })

  it('returns streak alive from yesterday when today has no session', () => {
    expect(calculateStreak(new Set(['2026-05-24', '2026-05-25']))).toBe(2)
  })

  it('does not count non-consecutive days as streak', () => {
    expect(calculateStreak(new Set(['2026-05-20', '2026-05-22', '2026-05-24', '2026-05-25', '2026-05-26']))).toBe(3)
  })
})

describe('calculateLongestStreak', () => {
  it('returns 0 for empty set', () => {
    expect(calculateLongestStreak(new Set())).toBe(0)
  })

  it('returns longest run of consecutive days', () => {
    expect(calculateLongestStreak(new Set([
      '2026-05-01', '2026-05-02', '2026-05-03',
      '2026-05-10', '2026-05-11',
    ]))).toBe(3)
  })
})

describe('useSessionTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T12:00:00'))
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('starts with empty sessions and default settings', () => {
    const { result } = renderHook(() => useSessionTracker())
    expect(result.current.sessions).toHaveLength(0)
    expect(result.current.streak).toBe(0)
    expect(result.current.totalSessions).toBe(0)
    expect(result.current.settings.preferredDuration).toBe(120)
    expect(result.current.settings.preferredCategory).toBe('all')
  })

  it('logSession appends to state and localStorage', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.logSession({
        category: 'opinion',
        difficulty: 'easy',
        promptText: 'test prompt',
        durationSeconds: 120,
      })
    })
    expect(result.current.totalSessions).toBe(1)
    expect(result.current.sessions[0].date).toBe('2026-05-26')
    expect(result.current.sessions[0].promptText).toBe('test prompt')
    const stored = JSON.parse(localStorage.getItem('speaking-sessions')!)
    expect(stored).toHaveLength(1)
  })

  it('streak updates after logging a session today', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.logSession({ category: 'opinion', difficulty: 'easy', promptText: 'x', durationSeconds: 60 })
    })
    expect(result.current.streak).toBe(1)
  })

  it('updateSettings persists to localStorage', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.updateSettings({ preferredCategory: 'opinion', preferredDuration: 60 })
    })
    expect(result.current.settings.preferredCategory).toBe('opinion')
    expect(result.current.settings.preferredDuration).toBe(60)
    const stored = JSON.parse(localStorage.getItem('speaking-settings')!)
    expect(stored.preferredCategory).toBe('opinion')
  })

  it('clearHistory wipes sessions from state and localStorage', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.logSession({ category: 'opinion', difficulty: 'easy', promptText: 'x', durationSeconds: 60 })
    })
    expect(result.current.totalSessions).toBe(1)
    act(() => result.current.clearHistory())
    expect(result.current.totalSessions).toBe(0)
    expect(localStorage.getItem('speaking-sessions')).toBeNull()
  })

  it('loads sessions from pre-populated localStorage', () => {
    localStorage.setItem('speaking-sessions', JSON.stringify([
      { id: '1', date: '2026-05-26', category: 'opinion', difficulty: 'easy', promptText: 'x', durationSeconds: 60 },
      { id: '2', date: '2026-05-25', category: 'opinion', difficulty: 'easy', promptText: 'y', durationSeconds: 60 },
    ]))
    const { result } = renderHook(() => useSessionTracker())
    expect(result.current.totalSessions).toBe(2)
    expect(result.current.streak).toBe(2)
  })
})
