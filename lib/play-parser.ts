import type { ParsedPlay, PlayType } from './types';

const DISTANCE_RE = /from (\d+) feet/i;
const PLAYER_RE = /^([A-Z][a-z]+ [A-Z][a-z']+(?:[-\s][A-Z][a-z]+)*)/;

function extractDistance(text: string): number | undefined {
  const m = text.match(DISTANCE_RE);
  return m ? parseInt(m[1], 10) : undefined;
}

function extractPlayer(text: string): string | undefined {
  const m = text.match(PLAYER_RE);
  return m ? m[1] : undefined;
}

function detectPlayType(text: string): PlayType {
  const t = text.toLowerCase();

  if (t.includes('alley-oop') || t.includes('alley oop')) return 'ALLEY_OOP';
  if (t.includes('slam dunk') || t.includes('driving dunk') || (t.includes('dunk') && !t.includes('misses'))) return 'DUNK';
  if (t.includes('fadeaway') || t.includes('fade-away')) return 'FADEAWAY';
  if (t.includes('hook shot') || t.includes('hook jumper')) return 'HOOK_SHOT';
  if (t.includes('3-point') || t.includes('three-point') || t.includes('three pointer')) return 'THREE_POINTER';
  if (t.includes('driving layup') || t.includes('finger roll') || t.includes('layup')) return 'LAYUP';
  if (t.includes('free throw')) return 'FREE_THROW';
  if (t.includes('putback') || t.includes('put-back') || t.includes('tip-in') || t.includes('tip in')) return 'PUTBACK';
  if (t.includes('jump shot') || t.includes('jumper') || t.includes('pull-up')) return 'JUMPER';
  if (t.includes('misses')) return 'MISS';
  return 'UNKNOWN';
}

function detectMade(text: string): boolean {
  const t = text.toLowerCase();
  if (t.includes('misses') || t.includes('missed')) return false;
  if (t.includes('makes') || t.includes('made') || t.includes('hits') || t.includes('good')) return true;
  return false;
}

function pointsForType(type: PlayType, made: boolean): number {
  if (!made) return 0;
  if (type === 'THREE_POINTER') return 3;
  if (type === 'FREE_THROW') return 1;
  return 2;
}

export function parsePlay(text: string, teamId?: string, clock?: string, period?: number): ParsedPlay {
  const type = detectPlayType(text);
  const made = detectMade(text);

  return {
    type,
    distance: extractDistance(text),
    playerName: extractPlayer(text),
    made,
    rawText: text,
    clock,
    period,
    teamId,
    points: pointsForType(type, made),
  };
}

// Demo plays for when no live games are active
export const DEMO_PLAYS: Array<{ text: string; delay: number }> = [
  { text: 'Stephen Curry makes a 3-point jump shot from 28 feet out', delay: 0 },
  { text: 'LeBron James makes a driving slam dunk', delay: 4000 },
  { text: 'Jayson Tatum makes a fadeaway jumper from 19 feet out', delay: 8000 },
  { text: 'Ja Morant makes an alley-oop slam dunk', delay: 12000 },
  { text: 'Giannis Antetokounmpo misses a layup', delay: 16000 },
  { text: 'Kevin Durant makes a pull-up jump shot from 22 feet out', delay: 20000 },
  { text: 'Joel Embiid makes a hook shot from 8 feet out', delay: 24000 },
  { text: 'Nikola Jokic makes a 3-point jump shot from 24 feet out', delay: 28000 },
  { text: 'Devin Booker makes a driving layup', delay: 32000 },
  { text: 'Anthony Davis makes a putback slam dunk', delay: 36000 },
];
