# One-Word Freestyle + Tone Refresh — Design Spec

**Date:** 2026-05-26

## Problem

Two related issues:
1. The Freestyle category allows Ollama to return a single word *or* a 2–5 word phrase, and three fallback prompts are multi-word phrases — Freestyle doesn't reliably produce one-word prompts.
2. Several fallback prompts and the Ollama difficulty guidance skew too heavy (therapy-adjacent, politically charged, or debate-class tone). Occasional depth is fine; it shouldn't be the default.

## Solution

Three changes across two files.

---

### 1. `src/hooks/usePromptGenerator.ts` — SYSTEM_PROMPT

**A. Add a global tone directive** at the top of the guidelines block:

> Default to fun and accessible. Occasional depth is welcome — just don't make it the focus. Avoid anything that feels like therapy, political debate, or a job interview question.

**B. Update difficulty descriptions** so "hard" means structurally demanding, not emotionally heavy:

| Level  | Before | After |
|--------|--------|-------|
| easy   | familiar, concrete, relatable | (unchanged) |
| medium | requires reflection, some abstraction, or mild discomfort | needs a bit of structure or an interesting angle |
| hard   | provocative, abstract, deeply personal, or philosophically uncomfortable | requires quick thinking, a strong stance, or a compelling argument |

**C. Tighten the freestyle instruction:**

Before: `return a SINGLE WORD or a 2–5 word phrase only, no punctuation. This is the entire prompt.`
After: `return EXACTLY ONE WORD. No phrases, no punctuation, no explanation. This is the entire prompt.`

---

### 2. `src/data/fallbackPrompts.ts` — Prompt swaps

**Freestyle — replace 3 multi-word prompts with single everyday words:**

| ID  | Before | After |
|-----|--------|-------|
| fs6 | "The second before you fall asleep" | "Pockets" |
| fs7 | "Almost remembering" | "Leftovers" |
| fs8 | "Tuesday at 3pm" | "Buffering" |

**Non-freestyle — replace 4 prompts that cross into heavy/political territory:**

| ID  | Before | After |
|-----|--------|-------|
| op4 | "Should social media platforms be held liable for their content?" | "Is it rude to text at the dinner table?" |
| op7 | "Argue that a widely held moral belief in your community is actually wrong." | "Hot dogs are sandwiches. Defend or deny." |
| pe7 | "Describe the version of yourself you are most ashamed of." | "Describe your worst fashion era. What were you thinking?" |
| ex7 | "Explain why democracy sometimes produces bad outcomes, without making it sound like democracy is bad." | "Explain why group projects always go wrong — tell it as a story." |

**Prompts kept as-is** (depth is fine; they don't cross into heavy territory):
pe6, pe8, op8, ex8, hy7 — genuinely interesting without being therapy or politics.

---

## Scope

- 2 files changed
- No new files, types, categories, or UI changes
- Test suite passes unchanged (checks: 48 prompts, 8 per category, correct `isFreestyle` flags — not word count or content)
