import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTimer } from '../useTimer'

describe('useTimer', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('initializes in idle state with 120s', () => {
    const { result } = renderHook(() => useTimer())
    expect(result.current.state).toBe('idle')
    expect(result.current.seconds).toBe(120)
    expect(result.current.duration).toBe(120)
  })

  it('transitions idle → running on start()', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    expect(result.current.state).toBe('running')
  })

  it('decrements seconds each second while running', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.seconds).toBe(115)
  })

  it('transitions to finished when seconds reach 0', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(120_000))
    expect(result.current.state).toBe('finished')
    expect(result.current.seconds).toBe(0)
  })

  it('pauses countdown and time does not advance', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10_000))
    act(() => result.current.pause())
    expect(result.current.state).toBe('paused')
    expect(result.current.seconds).toBe(110)
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.seconds).toBe(110)
  })

  it('resumes from paused state', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10_000))
    act(() => result.current.pause())
    act(() => result.current.start())
    expect(result.current.state).toBe('running')
    act(() => vi.advanceTimersByTime(5_000))
    expect(result.current.seconds).toBe(105)
  })

  it('resets to idle with full duration', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(30_000))
    act(() => result.current.reset())
    expect(result.current.state).toBe('idle')
    expect(result.current.seconds).toBe(120)
  })

  it('setDuration changes duration and seconds when idle', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.setDuration(60))
    expect(result.current.duration).toBe(60)
    expect(result.current.seconds).toBe(60)
  })

  it('setDuration is ignored when running', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10_000))
    act(() => result.current.setDuration(60))
    expect(result.current.seconds).toBe(110)
    expect(result.current.duration).toBe(120)
  })

  it('reset after setDuration uses new duration', () => {
    const { result } = renderHook(() => useTimer())
    act(() => result.current.setDuration(60))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(10_000))
    act(() => result.current.reset())
    expect(result.current.seconds).toBe(60)
  })
})
