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
