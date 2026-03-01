# Phase 4 — Stretch Goals

## Goal
Three features that take the game from functional to polished and shareable. None of these are required for the game to work — they are pure enhancements. Build them in order since the lose condition touches the backend, the debug panel is frontend only, and the share screen is the finishing touch.

## Prerequisites
Phases 1, 2, and 3 must all be complete and working before starting this.

## Module System
ES Modules only — `import`/`export` everywhere. No `require()` or `module.exports`.

## Order of Steps
**Lose condition → Debug panel → Share screen**

---

## Feature 1 — Lose Condition

### What you are doing
Right now the game only ends when the user wins. This feature adds a lose condition: if the cumulative score drops below -50, Rami calls security and the conversation ends with a lose screen. This makes the game more tense and gives negative scoring real consequences.

### What needs to change
Three places need updating: the API route (detect the lose condition), the Doorman prompt (tell Rami how to react when security is called), and the frontend (show a lose screen).

---

### Step 1.1 — Add the Lose Threshold to the API Route

- [ ] Open `app/api/chat/route.js`
- [ ] Add a `LOSE_THRESHOLD` constant at the top alongside `WIN_THRESHOLD`:
  ```
  const LOSE_THRESHOLD = -50
  ```
- [ ] After calculating `newCumulativeScore`, add a lose check alongside the win check:
  ```
  const won = newCumulativeScore >= WIN_THRESHOLD
  const lost = newCumulativeScore <= LOSE_THRESHOLD
  ```
- [ ] Pass `lost` into `callDoorman` alongside `won` so Rami knows to call security
- [ ] Add `lost` to the response payload returned to the client

### Step 1.2 — Update the Doorman Prompt

- [ ] Open `lib/doorman-prompt.js`
- [ ] Add this rule to Rami's prompt at the bottom of his rules section:
  ```
  - If a system message tells you the user has pushed you too far, call security. 
    Say something like "I've heard enough. *signals to security*" and end the 
    conversation firmly but without raising your voice. Stay in character.
  ```
- [ ] Open `lib/groq.js`
- [ ] Add a `LOSE_INSTRUCTION` constant similar to `WIN_INSTRUCTION`:
  ```
  The user has been too rude, aggressive, or persistent in the wrong ways. 
  You are done with this conversation. Call security now. Stay calm but firm. 
  Make it feel final.
  ```
- [ ] In `callDoorman`, inject this instruction when `lost` is true — same pattern as the win instruction

### Step 1.3 — Add Lose Screen to the Frontend

- [ ] Open `app/game/page.jsx`
- [ ] Add a `lost` state variable alongside `won`
- [ ] When the API response includes `lost: true`, set `lost` to true and disable the input
- [ ] Create `components/LoseOverlay.jsx` — same structure as `WinOverlay.jsx` but with different content:
  - Heading: **"You're Not Getting In."**
  - Subheading: **"Rami called security."**
  - Dark red color scheme instead of emerald green
  - A **"Try Again"** button that resets the game state
- [ ] Render `LoseOverlay` in the game page when `lost` is true

### How you know Feature 1 is done
Play the game and intentionally be rude, offer bribes, and insult Rami repeatedly. After enough negative messages the score should drop below -50, Rami should call security in character, and the lose screen should appear. The input should be disabled.

---

## Feature 2 — Judge Reasoning Debug Panel

### What you are doing
The Judge already returns a `judgeReasoning` string with every response — you've been receiving it from the API since Phase 1 but never displaying it. This feature adds a collapsible panel that shows the user what the Judge thought of their last message. It's great for learning how to win and adds a fun meta layer to the game.

### What needs to change
Frontend only — the data is already coming from the API. You just need to display it.

---

### Step 2.1 — Store the Judge Reasoning in State

- [ ] Open `app/game/page.jsx`
- [ ] Add a `lastReasoning` state variable and a `lastDelta` state variable
- [ ] After each API response, update both:
  - `lastReasoning` = `data.judgeReasoning`
  - `lastDelta` = `data.scoreDelta`

### Step 2.2 — Build the Debug Panel Component

- [ ] Create `components/DebugPanel.jsx`
- [ ] It receives `reasoning`, `delta`, and `isOpen`/`onToggle` as props
- [ ] The panel has a toggle button at the top — something subtle like **"🔍 Judge's Verdict"** or **"Why did my score change?"**
- [ ] When open it shows:
  - The score delta in large text: **+12** or **-8** in the appropriate color
  - The reasoning text below it in a smaller muted style
  - Example: *"The user showed genuine humility and referenced authentic personal experience, which aligns strongly with Rami's values."*
- [ ] The panel should be collapsible — clicking the toggle hides/shows it
- [ ] Position it between the influence meter and the input bar
- [ ] Style it subtly — it should feel like a hidden game mechanic being revealed, not a loud UI element. Use `bg-zinc-900`, `border-zinc-700`, small text.

### Step 2.3 — Wire it into the Game Page

- [ ] Add a `debugOpen` state variable (default `false`)
- [ ] Render `DebugPanel` in `app/game/page.jsx` passing the relevant state
- [ ] Only show the panel after the first message has been sent — don't show an empty panel on game start

### How you know Feature 2 is done
After each message a subtle toggle appears. Clicking it reveals what the Judge thought and why the score changed. It collapses when clicked again.

---

## Feature 3 — Share Result Screen

### What you are doing
When the user wins or loses, show them a shareable result card that tells them how they did. This gives the game a social hook and a satisfying sense of completion.

### What needs to change
Frontend only. You need to track the number of messages sent and then display a result card on the win/lose screen with a share button.

---

### Step 3.1 — Track Message Count

- [ ] Open `app/game/page.jsx`
- [ ] Add a `messageCount` state variable starting at 0
- [ ] Increment it by 1 every time the user sends a message
- [ ] Pass `messageCount` into both `WinOverlay` and `LoseOverlay` as a prop

### Step 3.2 — Update WinOverlay with Result Card

- [ ] Open `components/WinOverlay.jsx`
- [ ] Add a result card section that shows:
  - **"You got in after [X] messages"**
  - A rating based on message count:
    - 1–7 messages: **"Masterful. Rami was genuinely impressed."**
    - 8–12 messages: **"Smooth. You knew what you were doing."**
    - 13–18 messages: **"Persistent. But you got there."**
    - 19+ messages: **"Eventually. Rami almost called security."**
- [ ] Add a **"Share"** button below the result card

### Step 3.3 — Update LoseOverlay with Result Card

- [ ] Open `components/LoseOverlay.jsx`
- [ ] Add a result card that shows:
  - **"You lasted [X] messages before security arrived"**
  - A rating based on message count:
    - 1–3 messages: **"Catastrophic. What were you thinking?"**
    - 4–8 messages: **"Bold strategy. It did not pay off."**
    - 9+ messages: **"You tried. Rami just wasn't feeling it."**
- [ ] Add a **"Share"** button

### Step 3.4 — Build the Share Functionality

- [ ] The share button should use the browser's native Web Share API if available, with a fallback to copying to clipboard
- [ ] The share text for a win should be something like:
  ```
  I got past Rami and into Club Obsidian in just [X] messages. 
  Can you do better? 🚪✨ [your app URL]
  ```
- [ ] The share text for a lose should be:
  ```
  Rami called security on me after [X] messages. 
  Think you can get in? 🚫 [your app URL]
  ```
- [ ] The Web Share API code pattern looks like this (ask Antigravity to implement it):
  - Check if `navigator.share` exists
  - If yes, call `navigator.share({ title, text, url })`
  - If no, fall back to `navigator.clipboard.writeText(shareText)` and show a "Copied!" confirmation

### How you know Feature 3 is done
Win or lose the game and see the result card with your message count and rating. Clicking Share either opens the native share sheet on mobile or copies the text to clipboard on desktop.

---

## Phase 4 Complete ✓

When all three features are done you will have:

| Feature | What it adds |
|---|---|
| Lose condition | Real stakes — bad behavior ends the game |
| Debug panel | Transparency — players understand why scores change |
| Share screen | Replayability — players want to beat their score and share it |

---

## Antigravity Prompt to Start This Phase

> "I'm building The Doorman Game. Read these files first: @PRD.md @STRUCTURE.md @CURSOR_RULES.md. Phases 1, 2, and 3 are all complete. We are now on Phase 4 — stretch goals. Use ES Modules only. Do not touch the Pinecone or Hugging Face code. Start with Feature 1, Step 1.1 — adding the lose condition to the API route."