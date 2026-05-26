# One-Word Freestyle Prompts — Design Spec

**Date:** 2026-05-26

## Problem

The Freestyle category currently allows Ollama to return a single word *or* a 2–5 word phrase, and three fallback prompts are multi-word phrases. This means Freestyle doesn't reliably produce one-word prompts.

## Solution

Tighten Freestyle to strictly one word, in two places:

### 1. `src/hooks/usePromptGenerator.ts` — SYSTEM_PROMPT

Change the freestyle line from:
```
- freestyle: return a SINGLE WORD or a 2–5 word phrase only, no punctuation. This is the entire prompt.
```
To:
```
- freestyle: return EXACTLY ONE WORD. No phrases, no punctuation, no explanation. This is the entire prompt.
```

### 2. `src/data/fallbackPrompts.ts` — Replace multi-word fallback prompts

| ID  | Before                            | After       |
|-----|-----------------------------------|-------------|
| fs6 | "The second before you fall asleep" | "Drift"   |
| fs7 | "Almost remembering"              | "Threshold" |
| fs8 | "Tuesday at 3pm"                  | "Static"    |

## Scope

- No new files
- No new types or categories
- No UI changes
- Tests pass unchanged (check: 48 prompts, 8 per category, correct isFreestyle flags)
