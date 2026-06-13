import { NextResponse } from 'next/server';
import { fetchGameSummary, fetchScoreboard } from '@/lib/espn-api';

export const revalidate = 10;

export async function GET(_req: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  try {
    const [plays, games] = await Promise.all([
      fetchGameSummary(gameId),
      fetchScoreboard(),
    ]);
    const game = games.find((g) => g.id === gameId) ?? null;
    return NextResponse.json({ plays, game });
  } catch (e) {
    console.error('Game fetch error:', e);
    return NextResponse.json({ plays: [], game: null }, { status: 200 });
  }
}
