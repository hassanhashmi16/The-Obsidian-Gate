import { connectDB } from "@/lib/mongodb.js"
import Score from "@/lib/models/Score.js"

export const dynamic = 'force-dynamic';

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
