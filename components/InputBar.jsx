import React from 'react';

export default function InputBar({ value, onChange, onSend, disabled }) {
    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    }

    return (
        <div className="w-full bg-zinc-950 p-4 border-t border-zinc-800/50 flex justify-center">
            <div className="w-full max-w-3xl flex items-center relative gap-4">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder={disabled ? "The interaction is over." : "Say something to Rami..."}
                        className={`w-full bg-zinc-900 border border-zinc-700/50 rounded-full px-6 py-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 transition-all font-[family-name:var(--font-inter)] text-[15px] shadow-sm ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        maxLength={300}
                    />
                    {/* Subtle glow effect behind input that only activates on focus */}
                    <div className="absolute inset-0 -z-10 rounded-full bg-purple-500/0 peer-focus:bg-purple-500/5 blur-md transition-all duration-500"></div>
                </div>

                <button
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                    className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 text-purple-400 transition-all duration-300 ${disabled || !value.trim()
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:border-purple-500 hover:bg-purple-900/30 hover:text-purple-300 hover:-translate-y-0.5 shadow-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                        }`}
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                        <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
