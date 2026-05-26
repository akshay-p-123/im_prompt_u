# imPROMPTu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a focused daily impromptu speaking practice web app: user gets a prompt, runs a timer, marks done, sees streak grow — with optional Ollama LLM prompt generation and localStorage persistence.

**Architecture:** Single-page React app, no backend. All state in localStorage. Hooks own all business logic (timer state machine, session CRUD + streak math, Ollama fetch + fallback). Components are pure UI. Dark-mode-first with Tailwind.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Vitest 1, @testing-library/react 14, native fetch.

---

## File Map

```
/root/im_prompt_u/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── test-setup.ts
    ├── data/
    │   └── fallbackPrompts.ts          # Types + 48 static prompts
    ├── hooks/
    │   ├── useTimer.ts                 # Countdown state machine
    │   ├── useSessionTracker.ts        # localStorage CRUD + streak calc
    │   ├── usePromptGenerator.ts       # LLM call + fallback + dedup
    │   └── __tests__/
    │       ├── useTimer.test.ts
    │       ├── useSessionTracker.test.ts
    │       └── usePromptGenerator.test.ts
    └── components/
        ├── PromptCard.tsx              # Prompt display + shimmer skeleton
        ├── PromptControls.tsx          # Category/difficulty/topic filters
        ├── Timer.tsx                   # SVG ring + start/pause/reset
        ├── ProgressPanel.tsx           # Streak + 30-day heatmap
        └── SettingsModal.tsx           # Ollama config + clear history
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/test-setup.ts`
- Create: `src/App.tsx` (placeholder)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "impromptu",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.18",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.0",
    "vitest": "^1.3.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0f0f13',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>imPROMPTu</title>
  </head>
  <body class="bg-[#0f0f13] text-gray-100 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #0f0f13;
    color: #f3f4f6;
    min-height: 100vh;
  }
  * {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f0f13];
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #1e1e27 25%,
    #2a2a36 50%,
    #1e1e27 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

- [ ] **Step 9: Create `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 10: Create `src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 11: Create placeholder `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <p className="text-gray-400">imPROMPTu loading…</p>
    </div>
  )
}
```

- [ ] **Step 12: Install dependencies**

```bash
cd /root/im_prompt_u && npm install
```

Expected: packages installed, no errors.

- [ ] **Step 13: Verify dev server starts**

```bash
cd /root/im_prompt_u && npx vite build 2>&1 | tail -5
```

Expected: build succeeds (or minimal TS errors from empty App).

- [ ] **Step 14: Commit**

```bash
cd /root/im_prompt_u && git init && git add -A && git commit -m "chore: scaffold Vite + React + TS + Tailwind + Vitest"
```

---

### Task 2: Types + Fallback Prompts

**Files:**
- Create: `src/data/fallbackPrompts.ts`
- Create: `src/hooks/__tests__/fallbackPrompts.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/hooks/__tests__/fallbackPrompts.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { fallbackPrompts, type Category, type Difficulty } from '../../data/fallbackPrompts'

const CATEGORIES: Category[] = ['opinion', 'personal', 'hypothetical', 'explain', 'wildcard', 'freestyle']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

describe('fallbackPrompts', () => {
  it('has exactly 48 prompts', () => {
    expect(fallbackPrompts).toHaveLength(48)
  })

  it('has 8 prompts per category', () => {
    for (const cat of CATEGORIES) {
      const count = fallbackPrompts.filter(p => p.category === cat).length
      expect(count, `category ${cat}`).toBe(8)
    }
  })

  it('each prompt has required fields', () => {
    for (const p of fallbackPrompts) {
      expect(p.id).toBeTruthy()
      expect(p.text).toBeTruthy()
      expect(CATEGORIES).toContain(p.category)
      expect(DIFFICULTIES).toContain(p.difficulty)
      expect(typeof p.isFreestyle).toBe('boolean')
    }
  })

  it('all freestyle prompts have isFreestyle=true', () => {
    const freestyle = fallbackPrompts.filter(p => p.category === 'freestyle')
    expect(freestyle.every(p => p.isFreestyle)).toBe(true)
  })

  it('all non-freestyle prompts have isFreestyle=false', () => {
    const nonFreestyle = fallbackPrompts.filter(p => p.category !== 'freestyle')
    expect(nonFreestyle.every(p => !p.isFreestyle)).toBe(true)
  })

  it('all ids are unique', () => {
    const ids = fallbackPrompts.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/fallbackPrompts.test.ts 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/data/fallbackPrompts.ts`**

```ts
export type Category = 'opinion' | 'personal' | 'hypothetical' | 'explain' | 'wildcard' | 'freestyle'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Prompt = {
  id: string
  text: string
  category: Category
  difficulty: Difficulty
  isFreestyle: boolean
}

export type Filters = {
  category: Category | 'all'
  difficulty: Difficulty | 'all'
}

export const fallbackPrompts: Prompt[] = [
  // Opinion
  { id: 'op1', text: 'Should schools assign homework?', category: 'opinion', difficulty: 'easy', isFreestyle: false },
  { id: 'op2', text: 'Is breakfast really the most important meal of the day?', category: 'opinion', difficulty: 'easy', isFreestyle: false },
  { id: 'op3', text: 'Is expertise overrated in the age of search engines?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
  { id: 'op4', text: 'Should social media platforms be held liable for their content?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
  { id: 'op5', text: 'Is remote work better or worse for society overall?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
  { id: 'op6', text: "Pick a hill you'd die on and defend it.", category: 'opinion', difficulty: 'hard', isFreestyle: false },
  { id: 'op7', text: 'Argue that a widely held moral belief in your community is actually wrong.', category: 'opinion', difficulty: 'hard', isFreestyle: false },
  { id: 'op8', text: 'Is meritocracy a myth? Defend your position.', category: 'opinion', difficulty: 'hard', isFreestyle: false },

  // Personal
  { id: 'pe1', text: "Describe a skill you wish you'd learned earlier.", category: 'personal', difficulty: 'easy', isFreestyle: false },
  { id: 'pe2', text: 'Talk about a place that feels like home to you.', category: 'personal', difficulty: 'easy', isFreestyle: false },
  { id: 'pe3', text: 'Talk about a time you were completely wrong.', category: 'personal', difficulty: 'medium', isFreestyle: false },
  { id: 'pe4', text: 'Describe a moment that changed how you see yourself.', category: 'personal', difficulty: 'medium', isFreestyle: false },
  { id: 'pe5', text: 'Talk about a relationship that shaped who you are.', category: 'personal', difficulty: 'medium', isFreestyle: false },
  { id: 'pe6', text: "What's a belief you hold that most people in your life would disagree with?", category: 'personal', difficulty: 'hard', isFreestyle: false },
  { id: 'pe7', text: 'Describe the version of yourself you are most ashamed of.', category: 'personal', difficulty: 'hard', isFreestyle: false },
  { id: 'pe8', text: "What would your life look like if you'd made the opposite choice at a pivotal moment?", category: 'personal', difficulty: 'hard', isFreestyle: false },

  // Hypothetical
  { id: 'hy1', text: 'If you could live in any decade of the past, which would you choose and why?', category: 'hypothetical', difficulty: 'easy', isFreestyle: false },
  { id: 'hy2', text: 'If you could have dinner with any person alive today, who and why?', category: 'hypothetical', difficulty: 'easy', isFreestyle: false },
  { id: 'hy3', text: "You have 48 hours to redesign your city's transit system — what's your first call?", category: 'hypothetical', difficulty: 'medium', isFreestyle: false },
  { id: 'hy4', text: 'You wake up with the ability to make one law that everyone must follow. What is it?', category: 'hypothetical', difficulty: 'medium', isFreestyle: false },
  { id: 'hy5', text: 'A time capsule will be opened in 100 years. What do you put in it and why?', category: 'hypothetical', difficulty: 'medium', isFreestyle: false },
  { id: 'hy6', text: "Humanity must leave Earth in 10 years. You're on the logistics committee.", category: 'hypothetical', difficulty: 'hard', isFreestyle: false },
  { id: 'hy7', text: 'You can eliminate one human cognitive bias from all of humanity. Which one?', category: 'hypothetical', difficulty: 'hard', isFreestyle: false },
  { id: 'hy8', text: "You are given control of the world's education system for one year. What changes?", category: 'hypothetical', difficulty: 'hard', isFreestyle: false },

  // Explain
  { id: 'ex1', text: 'Explain compound interest using only a story.', category: 'explain', difficulty: 'easy', isFreestyle: false },
  { id: 'ex2', text: 'Explain what a habit is to someone who has never heard the word.', category: 'explain', difficulty: 'easy', isFreestyle: false },
  { id: 'ex3', text: 'Explain why humans need sleep without using any scientific jargon.', category: 'explain', difficulty: 'medium', isFreestyle: false },
  { id: 'ex4', text: 'Explain how the internet works using only physical-world analogies.', category: 'explain', difficulty: 'medium', isFreestyle: false },
  { id: 'ex5', text: 'Explain why diversity makes groups smarter — use a story or metaphor.', category: 'explain', difficulty: 'medium', isFreestyle: false },
  { id: 'ex6', text: 'Explain the concept of entropy to a ten-year-old using three concrete examples.', category: 'explain', difficulty: 'hard', isFreestyle: false },
  { id: 'ex7', text: 'Explain why democracy sometimes produces bad outcomes, without making it sound like democracy is bad.', category: 'explain', difficulty: 'hard', isFreestyle: false },
  { id: 'ex8', text: 'Explain consciousness as if the listener has never experienced being confused before.', category: 'explain', difficulty: 'hard', isFreestyle: false },

  // Wildcard
  { id: 'wc1', text: "Give a TED talk about why Mondays deserve more respect.", category: 'wildcard', difficulty: 'easy', isFreestyle: false },
  { id: 'wc2', text: 'Describe your morning routine as if it were an epic quest.', category: 'wildcard', difficulty: 'easy', isFreestyle: false },
  { id: 'wc3', text: 'Give a eulogy for the concept of boredom.', category: 'wildcard', difficulty: 'medium', isFreestyle: false },
  { id: 'wc4', text: "Defend the most mundane object near you as humanity's greatest invention.", category: 'wildcard', difficulty: 'medium', isFreestyle: false },
  { id: 'wc5', text: "Pitch a new national holiday and explain why it's desperately needed.", category: 'wildcard', difficulty: 'medium', isFreestyle: false },
  { id: 'wc6', text: 'Explain the rules of human society to a highly intelligent alien who has never seen Earth.', category: 'wildcard', difficulty: 'hard', isFreestyle: false },
  { id: 'wc7', text: 'You are a grain of sand. Narrate your life story.', category: 'wildcard', difficulty: 'hard', isFreestyle: false },
  { id: 'wc8', text: 'Argue that the concept of time is the most destructive invention in human history.', category: 'wildcard', difficulty: 'hard', isFreestyle: false },

  // Freestyle
  { id: 'fs1', text: 'Coffee', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs2', text: 'Airports', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs3', text: 'Momentum', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs4', text: 'Nostalgia', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs5', text: 'Silence', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
  { id: 'fs6', text: 'The second before you fall asleep', category: 'freestyle', difficulty: 'medium', isFreestyle: true },
  { id: 'fs7', text: 'Almost remembering', category: 'freestyle', difficulty: 'medium', isFreestyle: true },
  { id: 'fs8', text: 'Tuesday at 3pm', category: 'freestyle', difficulty: 'easy', isFreestyle: true },
]
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/fallbackPrompts.test.ts 2>&1 | tail -10
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: add types and 48-prompt fallback bank"
```

---

### Task 3: useTimer Hook (TDD)

**Files:**
- Create: `src/hooks/__tests__/useTimer.test.ts`
- Create: `src/hooks/useTimer.ts`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/__tests__/useTimer.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTimer } from '../useTimer'

describe('useTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/useTimer.test.ts 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/hooks/useTimer.ts`**

```ts
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

export function useTimer(): UseTimerReturn {
  const [duration, setDurationState] = useState<60 | 120>(120)
  const [seconds, setSeconds] = useState(120)
  const [state, setState] = useState<TimerState>('idle')
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef<60 | 120>(120)

  const clearTick = () => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }

  // Start/stop the interval based on state
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
    setState(s => {
      if (s !== 'idle') return s
      durationRef.current = d
      setDurationState(d)
      setSeconds(d)
      return 'idle'
    })
  }, [])

  return { seconds, state, duration, start, pause, reset, setDuration }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/useTimer.test.ts 2>&1 | tail -15
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: implement useTimer countdown state machine with tests"
```

---

### Task 4: useSessionTracker Hook (TDD)

**Files:**
- Create: `src/hooks/__tests__/useSessionTracker.test.ts`
- Create: `src/hooks/useSessionTracker.ts`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/__tests__/useSessionTracker.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSessionTracker, calculateStreak, calculateLongestStreak, toLocalDateStr } from '../useSessionTracker'

describe('toLocalDateStr', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toLocalDateStr(new Date('2026-05-26T12:00:00'))).toBe('2026-05-26')
  })
})

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns 0 for empty set', () => {
    expect(calculateStreak(new Set())).toBe(0)
  })

  it('returns 1 when only today has a session', () => {
    expect(calculateStreak(new Set(['2026-05-26']))).toBe(1)
  })

  it('returns 3 for three consecutive days including today', () => {
    expect(calculateStreak(new Set(['2026-05-24', '2026-05-25', '2026-05-26']))).toBe(3)
  })

  it('returns 0 when last session was 3+ days ago', () => {
    expect(calculateStreak(new Set(['2026-05-20']))).toBe(0)
  })

  it('returns streak alive from yesterday when today has no session', () => {
    expect(calculateStreak(new Set(['2026-05-24', '2026-05-25']))).toBe(2)
  })

  it('does not count non-consecutive days as streak', () => {
    expect(calculateStreak(new Set(['2026-05-20', '2026-05-22', '2026-05-24', '2026-05-25', '2026-05-26']))).toBe(3)
  })
})

describe('calculateLongestStreak', () => {
  it('returns 0 for empty set', () => {
    expect(calculateLongestStreak(new Set())).toBe(0)
  })

  it('returns longest run of consecutive days', () => {
    expect(calculateLongestStreak(new Set([
      '2026-05-01', '2026-05-02', '2026-05-03',
      '2026-05-10', '2026-05-11',
    ]))).toBe(3)
  })
})

describe('useSessionTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T12:00:00'))
    localStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('starts with empty sessions and default settings', () => {
    const { result } = renderHook(() => useSessionTracker())
    expect(result.current.sessions).toHaveLength(0)
    expect(result.current.streak).toBe(0)
    expect(result.current.totalSessions).toBe(0)
    expect(result.current.settings.preferredDuration).toBe(120)
    expect(result.current.settings.preferredCategory).toBe('all')
  })

  it('logSession appends to state and localStorage', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.logSession({
        category: 'opinion',
        difficulty: 'easy',
        promptText: 'test prompt',
        durationSeconds: 120,
      })
    })
    expect(result.current.totalSessions).toBe(1)
    expect(result.current.sessions[0].date).toBe('2026-05-26')
    expect(result.current.sessions[0].promptText).toBe('test prompt')
    const stored = JSON.parse(localStorage.getItem('speaking-sessions')!)
    expect(stored).toHaveLength(1)
  })

  it('streak updates after logging a session today', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.logSession({ category: 'opinion', difficulty: 'easy', promptText: 'x', durationSeconds: 60 })
    })
    expect(result.current.streak).toBe(1)
  })

  it('updateSettings persists to localStorage', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.updateSettings({ preferredCategory: 'opinion', preferredDuration: 60 })
    })
    expect(result.current.settings.preferredCategory).toBe('opinion')
    expect(result.current.settings.preferredDuration).toBe(60)
    const stored = JSON.parse(localStorage.getItem('speaking-settings')!)
    expect(stored.preferredCategory).toBe('opinion')
  })

  it('clearHistory wipes sessions from state and localStorage', () => {
    const { result } = renderHook(() => useSessionTracker())
    act(() => {
      result.current.logSession({ category: 'opinion', difficulty: 'easy', promptText: 'x', durationSeconds: 60 })
    })
    expect(result.current.totalSessions).toBe(1)
    act(() => result.current.clearHistory())
    expect(result.current.totalSessions).toBe(0)
    expect(localStorage.getItem('speaking-sessions')).toBeNull()
  })

  it('loads sessions from pre-populated localStorage', () => {
    localStorage.setItem('speaking-sessions', JSON.stringify([
      { id: '1', date: '2026-05-26', category: 'opinion', difficulty: 'easy', promptText: 'x', durationSeconds: 60 },
      { id: '2', date: '2026-05-25', category: 'opinion', difficulty: 'easy', promptText: 'y', durationSeconds: 60 },
    ]))
    const { result } = renderHook(() => useSessionTracker())
    expect(result.current.totalSessions).toBe(2)
    expect(result.current.streak).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/useSessionTracker.test.ts 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/hooks/useSessionTracker.ts`**

```ts
import { useState, useCallback, useMemo } from 'react'

const SESSIONS_KEY = 'speaking-sessions'
const SETTINGS_KEY = 'speaking-settings'

export type SessionRecord = {
  id: string
  date: string
  category: string
  difficulty: string
  promptText: string
  durationSeconds: number
}

export type UserSettings = {
  preferredCategory: string
  preferredDifficulty: string
  preferredDuration: 60 | 120
}

const defaultSettings: UserSettings = {
  preferredCategory: 'all',
  preferredDifficulty: 'all',
  preferredDuration: 120,
}

export function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function subtractOneDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return toLocalDateStr(d)
}

export function calculateStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const today = toLocalDateStr(new Date())
  const yesterday = subtractOneDay(today)
  if (!dates.has(today) && !dates.has(yesterday)) return 0

  let cursor = dates.has(today) ? today : yesterday
  let streak = 0
  while (dates.has(cursor)) {
    streak++
    cursor = subtractOneDay(cursor)
  }
  return streak
}

export function calculateLongestStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const sorted = Array.from(dates).sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T12:00:00')
    const curr = new Date(sorted[i] + 'T12:00:00')
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000)
    if (diff === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }
  return longest
}

function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? (JSON.parse(raw) as SessionRecord[]) : []
  } catch {
    return []
  }
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<UserSettings>) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function useSessionTracker() {
  const [sessions, setSessions] = useState<SessionRecord[]>(loadSessions)
  const [settings, setSettings] = useState<UserSettings>(loadSettings)

  const completedDates = useMemo(() => new Set(sessions.map(s => s.date)), [sessions])
  const streak = calculateStreak(completedDates)
  const longestStreak = calculateLongestStreak(completedDates)
  const totalSessions = sessions.length

  const logSession = useCallback((record: Omit<SessionRecord, 'id' | 'date'>) => {
    const full: SessionRecord = {
      id: Date.now().toString(),
      date: toLocalDateStr(new Date()),
      ...record,
    }
    setSessions(prev => {
      const next = [...prev, full]
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setSessions([])
    localStorage.removeItem(SESSIONS_KEY)
  }, [])

  return {
    sessions,
    logSession,
    streak,
    longestStreak,
    totalSessions,
    completedDates,
    settings,
    updateSettings,
    clearHistory,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/useSessionTracker.test.ts 2>&1 | tail -15
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: implement useSessionTracker with streak calculation and tests"
```

---

### Task 5: usePromptGenerator Hook (TDD)

**Files:**
- Create: `src/hooks/__tests__/usePromptGenerator.test.ts`
- Create: `src/hooks/usePromptGenerator.ts`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/__tests__/usePromptGenerator.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/usePromptGenerator.test.ts 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/hooks/usePromptGenerator.ts`**

```ts
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

const CATEGORIES = ['opinion', 'personal', 'hypothetical', 'explain', 'wildcard', 'freestyle'] as const

// Session-level dedup cache
const sessionCache = new Set<string>()

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getFilteredFallbacks(filters: Filters): Prompt[] {
  return fallbackPrompts.filter(p => {
    const catMatch = filters.category === 'all' || p.category === filters.category
    const diffMatch = filters.difficulty === 'all' || p.difficulty === filters.difficulty
    return catMatch && diffMatch
  })
}

function resolveCategory(filters: Filters): string {
  return filters.category === 'all' ? randomItem([...CATEGORIES]) : filters.category
}

function resolveDifficulty(filters: Filters): string {
  return filters.difficulty === 'all' ? randomItem(['easy', 'medium', 'hard']) : filters.difficulty
}

async function fetchOllamaPrompt(
  filters: Filters,
  customTopic: string | undefined,
  retryCount: number = 0,
): Promise<string> {
  const ollamaUrl = localStorage.getItem('speaking-ollama-url') ?? 'http://localhost:11434'
  const ollamaModel = localStorage.getItem('speaking-ollama-model') ?? 'llama3.1:8b'
  const category = resolveCategory(filters)
  const difficulty = resolveDifficulty(filters)
  const isFreestyle = category === 'freestyle'

  let userMessage = `Category: ${category}\nDifficulty: ${difficulty}\n`
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
  if (!text) throw new Error('Empty response')

  if (sessionCache.has(text) && retryCount < 3) {
    return fetchOllamaPrompt(filters, customTopic, retryCount + 1)
  }

  sessionCache.add(text)
  return text
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
    if (customTopic && customTopic.trim().split(/\s+/).length <= 3 && !/[?.]/u.test(customTopic)) {
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
      const text = await fetchOllamaPrompt(filters, customTopic)
      const category = filters.category === 'all'
        ? 'wildcard' as const
        : filters.category
      const difficulty = filters.difficulty === 'all'
        ? 'medium' as const
        : filters.difficulty
      setPrompt({
        id: Date.now().toString(),
        text,
        category,
        difficulty,
        isFreestyle: category === 'freestyle',
      })
    } catch {
      const pool = getFilteredFallbacks(filters)
      const fallback = pool.length > 0
        ? randomItem(pool)
        : randomItem(fallbackPrompts)
      setPrompt(fallback)
      setError('Ollama unreachable — using offline prompts. Check Settings.')
    } finally {
      clearInterval(ticker)
      setIsLoading(false)
    }
  }, [])

  return { prompt, isLoading, loadingSeconds, error, generatePrompt }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /root/im_prompt_u && npx vitest run src/hooks/__tests__/usePromptGenerator.test.ts 2>&1 | tail -15
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: implement usePromptGenerator with Ollama fetch, fallback, dedup, and tests"
```

---

### Task 6: PromptCard Component

**Files:**
- Create: `src/components/PromptCard.tsx`

- [ ] **Step 1: Create `src/components/PromptCard.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: add PromptCard component with shimmer skeleton and freestyle mode"
```

---

### Task 7: PromptControls Component

**Files:**
- Create: `src/components/PromptControls.tsx`

- [ ] **Step 1: Create `src/components/PromptControls.tsx`**

```tsx
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
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-indigo-500/50 focus:bg-white/8 transition-colors pr-8"
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
```

- [ ] **Step 2: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: add PromptControls with category/difficulty segments and topic input"
```

---

### Task 8: Timer Component

**Files:**
- Create: `src/components/Timer.tsx`

- [ ] **Step 1: Create `src/components/Timer.tsx`**

```tsx
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
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <p className="text-red-400 text-lg font-semibold">Time&apos;s Up!</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: add Timer component with SVG ring and color transitions"
```

---

### Task 9: ProgressPanel Component

**Files:**
- Create: `src/components/ProgressPanel.tsx`

- [ ] **Step 1: Create `src/components/ProgressPanel.tsx`**

```tsx
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
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
```

- [ ] **Step 2: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: add ProgressPanel with streak stats and 30-day heatmap"
```

---

### Task 10: SettingsModal Component

**Files:**
- Create: `src/components/SettingsModal.tsx`

- [ ] **Step 1: Create `src/components/SettingsModal.tsx`**

```tsx
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
    () => localStorage.getItem('speaking-ollama-model') ?? 'llama3.1:8b'
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
              <code className="text-gray-500">ollama pull llama3.1:8b</code>
            </p>
          </div>

          {/* Test connection */}
          <button
            onClick={testConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 rounded-xl transition-colors disabled:opacity-50"
          >
            {testStatus === 'testing' && <span className="animate-spin">⟳</span>}
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
```

- [ ] **Step 2: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: add SettingsModal with Ollama config, connection test, and clear history"
```

---

### Task 11: App Layout (Wire Everything Together)

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace `src/App.tsx` with full layout**

```tsx
import { useState, useEffect, useCallback } from 'react'
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
  const timer = useTimer()
  const { sessions, logSession, streak, longestStreak, totalSessions, completedDates, settings, updateSettings, clearHistory } = useSessionTracker()
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

  // Auto-complete when timer finishes
  useEffect(() => {
    if (timer.state === 'finished') {
      handleDone()
    }
  }, [timer.state]) // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/10 text-gray-100 text-sm px-5 py-3 rounded-xl shadow-2xl z-40 max-w-sm text-center animate-pulse-once">
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
```

- [ ] **Step 2: Commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "feat: wire up App.tsx with two-column layout and full user flow"
```

---

### Task 12: Final Verification

**Files:** None — run and verify.

- [ ] **Step 1: Run full test suite**

```bash
cd /root/im_prompt_u && npx vitest run 2>&1 | tail -20
```

Expected: all tests PASS, 0 failures.

- [ ] **Step 2: TypeScript check**

```bash
cd /root/im_prompt_u && npx tsc --noEmit 2>&1
```

Expected: no output (no type errors).

- [ ] **Step 3: Build check**

```bash
cd /root/im_prompt_u && npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 4: Start dev server and verify**

```bash
cd /root/im_prompt_u && npx vite --port 5173 &
sleep 3
curl -s http://localhost:5173 | head -5
```

Expected: HTML response with `<title>imPROMPTu</title>`.

- [ ] **Step 5: Final commit**

```bash
cd /root/im_prompt_u && git add -A && git commit -m "chore: verified build and tests pass"
```

---

## Self-Review Against Spec

| Spec Requirement | Covered By |
|---|---|
| React 18 + Vite + TypeScript + Tailwind | Task 1 |
| `fallbackPrompts.ts` with 48 prompts and all types | Task 2 |
| `useTimer` state machine (idle→running→paused→finished) | Task 3 |
| `useSessionTracker` with streak calc + localStorage | Task 4 |
| `usePromptGenerator` with Ollama fetch + fallback + dedup | Task 5 |
| PromptCard with shimmer skeleton + elapsed seconds | Task 6 |
| PromptControls with category/difficulty/topic | Task 7 |
| Timer SVG ring + color transitions + duration toggle | Task 8 |
| ProgressPanel streak stats + 30-day heatmap | Task 9 |
| SettingsModal with connection test + clear history | Task 10 |
| App two-column layout + header + user flow | Task 11 |
| `npm run dev` — no console errors | Task 12 |
| Freestyle shortcut (≤3 words, no ?.) | Task 5 |
| 30s timeout for Ollama | Task 5 |
| Session-level dedup (Set, 3 retries) | Task 5 |
| CORS note in Settings | Task 10 |
| "Done" available any time after Start | Task 8, 11 |
| Auto-generate next prompt after Done | Task 11 |
| Persist category+difficulty in settings | Task 11 |
| Toast for Ollama unreachable | Task 11 |
| Dark mode bg #0f0f13, accent indigo-500 | Tasks 1, 6–11 |
| Heatmap tooltip with session count | Task 9 |
| Fire emoji at ≥3 day streak | Task 9 |
