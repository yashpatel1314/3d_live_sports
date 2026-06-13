import type { GameData, TeamInfo, EspnPlay } from './types';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

function buildTeam(competitor: Record<string, unknown>): TeamInfo {
  const team = competitor.team as Record<string, string>;
  return {
    id: String(competitor.id ?? team.id ?? ''),
    displayName: team.displayName ?? team.name ?? '',
    abbreviation: team.abbreviation ?? '',
    color: `#${team.color ?? '1a1a1a'}`,
    alternateColor: `#${team.alternateColor ?? '333333'}`,
    logo: team.logo ?? '',
    score: parseInt(String(competitor.score ?? '0'), 10) || 0,
    homeAway: (competitor.homeAway as 'home' | 'away') ?? 'home',
  };
}

export async function fetchScoreboard(): Promise<GameData[]> {
  const res = await fetch(`${ESPN_BASE}/basketball/nba/scoreboard`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error('ESPN scoreboard fetch failed');
  const json = await res.json();

  const events = (json.events ?? []) as Record<string, unknown>[];
  return events.map((event) => {
    const competition = ((event.competitions as unknown[])?.[0] ?? {}) as Record<string, unknown>;
    const competitors = (competition.competitors as Record<string, unknown>[]) ?? [];
    const homeComp = competitors.find((c) => c.homeAway === 'home') ?? competitors[0] ?? {};
    const awayComp = competitors.find((c) => c.homeAway === 'away') ?? competitors[1] ?? {};

    const status = (event.status as Record<string, unknown>) ?? {};
    const statusType = (status.type as Record<string, unknown>) ?? {};

    return {
      id: String(event.id ?? ''),
      name: String(event.name ?? ''),
      shortName: String(event.shortName ?? event.name ?? ''),
      homeTeam: buildTeam(homeComp),
      awayTeam: buildTeam(awayComp),
      status: {
        period: Number(status.period ?? 0),
        displayClock: String(status.displayClock ?? ''),
        isActive: statusType.name === 'STATUS_IN_PROGRESS',
        isComplete: statusType.name === 'STATUS_FINAL',
        description: String(statusType.shortDetail ?? statusType.description ?? ''),
      },
      sport: 'basketball' as const,
    };
  });
}

export async function fetchGameSummary(gameId: string): Promise<EspnPlay[]> {
  const res = await fetch(`${ESPN_BASE}/basketball/nba/summary?event=${gameId}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error('ESPN summary fetch failed');
  const json = await res.json();

  const plays: EspnPlay[] = [];
  const playByPlay = json.plays ?? [];
  for (const p of playByPlay) {
    if (p.text) plays.push(p as EspnPlay);
  }
  return plays.reverse(); // newest first
}
