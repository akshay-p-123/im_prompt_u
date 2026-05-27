# imPROMPTu

Daily impromptu speaking practice. Get a prompt, start the timer, speak.

## Using the App

### Get a Prompt

Pick a **category** and **difficulty**, then hit **New Prompt**.

| Category | What you get |
|---|---|
| Opinion | Take a clear stance and defend it |
| Personal | Draw from memory or lived experience |
| Hypothetical | Reason through a scenario |
| Explain | Teach something simply using analogy |
| Wild Card | Absurd, playful, lateral |
| Freestyle | A single word — speak wherever it takes you |

**Custom topic** — type a word or phrase in the topic field to shape the prompt. 1–3 plain words (no punctuation) become a freestyle prompt instantly. Longer or punctuated input gets sent to Ollama to generate a guided prompt around that topic.

### Start Speaking

Hit **Start** when ready. The ring counts down — green → yellow at 30s → red at 15s.

Toggle between **1 min** and **2 min** before starting. Can't change duration mid-session.

Hit **Pause** to pause, **Resume** to continue, **Reset** to start over.

### Log the Session

Hit **Done** any time after starting. This logs the session and immediately generates your next prompt. The timer auto-logs when it hits zero.

### Track Progress

The right panel shows your current streak, longest streak, total sessions, and a 30-day heatmap. Hover any cell to see how many sessions you did that day.

---

## Running Locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. All data is stored in your browser's localStorage — no account, no backend.

---

## Ollama (AI-Generated Prompts)

By default the app uses built-in prompts. To get AI-generated prompts, run [Ollama](https://ollama.com) locally:

```bash
ollama pull qwen2:0.5b
OLLAMA_ORIGINS=* ollama serve
```

Then open **Settings** (gear icon) and verify the connection. The app will use Ollama automatically and fall back to built-in prompts if it's unreachable.

To use a different model, change it in Settings and pull it first:

```bash
ollama pull <model-name>
```

---

## Running Tests

```bash
npm test
```
