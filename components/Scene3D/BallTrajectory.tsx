'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, CatmullRomCurve3 } from 'three';
import type { ParsedPlay } from '@/lib/types';

// 1 unit ≈ 3.33 ft; basket at z = -12.5, y = 3.05
const BASKET = new Vector3(0, 3.05, -12.5);

function playerPosition(play: ParsedPlay): Vector3 {
  const dist = (play.distance ?? 8) / 3.33; // feet to units
  const type = play.type;

  if (type === 'FREE_THROW') return new Vector3(0, 0, -12.5 + 4.5);
  if (type === 'DUNK' || type === 'ALLEY_OOP' || type === 'PUTBACK') return new Vector3(0.3, 0, -12.5 + 0.5);
  if (type === 'LAYUP') return new Vector3(1.5, 0, -12.5 + 1.5);

  // For shots, use distance from basket
  const offset = Math.min(dist, 13);
  const angle = (Math.random() - 0.5) * Math.PI * 0.5; // slight lateral offset
  return new Vector3(Math.sin(angle) * offset * 0.4, 0, -12.5 + offset);
}

function buildArc(start: Vector3, end: Vector3, type: string): CatmullRomCurve3 {
  const mid = new Vector3().addVectors(start, end).multiplyScalar(0.5);
  let peakHeight: number;
  if (type === 'THREE_POINTER') peakHeight = 6.5;
  else if (type === 'FADEAWAY') peakHeight = 5.5;
  else if (type === 'DUNK' || type === 'ALLEY_OOP') peakHeight = 5.0;
  else if (type === 'FREE_THROW') peakHeight = 4.5;
  else peakHeight = 4.8;

  mid.y = Math.max(start.y, end.y) + peakHeight;

  return new CatmullRomCurve3([
    new Vector3(start.x, start.y + 2.2, start.z), // release point (approx hand height)
    mid,
    new Vector3(end.x, end.y, end.z),
  ]);
}

interface BallProps {
  play: ParsedPlay | null;
  progress: number; // 0..1
}

export function Ball({ play, progress }: BallProps) {
  const meshRef = useRef<Mesh>(null);
  const curve = useMemo(() => {
    if (!play) return null;
    const start = playerPosition(play);
    return buildArc(start, BASKET, play.type);
  }, [play]);

  useFrame(() => {
    if (!meshRef.current) return;

    if (!play || !curve) {
      meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;
    const t = Math.min(Math.max(progress, 0), 1);
    const pt = curve.getPoint(t);
    meshRef.current.position.copy(pt);
    // Spin the ball
    meshRef.current.rotation.x += 0.08;
    meshRef.current.rotation.z += 0.04;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.12, 20, 20]} />
      <meshStandardMaterial color="#F46E22" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

// Dotted arc path preview (fades in before ball launches)
export function ArcPreview({ play, opacity = 1 }: { play: ParsedPlay | null; opacity?: number }) {
  const points = useMemo(() => {
    if (!play) return [];
    const start = playerPosition(play);
    const curve = buildArc(start, BASKET, play.type);
    return curve.getPoints(40);
  }, [play]);

  if (!play || points.length === 0) return null;

  return (
    <group>
      {points.filter((_, i) => i % 2 === 0).map((pt, i) => (
        <mesh key={i} position={[pt.x, pt.y, pt.z]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#ffffff" opacity={opacity * 0.3} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Distance label
export function DistanceLabel({ play }: { play: ParsedPlay | null }) {
  if (!play?.distance || play.distance < 15) return null;

  const pos = playerPosition(play);

  return (
    <group position={[pos.x, pos.y + 2.8, pos.z]}>
      {/* Floating card — rendered via Html from drei in the parent */}
    </group>
  );
}
