'use client';
import { useState, useEffect, useRef } from 'react';
import { parsePlay, DEMO_PLAYS } from '@/lib/play-parser';
import type { ParsedPlay, GameData } from '@/lib/types';

const DEMO_GAME: GameData = {
  id: 'demo',
  name: 'Golden State Warriors at Boston Celtics',
  shortName: 'GSW @ BOS',
  homeTeam: {
    id: '2',
    displayName: 'Boston Celtics',
    abbreviation: 'BOS',
    color: '#007A33',
    alternateColor: '#BA9653',
    logo: '',
    score: 78,
    homeAway: 'home',
  },
  awayTeam: {
    id: '9',
    displayName: 'Golden State Warriors',
    abbreviation: 'GSW',
    color: '#1D428A',
    alternateColor: '#FFC72C',
    logo: '',
    score: 74,
    homeAway: 'away',
  },
  status: {
    period: 3,
    displayClock: '4:22',
    isActive: true,
    isComplete: false,
    description: 'Q3 4:22',
  },
  sport: 'basketball',
};

export function useDemoMode(enabled: boolean) {
  const [game, setGame] = useState<GameData>(DEMO_GAME);
  const [plays, setPlays] = useState<ParsedPlay[]>([]);
  const [latestPlay, setLatestPlay] = useState<ParsedPlay | null>(null);
  const playIndex = useRef(0);
  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!enabled) return;

    function scheduleNext(index: number) {
      if (index >= DEMO_PLAYS.length) {
        // Loop
        const t = setTimeout(() => {
          playIndex.current = 0;
          setGame(DEMO_GAME);
          setPlays([]);
          scheduleNext(0);
        }, 5000);
        timers.current.push(t);
        return;
      }

      const { text, delay } = DEMO_PLAYS[index];
      const nextDelay = index === 0 ? 500 : DEMO_PLAYS[index].delay - DEMO_PLAYS[index - 1].delay;

      const t = setTimeout(() => {
        const parsed = parsePlay(text, index % 2 === 0 ? 'away' : 'home');
        setLatestPlay(parsed);
        setPlays((prev) => [parsed, ...prev].slice(0, 50));

        // Update score
        if (parsed.points > 0) {
          setGame((g) => {
            const isHome = parsed.teamId === 'home';
            return {
              ...g,
              homeTeam: isHome ? { ...g.homeTeam, score: g.homeTeam.score + parsed.points } : g.homeTeam,
              awayTeam: !isHome ? { ...g.awayTeam, score: g.awayTeam.score + parsed.points } : g.awayTeam,
            };
          });
        }

        scheduleNext(index + 1);
      }, nextDelay);

      timers.current.push(t);
      playIndex.current = index;
    }

    scheduleNext(0);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [enabled]);

  return { game, plays, latestPlay };
}
