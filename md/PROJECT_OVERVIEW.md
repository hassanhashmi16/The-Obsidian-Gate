# Club Obsidian: The Doorman Game - Project Overview

## 📖 Concept
**Club Obsidian** is an interactive, AI-driven conversational game. You play as a guest trying to get into an exclusive Dubai nightclub guarded by **Rami Khalil**, a former literature professor turned head doorman. 
You cannot use bribes or name-drop. Your core mechanic is purely conversational manipulation, emotional intelligence, and philosophical wit. 

If you get your influence score to **100**, you get in. If your score drops to **-100**, Rami calls security and you lose.

---

## 🏗️ Technology Stack
* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) + React
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Backend Engines:** [Groq SDK](https://groq.com/) for lightning-fast LLM inference
* **Retrieval-Augmented Generation (RAG):**
  * **Memory Storage:** [Pinecone](https://www.pinecone.io/) (Serverless Vector Database)
  * **Embeddings:** [Hugging Face Inference API](https://huggingface.co/) (`sentence-transformers/all-MiniLM-L6-v2`)

---

## ⚙️ Core Workflows & Game Loop

The core architecture operates on a multi-agent system combined with a background RAG memory flow. Every time a user sends a message (`/api/chat`), the following workflow resolves within ~2.5 seconds:

### 1. Vector Recall (Semantic Memory)
- The user's input is instantly embedded via **Hugging Face** into a 384-dimensional array.
- The app pings **Pinecone** using the player's unique browser `sessionId`.
- Pinecone surfaces the 5 most semantically relevant past messages extending beyond the immediate chat history window constraint. This allows Rami to "remember" topics from hours ago if the user brings them up again.

### 2. The Judge Agent (Scoring Mechanic)
- The message history and the user's current message are sent to **Llama-3.3-70b-versatile** via Groq.
- The Judge acts as a hidden referee, evaluating the user's approach against Rami's personality (e.g., despises arrogance, respects humility).
- It outputs a raw JSON containing a `score` delta (from -15 to +15) and a `reasoning` string explaining *why* the score changed.

### 3. State & Threshold Checks
- The Score Delta is added to the user's `currentScore`.
- **Win Condition:** If the score reaches `>= 100`.
- **Lose Condition:** If the score reaches `<= -100`.
- If either condition is met, a specialized system instruction (`WIN_INSTRUCTION` or `LOSE_INSTRUCTION`) is appended to the next LLM call forcing Rami to react appropriately (either opening the door or calling security).

### 4. The Doorman Agent (Character Response)
- The augmented history (Semantic Context + Recent History + User Message + System Overrides) is sent to **Llama-3.1-8b-instant** via Groq.
- Rami generates his in-character response.

### 5. Fallback Storage (Fire and Forget)
- While the HTTP `200 OK` response is immediately shipped back to the user to keep the UX snappy, the server silently runs vector embedding on *both* the user's message and Rami's reply.
- These vectors are pushed asynchronously to **Pinecone** using v7's `upsert({ records: [...] })` format to catalog the ongoing conversation for the next semantic recall.

---

## 🧩 Key System Components

### Frontend (`app/game/page.jsx`)
- **InfluenceMeter:** A dynamic visual progress bar tracking the user's score to 100 or -100.
- **ScoreDelta:** A floating numeric animation indicating the Judge's real-time adjustment (e.g., +10 or -5).
- **DebugPanel:** A collapsible `<DebugPanel />` component that reveals the Llama-70b Judge's secret reasoning on the last message.
- **Overlays (WinOverlay / LoseOverlay):** Game-terminating UI popups. They conditionally halt chat inputs, count how many messages the run took, generate a context-appropriate rank (e.g., "Masterful" vs "Catastrophic"), and implement native Web Sharing (`navigator.share`) for virality.
- **Session Tracking:** Uses standard React `useState` randomized session IDs appended on mount to partition Pinecone namespaces.

### Backend Routing
* **`app/api/chat/route.js`**: The master orchestration route that synchronously runs the RAG query, fires the Judge, fires the Doorman, checks thresholds, and async-fires the vector storage hooks.
* **`app/api/embed/route.js` & `app/api/recall/route.js`**: Modular endpoints exposing isolated access to the Hugging Face / Pinecone pipeline.

### Machine Learning Libs
* **`lib/embeddings.js`**: Wraps the `@huggingface/inference` interface and safely normalizes nesting logic returning flat integer arrays. 
* **`lib/pinecone.js`**: Implements `@pinecone-database/pinecone` SDK logic tracking namespaces via the user's `sessionId`.
* **`lib/groq.js`**: Wraps `groq-sdk`, parses the strict JSON objects out of the Judge array, and parses standard strings out of the Doorman array.
* **`lib/doorman-prompt.js` & `lib/judge-prompt.js`**: Contains the raw, carefully tuned prompt instructions shaping the behavioral boundaries of the LLMs.

---

## 🛡️ Reliability & Edge Case Protocols
* **Graceful Degradation:** If Hugging Face times out generating a semantic vector, the app silently catches the error and gracefully falls back to just standard direct message history padding. No crashes are passed to the user.
* **JSON Swallowing:** If the Judge model hallucinates invalid JSON formats, a fallback wrapper defaults to `{ score: 0, reasoning: "Could not evaluate this message." }` protecting the app from `NaN` math breaks. 
* **Input Safeties:** Users cannot double-submit API calls while loading (`disabled={isLoading}`). Input length is hard-capped to `300` characters to prevent token-stuffing attacks.
