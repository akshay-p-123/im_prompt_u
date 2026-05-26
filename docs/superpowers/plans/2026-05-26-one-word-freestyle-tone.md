# One-Word Freestyle + Tone Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Freestyle generate strictly one-word prompts, and refresh the fallback bank + Ollama guidance to default to fun/accessible while keeping occasional depth.

**Architecture:** Two surgical edits — the `SYSTEM_PROMPT` string in `usePromptGenerator.ts` and 7 prompt strings in `fallbackPrompts.ts`. No logic changes, no new files, no new types. Existing tests cover structure (count, category distribution, field types) not content, so they pass unchanged.

**Tech Stack:** TypeScript, Vitest

---

## File Map

```
src/
├── hooks/usePromptGenerator.ts   — update SYSTEM_PROMPT (tone + difficulty + freestyle)
└── data/fallbackPrompts.ts       — replace 7 prompt texts
```

---

### Task 1: Update SYSTEM_PROMPT

**Files:**
- Modify: `src/hooks/usePromptGenerator.ts:4-24`

- [ ] **Step 1: Verify tests pass before touching anything**

```bash
cd /root/im_prompt_u && npx vitest run 2>&1 | tail -10
```

Expected: all tests PASS.

- [ ] **Step 2: Replace the SYSTEM_PROMPT constant**

In `src/hooks/usePromptGenerator.ts`, replace the entire `SYSTEM_PROMPT` constant (lines 4–24) with:

```ts
const SYSTEM_PROMPT = `You are a speaking coach. Output EXACTLY one speaking prompt — one question or statement a person speaks about for 1-2 minutes.

STRICT RULES:
- ONE sentence only. Stop after the first sentence.
- No labels like "Easy:", "Medium:", "Prompt:". No numbering.
- No dialogue, no story, no multiple versions or alternatives.
- No quotes around your output.
- Examples of correct output: "Should cities ban cars?" / "Describe a time you changed your mind." / "If you could delete one invention, what would it be and why?"

Tone: Default to fun and accessible. Occasional depth is welcome — just don't make it the focus. Avoid anything that feels like therapy, political debate, or a job interview question.

Difficulty:
- easy: everyday, familiar, relatable
- medium: needs a bit of structure or an interesting angle
- hard: requires quick thinking, a strong stance, or a compelling argument

Category:
- opinion: a question requiring a clear stance
- personal: draws from memory, identity, or lived experience
- hypothetical: a scenario or constraint to reason through
- explain: teach something simply using analogy
- wildcard: absurd, playful, or lateral — one weird angle
- freestyle: output EXACTLY ONE WORD. No phrases, no punctuation, no explanation.`
```

- [ ] **Step 3: Run tests to verify they still pass**

```bash
cd /root/im_prompt_u && npx vitest run 2>&1 | tail -10
```

Expected: all tests PASS (the `usePromptGenerator` tests mock `fetch` and don't depend on the system prompt text).

- [ ] **Step 4: Commit**

```bash
cd /root/im_prompt_u && git add src/hooks/usePromptGenerator.ts && git commit -m "feat: tighten freestyle to one word, refresh tone and difficulty guidance"
```

---

### Task 2: Replace 7 Fallback Prompts

**Files:**
- Modify: `src/data/fallbackPrompts.ts`

- [ ] **Step 1: Replace the 7 prompt texts**

In `src/data/fallbackPrompts.ts`, make the following 7 changes:

**op4** (line 22) — change `text`:
```ts
{ id: 'op4', text: 'Is it rude to text at the dinner table?', category: 'opinion', difficulty: 'medium', isFreestyle: false },
```

**op7** (line 25) — change `text`:
```ts
{ id: 'op7', text: 'Hot dogs are sandwiches. Defend or deny.', category: 'opinion', difficulty: 'hard', isFreestyle: false },
```

**pe7** (line 35) — change `text`:
```ts
{ id: 'pe7', text: 'Describe your worst fashion era. What were you thinking?', category: 'personal', difficulty: 'hard', isFreestyle: false },
```

**ex7** (line 55) — change `text`:
```ts
{ id: 'ex7', text: 'Explain why group projects always go wrong — tell it as a story.', category: 'explain', difficulty: 'hard', isFreestyle: false },
```

**fs6** (line 74) — change `text`:
```ts
{ id: 'fs6', text: 'Pockets', category: 'freestyle', difficulty: 'medium', isFreestyle: true },
```

**fs7** (line 75) — change `text`:
```ts
{ id: 'fs7', text: 'Leftovers', category: 'freestyle', difficulty: 'medium', isFreestyle: true },
```

**fs8** (line 76) — change `text`:
```ts
{ id: 'fs8', text: 'Buffering', category: 'freestyle', difficulty: 'hard', isFreestyle: true },
```

- [ ] **Step 2: Run the full test suite**

```bash
cd /root/im_prompt_u && npx vitest run 2>&1 | tail -15
```

Expected: all tests PASS. The `fallbackPrompts` tests check count (48), category distribution (8 each), required fields, and `isFreestyle` consistency — none check text content.

- [ ] **Step 3: Commit**

```bash
cd /root/im_prompt_u && git add src/data/fallbackPrompts.ts && git commit -m "feat: replace heavy/political prompts with lighter alternatives, one-word freestyle fallbacks"
```

---

### Task 3: Final Verification

**Files:** None — run and verify.

- [ ] **Step 1: TypeScript check**

```bash
cd /root/im_prompt_u && npx tsc --noEmit 2>&1
```

Expected: no output (no type errors).

- [ ] **Step 2: Build check**

```bash
cd /root/im_prompt_u && npm run build 2>&1 | tail -5
```

Expected: build succeeds.
