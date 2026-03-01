import fs from 'fs';
import mongoose from 'mongoose';

// Read MONGODB_URI from .env
const envFile = fs.readFileSync('.env', 'utf-8');
const mongoUriLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI='));
const MONGODB_URI = mongoUriLine ? mongoUriLine.split('=')[1].trim() : null;

const ScoreSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    messageCount: { type: Number, required: true },
    finalScore: { type: Number, required: true },
    difficulty: { type: String, enum: ["easy", "normal"], required: true },
    createdAt: { type: Date, default: Date.now },
});

const Score = mongoose.models.Score || mongoose.model("Score", ScoreSchema);

async function checkScores() {
    console.log("Connecting to Database:", MONGODB_URI);
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully. Fetching all scores...");

        const scores = await Score.find().sort({ createdAt: -1 });
        console.log(`Found ${scores.length} scores total.`);
        console.dir(scores.map(s => ({
            name: s.playerName,
            messages: s.messageCount,
            difficulty: s.difficulty,
            date: s.createdAt
        })));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

checkScores();
