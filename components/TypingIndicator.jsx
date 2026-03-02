import React, { useState, useEffect } from 'react';

export default function TypingIndicator() {
    const [isDelayed, setIsDelayed] = useState(false);

    useEffect(() => {
        // If the typing indicator is visible for more than 5 seconds, switch the text
        const timer = setTimeout(() => {
            setIsDelayed(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex w-full justify-start mb-4 animate-fade-in">
            <div className={`bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-sm px-5 py-4 transition-all duration-500 ${isDelayed ? 'w-auto max-w-[80%]' : 'w-24'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-300/90 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-inter)]">
                        Rami
                    </span>
                </div>
                {!isDelayed ? (
                    <div className="flex gap-1.5 h-6 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                ) : (
                    <div className="h-6 flex items-center text-zinc-400 text-sm italic font-[family-name:var(--font-inter)] animate-fade-in">
                        Rami is thinking deeply...
                    </div>
                )}
            </div>
        </div>
    );
}
