import { GameView } from './GameView';

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return <GameView gameId={gameId} />;
}
