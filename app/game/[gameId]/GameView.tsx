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

// Lazy load 3D scene (no SSR)
const BasketballScene = dynamic(
  () => import('@/components/Scene3D/BasketballScene').then((m) => m.BasketballScene),
  { ssr: false, loading: () => <ScenePlaceholder /> }
);

function ScenePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-orange-500/40 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading 3D court…</p>
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

  // Queue new plays
  useEffect(() => {
    if (latestPlay && latestPlay.type !== 'UNKNOWN' && latestPlay.type !== 'MISS') {
      setPlayQueue((q) => [...q, latestPlay]);
    }
  }, [latestPlay]);

  // Drain queue
  useEffect(() => {
    if (animating || playQueue.length === 0) return;
    const [next, ...rest] = playQueue;
    setPlayQueue(rest);
    setActivePlay(next);
    setAnimating(true);
    setShowPlayBanner(true);

    const bannerTimer = setTimeout(() => setShowPlayBanner(false), 3000);
    return () => clearTimeout(bannerTimer);
  }, [animating, playQueue]);

  const handleAnimComplete = useCallback(() => {
    setAnimating(false);
    // Keep play visible briefly then clear
    setTimeout(() => setActivePlay(null), 800);
  }, []);

  const teamColor = latestPlay?.teamId === 'home'
    ? (game?.homeTeam.color ?? '#FF6B00')
    : (game?.awayTeam.color ?? '#1D428A');

  if (!game && !isDemo && liveData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/40">Loading game data…</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-white/40 text-xl">Game not found</p>
        <Link href="/" className="text-orange-400 hover:text-orange-300 underline">← Back to games</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link href="/" className="text-white/40 hover:text-white/80 transition-colors text-sm flex items-center gap-1">
          ← Games
        </Link>
        {isDemo && (
          <div className="ml-auto flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            DEMO MODE
          </div>
        )}
        {!isDemo && game.status.isActive && (
          <div className="ml-auto flex items-center gap-1.5 bg-red-600/80 text-white text-xs font-bold px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 px-4 pb-4 min-h-0">
        {/* Left: 3D scene + scoreboard */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Scoreboard */}
          <Scoreboard game={game} latestPlay={latestPlay} />

          {/* Play announcement banner */}
          <AnimatePresence>
            {showPlayBanner && activePlay && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="rounded-xl px-4 py-3 text-center font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${teamColor}33, ${teamColor}15)`,
                  border: `1px solid ${teamColor}50`,
                  textShadow: `0 0 20px ${teamColor}`,
                }}
              >
                <span className="text-2xl mr-2">{PLAY_ANNOUNCE_EMOJI[activePlay.type] ?? '🏀'}</span>
                <span className="text-lg">{PLAY_ANNOUNCE[activePlay.type] ?? 'Big Play!'}</span>
                {activePlay.distance && activePlay.distance >= 20 && (
                  <span className="ml-2 text-sm opacity-70">from {activePlay.distance} feet!</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D court */}
          <div className="flex-1 rounded-2xl overflow-hidden min-h-[350px] lg:min-h-0" style={{ height: 'clamp(350px, 50vh, 600px)' }}>
            <BasketballScene
              play={activePlay}
              teamColor={teamColor}
              onAnimComplete={handleAnimComplete}
            />
          </div>
        </div>

        {/* Right: play-by-play feed */}
        <div
          className="rounded-2xl p-4 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <PlayFeed plays={plays} highlightPlay={latestPlay} />
        </div>
      </div>
    </div>
  );
}

const PLAY_ANNOUNCE: Record<string, string> = {
  THREE_POINTER: 'BANG! Three Ball!',
  FADEAWAY: 'Fadeaway Bucket!',
  DUNK: 'SLAM DUNK!',
  ALLEY_OOP: 'ALLEY-OOP!',
  LAYUP: 'And the Layup!',
  FREE_THROW: 'Free Throw — Good!',
  JUMPER: 'Jumper Connects!',
  HOOK_SHOT: 'Hook Shot!',
  PUTBACK: 'Putback Slam!',
};

const PLAY_ANNOUNCE_EMOJI: Record<string, string> = {
  THREE_POINTER: '🔥',
  FADEAWAY: '🌀',
  DUNK: '💥',
  ALLEY_OOP: '🚀',
  LAYUP: '🏃',
  FREE_THROW: '🎯',
  JUMPER: '🏀',
  HOOK_SHOT: '🪝',
  PUTBACK: '💪',
};
