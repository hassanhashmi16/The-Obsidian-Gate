import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({ messages, isLoading }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
                {messages.length === 0 ? (
                    <div className="text-center text-zinc-500 font-[family-name:var(--font-inter)] mb-10 opacity-60">
                        <p className="text-sm">The doorman is watching you.</p>
                        <p className="text-sm">Approach with respect.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <MessageBubble key={i} role={msg.role} content={msg.content} />
                    ))
                )}

                {isLoading && <TypingIndicator />}

                <div ref={scrollRef} className="h-4" />
            </div>
        </div>
    );
}
