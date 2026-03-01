import React from 'react';

export default function InfluenceMeter({ currentScore, difficulty = "normal" }) {
    // Cap percentage visually at 100, minimum 0.
    const percentage = Math.max(0, Math.min(Number(currentScore) || 0, 100));

    // Determine color based on progress
    let barColor = "bg-red-500";
    let label = "The door remains firmly shut.";

    if (currentScore >= 100) {
        barColor = "bg-emerald-400";
        label = "He steps aside.";
    } else if (currentScore >= 67) {
        barColor = difficulty === "easy" ? "bg-blue-500" : "bg-purple-500";
        label = "Almost there...";
    } else if (currentScore >= 34) {
        barColor = difficulty === "easy" ? "bg-cyan-500" : "bg-yellow-500";
        label = "He's warming up...";
    } else if (currentScore > 0) {
        barColor = "bg-red-400";
        label = "Keep talking...";
    }

    return (
        <div className="w-full bg-zinc-900 border-t border-b border-zinc-800 px-6 py-4 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-xl mx-auto flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-xs font-[family-name:var(--font-inter)] tracking-wider uppercase">
                    Influence: <strong className="text-zinc-200">{currentScore}</strong> / 100
                </span>
                <span className="text-zinc-500 text-xs italic font-[family-name:var(--font-cormorant-garamond)]">
                    {label}
                </span>
            </div>
            <div className="w-full max-w-xl mx-auto h-2 bg-zinc-950/80 rounded-full overflow-hidden shadow-inner border border-zinc-800/50 relative">
                <div
                    className={`h-full ${barColor} shadow-[0_0_10px_currentColor] rounded-full`}
                    style={{ width: `${percentage}%`, transition: "width 0.6s ease" }}
                />
            </div>
        </div>
    );
}
