import { useState } from 'react'

interface Props {
  onClose: () => void
  onClearHistory: () => void
}

export function SettingsModal({ onClose, onClearHistory }: Props) {
  const [url, setUrl] = useState(
    () => localStorage.getItem('speaking-ollama-url') ?? 'http://localhost:11434'
  )
  const [model, setModel] = useState(
    () => localStorage.getItem('speaking-ollama-model') ?? 'qwen2:0.5b'
  )
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [testError, setTestError] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const save = () => {
    localStorage.setItem('speaking-ollama-url', url.trim())
    localStorage.setItem('speaking-ollama-model', model.trim())
    onClose()
  }

  const testConnection = async () => {
    setTestStatus('testing')
    setTestError('')
    try {
      const res = await fetch(`${url.trim()}/api/tags`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTestStatus('ok')
    } catch (e) {
      setTestStatus('fail')
      setTestError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    onClearHistory()
    setConfirmClear(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#16161f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Ollama URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Ollama Server URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:border-indigo-500/50 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Ollama must be running locally. Start it with{' '}
              <code className="text-gray-500">ollama serve</code>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              If prompts fail, set{' '}
              <code className="text-gray-500">OLLAMA_ORIGINS=*</code> in your environment.
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Model</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:border-indigo-500/50 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Pull the model first:{' '}
              <code className="text-gray-500">ollama pull qwen2:0.5b</code>
            </p>
          </div>

          {/* Test connection */}
          <button
            onClick={testConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 rounded-xl transition-colors disabled:opacity-50"
          >
            {testStatus === 'testing' && <span className="animate-spin inline-block">⟳</span>}
            {testStatus === 'ok' && <span className="text-green-400">✓</span>}
            {testStatus === 'fail' && <span className="text-red-400">✗</span>}
            {testStatus === 'idle' && <span>◎</span>}
            Test connection
          </button>
          {testStatus === 'fail' && testError && (
            <p className="text-xs text-red-400 -mt-3">{testError}</p>
          )}
          {testStatus === 'ok' && (
            <p className="text-xs text-green-400 -mt-3">Connected successfully</p>
          )}

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Clear history */}
          <div>
            <button
              onClick={handleClear}
              className={`px-4 py-2.5 text-sm rounded-xl transition-colors border ${
                confirmClear
                  ? 'bg-red-900/30 border-red-500/50 text-red-300 hover:bg-red-900/50'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {confirmClear ? 'Confirm: delete all history' : 'Clear session history'}
            </button>
            {confirmClear && (
              <p className="text-xs text-red-400 mt-1.5">This cannot be undone.</p>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
