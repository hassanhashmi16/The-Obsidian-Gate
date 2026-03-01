# AI Coding Agent Rules (Antigravity / Cursor / Copilot)

This file tells the AI coding assistant how to behave in this project. Read this before making any changes.

---

## Project Context

This is The Doorman Game — a Next.js 14 app using the App Router. It is written in plain JavaScript (no TypeScript). It is a conversational game where a user tries to persuade an AI doorman named Rami Khalil to let them into an exclusive Dubai nightclub. Two Groq LLM agents are used: one for the Doorman persona (llama3-8b-8192), one for the Judge scoring system (llama3-70b-8192). Pinecone and Hugging Face are used for vector-based conversation memory in Phase 3.

Always refer to `PRD.md` for full product requirements and `STRUCTURE.md` for folder layout and naming conventions.

---

## Core Rules

1. **Plain JavaScript only.** Do not use TypeScript. Do not create `.ts` or `.tsx` files. All files use `.js` or `.jsx`.

2. **ES Modules only.** Always use `import` and `export`. Never use `require()` or `module.exports` — ever. This is a Next.js 14 App Router project and it uses ES Modules throughout.

2. **Never hardcode LLM prompts inline.** All prompts live in `lib/doorman-prompt.js` and `lib/judge-prompt.js`. Always import from there.

3. **Never expose API keys on the client.** All calls to Groq, Hugging Face, and Pinecone happen exclusively inside `/app/api/` route handlers. Never import these SDKs in any component or page file.

4. **Always handle errors.** Every API call must be wrapped in try/catch. A failed Judge call defaults the score delta to 0. A failed Doorman call returns a generic in-character fallback like "Give me a moment."

5. **Always validate Judge JSON output.** Wrap every `JSON.parse` of the Judge's response in try/catch. Never assume the LLM returned valid JSON — it sometimes doesn't.

6. **Keep components dumb.** Components render UI and emit events. Business logic belongs in API routes and `lib/` files only.

7. **Follow the folder structure in STRUCTURE.md exactly.** Do not create new folders or files without a clear reason tied to the PRD.

8. **Do not over-engineer.** This is a game demo. Avoid unnecessary abstractions, extra libraries, or features not listed in the PRD.

9. **Do not build Phase 3 (Pinecone/Hugging Face) until Phase 1 and Phase 2 are fully working and tested.**

---

## Implementation Order

Always build in this exact order. Do not skip ahead:

1. `lib/doorman-prompt.js` and `lib/judge-prompt.js` — prompts first
2. `lib/groq.js` — Groq client and helper functions
3. `app/api/chat/route.js` — core game logic
4. `components/` — UI components
5. `app/game/page.jsx` — wire components together
6. `app/page.jsx` — landing page last

Phase 3 order:
1. `lib/embeddings.js` — Hugging Face embedding helper
2. `lib/pinecone.js` — Pinecone client
3. `app/api/embed/route.js`
4. `app/api/recall/route.js`
5. Integrate into `app/api/chat/route.js`

---

## Groq API Usage

Doorman call:
- Model: `llama3-8b-8192`
- Always pass the full `conversationHistory` array
- Always include system prompt from `lib/doorman-prompt.js`
- Max tokens: 300 (Rami is concise)

Judge call:
- Model: `llama3-70b-8192`
- Always pass the conversation history as context
- Always include system prompt from `lib/judge-prompt.js`
- Max tokens: 150 (JSON only)
- Always parse response as JSON inside a try/catch

---

## Win Condition Logic

This logic lives exclusively in `app/api/chat/route.js`:

```js
const WIN_THRESHOLD = 100
const newScore = currentScore + scoreDelta
const won = newScore >= WIN_THRESHOLD
```

If `won === true`, inject this message into the conversation before generating the Doorman's reply:

```
[SYSTEM: The user has genuinely convinced you. Let them in now. Make it feel natural and organic — as if you changed your mind in this moment. Do not be abrupt about it.]
```

---

## Styling Rules

- Tailwind CSS utility classes only — no custom CSS except in `globals.css`
- Color palette:
  - Backgrounds: `bg-zinc-950`, `bg-zinc-900`
  - Neon accents: `text-purple-400`, `border-purple-500`, `bg-purple-900`
  - Rami / doorman color: `text-amber-400`
  - User message color: `text-white` or `text-zinc-100`
- Overall vibe: moody Dubai nightclub — dark, sleek, slightly glamorous
- Mobile-first — the chat UI must work on a phone screen

---

## What NOT To Do

- Do not use TypeScript — no `.ts` or `.tsx` files under any circumstances
- Do not use CommonJS — no `require()` or `module.exports` anywhere, ever
- Do not use the `pages/` router — App Router only
- Do not store API keys anywhere in code — `.env.local` only
- Do not install packages not listed in the PRD without asking first
- Do not change the Doorman or Judge prompts without updating `PRD.md` to match
- Do not make Pinecone or Hugging Face calls blocking — they must never delay the Doorman's reply to the user