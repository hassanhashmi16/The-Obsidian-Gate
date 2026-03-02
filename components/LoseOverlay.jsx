import React from 'react';
import Link from 'next/link';

export default function LoseOverlay({ lost, finalMessage, messageCount, onPlayAgain }) {
    if (!lost) return null;

    const getRating = (count) => {
        if (count <= 3) return "Catastrophic. What were you thinking?";
        if (count <= 8) return "Bold strategy. It did not pay off.";
        return "You tried. Rami just wasn't feeling it.";
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/95 backdrop-blur-md animate-fade-in">
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">

                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: "150ms" }}>

                    <div className="space-y-1 mb-6 mt-4 shrink-0">
                        <h2 className="font-[family-name:var(--font-cormorant-garamond)] text-4xl md:text-7xl font-bold text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            Not Getting In.
                        </h2>
                        <p className="font-[family-name:var(--font-inter)] text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm">
                            Rami called security.
                        </p>
                    </div>

                    <div className="relative bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 rounded-lg shadow-2xl w-full shrink-0">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 md:px-4 bg-zinc-900 border border-zinc-800 text-amber-400/90 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full whitespace-nowrap">
                            Rami's Final Word
                        </div>
                        <p className="font-[family-name:var(--font-inter)] text-zinc-200 text-base md:text-xl leading-relaxed italic mb-4 md:mb-6 mt-2">
                            "{finalMessage}"
                        </p>

                        <div className="border-t border-zinc-800/80 pt-4 md:pt-6">
                            <div className="text-xs md:text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-1 md:mb-2">Performance</div>
                            <div className="text-lg md:text-2xl font-bold text-red-500 mb-1">Lasted {messageCount} messages</div>
                            <div className="text-xs md:text-sm text-zinc-500 italic px-2">{getRating(messageCount)}</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-8 w-full md:w-auto">
                        <button
                            onClick={onPlayAgain}
                            className="group relative inline-flex items-center justify-center px-6 py-4 font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest font-medium text-red-50 bg-red-900/30 border border-red-500/50 rounded-sm overflow-hidden transition-all duration-300 hover:bg-red-800/40 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 flex-1"
                        >
                            <span className="relative">Try Again</span>
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
        </div>
    );
}
