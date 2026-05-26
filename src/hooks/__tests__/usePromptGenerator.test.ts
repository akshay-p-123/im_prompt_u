import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usePromptGenerator } from '../usePromptGenerator'

const defaultFilters = { category: 'opinion' as const, difficulty: 'easy' as const }

describe('usePromptGenerator', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.setItem('speaking-ollama-url', 'http://localhost:11434')
    localStorage.setItem('speaking-ollama-model', 'llama3.1:8b')
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('returns freestyle prompt immediately for short topic (no fetch)', async () => {
    const { result } = renderHook(() => usePromptGenerator())
    await act(async () => {
      await result.current.generatePrompt({ category: 'freestyle', difficulty: 'easy' }, 'coffee')
    })
    expect(result.current.prompt?.text).toBe('coffee')
    expect(result.current.prompt?.isFreestyle).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not shortcut when custom topic has punctuation', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Is coffee overrated?' } }),
    })
    vi.stubGlobal('fetch', mockFetch)
    const { result } = renderHook(() => usePromptGenerator())
    await act(async () => {
      await result.current.generatePrompt({ category: 'opinion', difficulty: 'easy' }, 'coffee?')
    })
    expect(fetch).toHaveBeenCalled()
  })

  it('falls back to static prompts when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => usePromptGenerator())
    await act(async () => {
      await result.current.generatePrompt(defaultFilters)
    })
    expect(result.current.prompt).not.toBeNull()
    expect(result.current.prompt?.category).toBe('opinion')
    expect(result.current.error).toContain('Ollama unreachable')
    expect(result.current.isLoading).toBe(false)
  })

  it('uses Ollama response when fetch succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Should social media be regulated?' } }),
    } as Response)
    const { result } = renderHook(() => usePromptGenerator())
    await act(async () => {
      await result.current.generatePrompt(defaultFilters)
    })
    expect(result.current.prompt?.text).toBe('Should social media be regulated?')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('falls back when Ollama returns empty content', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: '' } }),
    } as Response)
    const { result } = renderHook(() => usePromptGenerator())
    await act(async () => {
      await result.current.generatePrompt(defaultFilters)
    })
    expect(result.current.prompt).not.toBeNull()
    expect(result.current.error).toContain('Ollama unreachable')
  })

  it('sets isLoading true during fetch', async () => {
    let resolvePromise!: (v: unknown) => void
    vi.mocked(fetch).mockReturnValue(new Promise(r => { resolvePromise = r }) as Promise<Response>)
    const { result } = renderHook(() => usePromptGenerator())
    act(() => { result.current.generatePrompt(defaultFilters) })
    expect(result.current.isLoading).toBe(true)
    await act(async () => {
      resolvePromise({ ok: true, json: async () => ({ message: { content: 'test' } }) })
    })
    expect(result.current.isLoading).toBe(false)
  })
})
