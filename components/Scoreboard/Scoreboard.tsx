'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { AnimatedScore } from './AnimatedScore';
import type { GameData, ParsedPlay } from '@/lib/types';

interface ScoreboardProps {
  game: GameData;
  latestPlay: ParsedPlay | null;
}

export function Scoreboard({ game, latestPlay }: ScoreboardProps) {
  const { homeTeam, awayTeam, status } = game;

  return (
    <div className="relative w-full">
      {/* Main scoreboard */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{
          background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${awayTeam.color}, ${homeTeam.color})`,
          }}
        />

        <div className="px-4 py-3">
          {/* Period + clock */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/50">
              {status.isComplete ? 'FINAL' : status.isActive ? `Q${status.period}` : 'Upcoming'}
            </div>
            {status.isActive && (
              <>
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <div className="text-sm font-mono text-white/70">{status.displayClock}</div>
              </>
            )}
          </div>

          {/* Teams + scores */}
          <div className="flex items-center justify-between gap-4">
            {/* Away team */}
            <TeamBlock team={awayTeam} side="left" />

            {/* VS separator */}
            <div className="flex flex-col items-center">
              <div className="text-white/20 text-xs font-bold">VS</div>
            </div>

            {/* Home team */}
            <TeamBlock team={homeTeam} side="right" />
          </div>
        </div>

        {/* Latest play banner */}
        <AnimatePresence>
          {latestPlay && latestPlay.rawText && (
            <motion.div
              key={latestPlay.rawText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="px-4 pb-3"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
                <span className="text-xs mr-2">{PLAY_EMOJI[latestPlay.type] ?? '🏀'}</span>
                <span className="text-white/80 text-xs">{latestPlay.rawText}</span>
                {latestPlay.points > 0 && (
                  <span
                    className="ml-2 font-bold text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#FF6B0030', color: '#FF6B00' }}
                  >
                    +{latestPlay.points}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TeamBlock({ team, side }: { team: GameData['homeTeam']; side: 'left' | 'right' }) {
  return (
    <div className={`flex-1 flex ${side === 'left' ? 'flex-row' : 'flex-row-reverse'} items-center gap-3`}>
      {/* Logo */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${team.color}22`, border: `2px solid ${team.color}44` }}
      >
        {team.logo ? (
          <Image src={team.logo} alt={team.abbreviation} width={36} height={36} className="object-contain" />
        ) : (
          <span className="text-lg font-black" style={{ color: team.color }}>
            {team.abbreviation.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Name + score */}
      <div className={`flex flex-col ${side === 'left' ? 'items-start' : 'items-end'}`}>
        <div className="text-white/50 text-xs uppercase tracking-wider font-semibold">
          {team.abbreviation}
        </div>
        <AnimatedScore score={team.score} teamColor={team.color} side={side} />
        <div className="text-white/30 text-xs">{team.homeAway === 'home' ? 'Home' : 'Away'}</div>
      </div>
    </div>
  );
}

const PLAY_EMOJI: Record<string, string> = {
  THREE_POINTER: '🔥',
  FADEAWAY: '🏀',
  DUNK: '💥',
  ALLEY_OOP: '🚀',
  LAYUP: '🏀',
  FREE_THROW: '🎯',
  JUMPER: '🏀',
  HOOK_SHOT: '🪝',
  PUTBACK: '💪',
  MISS: '😮',
  UNKNOWN: '🏀',
};
