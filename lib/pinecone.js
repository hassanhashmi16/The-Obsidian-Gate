import { Pinecone } from "@pinecone-database/pinecone"

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
})

const index = pc.index(process.env.PINECONE_INDEX_NAME)

export async function storeVector(sessionId, messageId, vector, role, content) {
    try {
        if (!Array.isArray(vector) || vector.length === 0) {
            console.error("[DEBUG] Error: Invalid vector provided to storeVector", vector);
            return;
        }

        await index.namespace(sessionId).upsert({
            records: [
                {
                    id: messageId,
                    values: vector,
                    metadata: {
                        role,
                        content,
                        sessionId,
                    },
                },
            ]
        })
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
