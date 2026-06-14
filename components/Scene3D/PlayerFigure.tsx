'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial } from 'three';
import type { ParsedPlay } from '@/lib/types';

interface PlayerFigureProps {
  play: ParsedPlay | null;
  progress: number;
  color?: string;
  position?: [number, number, number];
  basketZ?: number;
}

// Maps p into [0,1] over the window [start, end]
const ph = (p: number, start: number, end: number) =>
  Math.max(0, Math.min(1, (p - start) / (end - start)));

export function PlayerFigure({
  play,
  progress,
  color = '#FF6B00',
  position = [0, 0, 0],
  basketZ = -12.5,
}: PlayerFigureProps) {
  const rootRef    = useRef<Group>(null);
  const torsoRef   = useRef<Group>(null);
  const rUpperArmRef = useRef<Group>(null);
  const rForeArmRef  = useRef<Group>(null);
  const lUpperArmRef = useRef<Group>(null);
  const lForeArmRef  = useRef<Group>(null);
  const rThighRef  = useRef<Group>(null);
  const lThighRef  = useRef<Group>(null);
  const rCalfRef   = useRef<Group>(null);
  const lCalfRef   = useRef<Group>(null);

  useFrame(() => {
    if (!rootRef.current) return;
    const p = progress;
    const type = play?.type;

    // Face the basket
    rootRef.current.rotation.y = basketZ < 0 ? Math.PI : 0;
    rootRef.current.position.y = position[1];

    // Reset joints each frame
    if (torsoRef.current) torsoRef.current.rotation.set(0, 0, 0);
    if (rUpperArmRef.current) rUpperArmRef.current.rotation.set(0, 0, 0);
    if (rForeArmRef.current) rForeArmRef.current.rotation.set(0, 0, 0);
    if (lUpperArmRef.current) lUpperArmRef.current.rotation.set(0, 0, 0);
    if (lForeArmRef.current) lForeArmRef.current.rotation.set(0, 0, 0);
    if (rThighRef.current) rThighRef.current.rotation.set(0, 0, 0);
    if (lThighRef.current) lThighRef.current.rotation.set(0, 0, 0);
    if (rCalfRef.current) rCalfRef.current.rotation.set(0, 0, 0);
    if (lCalfRef.current) lCalfRef.current.rotation.set(0, 0, 0);

    if (!play) {
      const breathe = Math.sin(Date.now() * 0.002) * 0.02;
      if (torsoRef.current) torsoRef.current.scale.y = 1 + breathe;
      return;
    }

    if (type === 'DUNK' || type === 'ALLEY_OOP') {
      // Crouch → explosive jump → both arms straight overhead → slam
      const crouchP = ph(p, 0, 0.22);
      const jumpP   = ph(p, 0.22, 0.55);
      const peakP   = ph(p, 0.55, 0.72);
      const slamP   = ph(p, 0.70, 0.88);
      const airP    = ph(p, 0.22, 0.88);

      rootRef.current.position.y = position[1] + Math.sin(airP * Math.PI) * 2.8;

      // Both arms swing from behind into full overhead extension
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = crouchP * 0.35 - Math.PI * jumpP;
        rUpperArmRef.current.rotation.y = -0.18 * peakP;
      }
      if (lUpperArmRef.current) {
        lUpperArmRef.current.rotation.x = crouchP * 0.35 - Math.PI * 0.88 * jumpP;
        lUpperArmRef.current.rotation.y = 0.18 * peakP;
      }
      // Slam: forearms snap down at the basket
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.22 * slamP;
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = -Math.PI * 0.18 * slamP;

      // Legs fold up during hang time
      if (rThighRef.current) rThighRef.current.rotation.x = 0.5 * crouchP - 0.65 * peakP;
      if (lThighRef.current) lThighRef.current.rotation.x = 0.5 * crouchP - 0.65 * peakP;
      if (rCalfRef.current) rCalfRef.current.rotation.x = 0.85 * peakP;
      if (lCalfRef.current) lCalfRef.current.rotation.x = 0.85 * peakP;
      if (torsoRef.current) torsoRef.current.rotation.x = -0.14 * jumpP + 0.22 * slamP;

    } else if (type === 'THREE_POINTER' || type === 'JUMPER') {
      // Gather → jump → shooting arm rises → wrist-snap release → "cookie jar" follow-through
      const gatherP  = ph(p, 0, 0.22);
      const jumpP    = ph(p, 0.18, 0.50);
      const shootP   = ph(p, 0.28, 0.68);
      const followP  = ph(p, 0.62, 1.00);

      rootRef.current.position.y = position[1] + Math.sin(ph(p, 0.18, 0.92) * Math.PI) * 1.6;

      // Right (shooting) arm — elbow high, extend at release, hold follow-through
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.93 * shootP;
      if (rForeArmRef.current) {
        // elbow bends during raise, then snaps open at release
        rForeArmRef.current.rotation.x = -Math.PI * 0.48 * ph(p, 0.28, 0.55) + Math.PI * 0.18 * followP;
      }
      // Guide (left) arm supports ball on the way up, drops after release
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.5 * shootP * (1 - followP * 0.65);
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = -Math.PI * 0.28 * shootP * (1 - followP * 0.8);

      if (rThighRef.current) rThighRef.current.rotation.x = 0.38 * gatherP * (1 - jumpP);
      if (lThighRef.current) lThighRef.current.rotation.x = 0.28 * gatherP * (1 - jumpP);

    } else if (type === 'FADEAWAY') {
      // Jump shot with pronounced backward lean — body tilts away from basket
      const shootP = ph(p, 0.0, 0.62);
      const leanP  = ph(p, 0.30, 0.92);

      rootRef.current.position.y = position[1] + Math.sin(ph(p, 0, 1) * Math.PI) * 1.3;

      if (torsoRef.current) torsoRef.current.rotation.x = Math.PI * 0.30 * leanP; // lean back
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.90 * shootP;
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.42 * shootP;
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.50 * shootP;
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = -Math.PI * 0.20 * shootP;
      // Legs go forward as body leans back (classic fadeaway shape)
      if (rThighRef.current) rThighRef.current.rotation.x = -0.35 * leanP;
      if (lThighRef.current) lThighRef.current.rotation.x = -0.35 * leanP;

    } else if (type === 'LAYUP') {
      // Running approach: legs alternate, one arm reaches straight up
      const runP   = ph(p, 0, 0.40);
      const jumpP  = ph(p, 0.35, 0.70);
      const reachP = ph(p, 0.52, 0.88);
      const airP   = ph(p, 0.35, 0.88);

      rootRef.current.position.y = position[1] + Math.sin(airP * Math.PI) * 2.0;

      // Alternating leg stride during approach
      if (rThighRef.current) rThighRef.current.rotation.x = -0.52 * Math.sin(runP * Math.PI * 3.5) * (1 - jumpP);
      if (lThighRef.current) lThighRef.current.rotation.x = 0.52 * Math.sin(runP * Math.PI * 3.5) * (1 - jumpP);
      if (rCalfRef.current) rCalfRef.current.rotation.x = 0.38 * Math.abs(Math.sin(runP * Math.PI * 3.5)) * (1 - jumpP);
      if (lCalfRef.current) lCalfRef.current.rotation.x = 0.38 * Math.abs(Math.sin(runP * Math.PI * 3.5)) * (1 - jumpP);

      // Right arm extends fully overhead toward the basket for the finger-roll / lay
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * reachP;
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.10 * reachP;
      // Balance arm
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.40 * jumpP;
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = Math.PI * 0.18 * jumpP;

      if (torsoRef.current) torsoRef.current.rotation.z = -0.20 * jumpP; // slight lean toward basket

    } else if (type === 'FREE_THROW') {
      // No jump — measured bend-and-extend, clean follow-through
      const bendP = ph(p, 0, 0.35);
      const extP  = ph(p, 0.30, 0.72);
      const holdP = ph(p, 0.68, 1.0);

      rootRef.current.position.y = position[1] + Math.sin(ph(p, 0.3, 0.85) * Math.PI) * 0.22;

      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.88 * extP;
      // Forearm: starts slightly bent (elbow angled), then fully extends
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.45 * bendP + Math.PI * 0.28 * extP;
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.42 * extP * (1 - holdP * 0.55);
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = -Math.PI * 0.18 * extP;
      if (rThighRef.current) rThighRef.current.rotation.x = 0.18 * bendP * (1 - extP * 1.6);
      if (lThighRef.current) lThighRef.current.rotation.x = 0.14 * bendP * (1 - extP * 1.6);

    } else if (type === 'HOOK_SHOT') {
      // Body turns ~70° sideways, shooting arm sweeps up in wide hook arc
      const turnP  = ph(p, 0, 0.32);
      const sweepP = ph(p, 0.20, 0.78);
      const followP = ph(p, 0.72, 1.0);

      rootRef.current.position.y = position[1] + Math.sin(ph(p, 0.2, 0.82) * Math.PI) * 1.0;
      if (torsoRef.current) torsoRef.current.rotation.y = Math.PI * 0.40 * turnP; // turn sideways
      // Hook arm: sweeps up in wide arc (Z rotation moves arm out then up)
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = -Math.PI * 0.78 * sweepP;
        rUpperArmRef.current.rotation.z = Math.PI * 0.52 * sweepP * (1 - followP);
      }
      if (rForeArmRef.current) rForeArmRef.current.rotation.z = Math.PI * 0.32 * sweepP * (1 - followP);
      // Balance arm
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.22 * turnP;
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = Math.PI * 0.12 * turnP;
      if (rThighRef.current) rThighRef.current.rotation.x = 0.28 * sweepP;

    } else if (type === 'PUTBACK') {
      // Short explosive jump, both arms reaching straight up from close range
      const jumpP = ph(p, 0, 0.45);
      const grabP = ph(p, 0.22, 0.65);

      rootRef.current.position.y = position[1] + Math.sin(jumpP * Math.PI) * 1.8;
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.94 * grabP;
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.88 * grabP;
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.16 * grabP;
      if (lForeArmRef.current) lForeArmRef.current.rotation.x = -Math.PI * 0.14 * grabP;
      if (rThighRef.current) rThighRef.current.rotation.x = -0.50 * jumpP;
      if (lThighRef.current) lThighRef.current.rotation.x = -0.50 * jumpP;

    } else {
      // MISS / UNKNOWN — off-balance jumper, arm slightly wide
      const jumpP  = ph(p, 0.10, 0.48);
      const shootP = ph(p, 0.22, 0.65);

      rootRef.current.position.y = position[1] + Math.sin(ph(p, 0.1, 0.78) * Math.PI) * 1.2;
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = -Math.PI * 0.72 * shootP;
        rUpperArmRef.current.rotation.z = 0.22 * shootP; // arm slightly off — missed shot
      }
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.28 * shootP;
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.32 * shootP;
      if (torsoRef.current) torsoRef.current.rotation.z = 0.18 * jumpP; // off-balance lean
    }
  });

  const mat = useMemo(
    () => new MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 }),
    [color]
  );
  const skinMat = useMemo(
    () => new MeshStandardMaterial({ color: '#F5CBA7', roughness: 0.7 }),
    []
  );

  return (
    <group ref={rootRef} position={position}>
      {/* Head */}
      <mesh material={skinMat} position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>

      {/* Torso group */}
      <group ref={torsoRef} position={[0, 1.55, 0]}>
        <mesh material={mat} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.65, 12]} />
        </mesh>

        {/* Right upper arm */}
        <group ref={rUpperArmRef} position={[0.28, 0.22, 0]}>
          <mesh material={mat} position={[0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.36, 10]} />
          </mesh>
          <group ref={rForeArmRef} position={[0.37, 0, 0]}>
            <mesh material={skinMat} position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.058, 0.05, 0.32, 10]} />
            </mesh>
          </group>
        </group>

        {/* Left upper arm */}
        <group ref={lUpperArmRef} position={[-0.28, 0.22, 0]}>
          <mesh material={mat} position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.36, 10]} />
          </mesh>
          <group ref={lForeArmRef} position={[-0.37, 0, 0]}>
            <mesh material={skinMat} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.058, 0.05, 0.32, 10]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Hips */}
      <group position={[0, 1.18, 0]}>
        {/* Right leg */}
        <group ref={rThighRef} position={[0.12, 0, 0]}>
          <mesh material={mat} position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.44, 10]} />
          </mesh>
          <group ref={rCalfRef} position={[0, -0.46, 0]}>
            <mesh material={mat} position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.07, 0.38, 10]} />
            </mesh>
            <mesh position={[0, -0.42, 0.06]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.26]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          </group>
        </group>

        {/* Left leg */}
        <group ref={lThighRef} position={[-0.12, 0, 0]}>
          <mesh material={mat} position={[0, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.44, 10]} />
          </mesh>
          <group ref={lCalfRef} position={[0, -0.46, 0]}>
            <mesh material={mat} position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.07, 0.38, 10]} />
            </mesh>
            <mesh position={[0, -0.42, 0.06]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.26]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
