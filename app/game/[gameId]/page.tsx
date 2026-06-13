import { GameView } from './GameView';
import { use } from 'react';

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  return <GameView gameId={gameId} />;
}
