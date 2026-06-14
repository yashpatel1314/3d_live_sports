'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Scoreboard } from '@/components/Scoreboard/Scoreboard';
import { PlayFeed } from '@/components/PlayFeed/PlayFeed';
import { useGameData } from '@/hooks/useGameData';
import { useDemoMode } from '@/hooks/useDemoMode';
import type { ParsedPlay, GameData } from '@/lib/types';

const BasketballScene = dynamic(
  () => import('@/components/Scene3D/BasketballScene').then((m) => m.BasketballScene),
  { ssr: false, loading: () => <ScenePlaceholder /> }
);

function ScenePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-white/28 text-sm">Loading 3D court…</p>
      </div>
    </div>
  );
}

interface GameViewProps {
  gameId: string;
}

export function GameView({ gameId }: GameViewProps) {
  const isDemo = gameId === 'demo';
  const liveData = useGameData(isDemo ? null : gameId);
  const demoData = useDemoMode(isDemo);

  const game: GameData | null = isDemo ? demoData.game : liveData.game;
  const plays: ParsedPlay[] = isDemo ? demoData.plays : liveData.plays;
  const latestPlay: ParsedPlay | null = isDemo ? demoData.latestPlay : liveData.latestPlay;

  const [activePlay, setActivePlay] = useState<ParsedPlay | null>(null);
  const [playQueue, setPlayQueue] = useState<ParsedPlay[]>([]);
  const [animating, setAnimating] = useState(false);
  const [showPlayBanner, setShowPlayBanner] = useState(false);

  useEffect(() => {
    if (latestPlay && latestPlay.type !== 'UNKNOWN' && latestPlay.type !== 'MISS') {
      setPlayQueue((q) => [...q, latestPlay]);
    }
  }, [latestPlay]);

  useEffect(() => {
    if (animating || playQueue.length === 0) return;
    const [next, ...rest] = playQueue;
    setPlayQueue(rest);
    setActivePlay(next);
    setAnimating(true);
    setShowPlayBanner(true);
    const t = setTimeout(() => setShowPlayBanner(false), 3200);
    return () => clearTimeout(t);
  }, [animating, playQueue]);

  const handleAnimComplete = useCallback(() => {
    setAnimating(false);
    setTimeout(() => setActivePlay(null), 800);
  }, []);

  const isHomePlay = game ? latestPlay?.teamId === game.homeTeam.id : false;
  const teamColor = isHomePlay
    ? (game?.homeTeam.color ?? '#FF6B00')
    : (game?.awayTeam.color ?? '#1D428A');

  if (!game && !isDemo && liveData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/36">Loading game…</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-white/40">Game not found</p>
        <Link href="/" className="text-orange-400 hover:text-orange-300 text-sm">← Back to games</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav bar */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/36 hover:text-white/70 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Games
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          {isDemo && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase"
              style={{
                color: '#FF6B00',
                background: 'rgba(255,107,0,0.1)',
                border: '1px solid rgba(255,107,0,0.22)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Demo
            </div>
          )}
          {!isDemo && game.status.isActive && (
            <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 px-4 pb-4 min-h-0">
        {/* Left: scoreboard + 3D court (court is hero) */}
        <div className="flex flex-col gap-3 min-h-0">
          <Scoreboard game={game} latestPlay={latestPlay} />

          {/* Court container — overlay-based */}
          <div
            className="relative flex-1 rounded-2xl overflow-hidden"
            style={{ minHeight: 'clamp(340px, 48vh, 580px)', height: 'clamp(340px, 48vh, 580px)' }}
          >
            <BasketballScene
              play={activePlay}
              teamColor={teamColor}
              homeTeamId={game?.homeTeam.id}
              onAnimComplete={handleAnimComplete}
            />

            {/* Play announcement — broadcast bottom overlay */}
            <AnimatePresence>
              {showPlayBanner && activePlay && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ type: 'spring', stiffness: 440, damping: 36 }}
                  className="absolute bottom-4 left-4 right-4 pointer-events-none"
                >
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{
                      background: `linear-gradient(135deg, rgba(7,7,26,0.88) 0%, ${teamColor}26 100%)`,
                      backdropFilter: 'blur(16px) saturate(1.4)',
                      WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
                      border: `1px solid ${teamColor}40`,
                    }}
                  >
                    {/* Type accent bar */}
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: teamColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-base font-bold leading-tight"
                        style={{ color: 'rgba(255,255,255,0.95)' }}
                      >
                        {PLAY_ANNOUNCE[activePlay.type] ?? 'Big Play!'}
                      </p>
                      {activePlay.rawText && (
                        <p className="text-[11px] text-white/44 mt-0.5 truncate">{activePlay.rawText}</p>
                      )}
                    </div>
                    {activePlay.distance && activePlay.distance >= 20 && (
                      <div
                        className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg tabular-nums"
                        style={{ color: teamColor, background: `${teamColor}18` }}
                      >
                        {activePlay.distance} ft
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: play-by-play */}
        <div
          className="rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <PlayFeed plays={plays} highlightPlay={latestPlay} />
        </div>
      </div>
    </div>
  );
}

const PLAY_ANNOUNCE: Record<string, string> = {
  THREE_POINTER: 'Bang! Three-pointer!',
  FADEAWAY: 'Fadeaway bucket',
  DUNK: 'Slam dunk!',
  ALLEY_OOP: 'Alley-oop!',
  LAYUP: 'Layup — good',
  FREE_THROW: 'Free throw — good',
  JUMPER: 'Jumper connects',
  HOOK_SHOT: 'Hook shot',
  PUTBACK: 'Putback slam',
};
