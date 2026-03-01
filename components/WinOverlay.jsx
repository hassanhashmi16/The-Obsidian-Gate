import React, { useState } from 'react';
import Link from 'next/link';

export default function WinOverlay({ won, finalMessage, messageCount, onPlayAgain, difficulty = 'normal' }) {
    const [playerName, setPlayerName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!won) return null;

    const getRating = (count) => {
        if (count <= 7) return "Masterful. Rami was genuinely impressed.";
        if (count <= 12) return "Smooth. You knew what you were doing.";
        if (count <= 18) return "Persistent. But you got there.";
        return "Eventually. Rami almost called security.";
    };

    const handleScoreSubmit = () => {
        if (!playerName.trim()) return;

        fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                playerName: playerName.trim(),
                messageCount,
                finalScore: 100, // Score logic simplifies tracking just win counts in Phase 6 as per specs.
                difficulty,
            }),
        })
            .then(() => setSubmitted(true))
            .catch(err => console.error("Score save failed:", err));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md animate-fade-in">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-2xl px-4 py-8 max-h-screen overflow-y-auto animate-fade-in-up" style={{ animationDelay: "150ms" }}>

                <div className="space-y-1 mb-6 mt-4 shrink-0">
                    <h2 className="font-[family-name:var(--font-cormorant-garamond)] text-5xl md:text-7xl font-bold text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                        You're In.
                    </h2>
                    <p className="font-[family-name:var(--font-inter)] text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm">
                        Club Obsidian welcomes you.
                    </p>
                </div>

                <div className="relative bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 rounded-lg shadow-2xl w-full shrink-0">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 md:px-4 bg-zinc-900 border border-zinc-800 text-amber-400/90 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                        Rami's Final Word
                    </div>
                    <p className="font-[family-name:var(--font-inter)] text-zinc-200 text-base md:text-xl leading-relaxed italic mb-4 md:mb-6 mt-2">
                        "{finalMessage}"
                    </p>

                    <div className="border-t border-zinc-800/80 pt-4 md:pt-6 mb-4 md:mb-6">
                        <div className="text-xs md:text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-1 md:mb-2">Performance</div>
                        <div className="text-lg md:text-2xl font-bold text-emerald-400 mb-1">Got in after {messageCount}</div>
                        <div className="text-xs md:text-sm text-zinc-500 italic px-2">{getRating(messageCount)}</div>
                    </div>

                    {/* Temporary Name Entry (Will be wired to API in Step 4) */}
                    <div className="border-t border-emerald-900/50 pt-4 md:pt-6 flex flex-col items-center">
                        <div className="text-[10px] md:text-xs font-semibold text-emerald-500/80 uppercase tracking-[0.2em] mb-3">Claim Your Spot</div>
                        {!submitted ? (
                            <div className="flex w-full max-w-sm flex-col md:flex-row gap-2">
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="ENTER YOUR NAME"
                                    maxLength={20}
                                    className="flex-1 bg-zinc-950 border border-zinc-700/50 rounded-sm px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 uppercase tracking-wider font-[family-name:var(--font-inter)]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleScoreSubmit();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleScoreSubmit}
                                    disabled={!playerName.trim()}
                                    className="px-4 py-2 bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-emerald-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                >
                                    Submit
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-emerald-400 font-[family-name:var(--font-inter)] italic">
                                Ready for the leaderboard, {playerName}.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-8 w-full md:w-auto">
                    <Link
                        href="/leaderboard"
                        className="group relative inline-flex items-center justify-center px-6 py-4 font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest font-medium text-emerald-400 bg-emerald-900/10 border border-emerald-500/30 rounded-sm overflow-hidden transition-all duration-300 hover:bg-emerald-800/20 hover:border-emerald-500/60 hover:-translate-y-0.5 flex-1 text-center"
                    >
                        <span className="relative">Leaderboard</span>
                    </Link>

                    <button
                        onClick={onPlayAgain}
                        className="group relative inline-flex items-center justify-center px-6 py-4 font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest font-medium text-emerald-50 bg-emerald-900/30 border border-emerald-500/50 rounded-sm overflow-hidden transition-all duration-300 hover:bg-emerald-800/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:-translate-y-0.5 flex-1"
                    >
                        <span className="relative">Play Again</span>
                    </button>

                    <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center px-6 py-4 font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-700/50 rounded-sm overflow-hidden transition-all duration-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 hover:-translate-y-0.5 flex-1 text-center"
                    >
                        <span className="relative">Home</span>
                    </Link>
                </div>

            </div>
        </div>
    );
}
