"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import ChatWindow from "@/components/ChatWindow"
import InfluenceMeter from "@/components/InfluenceMeter"
import ScoreDelta from "@/components/ScoreDelta"
import InputBar from "@/components/InputBar"
import WinOverlay from "@/components/WinOverlay"
import LoseOverlay from "@/components/LoseOverlay"
import DebugPanel from "@/components/DebugPanel"

function GamePageContent() {
    const searchParams = useSearchParams()
    const difficulty = searchParams.get("difficulty") || "normal"

    const [messages, setMessages] = useState([])
    const [currentScore, setCurrentScore] = useState(0)
    const [lastScoreDelta, setLastScoreDelta] = useState(0)
    const [lastReasoning, setLastReasoning] = useState("")
    const [debugOpen, setDebugOpen] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const [moodLevel, setMoodLevel] = useState(0)
    const [lastScoreCheckpoint, setLastScoreCheckpoint] = useState(0)
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [won, setWon] = useState(false)
    const [lost, setLost] = useState(false)
    const [sessionId] = useState(
        () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    )

    useEffect(() => {
        const openingLine = difficulty === "easy"
            ? "You've been waiting out here a while. State your business."
            : "Next. State your business."

        setMessages([{ role: "assistant", content: openingLine }])
    }, [difficulty])

    async function handleSend() {
        if (!inputValue.trim() || isLoading || won || lost) return

        const userMessage = inputValue.trim()
        setInputValue("")
        setIsLoading(true)

        // Add user message to display
        const updatedMessages = [...messages, { role: "user", content: userMessage }]
        setMessages(updatedMessages)
        const messagesSoFar = updatedMessages.filter(m => m.role === "user").length
        setMessageCount(messagesSoFar)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userMessage,
                    conversationHistory: messages,
                    currentScore,
                    sessionId,
                    difficulty,
                    moodLevel,
                }),
            })

            const data = await response.json()

            // Add Rami's reply to display
            setMessages([...updatedMessages, { role: "assistant", content: data.doormanReply }])
            setCurrentScore(data.newCumulativeScore)
            setLastScoreDelta(data.scoreDelta)
            setLastReasoning(data.judgeReasoning)

            if (messagesSoFar > 0 && messagesSoFar % 5 === 0) {
                const scoreGain = data.newCumulativeScore - lastScoreCheckpoint
                if (scoreGain < 15) {
                    setMoodLevel(prev => Math.min(prev + 1, 3))
                }
                setLastScoreCheckpoint(data.newCumulativeScore)
            }

            if (data.won) setWon(true)
            if (data.lost) setLost(true)
        } catch (error) {
            console.error("Send failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    function handlePlayAgain() {
        setMessages([])
        setCurrentScore(0)
        setLastScoreDelta(0)
        setLastReasoning("")
        setDebugOpen(false)
        setWon(false)
        setLost(false)
        setMessageCount(0)
        setMoodLevel(0)
        setLastScoreCheckpoint(0)
        setInputValue("")
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden text-zinc-100 relative">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm z-10 shrink-0 shadow-md gap-3 md:gap-0">
                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4 w-full md:w-auto text-center md:text-left">
                    <h1 className="font-[family-name:var(--font-cormorant-garamond)] text-2xl md:text-3xl font-bold text-zinc-100 tracking-wider">
                        Club Obsidian
                    </h1>
                    <span
                        className={`text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest px-2 py-0.5 md:py-1 rounded-sm ${difficulty === "easy"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            }`}
                    >
                        {difficulty === "easy" ? "Easy Mode" : "Normal Mode"}
                    </span>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full md:w-auto">

                    <span className="font-[family-name:var(--font-inter)] text-[10px] md:text-xs lg:text-sm tracking-[0.1em] md:tracking-[0.2em] text-amber-500/80 uppercase font-semibold mx-1 md:mx-2 flex items-center gap-2">
                        <span>Rami <span className="hidden md:inline">Khalil</span></span>
                        {moodLevel === 1 && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500" title="Impatient"></span>}
                        {moodLevel === 2 && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500" title="Cold"></span>}
                        {moodLevel === 3 && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500" title="Done with you"></span>}
                    </span>
                    <Link
                        href="/"
                        className="text-[9px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest px-2 md:px-3 py-1 rounded-sm bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
                    >
                        Quit
                    </Link>
                </div>
            </header>

            {/* CHAT WINDOW */}
            <ChatWindow messages={messages} isLoading={isLoading} />

            {/* INFLUENCE METER (WITH SCORE DELTA) */}
            <div className="relative shrink-0">
                <div className="absolute top-0 right-8 md:right-1/4 z-20">
                    <ScoreDelta delta={lastScoreDelta} />
                </div>
                <InfluenceMeter currentScore={currentScore} difficulty={difficulty} />
            </div>

            {/* DEBUG PANEL */}
            <div className="shrink-0 z-10 w-full flex flex-col items-end">
                <DebugPanel
                    reasoning={lastReasoning}
                    delta={lastScoreDelta}
                    isOpen={debugOpen}
                    onToggle={() => setDebugOpen(!debugOpen)}
                />
            </div>

            {/* INPUT BAR */}
            <div className="shrink-0 z-10 pb-4 md:pb-0 bg-zinc-950">
                <InputBar
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSend}
                    disabled={isLoading || won || lost}
                />
            </div>

            {/* WIN OVERLAY */}
            <WinOverlay
                won={won}
                finalMessage={messages[messages.length - 1]?.content}
                messageCount={messageCount}
                onPlayAgain={handlePlayAgain}
                difficulty={difficulty}
            />

            {/* LOSE OVERLAY */}
            <LoseOverlay
                lost={lost}
                finalMessage={messages[messages.length - 1]?.content}
                messageCount={messageCount}
                onPlayAgain={handlePlayAgain}
            />
        </div>
    )
}

export default function GamePage() {
    return (
        <Suspense fallback={<div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-[family-name:var(--font-inter)] tracking-widest uppercase text-sm">Approaching the door...</div>}>
            <GamePageContent />
        </Suspense>
    )
}
