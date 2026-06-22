'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, CatmullRomCurve3 } from 'three';
import type { ParsedPlay } from '@/lib/types';

// 1 unit ≈ 3.33 ft
// basketZ: -12.5 home end, +12.5 away end

// Maps p into [0,1] over the window [start, end]
const ph = (p: number, s: number, e: number) =>
  Math.max(0, Math.min(1, (p - s) / (e - s)));

// Fraction of animation at which the ball leaves the shooting hand
function getReleaseT(type: string): number {
  if (type === 'DUNK' || type === 'ALLEY_OOP') return 0.64;
  if (type === 'LAYUP') return 0.66;
  if (type === 'FREE_THROW') return 0.52;
  if (type === 'FADEAWAY') return 0.48;
  return 0.54;
}

// Jump height at progress p — mirrors PlayerFigure.tsx exactly so ball stays on player
function getJumpY(type: string, p: number): number {
  if (type === 'DUNK' || type === 'ALLEY_OOP')
    return Math.sin(ph(p, 0.22, 0.88) * Math.PI) * 2.8;
  if (type === 'THREE_POINTER' || type === 'JUMPER')
    return Math.sin(ph(p, 0.18, 0.92) * Math.PI) * 1.6;
  if (type === 'FADEAWAY')
    return Math.sin(ph(p, 0, 1) * Math.PI) * 1.3;
  if (type === 'LAYUP')
    return Math.sin(ph(p, 0.35, 0.88) * Math.PI) * 2.0;
  if (type === 'FREE_THROW')
    return Math.sin(ph(p, 0.3, 0.85) * Math.PI) * 0.22;
  if (type === 'PUTBACK')
    return Math.sin(ph(p, 0, 0.45) * Math.PI) * 1.8;
  return Math.sin(ph(p, 0.1, 0.78) * Math.PI) * 1.2;
}

// Approximate world position of shooting hand at progress p.
// faceSign: HOME (basketZ<0) player's local +x = world -x → faceSign=-1
//           AWAY (basketZ>0) player's local +x = world +x → faceSign=+1
function getHandPos(
  type: string,
  p: number,
  groundPos: Vector3,
  basketZ: number,
): Vector3 {
  const releaseT = getReleaseT(type);
  const lift = Math.min(p / releaseT, 1);
  const faceSign = basketZ < 0 ? -1 : 1;
  const rootY = groundPos.y + getJumpY(type, p);

  let xS: number, xE: number, yS: number, yE: number, zOff: number;

  if (type === 'DUNK' || type === 'ALLEY_OOP') {
    // Both hands meet overhead
    xS = 0.12; xE = 0.05;
    yS = 1.25; yE = 3.2;
    zOff = 0.15;
  } else if (type === 'LAYUP') {
    xS = 0.40; xE = 0.15;
    yS = 1.10; yE = 2.8;
    zOff = 0.22;
  } else if (type === 'HOOK_SHOT') {
    xS = 0.45; xE = 0.55;
    yS = 1.10; yE = 2.4;
    zOff = 0.10;
  } else {
    // Jump shot / free throw / fadeaway / putback
    xS = 0.42; xE = 0.30;
    yS = 1.10; yE = 2.4;
    zOff = 0.18;
  }

  return new Vector3(
    groundPos.x + faceSign * (xS + (xE - xS) * lift),
    rootY + yS + (yE - yS) * lift,
    groundPos.z + faceSign * zOff,
  );
}

function playerGroundPosition(play: ParsedPlay, basketZ: number): Vector3 {
  const dist = (play.distance ?? 8) / 3.33;
  const dir = basketZ < 0 ? 1 : -1;
  const type = play.type;

  if (type === 'FREE_THROW') return new Vector3(0, 0, basketZ + dir * 4.5);
  if (type === 'DUNK' || type === 'ALLEY_OOP' || type === 'PUTBACK')
    return new Vector3(0.3, 0, basketZ + dir * 0.5);
  if (type === 'LAYUP') return new Vector3(1.5, 0, basketZ + dir * 1.5);

  const offset = Math.min(dist, 13);
  const angle = (Math.random() - 0.5) * Math.PI * 0.5;
  return new Vector3(Math.sin(angle) * offset * 0.4, 0, basketZ + dir * offset);
}

function buildArc(
  releasePos: Vector3,
  basket: Vector3,
  type: string,
  made: boolean,
): CatmullRomCurve3 {
  const mid = new Vector3().addVectors(releasePos, basket).multiplyScalar(0.5);

  let peak: number;
  if (type === 'THREE_POINTER') peak = 6.5;
  else if (type === 'FADEAWAY') peak = 5.5;
  else if (type === 'DUNK' || type === 'ALLEY_OOP') peak = 5.0;
  else if (type === 'FREE_THROW') peak = 4.5;
  else peak = 4.8;

  mid.y = Math.max(releasePos.y, basket.y) + peak;

  if (!made) {
    const rimX = Math.random() > 0.5 ? 0.52 : -0.52;
    const bDir = basket.z < 0 ? 1 : -1;
    return new CatmullRomCurve3([
      releasePos,
      mid,
      new Vector3(basket.x + rimX, basket.y + 0.1, basket.z),
      new Vector3(basket.x + rimX * 1.8, basket.y - 1.7, basket.z + bDir * 1.6),
    ]);
  }
  return new CatmullRomCurve3([releasePos, mid, new Vector3(basket.x, basket.y, basket.z)]);
}

interface BallProps {
  play: ParsedPlay | null;
  progress: number;
  basketZ?: number;
  playerPos?: [number, number, number];
}

export function Ball({ play, progress, basketZ = -12.5, playerPos = [0, 0, 0] }: BallProps) {
  const groupRef = useRef<Group>(null);

  const groundPos = useMemo(
    () => new Vector3(playerPos[0], playerPos[1], playerPos[2]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerPos[0], playerPos[1], playerPos[2]],
  );

  const { curve, releaseT } = useMemo(() => {
    if (!play) return { curve: null, releaseT: 0.54 };
    const rt = getReleaseT(play.type);
    const rPos = getHandPos(play.type, rt, groundPos, basketZ);
    const basket = new Vector3(0, 3.05, basketZ);
    return { curve: buildArc(rPos, basket, play.type, play.made), releaseT: rt };
  }, [play, basketZ, groundPos]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (!play) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;

    const t = Math.max(0, Math.min(progress, 1));

    if (t <= releaseT) {
      // Ball held in shooting hand — track hand world position
      const pos = getHandPos(play.type, t, groundPos, basketZ);
      groupRef.current.position.copy(pos);
      groupRef.current.rotation.x += 0.02;
    } else {
      // Ball in flight on arc
      if (!curve) return;
      const ft = (t - releaseT) / Math.max(1 - releaseT, 0.001);
      groupRef.current.position.copy(curve.getPoint(Math.min(ft, 1)));
      const spinMult = !play.made && progress > 0.8 ? 2.5 : 1;
      groupRef.current.rotation.x += 0.08 * spinMult;
      groupRef.current.rotation.z += 0.04 * spinMult;
    }
  });

  // NBA basketball: orange sphere + 3 black seam rings
  return (
    <group ref={groupRef} castShadow>
      <mesh castShadow>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#E8621A" roughness={0.78} metalness={0.05} />
      </mesh>
      {/* Seam rings — one equatorial, two longitudinal */}
      <mesh>
        <torusGeometry args={[0.221, 0.009, 8, 40]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.221, 0.009, 8, 40]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.221, 0.009, 8, 40]} />
        <meshStandardMaterial color="#111111" roughness={1} />
      </mesh>
    </group>
  );
}

export function ArcPreview({
  play,
  opacity = 1,
  basketZ = -12.5,
  playerPos = [0, 0, 0] as [number, number, number],
}: {
  play: ParsedPlay | null;
  opacity?: number;
  basketZ?: number;
  playerPos?: [number, number, number];
}) {
  const points = useMemo(() => {
    if (!play) return [];
    const gPos = new Vector3(playerPos[0], playerPos[1], playerPos[2]);
    const rt = getReleaseT(play.type);
    const rPos = getHandPos(play.type, rt, gPos, basketZ);
    const basket = new Vector3(0, 3.05, basketZ);
    return buildArc(rPos, basket, play.type, play.made).getPoints(48);
  }, [play, basketZ, playerPos]);

  if (!play || points.length === 0) return null;
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
