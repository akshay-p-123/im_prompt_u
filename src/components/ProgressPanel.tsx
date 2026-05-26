import { toLocalDateStr } from '../hooks/useSessionTracker'

interface Props {
  streak: number
  longestStreak: number
  totalSessions: number
  completedDates: Set<string>
  sessions: Array<{ date: string }>
}

function buildHeatmapCells(completedDates: Set<string>, sessions: Array<{ date: string }>) {
  const sessionsByDate: Record<string, number> = {}
  for (const s of sessions) {
    sessionsByDate[s.date] = (sessionsByDate[s.date] ?? 0) + 1
  }

  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateStr = toLocalDateStr(d)
    const count = sessionsByDate[dateStr] ?? 0
    const label = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return {
      dateStr,
      completed: completedDates.has(dateStr),
      count,
      label,
      isToday: i === 29,
    }
  })
}

export function ProgressPanel({ streak, longestStreak, totalSessions, completedDates, sessions }: Props) {
  const cells = buildHeatmapCells(completedDates, sessions)

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
        <h2 className="text-sm text-gray-500 uppercase tracking-wider">Progress</h2>

        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white">{streak}</span>
          <span className="text-gray-400 text-lg">
            day streak {streak >= 3 ? '🔥' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Longest streak</p>
            <p className="text-2xl font-bold text-white">{longestStreak}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total sessions</p>
            <p className="text-2xl font-bold text-white">{totalSessions}</p>
          </div>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">Last 30 days</h2>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
        >
          {cells.map(cell => (
            <div
              key={cell.dateStr}
              title={`${cell.label} — ${cell.count === 0 ? 'no session' : `${cell.count} session${cell.count > 1 ? 's' : ''}`}`}
              className={`aspect-square rounded-sm cursor-default transition-colors ${
                cell.completed
                  ? 'bg-indigo-500'
                  : 'bg-gray-800 hover:bg-gray-700'
              } ${cell.isToday ? 'ring-1 ring-indigo-400 ring-offset-1 ring-offset-[#0f0f13]' : ''}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-600">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
