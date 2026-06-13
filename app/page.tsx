'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useScoreboard } from '@/hooks/useGameData';
import { GameCard } from '@/components/GameCard';

export default function HomePage() {
  const { games, loading } = useScoreboard();

  const liveGames = games.filter((g) => g.status.isActive);
  const otherGames = games.filter((g) => !g.status.isActive);

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-4xl">🏀</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            3D Live Sports
          </h1>
        </div>
        <p className="text-white/50 text-lg mt-2">
          Real-time scores · 3D play animations · You feel like you're there
        </p>
      </motion.div>

      {/* Demo mode CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Link href="/game/demo">
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/40 p-5 cursor-pointer group hover:border-orange-500/80 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 group-hover:from-orange-500/20 group-hover:to-yellow-500/20 transition-all duration-300" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🎮</span>
                  <h2 className="text-white font-bold text-lg">Try Demo Mode</h2>
                </div>
                <p className="text-white/50 text-sm">
                  See 3D animations live — dunks, 3-pointers, fadeaways — no real game needed
                </p>
              </div>
              <div className="text-orange-400 text-2xl group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Live games */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading live games…</p>
        </div>
      ) : (
        <>
          {liveGames.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Now
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveGames.map((game, i) => (
                  <GameCard key={game.id} game={game} index={i} />
                ))}
              </div>
            </section>
          )}

          {otherGames.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4">
                Today's Games
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherGames.map((game, i) => (
                  <GameCard key={game.id} game={game} index={liveGames.length + i} />
                ))}
              </div>
            </section>
          )}

          {games.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/30 text-lg mb-2">No games today</p>
              <p className="text-white/20 text-sm">Try the demo mode above to see the 3D animations</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
