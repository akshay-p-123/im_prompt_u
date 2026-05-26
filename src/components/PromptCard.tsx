import type { Prompt } from '../data/fallbackPrompts'

const CATEGORY_COLORS: Record<string, string> = {
  opinion: 'bg-rose-900/50 text-rose-300',
  personal: 'bg-amber-900/50 text-amber-300',
  hypothetical: 'bg-sky-900/50 text-sky-300',
  explain: 'bg-emerald-900/50 text-emerald-300',
  wildcard: 'bg-purple-900/50 text-purple-300',
  freestyle: 'bg-indigo-900/50 text-indigo-300',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-900/50 text-green-300',
  medium: 'bg-yellow-900/50 text-yellow-300',
  hard: 'bg-red-900/50 text-red-300',
}

interface Props {
  prompt: Prompt | null
  isLoading: boolean
  loadingSeconds: number
}

export function PromptCard({ prompt, isLoading, loadingSeconds }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 min-h-[200px] flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="shimmer h-6 w-24 rounded-full" />
          <div className="shimmer h-6 w-16 rounded-full" />
        </div>
        <div className="shimmer h-8 w-full rounded-lg" />
        <div className="shimmer h-8 w-3/4 rounded-lg" />
        <div className="shimmer h-8 w-1/2 rounded-lg" />
        <p className="text-sm text-gray-500 mt-2">Generating… {loadingSeconds}s</p>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500">No prompt yet — hit Generate.</p>
      </div>
    )
  }

  if (prompt.isFreestyle) {
    return (
      <div className="rounded-2xl border border-indigo-500/30 bg-white/5 p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 hover:border-indigo-400/50 transition-colors">
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${CATEGORY_COLORS.freestyle}`}>
            Freestyle
          </span>
        </div>
        <p className="text-5xl font-black text-center text-white leading-tight">{prompt.text}</p>
        <p className="text-sm text-gray-500">Just speak.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 min-h-[200px] flex flex-col gap-4 hover:border-indigo-500/30 transition-colors">
      <div className="flex gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[prompt.category] ?? 'bg-gray-800 text-gray-300'}`}>
          {prompt.category}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${DIFFICULTY_COLORS[prompt.difficulty] ?? 'bg-gray-800 text-gray-300'}`}>
          {prompt.difficulty}
        </span>
      </div>
      <p className="text-2xl font-medium text-white leading-relaxed">{prompt.text}</p>
    </div>
  )
}
