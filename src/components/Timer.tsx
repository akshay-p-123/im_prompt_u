import type { TimerState, UseTimerReturn } from '../hooks/useTimer'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ringColor(seconds: number, state: TimerState): string {
  if (state === 'finished') return '#ef4444'
  if (seconds <= 15) return '#ef4444'
  if (seconds <= 30) return '#eab308'
  return '#22c55e'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  timer: UseTimerReturn
  onDone: () => void
  canDone: boolean
}

export function Timer({ timer, onDone, canDone }: Props) {
  const { seconds, state, duration, start, pause, reset, setDuration } = timer
  const progress = state === 'idle' ? 1 : seconds / duration
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)
  const color = ringColor(seconds, state)

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Ring */}
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke="#1e1e27"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="70" cy="70" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
            className={state === 'finished' ? 'animate-pulse' : ''}
          />
        </svg>
        {/* Center readout */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl font-mono font-bold tabular-nums"
            style={{ color }}
          >
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      {/* Duration toggle */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {([60, 120] as const).map(d => (
          <button
            key={d}
            disabled={state !== 'idle'}
            onClick={() => setDuration(d)}
            className={`px-4 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              duration === d
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
            }`}
          >
            {d === 60 ? '1 min' : '2 min'}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {state === 'idle' && (
          <button
            onClick={start}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
          >
            Start
          </button>
        )}
        {state === 'running' && (
          <button
            onClick={pause}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            Pause
          </button>
        )}
        {state === 'paused' && (
          <button
            onClick={start}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
          >
            Resume
          </button>
        )}
        {state !== 'idle' && (
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 rounded-xl transition-colors"
          >
            Reset
          </button>
        )}
        {canDone && (
          <button
            onClick={onDone}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        )}
      </div>

      {/* Time's up overlay */}
      {state === 'finished' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-red-400 text-lg font-semibold animate-pulse">Time&apos;s Up!</p>
        </div>
      )}
    </div>
  )
}
