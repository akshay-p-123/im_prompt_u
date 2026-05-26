import type { Category, Difficulty, Filters } from '../data/fallbackPrompts'

const CATEGORIES: Array<{ value: Category | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'opinion', label: 'Opinion' },
  { value: 'personal', label: 'Personal' },
  { value: 'hypothetical', label: 'Hypothetical' },
  { value: 'explain', label: 'Explain' },
  { value: 'wildcard', label: 'Wild Card' },
  { value: 'freestyle', label: 'Freestyle' },
]

const DIFFICULTIES: Array<{ value: Difficulty | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

interface Props {
  filters: Filters
  customTopic: string
  onFiltersChange: (f: Filters) => void
  onCustomTopicChange: (t: string) => void
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-indigo-600 text-white font-medium'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

export function PromptControls({ filters, customTopic, onFiltersChange, onCustomTopicChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Category */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Category</p>
        <div className="flex flex-wrap gap-1 bg-white/5 rounded-xl p-1">
          {CATEGORIES.map(({ value, label }) => (
            <SegmentButton
              key={value}
              active={filters.category === value}
              onClick={() => onFiltersChange({ ...filters, category: value })}
            >
              {label}
            </SegmentButton>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Difficulty</p>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {DIFFICULTIES.map(({ value, label }) => (
            <SegmentButton
              key={value}
              active={filters.difficulty === value}
              onClick={() => onFiltersChange({ ...filters, difficulty: value })}
            >
              {label}
            </SegmentButton>
          ))}
        </div>
      </div>

      {/* Custom Topic */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Custom Topic</p>
        <div className="relative">
          <input
            type="text"
            value={customTopic}
            onChange={e => onCustomTopicChange(e.target.value)}
            placeholder="e.g. airports, trust, AI ethics…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 transition-colors pr-8"
          />
          {customTopic && (
            <button
              onClick={() => onCustomTopicChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg leading-none"
              aria-label="Clear topic"
            >
              ×
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1.5">1–3 words = freestyle · longer = guided</p>
      </div>
    </div>
  )
}
