'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GameData } from '@/lib/types';

export function GameCard({ game, index }: { game: GameData; index: number }) {
  const { homeTeam, awayTeam, status } = game;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link href={`/game/${game.id}`}>
        <div
          className="group relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/25"
          style={{
            background: 'linear-gradient(135deg, #0f0f20 0%, #1a1a30 100%)',
          }}
        >
          {/* Color accent */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${homeTeam.color}15 0%, transparent 70%)`,
            }}
          />

          {/* Live badge */}
          {status.isActive && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-red-600/90 rounded-full px-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live</span>
            </div>
          )}
          {status.isComplete && (
            <div className="absolute top-3 right-3 z-10 bg-white/10 rounded-full px-2 py-0.5">
              <span className="text-white/60 text-[10px] font-semibold uppercase">Final</span>
            </div>
          )}

          <div className="relative z-10 p-4">
            {/* Status line */}
            <div className="text-center text-white/40 text-[10px] uppercase tracking-widest mb-3 font-semibold">
              {status.description || 'NBA'}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-2">
              {/* Away */}
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${awayTeam.color}20`, border: `2px solid ${awayTeam.color}40` }}
                >
                  {awayTeam.logo ? (
                    <Image src={awayTeam.logo} alt={awayTeam.abbreviation} width={42} height={42} className="object-contain" />
                  ) : (
                    <span className="text-xl font-black" style={{ color: awayTeam.color }}>
                      {awayTeam.abbreviation.slice(0, 2)}
                    </span>
                  )}
                </div>
                <span className="text-white/70 text-xs font-semibold">{awayTeam.abbreviation}</span>
                <span className="text-white text-3xl font-black">{awayTeam.score}</span>
              </div>

              {/* Separator */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-white/20 text-sm font-bold">@</span>
                <span className="text-white/30 text-[10px]">
                  {status.isActive ? `Q${status.period}` : ''}
                </span>
              </div>

              {/* Home */}
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${homeTeam.color}20`, border: `2px solid ${homeTeam.color}40` }}
                >
                  {homeTeam.logo ? (
                    <Image src={homeTeam.logo} alt={homeTeam.abbreviation} width={42} height={42} className="object-contain" />
                  ) : (
                    <span className="text-xl font-black" style={{ color: homeTeam.color }}>
                      {homeTeam.abbreviation.slice(0, 2)}
                    </span>
                  )}
                </div>
                <span className="text-white/70 text-xs font-semibold">{homeTeam.abbreviation}</span>
                <span className="text-white text-3xl font-black">{homeTeam.score}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-white/50 group-hover:text-white/80 transition-colors">
                <span>Watch 3D</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
