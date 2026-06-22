'use client';
import { useState, useEffect, useRef } from 'react';
import type { GameData, ParsedPlay } from '@/lib/types';
import { parsePlay } from '@/lib/play-parser';

interface GameDataResult {
  game: GameData | null;
  plays: ParsedPlay[];
  latestPlay: ParsedPlay | null;
  loading: boolean;
}

export function useGameData(gameId: string | null, demo?: boolean): GameDataResult {
  const [game, setGame] = useState<GameData | null>(null);
  const [plays, setPlays] = useState<ParsedPlay[]>([]);
  const [latestPlay, setLatestPlay] = useState<ParsedPlay | null>(null);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!gameId || demo) {
      setLoading(false);
      return;
    }

    async function poll() {
      try {
        const res = await fetch(`/api/game/${gameId}`);
        const data = await res.json();

        if (data.game) setGame(data.game);

        if (data.plays && Array.isArray(data.plays)) {
          const rawPlays = data.plays as Array<{
            id: string;
            text: string;
            team?: { id: string };
            clock?: { displayValue: string };
            period?: { number: number };
          }>;

          const parsed: ParsedPlay[] = [];
          let newest: ParsedPlay | null = null;

          for (const p of rawPlays) {
            if (!p.text) continue;
            const play = parsePlay(p.text, p.team?.id, p.clock?.displayValue, p.period?.number);
            parsed.push(play);
            if (!seenIds.current.has(p.id)) {
              seenIds.current.add(p.id);
              if (!newest) newest = play;
            }
          }

          setPlays(parsed);
          if (newest) setLatestPlay(newest);
        }
      } catch (e) {
        console.error('Poll error:', e);
      } finally {
        setLoading(false);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 15000);
    return () => clearInterval(intervalRef.current);
  }, [gameId, demo]);

  return { game, plays, latestPlay, loading };
}

export function useScoreboard() {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/scoreboard');
        const data = await res.json();
        setGames(data.games ?? []);
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return { games, loading };
}
