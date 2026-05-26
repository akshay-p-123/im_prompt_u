import { useState, useRef, useCallback, useEffect } from 'react'

export type TimerState = 'idle' | 'running' | 'paused' | 'finished'

export interface UseTimerReturn {
  seconds: number
  state: TimerState
  duration: 60 | 120
  start: () => void
  pause: () => void
  reset: () => void
  setDuration: (d: 60 | 120) => void
}

export function useTimer(initialDuration: 60 | 120 = 120): UseTimerReturn {
  const [duration, setDurationState] = useState<60 | 120>(initialDuration)
  const [seconds, setSeconds] = useState<number>(initialDuration)
  const [state, setState] = useState<TimerState>('idle')
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef<60 | 120>(initialDuration)
  const stateRef = useRef<TimerState>('idle')

  const clearTick = () => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Start the interval when state becomes 'running'
  useEffect(() => {
    if (state !== 'running') return
    tickRef.current = setInterval(() => {
      setSeconds(prev => Math.max(0, prev - 1))
    }, 1000)
    return clearTick
  }, [state])

  // Transition to finished when countdown reaches zero
  useEffect(() => {
    if (state === 'running' && seconds === 0) {
      setState('finished')
    }
  }, [seconds, state])

  const start = useCallback(() => {
    setState(s => (s === 'idle' || s === 'paused') ? 'running' : s)
  }, [])

  const pause = useCallback(() => {
    clearTick()
    setState(s => s === 'running' ? 'paused' : s)
  }, [])

  const reset = useCallback(() => {
    clearTick()
    setState('idle')
    setSeconds(durationRef.current)
  }, [])

  const setDuration = useCallback((d: 60 | 120) => {
    if (stateRef.current !== 'idle') return
    durationRef.current = d
    setDurationState(d)
    setSeconds(d)
  }, [])

  return { seconds, state, duration, start, pause, reset, setDuration }
}
