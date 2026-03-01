import React from 'react';

export default function DebugPanel({ reasoning, delta, isOpen, onToggle }) {
    if (!reasoning) return null; // Don't show until first message is scored

    const isPositive = delta > 0;
    const isNegative = delta < 0;
    const deltaColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-zinc-400';
    const sign = isPositive ? '+' : '';

    return (
        <div className="flex flex-col items-center mt-2 w-full max-w-2xl mx-auto px-4 z-10">
            <button
                onClick={onToggle}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest font-semibold flex items-center gap-2 py-2"
            >
                <span>🔍 Judge's Verdict</span>
            </button>

            {isOpen && (
                <div className="w-full bg-zinc-900 border border-zinc-700/50 rounded-md p-4 mt-2 mb-2 shadow-lg animate-fade-in">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className={`text-3xl font-bold font-[family-name:var(--font-cormorant-garamond)] ${deltaColor} shrink-0`}>
                            {sign}{delta}
                        </div>
                        <div className="text-sm text-zinc-400 italic font-[family-name:var(--font-inter)] leading-relaxed">
                            "{reasoning}"
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
