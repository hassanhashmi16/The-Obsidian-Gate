import React from 'react';

export default function MessageBubble({ role, content }) {
    const isUser = role === "user";

    return (
        <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in-up`}>
            <div
                className={`max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl ${isUser
                        ? "bg-purple-900/60 border border-purple-500/30 text-zinc-100 rounded-br-sm"
                        : "bg-zinc-800/80 border border-zinc-700/50 text-white rounded-bl-sm"
                    }`}
            >
                {!isUser && (
                    <div className="flex items-center gap-2 mb-1 cursor-default">
                        <span className="text-amber-300/90 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-inter)]">
                            Rami Khalil
                        </span>
                    </div>
                )}
                <div className="font-[family-name:var(--font-inter)] text-[15px] leading-relaxed whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        </div>
    );
}
