'use client';
import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { BasketballCourt } from './Court';
import { PlayerFigure } from './PlayerFigure';
import { Ball, ArcPreview } from './BallTrajectory';
import { ScoreParticles } from './ScoreParticles';
import type { ParsedPlay } from '@/lib/types';

const ANIM_DURATION = 2.5;

// Returns the shooter's z position in world space, relative to the target basket
function getShooterZ(play: ParsedPlay, basketZ: number): number {
  const dir = basketZ < 0 ? 1 : -1; // direction from basket toward center
  const type = play.type;
  if (type === 'DUNK' || type === 'ALLEY_OOP' || type === 'PUTBACK') return basketZ + dir * 0.5;
  if (type === 'LAYUP') return basketZ + dir * 1.5;
  if (type === 'FREE_THROW') return basketZ + dir * 4.5;
  const dist = (play.distance ?? 12) / 3.33;
  return basketZ + dir * Math.min(dist, 12);
}

interface SceneContentProps {
  play: ParsedPlay | null;
  teamColor: string;
  onAnimComplete: () => void;
  basketZ: number; // -12.5 = home end, +12.5 = away end
}

function SceneContent({ play, teamColor, onAnimComplete, basketZ }: SceneContentProps) {
  const [progress, setProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const elapsed = useRef(0);
  const animating = useRef(false);
  const lastPlay = useRef<ParsedPlay | null>(null);

  // Camera position target
  const cameraRef = useRef<Vector3>(new Vector3(0, 12, 20));
  // LookAt: two refs so we can lerp smoothly between sides
  const lookAtTarget = useRef<Vector3>(new Vector3(0, 2, -8));
  const lookAtCurrent = useRef<Vector3>(new Vector3(0, 2, -8));

  useEffect(() => {
    if (!play || play === lastPlay.current) return;
    lastPlay.current = play;
    elapsed.current = 0;
    animating.current = true;
    setProgress(0);
    setShowParticles(false);

    // Which side of the court this play is on
    const isAway = basketZ > 0;
    // zSign: which direction from basket toward center (+1 for home end, -1 for away end)
    const zSign = isAway ? -1 : 1;

    // Smoothly pan lookAt to whichever basket we're watching
    lookAtTarget.current.set(0, 2, isAway ? 8 : -8);

    // Set camera position based on play type (always on center-court side of the action)
    if (play.type === 'DUNK' || play.type === 'ALLEY_OOP') {
      cameraRef.current.set(3, 6, zSign * 6);
    } else if (play.type === 'THREE_POINTER') {
      const dist = (play.distance ?? 26) / 3.33;
      cameraRef.current.set(4, 7, basketZ + zSign * (dist + 4));
    } else if (play.type === 'FADEAWAY') {
      cameraRef.current.set(5, 8, zSign * 3);
    } else if (play.type === 'FREE_THROW') {
      cameraRef.current.set(3, 6, zSign * 5);
    } else {
      cameraRef.current.set(4, 8, zSign * 2);
    }
  }, [play, basketZ]);

  useFrame((state, delta) => {
    if (animating.current) {
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
    }

    // Smooth camera position and lookAt
    state.camera.position.lerp(cameraRef.current, 0.025);
    lookAtCurrent.current.lerp(lookAtTarget.current, 0.04);
    state.camera.lookAt(
      lookAtCurrent.current.x,
      lookAtCurrent.current.y,
      lookAtCurrent.current.z,
    );
  });

  const shooterZ = play ? getShooterZ(play, basketZ) : 0;
  const playerColor = teamColor.startsWith('#') ? teamColor : `#${teamColor}`;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 15, -5]} intensity={0.4} color="#FFE0A0" />
      {/* Basket lights on both ends */}
      <pointLight position={[0, 15, -12.5]} intensity={0.6} color="#FFD080" />
      <pointLight position={[0, 15, 12.5]} intensity={0.6} color="#FFD080" />

      <BasketballCourt />

      <PlayerFigure
        play={play}
        progress={progress}
        color={playerColor}
        position={[0, 0, shooterZ]}
        basketZ={basketZ}
      />

      <Ball play={play} progress={progress} basketZ={basketZ} />
      <ArcPreview play={play} opacity={1 - progress} basketZ={basketZ} />
      <ScoreParticles active={showParticles} teamColor={playerColor} />

      <fog attach="fog" args={['#0a0a1a', 30, 80]} />
    </>
  );
}

interface BasketballSceneProps {
  play: ParsedPlay | null;
  teamColor?: string;
  homeTeamId?: string; // if play.teamId matches this, use home basket (z=-12.5), else away (z=+12.5)
  onAnimComplete?: () => void;
}

export function BasketballScene({ play, teamColor = '#FF6B00', homeTeamId, onAnimComplete }: BasketballSceneProps) {
  const handleComplete = useCallback(() => onAnimComplete?.(), [onAnimComplete]);

  // Home team scores at z=-12.5 end; away team scores at z=+12.5 end
  const basketZ =
    homeTeamId && play?.teamId && play.teamId !== homeTeamId ? 12.5 : -12.5;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 12, 20], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(180deg, #0a0a1e 0%, #0d1a0d 100%)' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            play={play}
            teamColor={teamColor}
            onAnimComplete={handleComplete}
            basketZ={basketZ}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.05}
          makeDefault={false}
        />
      </Canvas>
    </div>
  );
}
