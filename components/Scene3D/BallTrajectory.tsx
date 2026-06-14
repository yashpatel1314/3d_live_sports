'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, CatmullRomCurve3 } from 'three';
import type { ParsedPlay } from '@/lib/types';

// 1 unit ≈ 3.33 ft
// basketZ: -12.5 for home end, +12.5 for away end

function playerPosition(play: ParsedPlay, basketZ: number): Vector3 {
  const dist = (play.distance ?? 8) / 3.33;
  const dir = basketZ < 0 ? 1 : -1; // toward center court
  const type = play.type;

  if (type === 'FREE_THROW') return new Vector3(0, 0, basketZ + dir * 4.5);
  if (type === 'DUNK' || type === 'ALLEY_OOP' || type === 'PUTBACK') return new Vector3(0.3, 0, basketZ + dir * 0.5);
  if (type === 'LAYUP') return new Vector3(1.5, 0, basketZ + dir * 1.5);

  const offset = Math.min(dist, 13);
  const angle = (Math.random() - 0.5) * Math.PI * 0.5;
  return new Vector3(Math.sin(angle) * offset * 0.4, 0, basketZ + dir * offset);
}

function buildArc(start: Vector3, basket: Vector3, type: string, made: boolean): CatmullRomCurve3 {
  const mid = new Vector3().addVectors(start, basket).multiplyScalar(0.5);

  let peakHeight: number;
  if (type === 'THREE_POINTER') peakHeight = 6.5;
  else if (type === 'FADEAWAY') peakHeight = 5.5;
  else if (type === 'DUNK' || type === 'ALLEY_OOP') peakHeight = 5.0;
  else if (type === 'FREE_THROW') peakHeight = 4.5;
  else peakHeight = 4.8;

  mid.y = Math.max(start.y, basket.y) + peakHeight;

  const startPt = new Vector3(start.x, start.y + 2.2, start.z);

  if (!made) {
    // Ball clips the rim edge and deflects away — visually obvious miss
    const rimOffsetX = Math.random() > 0.5 ? 0.52 : -0.52;
    // Deflect toward center court after rim hit
    const bounceDir = basket.z < 0 ? 1 : -1;
    const rimHit = new Vector3(basket.x + rimOffsetX, basket.y + 0.1, basket.z);
    const deflect = new Vector3(
      basket.x + rimOffsetX * 1.8,
      basket.y - 1.7,
      basket.z + bounceDir * 1.6,
    );
    return new CatmullRomCurve3([startPt, mid, rimHit, deflect]);
  }

  return new CatmullRomCurve3([startPt, mid, new Vector3(basket.x, basket.y, basket.z)]);
}

interface BallProps {
  play: ParsedPlay | null;
  progress: number;
  basketZ?: number;
}

export function Ball({ play, progress, basketZ = -12.5 }: BallProps) {
  const meshRef = useRef<Mesh>(null);

  const curve = useMemo(() => {
    if (!play) return null;
    const start = playerPosition(play, basketZ);
    const basket = new Vector3(0, 3.05, basketZ);
    return buildArc(start, basket, play.type, play.made);
  }, [play, basketZ]);

  useFrame(() => {
    if (!meshRef.current) return;
    if (!play || !curve) { meshRef.current.visible = false; return; }
    meshRef.current.visible = true;
    const t = Math.min(Math.max(progress, 0), 1);
    meshRef.current.position.copy(curve.getPoint(t));
    // Faster spin after rim contact on misses
    const spinMult = !play.made && progress > 0.8 ? 2.5 : 1;
    meshRef.current.rotation.x += 0.08 * spinMult;
    meshRef.current.rotation.z += 0.04 * spinMult;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.12, 20, 20]} />
      <meshStandardMaterial color="#F46E22" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

export function ArcPreview({ play, opacity = 1, basketZ = -12.5 }: { play: ParsedPlay | null; opacity?: number; basketZ?: number }) {
  const points = useMemo(() => {
    if (!play) return [];
    const start = playerPosition(play, basketZ);
    const basket = new Vector3(0, 3.05, basketZ);
    const curve = buildArc(start, basket, play.type, play.made);
    return curve.getPoints(48);
  }, [play, basketZ]);

  if (!play || points.length === 0) return null;

  // Miss: red dots. Make: white dots.
  const dotColor = play.made ? '#ffffff' : '#ff4422';

  return (
    <group>
      {points.filter((_, i) => i % 2 === 0).map((pt, i) => (
        <mesh key={i} position={[pt.x, pt.y, pt.z]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color={dotColor} opacity={opacity * 0.32} transparent />
        </mesh>
      ))}
    </group>
  );
}
