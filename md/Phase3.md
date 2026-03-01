# Phase 3 — Vector Database (Pinecone + Hugging Face)

## Goal
By the end of this phase, Rami will have semantic memory. Instead of just passing the last N messages, the app will find the most *relevant* past messages from the entire conversation and inject them as extra context before each LLM call. This makes Rami feel like he actually remembers things you said earlier — even things said 20 messages ago.

## Prerequisites
- Phase 1 and Phase 2 must be fully working before starting this
- You must have your `.env.local` already containing:
  ```
  GROQ_API_KEY=
  HUGGINGFACE_API_KEY=
  PINECONE_API_KEY=
  PINECONE_INDEX_NAME=doorman-game
  ```

## Important: How This Works (Read Before Coding)

Here is the full picture of what Phase 3 adds, so nothing confuses you:

**Every time the user sends a message:**
1. The message gets converted to a vector (384 numbers) by calling Hugging Face
2. That vector gets stored in Pinecone, tagged with a `sessionId` and the original message text
3. Before calling Groq, the app queries Pinecone with the latest message to find the 5 most semantically similar past messages
4. Those 5 retrieved messages get injected into the prompt as extra context alongside the recent history

**The simple array from Phase 1 stays.** You do not remove it. It handles recent messages. Pinecone handles relevant older messages. They work together.

**If Hugging Face or Pinecone fails**, the app falls back to the simple array silently. The game keeps working. This is intentional.

## Module System
ES Modules only — `import`/`export` everywhere. No `require()` or `module.exports`.

## Order of Steps
**Install packages → Embeddings helper → Pinecone client → Embed API route → Recall API route → Update chat route → Add sessionId to frontend → Test**

---

## Step 1: Install Packages

### Tasks
- [ ] Run this in your project root:
  ```
  npm install @pinecone-database/pinecone @huggingface/inference
  ```
- [ ] Confirm both installed without errors in the terminal

### How you know this step is done
Both packages appear in your `package.json` under dependencies.

---

## Step 2: Hugging Face Embeddings Helper

### What you are doing
Writing a single function that takes a piece of text and returns a vector (array of 384 numbers). Every other part of Phase 3 depends on this function.

### What is actually happening
You call the Hugging Face free Inference API with your text. They run it through `sentence-transformers/all-MiniLM-L6-v2` and return 384 numbers that represent the *meaning* of your text. Two messages with similar meaning will produce similar numbers — that's what makes the search work.

### Tasks
- [ ] Create `lib/embeddings.js`:

```js
import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function embedText(text) {
  try {
    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    })

    // Result can be nested (array of arrays) or flat (array of numbers)
    // We always want a flat array of 384 numbers
    if (Array.isArray(result[0])) {
      return result[0]
    }
    return result
  } catch (error) {
    console.error("Hugging Face embedding failed:", error)
    return null
  }
}
```

- [ ] Test it manually — write a quick test at the bottom of the file temporarily, call `embedText("hello world")` and `console.log` the result. You should see an array of 384 numbers. Remove the test after confirming.

### If Hugging Face returns an error
The free inference API can occasionally go down or be slow. If you get a 503 or timeout, wait a few minutes and try again. The function returns `null` on failure which the rest of the code handles gracefully.

### How you know this step is done
`embedText("hello world")` returns an array of exactly 384 numbers with no crash.

---

## Step 3: Pinecone Client

### What you are doing
Setting up the Pinecone connection and writing two functions — one to store a vector, one to search for similar vectors.

### Key concepts before writing this
- **Upsert** = storing a vector. You give Pinecone an `id`, the vector values, and metadata (the original text, role, sessionId so you can read it back later).
- **Query** = searching. You give Pinecone a vector and it returns the top K most similar stored vectors and their metadata.
- **Namespace** = a partition inside your index. We use the `sessionId` as the namespace so each game session is completely isolated from others.

### Tasks
- [ ] Create `lib/pinecone.js`:

```js
import { Pinecone } from "@pinecone-database/pinecone"

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

const index = pc.index(process.env.PINECONE_INDEX_NAME)

export async function storeVector(sessionId, messageId, vector, role, content) {
  try {
    await index.namespace(sessionId).upsert([
      {
        id: messageId,
        values: vector,
        metadata: {
          role,
          content,
          sessionId,
        },
      },
    ])
  } catch (error) {
    console.error("Pinecone upsert failed:", error)
  }
}

export async function findSimilarMessages(sessionId, queryVector, topK = 5) {
  try {
    const result = await index.namespace(sessionId).query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    })

    // Return just role and content from each match
    return result.matches.map((match) => ({
      role: match.metadata.role,
      content: match.metadata.content,
    }))
  } catch (error) {
    console.error("Pinecone query failed:", error)
    return []
  }
}
```

### How you know this step is done
The file exists and imports without errors. You will test it fully in Step 8.

---

## Step 4: Embed API Route

### What you are doing
Building the `/api/embed` route. It receives a message, converts it to a vector via Hugging Face, and stores it in Pinecone.

### Tasks
- [ ] Create folder `app/api/embed/`
- [ ] Create `app/api/embed/route.js`:

```js
import { embedText } from "@/lib/embeddings.js"
import { storeVector } from "@/lib/pinecone.js"

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionId, messageId, role, content } = body

    const vector = await embedText(content)

    if (!vector) {
      return Response.json({ error: "Embedding failed" }, { status: 500 })
    }

    await storeVector(sessionId, messageId, vector, role, content)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Embed route error:", error)
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}
```

### How you know this step is done
You can POST to `/api/embed` in Thunder Client with a test body and see a `{ success: true }` response. Check your Pinecone dashboard — a vector should appear in your index.

---

## Step 5: Recall API Route

### What you are doing
Building the `/api/recall` route. It receives a query string, converts it to a vector, and asks Pinecone for the most semantically similar stored messages.

### Tasks
- [ ] Create folder `app/api/recall/`
- [ ] Create `app/api/recall/route.js`:

```js
import { embedText } from "@/lib/embeddings.js"
import { findSimilarMessages } from "@/lib/pinecone.js"

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionId, query, topK = 5 } = body

    const queryVector = await embedText(query)

    if (!queryVector) {
      // Fallback — return empty, chat route will use simple history instead
      return Response.json({ messages: [] })
    }

    const similarMessages = await findSimilarMessages(sessionId, queryVector, topK)

    return Response.json({ messages: similarMessages })
  } catch (error) {
    console.error("Recall route error:", error)
    return Response.json({ messages: [] })
  }
}
```

### How you know this step is done
You can POST to `/api/recall` with a sessionId and a query string and get back an array of message objects.

---

## Step 6: Update the Chat Route

### What you are doing
This is the core integration step. You update `app/api/chat/route.js` to:
1. Recall relevant past messages before calling Groq
2. Inject those recalled messages as a system context message
3. Store each new message in Pinecone after responding — non-blocking, never delays Rami's reply

### Critical rule
The embed (store) calls must NEVER block the response. You fire them and forget — never `await` them in the critical path.

### Tasks
- [ ] Replace the contents of `app/api/chat/route.js` with this:

```js
import { callDoorman, callJudge } from "@/lib/groq.js"
import { embedText } from "@/lib/embeddings.js"
import { storeVector, findSimilarMessages } from "@/lib/pinecone.js"

const WIN_THRESHOLD = 100

export async function POST(request) {
  try {
    const body = await request.json()
    const { userMessage, conversationHistory, currentScore, sessionId } = body

    // Step 1: Recall semantically relevant past messages from Pinecone
    let retrievedContext = []
    if (sessionId) {
      try {
        const queryVector = await embedText(userMessage)
        if (queryVector) {
          retrievedContext = await findSimilarMessages(sessionId, queryVector, 5)
        }
      } catch (err) {
        // Silently fall back to simple history if recall fails
        console.error("Recall failed, continuing without semantic memory:", err)
      }
    }

    // Step 2: Judge scores the user's message
    const judgeResult = await callJudge(conversationHistory, userMessage)
    const scoreDelta = judgeResult.score
    const judgeReasoning = judgeResult.reasoning

    // Step 3: Calculate new score and check win condition
    const newCumulativeScore = currentScore + scoreDelta
    const won = newCumulativeScore >= WIN_THRESHOLD

    // Step 4: Build the history to send to the Doorman
    // Inject recalled context as a system message at the start
    const updatedHistory = []

    if (retrievedContext.length > 0) {
      const contextText = retrievedContext
        .map((m) => `${m.role === "user" ? "User" : "Rami"}: ${m.content}`)
        .join("\n")

      updatedHistory.push({
        role: "system",
        content: `Relevant earlier context from this conversation:\n${contextText}`,
      })
    }

    // Add the recent message history and the new user message
    updatedHistory.push(...conversationHistory)
    updatedHistory.push({ role: "user", content: userMessage })

    // Step 5: Call the Doorman
    const doormanReply = await callDoorman(updatedHistory, won)

    // Step 6: Send the response back to the client immediately
    const responsePayload = Response.json({
      doormanReply,
      scoreDelta,
      newCumulativeScore,
      won,
      judgeReasoning,
    })

    // Step 7: Store both messages in Pinecone — fire and forget, never awaited
    if (sessionId) {
      const timestamp = Date.now()

      embedText(userMessage).then((vector) => {
        if (vector) {
          storeVector(
            sessionId,
            `${sessionId}-${timestamp}-user`,
            vector,
            "user",
            userMessage
          )
        }
      }).catch(() => {})

      embedText(doormanReply).then((vector) => {
        if (vector) {
          storeVector(
            sessionId,
            `${sessionId}-${timestamp}-rami`,
            vector,
            "assistant",
            doormanReply
          )
        }
      }).catch(() => {})
    }

    return responsePayload
  } catch (error) {
    console.error("Chat route error:", error)
    return Response.json({ error: "Something went wrong." }, { status: 500 })
  }
}
```

### How you know this step is done
The game still works exactly as before. No errors in the terminal. Vectors start appearing in your Pinecone dashboard as you chat.

---

## Step 7: Add sessionId to the Frontend

### What you are doing
The chat route now expects a `sessionId`. You generate it once per game session in the frontend and send it with every request.

### Tasks
- [ ] Open `app/game/page.jsx`
- [ ] Add `sessionId` to your state — generate it once when the component first mounts:

```jsx
// Add this with your other useState declarations
const [sessionId] = useState(
  () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
)
```

- [ ] Add `sessionId` to your fetch body:

```js
body: JSON.stringify({
  userMessage,
  conversationHistory: messages,
  currentScore,
  sessionId,      // add this
})
```

- [ ] Also reset the sessionId when the user clicks Play Again — give them a fresh session:

```js
function handlePlayAgain() {
  setMessages([])
  setCurrentScore(0)
  setWon(false)
  setInputValue("")
  // sessionId stays the same since useState initializer only runs once
  // For a true fresh session, you could navigate to the page fresh
}
```

### How you know this step is done
Every request body in the browser's Network tab now includes a `sessionId` field.

---

## Step 8: Test and Verify

### What you are doing
Making sure the semantic memory actually works end to end.

### Tasks
- [ ] Start a new game
- [ ] Early in the conversation, mention something specific — for example: "I once wrote a paper on Camus and the absurd"
- [ ] Keep chatting for 10+ more messages about different things
- [ ] Then reference the earlier topic — say: "you know, that thing I mentioned about Camus earlier..."
- [ ] See if Rami's response shows he remembers — this is RAG working
- [ ] Open your Pinecone dashboard → your `doorman-game` index → browse namespaces — you should see vectors being stored
- [ ] Check your terminal — confirm no uncaught errors from the embed/recall flow
- [ ] Confirm that Rami's reply is NOT delayed by the embed calls (they are non-blocking)

### How you know this step is done
- Vectors appear in Pinecone dashboard after each message
- Rami occasionally references relevant earlier parts of the conversation
- The app never crashes even if Hugging Face is slow

---

## Phase 3 Complete ✓

When all 8 steps are done you will have built a full RAG pipeline from scratch:

| File | What it does |
|---|---|
| `lib/embeddings.js` | Converts text to 384-dim vectors via Hugging Face |
| `lib/pinecone.js` | Stores and retrieves vectors from Pinecone |
| `app/api/embed/route.js` | API route to embed and store a message |
| `app/api/recall/route.js` | API route to find semantically similar past messages |
| `app/api/chat/route.js` | Updated to use semantic memory + graceful fallback |
| `app/game/page.jsx` | Updated to send sessionId with every request |

---

## What You Learned in Phase 3

- **Embeddings** — how text gets converted to numbers that represent meaning
- **Vector storage** — how Pinecone stores and organizes those vectors by session
- **Semantic search** — how querying with a vector finds similar past messages by meaning, not keywords
- **RAG pattern** — Retrieval Augmented Generation — how retrieved context improves LLM responses
- **Non-blocking async** — how to run background tasks without slowing down the user

---

## Antigravity Prompt to Start This Phase

> "I'm building The Doorman Game. Read these files first: @PRD.md @STRUCTURE.md @CURSOR_RULES.md. Phases 1 and 2 are complete and working. We are now on Phase 3 — adding Pinecone vector memory and Hugging Face embeddings. Use ES Modules only (import/export, never require). Do not touch the Doorman or Judge prompts. Start with Step 1 — installing the two new packages."