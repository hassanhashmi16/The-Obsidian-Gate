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
