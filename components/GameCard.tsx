'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { GameData } from '@/lib/types';

export function GameCard({ game, index }: { game: GameData; index: number }) {
  const { homeTeam, awayTeam, status } = game;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/game/${game.id}`}>
        <div
          className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Team color gradient on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${homeTeam.color}18 0%, transparent 65%)`,
            }}
          />

          {/* Color bar — team gradient */}
          <div
            className="h-px w-full"
            style={{ background: `linear-gradient(90deg, ${awayTeam.color}cc, ${homeTeam.color}cc)` }}
          />

          {/* Status badge */}
          <div className="absolute top-3 right-3 z-10">
            {status.isActive && (
              <div className="flex items-center gap-1.5 bg-red-600/90 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-bold tracking-wide">LIVE</span>
              </div>
            )}
            {status.isComplete && (
              <div
                className="rounded-full px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <span className="text-white/50 text-[10px] font-semibold">FINAL</span>
              </div>
            )}
          </div>

          <div className="relative z-10 p-5">
            {/* Quarter / status */}
            {status.isActive && (
              <p className="text-center text-white/32 text-[11px] font-mono mb-4">
                Q{status.period} · {status.displayClock}
              </p>
            )}

            {/* Teams + scores */}
            <div className="flex items-center justify-between">
              <TeamColumn team={awayTeam} />
              <span className="text-white/18 text-sm font-medium">@</span>
              <TeamColumn team={homeTeam} align="right" />
            </div>

            {/* CTA */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-white/30 group-hover:text-white/60 transition-colors duration-200">
              <span>Watch in 3D</span>
              <svg className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function TeamColumn({ team, align = 'left' }: { team: GameData['homeTeam']; align?: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col items-${align === 'right' ? 'end' : 'start'} gap-1.5`}>
      {/* Logo */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center"
        style={{
          background: `${team.color}18`,
          border: `1.5px solid ${team.color}38`,
        }}
      >
        {team.logo ? (
          <Image src={team.logo} alt={team.abbreviation} width={32} height={32} className="object-contain" />
        ) : (
          <span className="text-base font-black" style={{ color: team.color }}>
            {team.abbreviation.slice(0, 2)}
          </span>
        )}
      </div>
      <span className="text-white/55 text-xs font-semibold">{team.abbreviation}</span>
      <span
        className="text-[2rem] font-black leading-none tabular-nums"
        style={{ color: 'rgba(255,255,255,0.92)' }}
      >
        {team.score}
      </span>
    </div>
  );
}
