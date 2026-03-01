import mongoose from "mongoose"

const ScoreSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    messageCount: { type: Number, required: true },
    finalScore: { type: Number, required: true },
    difficulty: { type: String, enum: ["easy", "normal"], required: true },
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema)
