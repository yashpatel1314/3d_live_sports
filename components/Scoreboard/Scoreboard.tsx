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
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: 'rgba(7, 7, 26, 0.82)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}
    >
      {/* Team color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${awayTeam.color}e0, ${homeTeam.color}e0)` }}
      />

      <div className="px-4 pt-3.5 pb-3">
        {/* Main row: away — clock — home */}
        <div className="flex items-center gap-3">
          {/* Away */}
          <TeamHud team={awayTeam} side="left" />

          {/* Clock */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="text-[11px] font-semibold text-white/36 tracking-wide">
              {status.isComplete ? 'FINAL' : status.isActive ? `Q${status.period}` : 'Upcoming'}
            </div>
            {status.isActive ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-base font-mono font-semibold text-white/88 tabular-nums">
                  {status.displayClock}
                </span>
              </div>
            ) : (
              <span className="text-white/20 text-xs">{status.description}</span>
            )}
          </div>

          {/* Home */}
          <TeamHud team={homeTeam} side="right" />
        </div>

        {/* Latest play — compact single line */}
        <AnimatePresence>
          {latestPlay?.rawText && (
            <motion.div
              key={latestPlay.rawText}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mt-2.5 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {latestPlay.points > 0 && (
                    <span
                      className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ color: '#FF6B00', background: 'rgba(255,107,0,0.14)' }}
                    >
                      +{latestPlay.points}
                    </span>
                  )}
                  <p className="text-white/46 text-[11px] truncate">{latestPlay.rawText}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TeamHud({ team, side }: { team: GameData['homeTeam']; side: 'left' | 'right' }) {
  const isRight = side === 'right';
  return (
    <div className={`flex items-center gap-2.5 ${isRight ? 'flex-row-reverse' : ''}`}>
      {/* Logo mark */}
      <div
        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
        style={{ background: `${team.color}1e`, border: `1.5px solid ${team.color}44` }}
      >
        {team.logo ? (
          <Image src={team.logo} alt={team.abbreviation} width={26} height={26} className="object-contain" />
        ) : (
          <span className="text-[13px] font-black" style={{ color: team.color }}>
            {team.abbreviation.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Name + score */}
      <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-semibold text-white/36 tracking-wider uppercase">
          {team.abbreviation}
        </span>
        <AnimatedScore score={team.score} teamColor={team.color} side={side} />
      </div>
    </div>
  );
}
