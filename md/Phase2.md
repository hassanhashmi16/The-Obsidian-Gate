# Phase 2 — UI Polish

## Goal
By the end of this phase the game should look and feel like a real product. Dark Dubai nightclub aesthetic, animated influence meter, smooth interactions, a proper landing page, and a satisfying win screen. The logic does not change at all in this phase — you are only making it look and feel good.

## Prerequisites
Phase 1 must be fully working before you start this. The game logic, scoring, and win condition should all be tested and reliable.

## Order of Steps
**Global Styles → Landing Page → Chat Layout → Message Bubbles → Influence Meter → Score Delta Flash → Typing Indicator → Win Screen**

---

## Step 1: Global Styles and Theme

### What you are doing
Setting up the base visual theme for the entire app before touching any individual component. Dark backgrounds, neon accents, and the right font give you the Dubai nightclub vibe from the start.

### Tasks
- [ ] Open `app/globals.css` and set the base background to near-black:
```css
body {
  background-color: #09090b; /* zinc-950 */
  color: #fafafa;
}
```
- [ ] Open `app/layout.jsx` and set the page title to "Club Obsidian — The Doorman Game"
- [ ] Pick a Google Font that feels upscale and moody — **Cormorant Garamond** or **Playfair Display** for headings, and a clean sans-serif like **Inter** for chat text. Import them in `layout.jsx`.
- [ ] Confirm the whole app now has a dark background when you run it

### Color Palette to Use Everywhere
| Purpose | Tailwind Class |
|---|---|
| Page background | `bg-zinc-950` |
| Card / panel background | `bg-zinc-900` |
| Borders | `border-zinc-800` |
| Neon purple accent | `text-purple-400` / `border-purple-500` |
| Rami's messages | `text-amber-300` |
| User messages | `text-zinc-100` |
| Muted text | `text-zinc-500` |
| Win / success color | `text-emerald-400` |

### How you know this step is done
The app has a dark background and the font feels right. No more default white Next.js background.

---

## Step 2: Landing Page

### What you are doing
Building the `/` page that greets the user before they start the game. It should immediately communicate the mood and the premise.

### Tasks
- [ ] Open `app/page.jsx` and replace the placeholder content with a proper landing page
- [ ] The page should have:
  - A full-screen dark background with a subtle background image or gradient (dark purple/black)
  - A heading like **"Club Obsidian"** in the display font
  - A subheading like **"There is one door. One man. Can you get past him?"**
  - A short one-line description of the game
  - A single CTA button: **"Step Up to the Door"** that links to `/game`
  - Optionally: a faint neon glow effect on the heading using Tailwind's `drop-shadow`
- [ ] The button should feel premium — dark background, purple border, subtle hover effect

### Example structure (unstyled — let Antigravity style it):
```jsx
export default function LandingPage() {
  return (
    <main>
      <h1>Club Obsidian</h1>
      <p>There is one door. One man. Can you get past him?</p>
      <p>Use your words. No bribes. No shortcuts.</p>
      <a href="/game">Step Up to the Door</a>
    </main>
  )
}
```

### Prompt for Antigravity:
> "Style this landing page using Tailwind CSS. Full screen dark background (zinc-950). Centered content. Heading in a large display font with a subtle purple glow. Subheading in zinc-400. A premium-looking CTA button with a purple border and hover effect. Dubai nightclub vibe — dark, sleek, glamorous."

### How you know this step is done
The landing page looks like it belongs to an exclusive nightclub. The CTA button leads to `/game`.

---

## Step 3: Game Page Layout

### What you are doing
Restructuring the game page layout before building the individual components. Getting the layout right first makes everything else easier.

### Layout Structure:
```
┌─────────────────────────────┐
│         HEADER              │  ← Club name + Rami's name/status
├─────────────────────────────┤
│                             │
│       CHAT WINDOW           │  ← Scrollable, takes up most of screen
│                             │
├─────────────────────────────┤
│      INFLUENCE METER        │  ← Progress bar with score
├─────────────────────────────┤
│       INPUT BAR             │  ← Text input + send button
└─────────────────────────────┘
```

### Tasks
- [ ] Create `components/` folder in the project root
- [ ] Restructure `app/game/page.jsx` to use this layout — just empty divs with the right Tailwind classes for now, you will fill them with components in the next steps
- [ ] The page should be full height (`h-screen`) with no scrolling on the outer container — only the chat window scrolls internally
- [ ] Add a simple header bar with "Club Obsidian" on the left and "Rami Khalil — Head Doorman" on the right

### How you know this step is done
The layout structure is correct and visible. You can see the four sections even if they are mostly empty.

---

## Step 4: Message Bubbles

### What you are doing
Creating the component that renders individual chat messages. User messages and Rami's messages should look visually distinct.

### Tasks
- [ ] Create `components/MessageBubble.jsx`
- [ ] User messages should:
  - Align to the **right**
  - Have a dark purple/zinc background
  - White text
  - Rounded corners, slightly less rounded on the bottom right
- [ ] Rami's messages should:
  - Align to the **left**
  - Have a slightly lighter zinc background
  - Amber/gold text for Rami's name label
  - White text for the message content
  - Optional: a small doorman icon or initial avatar on the left
- [ ] Create `components/ChatWindow.jsx`
  - Renders a list of `MessageBubble` components
  - Has a fixed height and scrolls internally (`overflow-y-auto`)
  - **Auto-scrolls to the bottom** whenever a new message is added — this is important, use a `useRef` and `scrollIntoView`

### How you know this step is done
Messages display cleanly with the right alignment and colors. New messages cause the window to scroll down automatically.

---

## Step 5: Influence Meter

### What you are doing
Building the animated progress bar that shows the user how close they are to getting in.

### Tasks
- [ ] Create `components/InfluenceMeter.jsx`
- [ ] It receives `currentScore` as a prop (0 to 100+)
- [ ] Display a progress bar that fills from left to right
- [ ] The fill percentage is `Math.min(currentScore, 100)` — cap it visually at 100 even if the score goes over
- [ ] If the score is negative, the bar should show empty (0%) — never show a negative bar
- [ ] Add a smooth CSS transition so the bar animates when the score changes:
  ```jsx
  <div style={{ width: `${percentage}%`, transition: "width 0.6s ease" }} />
  ```
- [ ] Color the bar based on progress:
  - 0–33: `bg-red-500`
  - 34–66: `bg-yellow-500`
  - 67–99: `bg-purple-500`
  - 100: `bg-emerald-400`
- [ ] Show the score as text: **"Influence: 45 / 100"**
- [ ] Show a label underneath like **"Keep talking..."** or **"He's warming up..."** or **"Almost there..."** based on the score range

### How you know this step is done
The bar animates smoothly when the score changes. The color shifts as the score increases. It never goes below 0 visually.

---

## Step 6: Score Delta Flash

### What you are doing
After each message, briefly show the user how many points they just gained or lost — a "+12" or "-8" that appears and fades out. This is great game feel feedback.

### Tasks
- [ ] Create `components/ScoreDelta.jsx`
- [ ] It receives `delta` (a number) and `show` (a boolean) as props
- [ ] When `show` is true it appears, then automatically fades out after 2 seconds
- [ ] Positive deltas show in green (`text-emerald-400`) with a `+` prefix: **+12**
- [ ] Negative deltas show in red (`text-red-400`): **-8**
- [ ] Use a CSS fade-out animation — Tailwind's `animate-ping` or a custom opacity transition works well
- [ ] Position it near the Influence Meter so the user connects the flash with the score change

### How you know this step is done
After every message a number briefly appears showing the score change then disappears cleanly.

---

## Step 7: Typing Indicator

### What you are doing
While Rami is "thinking" (waiting for the Groq API to respond), show a subtle typing indicator so the user knows something is happening and the app hasn't frozen.

### Tasks
- [ ] Create `components/TypingIndicator.jsx`
- [ ] Show three animated dots that pulse — the classic chat typing indicator
- [ ] Only render it when `isLoading` is true in the game state
- [ ] It should appear in the chat window where Rami's next message will appear, aligned to the left like his messages
- [ ] Style it with amber color to match Rami's message style

### Tailwind animated dots example:
```jsx
<div className="flex gap-1">
  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
</div>
```

### How you know this step is done
While waiting for Rami's response the three dots animate in the chat. They disappear the moment his reply arrives.

---

## Step 8: Input Bar

### What you are doing
Making the text input and send button look polished and feel good to use.

### Tasks
- [ ] Create `components/InputBar.jsx`
- [ ] It should take `value`, `onChange`, `onSend`, and `disabled` as props
- [ ] Style it as a dark input with a subtle border that glows purple on focus
- [ ] The Send button should be on the right, styled with a purple accent
- [ ] When `disabled` is true (loading or won) both the input and button should look visually inactive
- [ ] Pressing Enter should also trigger `onSend` — handle `onKeyDown`
- [ ] Add a character count or placeholder text like **"Say something to Rami..."**

### How you know this step is done
The input bar looks polished. Focus state shows a subtle glow. Enter key works. Disabled state is visually clear.

---

## Step 9: Win Screen

### What you are doing
Building the overlay that appears when the user wins. This is the payoff moment — it should feel satisfying.

### Tasks
- [ ] Create `components/WinOverlay.jsx`
- [ ] It renders as a full-screen overlay on top of the game when `won` is true
- [ ] Content to include:
  - A large heading: **"You're In."**
  - A subheading: **"Club Obsidian welcomes you."**
  - Rami's final message displayed here (the last message from the chat)
  - A subtle animated background — a slow pulsing glow or shimmer effect
  - A **"Play Again"** button that resets the game state
- [ ] The overlay should fade in smoothly — use Tailwind's `animate-fade-in` or a CSS opacity transition
- [ ] Colors: deep black background, emerald green heading, gold/amber accents

### Play Again logic (in `app/game/page.jsx`):
```js
function handlePlayAgain() {
  setMessages([])
  setCurrentScore(0)
  setWon(false)
  setInputValue("")
}
```

### How you know this step is done
Winning the game triggers a beautiful overlay that fades in. The Play Again button resets everything cleanly.

---

## Phase 2 Complete ✓

When all 9 steps are done you should have:
- A moody, dark landing page that sets the tone
- A polished chat interface with distinct message bubbles for user and Rami
- An animated influence meter that shifts color as progress increases
- A score delta flash after every message
- A typing indicator while waiting for Rami
- A satisfying win screen with a play again option

The game should now feel like something you would actually want to show someone.

---

## General Styling Prompt for Antigravity

Use this when asking Antigravity to style any component:

> "Style this component using Tailwind CSS only. Follow this color palette: page background is zinc-950, panels are zinc-900, borders are zinc-800, accent color is purple-500, Rami's text is amber-300, user text is zinc-100, success color is emerald-400. The overall vibe is a dark moody Dubai nightclub — sleek, minimal, slightly glamorous. Mobile-first."