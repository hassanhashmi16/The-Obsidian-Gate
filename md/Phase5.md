# Phase 5 — Difficulty Levels

## Goal
Add two difficulty modes — Normal and Easy — selectable on the landing page via cards. Easy mode makes Rami more forgiving by multiplying positive scores by 1.5x and changing the influence meter to blue. Normal mode is unchanged from what you already have. The difficulty choice is passed through to the game and affects scoring logic in the API route.

## Prerequisites
Phases 1 through 4 must be complete before starting this.

## What Changes Between Modes

| | Easy | Normal |
|---|---|---|
| Win threshold | 100 | 100 |
| Score multiplier | 1.5x on positive scores | 1x (unchanged) |
| Influence meter color | Blue (`bg-blue-500`) | Purple (`bg-purple-500`) |
| Rami's opening line | Slightly warmer | Current default |
| Judge prompt | Unchanged | Unchanged |
| Lose threshold | -50 | -50 |

**Important:** The Judge prompt does NOT change between difficulties. The Judge always scores the same way. The multiplier is applied in the API route *after* the Judge returns its score. This keeps the Judge honest and unbiased — only the result changes, not the evaluation.

## Module System
ES Modules only — `import`/`export` everywhere. No `require()` or `module.exports`.

## Order of Steps
**Landing page cards → Pass difficulty to game → API route multiplier → Meter color change → Rami's opening line**

---

## Step 1: Difficulty Selection Cards on the Landing Page

### What you are doing
Replacing the single "Step Up to the Door" CTA button with two mode selection cards. Each card describes the mode and links to the game with the difficulty as a URL parameter.

### Tasks
- [ ] Open `app/page.jsx`
- [ ] Remove the single CTA button
- [ ] Add a heading above the cards like **"Choose Your Night"** or **"How bold are you?"**
- [ ] Build two cards side by side (or stacked on mobile):

**Easy Card:**
- Title: **"First Timer"**
- Subtitle: **"Easy Mode"**
- Description: *"Rami is in a good mood tonight. He's still selective — but he's willing to give you a chance."*
- Meter color indicator: a small blue dot or bar
- CTA button: **"Step Up"** — links to `/game?difficulty=easy`

**Normal Card:**
- Title: **"Regular Night"**
- Subtitle: **"Normal Mode"**
- Description: *"This is Rami on a typical evening. Unimpressed, watchful, and not in the mood for nonsense."*
- Meter color indicator: a small purple dot or bar
- CTA button: **"Step Up"** — links to `/game?difficulty=normal`

### Styling notes
- Cards should sit side by side on desktop, stacked on mobile
- Use `bg-zinc-900` for card backgrounds with a `border-zinc-700` border
- Easy card accent color: `border-blue-500` on hover or selection
- Normal card accent color: `border-purple-500` on hover or selection
- The selected/hovered card should glow slightly using Tailwind's `ring` utility
- Keep the overall dark nightclub aesthetic consistent with the rest of the app

### How you know this step is done
The landing page shows two cards. Clicking Easy links to `/game?difficulty=easy`. Clicking Normal links to `/game?difficulty=normal`. Both links work.

---

## Step 2: Read Difficulty in the Game Page

### What you are doing
Reading the `difficulty` URL parameter in `app/game/page.jsx` and storing it in state so it can be passed to the API with every message.

### Tasks
- [ ] Open `app/game/page.jsx`
- [ ] Import `useSearchParams` from `next/navigation` at the top:
  ```js
  import { useSearchParams } from "next/navigation"
  ```
- [ ] Read the difficulty param inside the component:
  ```js
  const searchParams = useSearchParams()
  const difficulty = searchParams.get("difficulty") || "normal"
  ```
- [ ] Add `difficulty` to your fetch body so it's sent with every message:
  ```js
  body: JSON.stringify({
    userMessage,
    conversationHistory: messages,
    currentScore,
    sessionId,
    difficulty,        // add this
  })
  ```
- [ ] Also display the current mode somewhere subtle on the game page — for example a small badge in the header like **"Easy Mode"** in blue or **"Normal Mode"** in purple so the player always knows what they picked

### How you know this step is done
Open `/game?difficulty=easy` in the browser. The difficulty value is readable in the component. Every API request body includes the `difficulty` field — verify this in your browser's Network tab.

---

## Step 3: Apply the Scoring Multiplier in the API Route

### What you are doing
This is the only backend change in this entire phase. After the Judge returns its score, if the difficulty is Easy and the score is positive, multiply it by 1.5 and round to the nearest integer. Negative scores are never multiplied — Easy mode only makes good messages count more, it doesn't reduce punishment for bad ones.

### Tasks
- [ ] Open `app/api/chat/route.js`
- [ ] Read `difficulty` from the request body alongside the other fields:
  ```js
  const { userMessage, conversationHistory, currentScore, sessionId, difficulty } = body
  ```
- [ ] After getting `scoreDelta` from the Judge, apply the multiplier:
  ```js
  let adjustedDelta = scoreDelta

  if (difficulty === "easy" && scoreDelta > 0) {
    adjustedDelta = Math.round(scoreDelta * 1.5)
  }
  ```
- [ ] Use `adjustedDelta` everywhere from this point on instead of `scoreDelta` — for calculating `newCumulativeScore`, for the win/lose check, and for the response payload
- [ ] Still return the original `scoreDelta` in the response as `rawDelta` if you want to show the unmodified score in the debug panel, and return `adjustedDelta` as `scoreDelta` for everything else — this is optional but clean

### Example of what changes:
- Judge returns `+10`
- Normal mode → `+10` added to score
- Easy mode → `+15` added to score (10 × 1.5)
- Judge returns `-8`
- Both modes → `-8` added to score (negatives never multiplied)

### How you know this step is done
Play on Easy mode and notice scores climbing faster on good messages. Play on Normal and confirm nothing changed. Check the debug panel — scores should be visibly higher in Easy for the same quality messages.

---

## Step 4: Change the Influence Meter Color

### What you are doing
The influence meter should be blue in Easy mode and purple in Normal mode. This is a small visual touch but it makes the difficulty feel distinct and real.

### Tasks
- [ ] Open `components/InfluenceMeter.jsx`
- [ ] Add a `difficulty` prop to the component
- [ ] Replace the hardcoded color classes with dynamic ones based on difficulty and progress:

**Easy mode colors:**
- 0–33%: `bg-red-500`
- 34–66%: `bg-cyan-500`
- 67–99%: `bg-blue-500`
- 100%: `bg-emerald-400`

**Normal mode colors (unchanged):**
- 0–33%: `bg-red-500`
- 34–66%: `bg-yellow-500`
- 67–99%: `bg-purple-500`
- 100%: `bg-emerald-400`

- [ ] Pass `difficulty` into `InfluenceMeter` from `app/game/page.jsx`

### How you know this step is done
Open the game in Easy mode — the meter is blue as it fills. Open in Normal mode — the meter is purple. Both turn emerald green at 100.

---

## Step 5: Rami's Opening Line

### What you are doing
When the game loads, Rami should greet the player with a first message before they type anything. This removes the awkward "player goes first" cold start. The opening line is slightly warmer in Easy mode and his usual guarded self in Normal mode.

### Tasks
- [ ] Open `app/game/page.jsx`
- [ ] Add a `useEffect` that runs once on mount and sets an initial message from Rami based on difficulty:

```js
useEffect(() => {
  const openingLine = difficulty === "easy"
    ? "You've been standing out here a while. Go ahead — say something."
    : "Next."

  setMessages([{ role: "assistant", content: openingLine }])
}, [])
```

- [ ] This message should appear in the chat window as Rami's first message — styled exactly like his other messages with the amber color and left alignment
- [ ] This opening message should NOT be included in `conversationHistory` sent to the API on the first user message — it's purely cosmetic. The real conversation history starts when the user sends their first message.
  - To handle this: keep a separate `displayMessages` array for what you show in the UI, and keep `conversationHistory` as the array you send to the API. The opening line goes in `displayMessages` only.
  - Alternatively — and simpler — just include it in history as an assistant message. Rami knowing he said "Next." as his first line is fine context for him to have.

### How you know this step is done
Open the game — Rami's opening line appears immediately without the player typing anything. Easy mode shows the warmer line. Normal mode shows "Next." The player can then respond naturally.

---

## Phase 5 Complete ✓

When all 5 steps are done you will have:

| Step | What it adds |
|---|---|
| Landing page cards | Clear mode selection with personality descriptions |
| Difficulty in game page | URL param read and passed to API on every request |
| Scoring multiplier | Easy positive scores are 1.5x more generous |
| Meter color | Blue for Easy, Purple for Normal |
| Opening line | Rami greets the player, removes cold start |

---

## How to Test Both Modes

- [ ] Play Easy mode — try a mediocre message like "I just really want to experience the vibe in there." Confirm the score is noticeably higher than Normal mode for the same message
- [ ] Play Normal mode — confirm nothing about the scoring changed from before this phase
- [ ] Check the meter turns blue in Easy and purple in Normal
- [ ] Confirm Rami's opening line appears immediately in both modes
- [ ] Check the Network tab — every request body includes `difficulty: "easy"` or `difficulty: "normal"`

---

## Antigravity Prompt to Start This Phase

> "I'm building The Doorman Game. Read these files first: @PRD.md @STRUCTURE.md @CURSOR_RULES.md. Phases 1 through 4 are complete. We are now on Phase 5 — adding Easy and Normal difficulty modes. Use ES Modules only. Do not change the Judge prompt or the Pinecone/Hugging Face code. Start with Step 1 — building the difficulty selection cards on the landing page."