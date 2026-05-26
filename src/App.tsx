import { useState, useEffect, useCallback, useRef } from 'react'
import { PromptCard } from './components/PromptCard'
import { PromptControls } from './components/PromptControls'
import { Timer } from './components/Timer'
import { ProgressPanel } from './components/ProgressPanel'
import { SettingsModal } from './components/SettingsModal'
import { useTimer } from './hooks/useTimer'
import { useSessionTracker } from './hooks/useSessionTracker'
import { usePromptGenerator } from './hooks/usePromptGenerator'
import type { Filters } from './data/fallbackPrompts'

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

export default function App() {
  const { sessions, logSession, streak, longestStreak, totalSessions, completedDates, settings, updateSettings, clearHistory } = useSessionTracker()
  const timer = useTimer(
    (settings.preferredDuration === 60 || settings.preferredDuration === 120)
      ? settings.preferredDuration
      : 120
  )
  const { prompt, isLoading, loadingSeconds, error, generatePrompt } = usePromptGenerator()

  const [filters, setFilters] = useState<Filters>({
    category: (settings.preferredCategory as Filters['category']) ?? 'all',
    difficulty: (settings.preferredDifficulty as Filters['difficulty']) ?? 'all',
  })
  const [customTopic, setCustomTopic] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Generate on mount
  useEffect(() => {
    generatePrompt(filters, customTopic || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show error toast when Ollama unreachable
  useEffect(() => {
    if (error) showToast(error)
  }, [error, showToast])

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f)
    updateSettings({ preferredCategory: f.category, preferredDifficulty: f.difficulty })
  }, [updateSettings])

  const handleDone = useCallback(() => {
    if (!prompt || timer.state === 'idle') return
    logSession({
      category: prompt.category,
      difficulty: prompt.difficulty,
      promptText: prompt.text,
      durationSeconds: timer.duration,
    })
    showToast('Session logged! Keep it up.')
    timer.reset()
    generatePrompt(filters, customTopic || undefined)
  }, [prompt, timer, logSession, showToast, generatePrompt, filters, customTopic])

  const handleDoneRef = useRef(handleDone)
  useEffect(() => { handleDoneRef.current = handleDone }, [handleDone])

  // Auto-complete when timer finishes
  useEffect(() => {
    if (timer.state === 'finished') {
      handleDoneRef.current()
    }
  }, [timer.state])

  // Persist duration changes
  useEffect(() => {
    updateSettings({ preferredDuration: timer.duration })
  }, [timer.duration, updateSettings])

  const canDone = timer.state === 'running' || timer.state === 'paused' || timer.state === 'finished'

  return (
    <div className="min-h-screen bg-[#0f0f13] text-gray-100">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">imPROMPTu</h1>
          <p className="text-xs text-gray-500">Speak first, think sharper.</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 rounded-lg"
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column: prompt + controls + timer */}
          <div className="flex flex-col gap-6 md:w-[55%]">
            <PromptCard prompt={prompt} isLoading={isLoading} loadingSeconds={loadingSeconds} />
            <PromptControls
              filters={filters}
              customTopic={customTopic}
              onFiltersChange={handleFiltersChange}
              onCustomTopicChange={setCustomTopic}
            />
            {/* New Prompt button */}
            <button
              onClick={() => generatePrompt(filters, customTopic || undefined)}
              disabled={isLoading}
              className="self-start px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
            >
              {isLoading ? 'Generating…' : 'New Prompt'}
            </button>
            {/* Timer */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex justify-center">
              <Timer timer={timer} onDone={handleDone} canDone={canDone} />
            </div>
          </div>

          {/* Right column: progress */}
          <div className="md:w-[45%]">
            <ProgressPanel
              streak={streak}
              longestStreak={longestStreak}
              totalSessions={totalSessions}
              completedDates={completedDates}
              sessions={sessions}
            />
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/10 text-gray-100 text-sm px-5 py-3 rounded-xl shadow-2xl z-40 max-w-sm text-center">
          {toast}
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onClearHistory={() => {
            clearHistory()
            setShowSettings(false)
            showToast('Session history cleared.')
          }}
        />
      )}
    </div>
  )
}
