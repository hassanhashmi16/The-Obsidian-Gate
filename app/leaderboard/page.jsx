import Link from "next/link";
import { connectDB } from "@/lib/mongodb.js";
import Score from "@/lib/models/Score.js";

export const dynamic = 'force-dynamic';

// Page component must be async in Next.js App Router for data fetching
export default async function LeaderboardPage() {
    let scores = [];
    let error = null;

    try {
        await connectDB();
        // Fetch top 20 scores ranked by messageCount (ascending) then finalScore (descending)
        scores = await Score.find()
            .sort({ messageCount: 1, finalScore: -1 })
            .limit(20)
            .lean()
            .exec(); // Explicitly execute to return plain objects properly

        // Ensure serialization of IDs if any before passing to client components or mapping
        scores = scores.map(s => ({
            ...s,
            _id: s._id.toString(),
            createdAt: s.createdAt.toString()
        }));
    } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        error = "Failed to load leaderboard. Please try again later.";
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-[family-name:var(--font-inter)] py-12 px-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

                <h1 className="font-[family-name:var(--font-cormorant-garamond)] text-4xl md:text-6xl font-bold text-center text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)] mb-2">
                    The Inner Circle
                </h1>
                <p className="text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm text-center mb-12">
                    They earned their place.
                </p>

                {error ? (
                    <div className="text-red-400 bg-red-900/20 px-6 py-4 rounded border border-red-500/30 text-sm">
                        {error}
                    </div>
                ) : (
                    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">

                        {/* Headers */}
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4 px-4 py-3 md:px-6 md:py-4 bg-zinc-900/80 border-b border-zinc-800 text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            <div className="col-span-1 text-center font-bold">Rank</div>
                            <div className="col-span-2 text-left">Name</div>
                            <div className="col-span-1 text-center">Messages</div>
                            <div className="hidden md:block col-span-1 text-center">Difficulty</div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-zinc-800/50">
                            {scores.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm italic">
                                    The door remains closed. No one has entered yet.
                                </div>
                            ) : (
                                scores.map((score, index) => {
                                    // Special styling for top 3
                                    const rankCol = index === 0 ? "text-amber-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                        : index === 1 ? "text-slate-300 font-bold text-lg drop-shadow-[0_0_8px_rgba(203,213,225,0.3)]"
                                            : index === 2 ? "text-amber-700 font-bold text-lg drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]"
                                                : "text-zinc-500 font-bold";

                                    return (
                                        <div key={score._id} className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4 px-4 py-3 md:px-6 md:py-4 items-center hover:bg-zinc-800/30 transition-colors">
                                            <div className={`col-span-1 text-center font-[family-name:var(--font-cormorant-garamond)] ${rankCol}`}>
                                                #{index + 1}
                                            </div>
                                            <div className="col-span-2 text-left text-sm md:text-base font-medium text-zinc-200 uppercase tracking-wide truncate">
                                                {score.playerName}
                                            </div>
                                            <div className="col-span-1 text-center text-sm md:text-base font-bold text-emerald-400">
                                                {score.messageCount}
                                            </div>
                                            <div className="hidden md:block col-span-1 text-center">
                                                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${score.difficulty === "easy" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                                                    {score.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12 flex justify-center">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest font-bold text-zinc-100 bg-zinc-900 border border-zinc-700/80 rounded-sm overflow-hidden transition-all duration-300 hover:bg-zinc-800 hover:border-zinc-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:-translate-y-0.5"
                    >
                        <span className="relative">Back to the Door</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
