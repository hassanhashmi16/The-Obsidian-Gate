# Phase 6 — Personality, Atmosphere & Leaderboard

## Goal
Four features that make the game feel alive, personal, and competitive. By the end of this phase Rami will visibly lose patience over time, the club has an ambient atmosphere, you start with an organic ID check, and winners can compete on a global leaderboard.

## Prerequisites
Phases 1 through 5 must be complete and working. MongoDB Atlas account ready (free tier).

## New Environment Variable
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

## Module System
ES Modules only — `import`/`export` everywhere. No `require()` or `module.exports`.

## Build Order
**Organic ID Check → Mood escalation → Ambient sound → Leaderboard**

---

## Feature 1 — Organic ID Check & Leaderboard Name

### What you are doing
Instead of a separate name entry screen, the game starts immediately in the chat. Rami's opening line simply asks for ID. This thrusts the player directly into the experience. For the global leaderboard, the player will enter their name exclusively on the Win Screen.

### What changes
- Rami's opening line in the chat is changed to ask for ID.
- The Win Overlay is later updated to include a name input field before submitting the score to the leaderboard.

### Step 1.1 — Update Rami's Opening Line

- [ ] Open `app/game/page.jsx`
- [ ] Update the `messages` state initialization. Set the opening line to:
  ```js
  const openingLine = difficulty === "easy"
    ? "ID. And don't waste my time."
    : "ID."
  ```

### Step 1.2 — Name Entry on Win Screen (Prep for Leaderboard)

- [ ] Open `components/WinOverlay.jsx` (we will use this in Feature 4)
- [ ] Note that we will add a `playerName` input field here later so the player can enter their name after winning. 

### How you know Feature 1 is done
When you open the game, it goes straight to the chat and Rami prompts you for your ID. The interaction feels organic.

---

## Feature 2 — Rami's Mood Escalation

### What you are doing
The longer the player struggles, the colder and more impatient Rami becomes. Every 5 messages where the cumulative score hasn't meaningfully improved, his mood escalates to the next level. There are 3 mood levels beyond his default:

| Level | Trigger | Rami's behavior |
|---|---|---|
| 0 (Default) | Game start | Normal Rami |
| 1 (Impatient) | 5 messages, score under 30 | Shorter replies, slightly dismissive |
| 2 (Cold) | 10 messages, score under 50 | Terse, barely engaging |
| 3 (Done) | 15 messages, score under 70 | One word answers, clearly wants you gone |

### What changes
- A `moodLevel` state on the frontend (0–3)
- A `moodLevel` sent with every API request
- A mood instruction injected into Rami's prompt based on the level
- A subtle visual indicator showing Rami's current mood

### Step 2.1 — Track Mood on the Frontend

- [ ] Open `app/game/page.jsx`
- [ ] Add `moodLevel` state (default 0) and `lastScoreCheckpoint` state (default 0)
- [ ] After every API response, run a mood check:
  ```js
  // After setting the new score
  const messagesSoFar = messages.filter(m => m.role === "user").length

  if (messagesSoFar > 0 && messagesSoFar % 5 === 0) {
    const scoreGain = newCumulativeScore - lastScoreCheckpoint
    if (scoreGain < 15) {
      // Player hasn't made enough progress — escalate mood
      setMoodLevel(prev => Math.min(prev + 1, 3))
    }
    setLastScoreCheckpoint(newCumulativeScore)
  }
  ```
- [ ] Include `moodLevel` in the fetch body with every request

### Step 2.2 — Inject Mood into the Doorman Prompt

- [ ] Open `lib/groq.js`
- [ ] Add mood instructions as constants:
  ```js
  const MOOD_INSTRUCTIONS = {
    0: "", // Default — no extra instruction
    1: "You are growing impatient. Your replies are getting shorter. You check your watch occasionally.",
    2: "You are cold and disengaged. You give minimal responses. You're barely looking at them.",
    3: "You are done. You give one or two word answers at most. You have mentally moved on from this person.",
  }
  ```
- [ ] Update `callDoorman` to accept `moodLevel` as a parameter
- [ ] Inject the mood instruction as an additional system message when `moodLevel > 0`:
  ```js
  if (moodLevel > 0) {
    messages.push({
      role: "system",
      content: MOOD_INSTRUCTIONS[moodLevel]
    })
  }
  ```
- [ ] Update `app/api/chat/route.js` to read `moodLevel` from the request body and pass it to `callDoorman`

### Step 2.3 — Visual Mood Indicator

- [ ] In the game page header where Rami's name is displayed, add a subtle mood indicator next to it
- [ ] It should be a small colored dot or status text that changes based on mood:
  - Level 0: Nothing shown (or a subtle green dot)
  - Level 1: Amber dot — *"Impatient"*
  - Level 2: Orange dot — *"Cold"*
  - Level 3: Red dot — *"Done with you"*
- [ ] Keep it subtle — small text, muted colors. It should feel like reading Rami's body language, not a game HUD

### How you know Feature 2 is done
Play the game and deliberately send weak messages. After 5 messages with little progress, Rami's replies get noticeably shorter and colder. The mood indicator updates. After 15 weak messages he's basically giving you nothing.

---

## Feature 3 — Ambient Sound Design

### What you are doing
Adding subtle background audio that plays while the game is active. A low volume ambient track creates atmosphere without being distracting. The player can mute it. It fades in when the game starts and fades out on win/lose.

### What to use
For this game, you want the sound of **standing outside a club**.
Search freesound.org for: "muffled club bass", "distant nightclub", or "outside club".
Look for a loop that has a low, thumping bass (like music playing behind heavily insulated doors) and occasional distant street sounds or muted chatter. It should feel mysterious, not like an active dance floor. Place it in your `public/` folder as `public/sounds/ambient.mp3`.

### Step 3.1 — Add the Audio File

- [ ] Find a subtle ambient nightclub/lounge track (Creative Commons license)
- [ ] Download it as MP3
- [ ] Place it at `public/sounds/ambient.mp3`

### Step 3.2 — Build the Audio Controller

- [ ] Open `app/game/page.jsx`
- [ ] Add a `isMuted` state variable (default `false`)
- [ ] Add a `useRef` for the audio element:
  ```js
  const audioRef = useRef(null)
  ```
- [ ] Add a `useEffect` to start playing when the component mounts (since game starts immediately now):
  ```js
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15  // Very subtle
      audioRef.current.play().catch(() => {})  // Catch autoplay block
    }
  }, [])
  ```
- [ ] Add the audio element to the JSX (hidden):
  ```jsx
  <audio ref={audioRef} src="/sounds/ambient.mp3" loop />
  ```
- [ ] When `isMuted` changes, update the audio volume:
  ```js
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.15
    }
  }, [isMuted])
  ```
- [ ] On win or lose, fade out by setting volume to 0

### Step 3.3 — Mute Button

- [ ] Add a small mute/unmute toggle button in the game header
- [ ] Use a simple speaker icon — you can use a unicode emoji (🔊 / 🔇) or an SVG icon
- [ ] Clicking it toggles `isMuted`
- [ ] Style it subtly — small, in the corner, not distracting

### Important notes
- Browser autoplay policies block audio that starts without user interaction. If playing strictly on mount doesn't work until the first click/keypress, we will attach it to the first layout interaction. The `.catch(() => {})` handles the strict autoplay block.
- Keep volume at 0.15 maximum — the game is about reading text, not listening to music
- Test on mobile — iOS is strict about autoplay

### How you know Feature 3 is done
Start a game, interact with the screen, and hear subtle ambient sound playing in the background. The mute button toggles it on and off. Sound fades on win/lose.

---

## Feature 4 — Global Leaderboard (MongoDB Atlas)

### What you are doing
When a player wins, they enter their name on the Win overlay. Their name, message count, difficulty, and score get saved to MongoDB. A leaderboard page at `/leaderboard` shows the top 20 fastest wins globally — ranked by fewest messages to win.

### New packages needed
```
npm install mongoose
```

### New environment variable
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

### Step 4.1 — MongoDB Atlas Setup

- [ ] Go to mongodb.com/atlas and create a free account
- [ ] Create a free M0 cluster
- [ ] Create a database named `doorman-game`
- [ ] Create a collection named `scores`
- [ ] Get your connection string — it looks like: `mongodb+srv://username:password@cluster.mongodb.net/doorman-game`
- [ ] Add it to `.env.local` as `MONGODB_URI`
- [ ] In Atlas, go to Network Access and add `0.0.0.0/0` to allow connections from anywhere (required for Vercel deployment)

### Step 4.2 — Mongoose Connection Helper

- [ ] Create `lib/mongodb.js`:
  ```js
  import mongoose from "mongoose"

  const MONGODB_URI = process.env.MONGODB_URI

  let cached = global.mongoose || { conn: null, promise: null }
  global.mongoose = cached

  export async function connectDB() {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI).then(m => m)
    }

    cached.conn = await cached.promise
    return cached.conn
  }
  ```

### Step 4.3 — Score Model

- [ ] Create `lib/models/Score.js`:
  ```js
  import mongoose from "mongoose"

  const ScoreSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    messageCount: { type: Number, required: true },
    finalScore: { type: Number, required: true },
    difficulty: { type: String, enum: ["easy", "normal"], required: true },
    createdAt: { type: Date, default: Date.now },
  })

  export default mongoose.models.Score || mongoose.model("Score", ScoreSchema)
  ```

### Step 4.4 — Save Score API Route

- [ ] Create `app/api/scores/route.js`:
  ```js
  import { connectDB } from "@/lib/mongodb.js"
  import Score from "@/lib/models/Score.js"

  // POST — save a new score
  export async function POST(request) {
    try {
      await connectDB()
      const body = await request.json()
      const { playerName, messageCount, finalScore, difficulty } = body

      const score = await Score.create({
        playerName,
        messageCount,
        finalScore,
        difficulty,
      })

      return Response.json({ success: true, score })
    } catch (error) {
      console.error("Save score error:", error)
      return Response.json({ error: "Failed to save score" }, { status: 500 })
    }
  }

  // GET — fetch top 20 scores ranked by fewest messages
  export async function GET() {
    try {
      await connectDB()

      const scores = await Score.find()
        .sort({ messageCount: 1, finalScore: -1 })
        .limit(20)
        .lean()

      return Response.json({ scores })
    } catch (error) {
      console.error("Fetch scores error:", error)
      return Response.json({ error: "Failed to fetch scores" }, { status: 500 })
    }
  }
  ```

### Step 4.5 — Save Score on Win

- [ ] Open `components/WinOverlay.jsx`
- [ ] Add a `playerName` state and text input to the UI
- [ ] Add a `Submit to Leaderboard` button
- [ ] When clicked, fetch `/api/scores`:
  ```js
  fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerName, // from state
      messageCount,
      finalScore,
      difficulty,
    }),
  }).catch(err => console.error("Score save failed:", err))
  ```

### Step 4.6 — Leaderboard Page

- [ ] Create `app/leaderboard/page.jsx`
- [ ] Fetch scores from `/api/scores` on load
- [ ] Display a ranked table showing:
  - Rank (#1, #2, #3...)
  - Player name
  - Messages to win
  - Difficulty (Easy / Normal badge)
  - Date
- [ ] Top 3 entries get special styling — gold, silver, bronze colors
- [ ] Add a **"Play Now"** button linking back to `/`
- [ ] Add a link to the leaderboard from the landing page and the win screen

### How you know Feature 4 is done
Win a game. Enter your name and save to leaderboard. Go to `/leaderboard`. Your entry appears ranked by message count. Play again with a different name — a new entry appears. The top 3 are highlighted.

---

## Phase 6 Complete ✓

| Feature | Complexity | Impact |
|---|---|---|
| Organic ID Check | Low | High — immediate immersion |
| Mood escalation | Medium | High — adds real tension |
| Ambient sound | Low | Medium — atmosphere |
| Leaderboard | High | High — makes game competitive and shareable |

---

## Build Order Reminder
**Organic ID Check → Mood escalation → Ambient sound → Leaderboard**

Do not start the leaderboard until the first three features are working. The leaderboard is the most complex and should be built on a stable foundation.

---

## Antigravity Prompt to Start This Phase

> "I'm building The Doorman Game. Read these files first: @PRD.md @STRUCTURE.md @AGENT_RULES.md. Phases 1 through 5 are complete. We are now on Phase 6. Use ES Modules only. Do not touch the Judge prompt, Pinecone, or Hugging Face code. Start with Feature 1, Step 1.1 — the organic ID check."