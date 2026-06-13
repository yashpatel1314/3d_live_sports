'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import { BasketballCourt } from './Court';
import { PlayerFigure } from './PlayerFigure';
import { Ball, ArcPreview } from './BallTrajectory';
import { ScoreParticles } from './ScoreParticles';
import type { ParsedPlay } from '@/lib/types';

const ANIM_DURATION = 2.5; // seconds

interface SceneContentProps {
  play: ParsedPlay | null;
  teamColor: string;
  onAnimComplete: () => void;
}

function SceneContent({ play, teamColor, onAnimComplete }: SceneContentProps) {
  const [progress, setProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const elapsed = useRef(0);
  const animating = useRef(false);
  const lastPlay = useRef<ParsedPlay | null>(null);
  const { camera } = useThree();

  // Camera target per play type
  useEffect(() => {
    if (!play || play === lastPlay.current) return;
    lastPlay.current = play;
    elapsed.current = 0;
    animating.current = true;
    setProgress(0);
    setShowParticles(false);
  }, [play]);

  useFrame((_, delta) => {
    if (!animating.current) return;

    elapsed.current += delta;
    const p = Math.min(elapsed.current / ANIM_DURATION, 1);
    setProgress(p);

    if (p >= 0.85 && play?.made && !showParticles) {
      setShowParticles(true);
    }

    if (p >= 1) {
      animating.current = false;
      onAnimComplete();
    }
  });

  // Dynamic camera positioning
  useFrame(() => {
    if (!play) {
      // Default: angled overview
      camera.position.lerp(new Vector3(0, 12, 20), 0.02);
      camera.lookAt(0, 0, 0);
      return;
    }

    let target: Vector3;
    if (play.type === 'DUNK' || play.type === 'ALLEY_OOP') {
      target = new Vector3(3, 6, -6);
    } else if (play.type === 'THREE_POINTER') {
      const dist = (play.distance ?? 26) / 3.33;
      target = new Vector3(4, 7, -12.5 + dist + 4);
    } else if (play.type === 'FADEAWAY') {
      target = new Vector3(5, 8, -3);
    } else if (play.type === 'FREE_THROW') {
      target = new Vector3(3, 6, -5);
    } else {
      target = new Vector3(4, 8, -2);
    }

    camera.position.lerp(target, 0.025);
    camera.lookAt(0, 2, -8);
  });

  const playerColor = teamColor.startsWith('#') ? teamColor : `#${teamColor}`;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-10, 15, -5]} intensity={0.4} color="#FFE0A0" />
      <pointLight position={[0, 15, -12.5]} intensity={0.8} color="#FFD080" />

      <BasketballCourt />

      <PlayerFigure
        play={play}
        progress={progress}
        color={playerColor}
        position={[0, 0, play ? getPlayerZ(play) : 0]}
      />

      <Ball play={play} progress={progress} />
      <ArcPreview play={play} opacity={1 - progress} />

      <ScoreParticles active={showParticles} teamColor={playerColor} />

      {/* Distance label */}
      {play?.distance && play.distance >= 20 && (
        <Html position={[2, 4, getPlayerZ(play) + 0.5]} center>
          <div className="bg-black/80 text-white text-sm font-bold px-3 py-1 rounded-full border border-orange-500 shadow-lg whitespace-nowrap">
            📏 {play.distance} ft
          </div>
        </Html>
      )}

      {/* Play type label */}
      {play && (
        <Html position={[0, 7, -5]} center>
          <div className="text-center pointer-events-none">
            <div className="bg-black/70 text-white text-xs font-semibold px-4 py-1 rounded-full border border-white/20 uppercase tracking-widest">
              {PLAY_LABELS[play.type] ?? play.type}
            </div>
          </div>
        </Html>
      )}

      <fog attach="fog" args={['#0a0a1a', 30, 80]} />
    </>
  );
}

const PLAY_LABELS: Record<string, string> = {
  THREE_POINTER: '3-Pointer',
  FADEAWAY: 'Fadeaway Jumper',
  DUNK: 'Slam Dunk',
  ALLEY_OOP: 'Alley-Oop',
  LAYUP: 'Driving Layup',
  FREE_THROW: 'Free Throw',
  JUMPER: 'Mid-Range Jumper',
  HOOK_SHOT: 'Hook Shot',
  PUTBACK: 'Putback Slam',
  MISS: 'Missed Shot',
};

function getPlayerZ(play: ParsedPlay): number {
  const type = play.type;
  if (type === 'DUNK' || type === 'ALLEY_OOP' || type === 'PUTBACK') return -12;
  if (type === 'LAYUP') return -11;
  if (type === 'FREE_THROW') return -8;
  const dist = (play.distance ?? 12) / 3.33;
  return -12.5 + Math.min(dist, 12.5);
}

interface BasketballSceneProps {
  play: ParsedPlay | null;
  teamColor?: string;
  onAnimComplete?: () => void;
}

export function BasketballScene({ play, teamColor = '#FF6B00', onAnimComplete }: BasketballSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(180deg, #0a0a1e 0%, #0d1a0d 100%)' }}
      >
        <PerspectiveCamera makeDefault position={[0, 12, 20]} fov={55} />
        <Suspense fallback={null}>
          <SceneContent
            play={play}
            teamColor={teamColor}
            onAnimComplete={onAnimComplete ?? (() => {})}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
