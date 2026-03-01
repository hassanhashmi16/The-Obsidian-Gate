# The Obsidian Gate

An AI-powered social engineering simulator built with Next.js. You are standing outside an exclusive nightclub guarded by Rami Khalil, an unyielding doorman powered by an LLM with hidden principles and a deep vector memory of your conversation. 

You are not on the list. You do not have an ID. Your only weapon is your ability to use your words to persuade him to let you inside.

## Tech Stack
* **Frontend/Framework:** Next.js (App Router), React, TailwindCSS
* **AI Engines:** Groq (Llama 3 70B & 8B) 
* **Vector Memory:** Pinecone Databse & Hugging Face Embeddings
* **Leaderboard Database:** MongoDB (Mongoose)

## How It Works
The game uses a two-agent architecture:
1. **The Doorman (Llama 3 70B):** Roleplays as Rami, responding to your arguments dynamically while pulling context from long-term vector memory.
2. **The Judge (Llama 3 8B):** An invisible background agent that critiques your conversational tactics in real-time, assigning positive or negative points to an Influence Meter based on Rami's hidden personality profile.
