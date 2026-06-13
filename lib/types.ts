export type PlayType =
  | 'THREE_POINTER'
  | 'FADEAWAY'
  | 'DUNK'
  | 'ALLEY_OOP'
  | 'LAYUP'
  | 'FREE_THROW'
  | 'JUMPER'
  | 'HOOK_SHOT'
  | 'PUTBACK'
  | 'MISS'
  | 'UNKNOWN';

export interface ParsedPlay {
  type: PlayType;
  distance?: number;
  playerName?: string;
  made: boolean;
  rawText: string;
  clock?: string;
  period?: number;
  teamId?: string;
  points: number;
}

export interface TeamInfo {
  id: string;
  displayName: string;
  abbreviation: string;
  color: string;
  alternateColor: string;
  logo: string;
  score: number;
  homeAway: 'home' | 'away';
}

export interface GameStatus {
  period: number;
  displayClock: string;
  isActive: boolean;
  isComplete: boolean;
  description: string;
}

export interface GameData {
  id: string;
  name: string;
  shortName: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: GameStatus;
  sport: 'basketball';
}

export interface EspnPlay {
  id: string;
  text: string;
  period: { number: number };
  clock: { displayValue: string };
  scoringPlay: boolean;
  homeScore?: string;
  awayScore?: string;
  team?: { id: string };
  type?: { id: string; text: string };
}

export interface AnimationState {
  active: boolean;
  play: ParsedPlay | null;
  teamColor: string;
}
