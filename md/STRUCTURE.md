# Project Structure & Conventions

## Folder Structure

```
doorman-game/
├── app/
│   ├── page.jsx                  # Landing page "/"
│   ├── game/
│   │   └── page.jsx              # Main game screen "/game"
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.js          # POST /api/chat — main game loop
│   │   ├── embed/
│   │   │   └── route.js          # POST /api/embed — store vector in Pinecone (Phase 3)
│   │   └── recall/
│   │       └── route.js          # POST /api/recall — retrieve vectors from Pinecone (Phase 3)
│   ├── layout.jsx
│   └── globals.css
├── components/
│   ├── ChatWindow.jsx            # Scrollable message history
│   ├── MessageBubble.jsx         # Individual message (user vs Rami)
│   ├── InfluenceMeter.jsx        # Animated progress bar
│   ├── ScoreDelta.jsx            # Flashing +12 / -5 display
│   ├── InputBar.jsx              # Text input + send button
│   └── WinOverlay.jsx            # Success screen
├── lib/
│   ├── doorman-prompt.js         # Doorman system prompt string
│   ├── judge-prompt.js           # Judge system prompt string
│   ├── groq.js                   # Groq client setup and helper functions
│   ├── pinecone.js               # Pinecone client setup (Phase 3)
│   ├── embeddings.js             # Hugging Face embedding calls (Phase 3)
│   └── utils.js                  # Shared helper functions
├── .env.local                    # Environment variables (never commit this)
├── .env.example                  # Template showing which env vars are needed
├── PRD.md                        # Product requirements
├── STRUCTURE.md                  # This file
└── CURSOR_RULES.md               # Instructions for the AI coding agent
```

---

## Data Shapes

These are the key data structures used across the app. No TypeScript — just use these as a reference for what shape your objects should be.

```js
// A single message in the conversation history
// role is one of: "user", "assistant", "system"
{ role: "user", content: "Hey let me in" }

// Request body sent to /api/chat
{
  userMessage: "string",
  conversationHistory: [{ role: "string", content: "string" }],
  currentScore: 0,
  sessionId: "string"
}

// Response body returned from /api/chat
{
  doormanReply: "string",
  scoreDelta: 12,
  newCumulativeScore: 45,
  won: false,
  judgeReasoning: "string"
}

// What the Judge LLM must return (parsed from JSON string)
{
  score: 12,
  reasoning: "string"
}
```

---

## Naming Conventions

- **Components:** PascalCase (`ChatWindow.jsx`)
- **Lib/utility files:** kebab-case (`doorman-prompt.js`, `groq.js`)
- **API route folders:** kebab-case (`/api/chat/`, `/api/embed/`)
- **Variables:** camelCase (`conversationHistory`, `currentScore`)
- **Constants:** UPPER_SNAKE_CASE (`const WIN_THRESHOLD = 100`)

---

## Code Style Rules

- Plain JavaScript only — no TypeScript, no `.ts` or `.tsx` files
- Keep API route files focused on one responsibility only
- LLM prompts live in `lib/` only — never hardcode them inline in route files
- All Groq calls go through `lib/groq.js` — never call the Groq SDK directly in components
- All Pinecone calls go through `lib/pinecone.js`
- All Hugging Face embedding calls go through `lib/embeddings.js`
- Components should never call external APIs directly — they call `/api/` routes only
- Handle all errors explicitly — a failed LLM call should never crash the UI silently