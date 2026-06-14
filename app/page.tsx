'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useScoreboard } from '@/hooks/useGameData';
import { GameCard } from '@/components/GameCard';

const ease = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  const { games, loading } = useScoreboard();

  const liveGames = games.filter((g) => g.status.isActive);
  const otherGames = games.filter((g) => !g.status.isActive);

  return (
    <main className="min-h-screen px-5 py-10 max-w-5xl mx-auto">
      {/* Wordmark */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="mb-12 text-center"
      >
        <p className="text-[11px] font-semibold tracking-[0.2em] text-orange-500/70 uppercase mb-3">
          NBA · Real-time · 3D
        </p>
        <h1 className="text-[clamp(2.4rem,7vw,4.5rem)] font-black text-white tracking-tight leading-none" style={{ textWrap: 'balance' } as React.CSSProperties}>
          3D Live Sports
        </h1>
        <p className="text-white/40 text-base mt-4 max-w-[38ch] mx-auto leading-relaxed">
          Live scores and 3D play animations — every dunk, every three-pointer, right when it happens.
        </p>
      </motion.header>

      {/* Demo CTA */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease }}
        className="mb-10"
      >
        <Link href="/game/demo">
          <div
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, #0d0d22 0%, #180a00 60%, #0d0d22 100%)',
              border: '1px solid rgba(255,107,0,0.18)',
            }}
          >
            {/* Floor glow */}
            <div
              className="absolute inset-0 transition-opacity duration-500 opacity-50 group-hover:opacity-90"
              style={{
                background: 'radial-gradient(ellipse at 50% 120%, rgba(255,107,0,0.22) 0%, transparent 65%)',
              }}
            />
            {/* Subtle court-line texture */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 48px)',
              }}
            />

            <div className="relative z-10 p-7 flex items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-400/90 text-sm font-semibold">Demo Mode</span>
                </div>
                <h2 className="text-[1.35rem] font-bold text-white mb-1.5">
                  See the 3D court in action
                </h2>
                <p className="text-white/38 text-sm leading-relaxed max-w-[42ch]">
                  Dunks, 3-pointers, fadeaways — live-rendered without a real game.
                </p>
              </div>

              {/* Play button */}
              <div
                className="shrink-0 w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  width: 52, height: 52,
                  border: '1px solid rgba(255,107,0,0.3)',
                  background: 'rgba(255,107,0,0.06)',
                }}
              >
                <svg
                  className="w-5 h-5 text-orange-400 translate-x-px transition-transform duration-300 group-hover:translate-x-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Games */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div
            className="w-9 h-9 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin"
            style={{ animationTimingFunction: 'linear' }}
          />
          <p className="text-white/28 text-sm">Loading live games…</p>
        </div>
      ) : (
        <>
          {liveGames.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-9"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold text-red-400">Live now</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveGames.map((game, i) => (
                  <GameCard key={game.id} game={game} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {otherGames.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-white/34 font-medium mb-5">Today's games</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherGames.map((game, i) => (
                  <GameCard key={game.id} game={game} index={liveGames.length + i} />
                ))}
              </div>
            </motion.section>
          )}

          {games.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/28 text-base mb-2">No games scheduled today</p>
              <p className="text-white/18 text-sm">
                Try the demo above to see the 3D animations
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
