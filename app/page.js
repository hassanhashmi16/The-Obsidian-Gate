import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        <h1 className="font-[family-name:var(--font-cormorant-garamond)] text-6xl md:text-8xl font-bold tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] text-zinc-100">
          Club Obsidian
        </h1>

        <div className="space-y-4 font-[family-name:var(--font-inter)] text-zinc-400 text-lg md:text-xl font-light max-w-xl text-center">
          <p>There is one door. One man. Can you get past him?</p>
          <p className="text-zinc-300 text-base leading-relaxed bg-zinc-900/50 p-4 rounded border border-zinc-800/80">
            You are standing outside Club Obsidian, an exclusive nightclub guarded by Rami Khalil.
            You are not on the list. You do not have a membership. You do not have an ID.
            Your goal is to persuade him to let you in using only your words. He despises arrogance and entitlement,
            but respects authenticity and philosophical wit.
          </p>
          <p className="text-zinc-500 text-base font-medium">No bribes. No name-dropping. Just conversation.</p>
        </div>

        <h2 className="text-3xl font-[family-name:var(--font-cormorant-garamond)] text-zinc-200 mt-6 mb-2">
          Choose Your Night
        </h2>

        <div className="flex w-full justify-center">
          <Link
            href="/leaderboard"
            className="group relative inline-flex items-center justify-center px-6 py-3 font-[family-name:var(--font-inter)] text-sm uppercase tracking-widest font-medium text-amber-500 bg-amber-900/10 border border-amber-500/30 rounded-sm overflow-hidden transition-all duration-300 hover:bg-amber-800/20 hover:border-amber-500/60 hover:-translate-y-0.5"
          >
            <span className="relative">View Leaderboard</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pt-2 w-full">
          {/* Easy Card */}
          <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-left flex flex-col hover:border-blue-500 hover:ring-1 hover:ring-blue-500/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-inter)] text-white">First Timer</h3>
                <span className="text-blue-400 text-sm font-medium uppercase tracking-wider">Easy Mode</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] mt-1"></div>
            </div>
            <p className="text-zinc-400 text-sm mb-8 flex-grow">
              Rami is in a good mood tonight. He&apos;s still selective — but he&apos;s willing to give you a chance.
            </p>
            <Link
              href="/game?difficulty=easy"
              className="w-full text-center py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium uppercase tracking-widest rounded transition-colors"
            >
              Step Up
            </Link>
          </div>

          {/* Normal Card */}
          <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-left flex flex-col hover:border-purple-500 hover:ring-1 hover:ring-purple-500/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-inter)] text-white">Regular Night</h3>
                <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Normal Mode</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] mt-1"></div>
            </div>
            <p className="text-zinc-400 text-sm mb-8 flex-grow">
              This is Rami on a typical evening. Unimpressed, watchful, and not in the mood for nonsense.
            </p>
            <Link
              href="/game?difficulty=normal"
              className="w-full text-center py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium uppercase tracking-widest rounded transition-colors"
            >
              Step Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
