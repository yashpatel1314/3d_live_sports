import { NextResponse } from 'next/server';
import { fetchScoreboard } from '@/lib/espn-api';

export const revalidate = 15;

export async function GET() {
  try {
    const games = await fetchScoreboard();
    return NextResponse.json({ games });
  } catch (e) {
    console.error('Scoreboard error:', e);
    return NextResponse.json({ games: [] }, { status: 200 });
  }
}
