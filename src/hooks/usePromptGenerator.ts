import { useState, useCallback } from 'react'
import { fallbackPrompts, type Prompt, type Filters } from '../data/fallbackPrompts'

const SYSTEM_PROMPT = `You are a speaking coach generating impromptu speaking prompts for 1–2 minute speeches.
Return ONLY the prompt text. No preamble, no quotes, no explanation.

Guidelines by difficulty:
- easy: familiar, concrete, relatable
- medium: requires reflection, some abstraction, or mild discomfort
- hard: provocative, abstract, deeply personal, or philosophically uncomfortable

Guidelines by category:
- opinion: take a clear stance; avoid fence-sitting
- personal: draw from lived experience, memory, identity
- hypothetical: a scenario or constraint to reason through
- explain: teach something to a non-expert using analogy and story
- wildcard: absurd, playful, lateral — anything goes
- freestyle: return a SINGLE WORD or a 2–5 word phrase only, no punctuation. This is the entire prompt.`

const ALL_CATEGORIES = ['opinion', 'personal', 'hypothetical', 'explain', 'wildcard', 'freestyle'] as const
const ALL_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

// Session-level dedup cache
const sessionCache = new Set<string>()

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getFilteredFallbacks(filters: Filters): Prompt[] {
  return fallbackPrompts.filter(p => {
    const catMatch = filters.category === 'all' || p.category === filters.category
    const diffMatch = filters.difficulty === 'all' || p.difficulty === filters.difficulty
    return catMatch && diffMatch
  })
}

async function fetchOllamaPrompt(
  filters: Filters,
  customTopic: string | undefined,
  retryCount: number = 0,
): Promise<{ text: string; resolvedCategory: string; resolvedDifficulty: string }> {
  const ollamaUrl = localStorage.getItem('speaking-ollama-url') ?? 'http://localhost:11434'
  const ollamaModel = localStorage.getItem('speaking-ollama-model') ?? 'llama3.1:8b'

  const resolvedCategory = filters.category === 'all' ? randomItem(ALL_CATEGORIES) : filters.category
  const resolvedDifficulty = filters.difficulty === 'all' ? randomItem(ALL_DIFFICULTIES) : filters.difficulty
  const isFreestyle = resolvedCategory === 'freestyle'

  let userMessage = `Category: ${resolvedCategory}\nDifficulty: ${resolvedDifficulty}\n`
  if (customTopic) {
    userMessage += isFreestyle
      ? `The topic is: ${customTopic}\n`
      : `Incorporate this topic naturally: ${customTopic}\n`
  }
  userMessage += 'Generate one prompt.'

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      options: { temperature: 0.9, num_predict: 120 },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  })

  const data = await response.json() as { message?: { content?: string } }
  const text = data.message?.content?.trim() ?? ''
  if (!text) throw new Error('Empty response from Ollama')

  if (sessionCache.has(text) && retryCount < 3) {
    return fetchOllamaPrompt(filters, customTopic, retryCount + 1)
  }

  sessionCache.add(text)
  return { text, resolvedCategory, resolvedDifficulty }
}

export interface UsePromptGeneratorReturn {
  prompt: Prompt | null
  isLoading: boolean
  loadingSeconds: number
  error: string | null
  generatePrompt: (filters: Filters, customTopic?: string) => Promise<void>
}

export function usePromptGenerator(): UsePromptGeneratorReturn {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const generatePrompt = useCallback(async (filters: Filters, customTopic?: string) => {
    // Freestyle shortcut: ≤3 words, no ? or .
    if (
      customTopic &&
      customTopic.trim().split(/\s+/).length <= 3 &&
      !/[?.]/.test(customTopic)
    ) {
      setPrompt({
        id: Date.now().toString(),
        text: customTopic.trim(),
        category: 'freestyle',
        difficulty: 'easy',
        isFreestyle: true,
      })
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setLoadingSeconds(0)

    const ticker = setInterval(() => setLoadingSeconds(s => s + 1), 1000)

    try {
      const { text, resolvedCategory, resolvedDifficulty } = await fetchOllamaPrompt(filters, customTopic)
      setPrompt({
        id: Date.now().toString(),
        text,
        category: resolvedCategory as Prompt['category'],
        difficulty: resolvedDifficulty as Prompt['difficulty'],
        isFreestyle: resolvedCategory === 'freestyle',
      })
      setError(null)
    } catch {
      const pool = getFilteredFallbacks(filters)
      const fallback = pool.length > 0 ? randomItem(pool) : randomItem(fallbackPrompts)
      setPrompt(fallback)
      setError('Ollama unreachable — using offline prompts. Check Settings.')
    } finally {
      clearInterval(ticker)
      setIsLoading(false)
    }
  }, [])

  return { prompt, isLoading, loadingSeconds, error, generatePrompt }
}
