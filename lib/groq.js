import Groq from "groq-sdk"
import { DOORMAN_SYSTEM_PROMPT } from "./doorman-prompt.js"
import { JUDGE_SYSTEM_PROMPT } from "./judge-prompt.js"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const WIN_INSTRUCTION = `[SYSTEM: The user has genuinely convinced you. Let them in now. Make it feel natural and organic — as if you changed your mind in this moment. Do not be abrupt about it.]`
const LOSE_INSTRUCTION = `[SYSTEM: The user has been too rude, aggressive, or persistent in the wrong ways. You are done with this conversation. Call security now. Stay calm but firm. Make it feel final.]`

const MOOD_INSTRUCTIONS = {
    0: "", // Default — no extra instruction
    1: "[SYSTEM: You are growing impatient. Your replies are getting shorter. You check your watch occasionally.]",
    2: "[SYSTEM: You are cold and disengaged. You give minimal responses. You're barely looking at them.]",
    3: "[SYSTEM: You are done. You give one or two word answers at most. You have mentally moved on from this person.]",
}

async function callDoorman(conversationHistory, hasWon, hasLost, moodLevel = 0) {
    try {
        const messages = [
            { role: "system", content: DOORMAN_SYSTEM_PROMPT },
        ]

        if (moodLevel > 0 && MOOD_INSTRUCTIONS[moodLevel]) {
            messages.push({ role: "system", content: MOOD_INSTRUCTIONS[moodLevel] })
        }

        messages.push(...conversationHistory)

        if (hasWon) {
            messages.push({ role: "system", content: WIN_INSTRUCTION })
        } else if (hasLost) {
            messages.push({ role: "system", content: LOSE_INSTRUCTION })
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: messages,
            max_tokens: 300,
        })

        return response.choices[0].message.content
    } catch (error) {
        console.error("Doorman call failed:", error)
        return "Give me a moment."
    }
}

async function callJudge(conversationHistory, userMessage) {
    try {
        const messages = [
            { role: "system", content: JUDGE_SYSTEM_PROMPT },
            ...conversationHistory,
            { role: "user", content: userMessage },
        ]

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            max_tokens: 150,
        })

        let raw = response.choices[0].message.content
        // Sometimes the LLM returns `{"score": +5}` which is invalid JSON.
        // This regex finds a plus sign followed by digits and removes the plus sign.
        raw = raw.replace(/:\s*\+(\d+)/g, ': $1')

        const parsed = JSON.parse(raw)
        return parsed
    } catch (error) {
        console.error("Judge call failed:", error)
        return { score: 0, reasoning: "Could not evaluate this message." }
    }
}

export { callDoorman, callJudge }