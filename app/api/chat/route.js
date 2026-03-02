import { callDoorman, callJudge } from "@/lib/groq.js"
import { embedText } from "@/lib/embeddings.js"
import { storeVector, findSimilarMessages } from "@/lib/pinecone.js"
import { waitUntil } from "@vercel/functions"

const WIN_THRESHOLD = 100
const LOSE_THRESHOLD = -100

export async function POST(request) {
    try {
        const body = await request.json()
        const { userMessage, conversationHistory, currentScore, sessionId, difficulty, moodLevel } = body

        // Step 1 & 2: Run Vector Recall and Judge logic in parallel
        const recallPromise = async () => {
            if (!sessionId) return [];
            try {
                const queryVector = await embedText(userMessage);
                if (queryVector) {
                    return await findSimilarMessages(sessionId, queryVector, 5);
                }
            } catch (err) {
                // Silently fall back to simple history if recall fails
                console.error("Recall failed, continuing without semantic memory:", err);
            }
            return [];
        };

        const judgePromise = callJudge(conversationHistory, userMessage);

        const [retrievedContext, judgeResult] = await Promise.all([
            recallPromise(),
            judgePromise
        ]);

        const rawScoreDelta = judgeResult.score;
        const judgeReasoning = judgeResult.reasoning;

        // Step 3: Apply multiplier
        let scoreDelta = rawScoreDelta
        if (difficulty === "easy") {
            if (rawScoreDelta > 0) {
                scoreDelta = Math.round(rawScoreDelta * 2.0) // 2x points for good answers
            } else if (rawScoreDelta < 0) {
                scoreDelta = Math.round(rawScoreDelta * 0.5) // Half penalty for bad answers
            }
        }

        // Step 4: Calculate new score and check win condition
        const newCumulativeScore = currentScore + scoreDelta
        const won = newCumulativeScore >= WIN_THRESHOLD
        const lost = newCumulativeScore <= LOSE_THRESHOLD

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
        const doormanReply = await callDoorman(updatedHistory, won, lost, moodLevel)

        // Step 6: Send the response back to the client immediately
        const responsePayload = Response.json({
            doormanReply,
            scoreDelta,
            newCumulativeScore,
            won,
            lost,
            judgeReasoning,
        })

        // Step 7: Store both messages in Pinecone using Vercel's waitUntil
        if (sessionId) {
            const timestamp = Date.now()

            // Wrap the background logic in an async function inside waitUntil
            waitUntil((async () => {
                const results = await Promise.allSettled([
                    embedText(userMessage).then(async (vector) => {
                        if (vector) {
                            await storeVector(
                                sessionId,
                                `${sessionId}-${timestamp}-user`,
                                vector,
                                "user",
                                userMessage
                            )
                        }
                    }),
                    embedText(doormanReply).then(async (vector) => {
                        if (vector) {
                            await storeVector(
                                sessionId,
                                `${sessionId}-${timestamp}-rami`,
                                vector,
                                "assistant",
                                doormanReply
                            )
                        }
                    })
                ])
                console.log("Background vector storage completed.", results)
            })())
        }

        return responsePayload
    } catch (error) {
        console.error("Chat route error:", error)
        return Response.json({ error: "Something went wrong." }, { status: 500 })
    }
}