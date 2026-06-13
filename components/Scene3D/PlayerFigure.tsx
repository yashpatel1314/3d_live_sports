'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshStandardMaterial } from 'three';
import type { ParsedPlay } from '@/lib/types';

interface PlayerFigureProps {
  play: ParsedPlay | null;
  progress: number; // 0..1
  color?: string;
  position?: [number, number, number];
}

// Low-poly humanoid figure built from Three.js primitives
export function PlayerFigure({ play, progress, color = '#FF6B00', position = [0, 0, 0] }: PlayerFigureProps) {
  const rootRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const rUpperArmRef = useRef<Group>(null);
  const rForeArmRef = useRef<Group>(null);
  const lUpperArmRef = useRef<Group>(null);
  const lForeArmRef = useRef<Group>(null);
  const rThighRef = useRef<Group>(null);
  const lThighRef = useRef<Group>(null);
  const rCalfRef = useRef<Group>(null);
  const lCalfRef = useRef<Group>(null);

  useFrame(() => {
    if (!rootRef.current) return;
    const p = progress;
    const type = play?.type;

    // Reset
    if (torsoRef.current) torsoRef.current.rotation.set(0, 0, 0);
    if (rUpperArmRef.current) rUpperArmRef.current.rotation.set(0, 0, 0);
    if (rForeArmRef.current) rForeArmRef.current.rotation.set(0, 0, 0);
    if (lUpperArmRef.current) lUpperArmRef.current.rotation.set(0, 0, 0);
    if (rThighRef.current) rThighRef.current.rotation.set(0, 0, 0);
    if (lThighRef.current) lThighRef.current.rotation.set(0, 0, 0);
    if (rCalfRef.current) rCalfRef.current.rotation.set(0, 0, 0);
    if (lCalfRef.current) lCalfRef.current.rotation.set(0, 0, 0);

    if (!play) {
      // Idle breathing
      const breathe = Math.sin(Date.now() * 0.002) * 0.02;
      if (torsoRef.current) torsoRef.current.scale.y = 1 + breathe;
      return;
    }

    if (type === 'DUNK' || type === 'ALLEY_OOP') {
      // 0..0.3: crouch, 0.3..0.6: jump + arm up, 0.6..1: slam
      const jumpPhase = Math.max(0, (p - 0.3) / 0.3);
      const slamPhase = Math.max(0, (p - 0.6) / 0.4);
      rootRef.current.position.y = position[1] + Math.sin(Math.min(jumpPhase, 1) * Math.PI) * 2.5;

      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.8 * Math.min(jumpPhase * 2, 1);
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.5 * Math.min(jumpPhase * 2, 1);
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.5 * slamPhase;
      if (rThighRef.current) rThighRef.current.rotation.x = 0.4 * (1 - jumpPhase);
      if (lThighRef.current) lThighRef.current.rotation.x = 0.4 * (1 - jumpPhase);
    } else if (type === 'FADEAWAY') {
      // Lean backward while shooting
      const shootPhase = Math.min(p * 2, 1);
      const leanPhase = Math.max(0, (p - 0.4) / 0.6);
      if (torsoRef.current) torsoRef.current.rotation.x = Math.PI * 0.2 * leanPhase;
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.9 * shootPhase;
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.4 * shootPhase;
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.5 * shootPhase;
      rootRef.current.position.y = position[1] + Math.sin(p * Math.PI) * 0.8;
    } else if (type === 'THREE_POINTER' || type === 'JUMPER') {
      // Standard jump shot
      const shootPhase = Math.min(p * 1.5, 1);
      rootRef.current.position.y = position[1] + Math.sin(Math.min(p * 1.2, 1) * Math.PI) * 1.2;
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.85 * shootPhase;
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.35 * shootPhase;
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.5 * shootPhase;
      if (rThighRef.current) rThighRef.current.rotation.x = 0.3 * (1 - shootPhase);
    } else if (type === 'LAYUP') {
      // Driving layup — extend one arm
      rootRef.current.position.y = position[1] + Math.sin(Math.min(p * 1.5, 1) * Math.PI) * 1.5;
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.9 * p;
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.2 * p;
      if (torsoRef.current) torsoRef.current.rotation.z = -0.15;
    } else if (type === 'FREE_THROW') {
      // Measured, clean shot
      if (rUpperArmRef.current) rUpperArmRef.current.rotation.x = -Math.PI * 0.8 * Math.min(p * 2, 1);
      if (rForeArmRef.current) rForeArmRef.current.rotation.x = -Math.PI * 0.3 * Math.min(p * 2, 1);
      if (lUpperArmRef.current) lUpperArmRef.current.rotation.x = -Math.PI * 0.4 * Math.min(p * 2, 1);
    } else if (type === 'HOOK_SHOT') {
      // Side arm hook
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = -Math.PI * 0.7 * p;
        rUpperArmRef.current.rotation.z = Math.PI * 0.4 * p;
      }
      if (torsoRef.current) torsoRef.current.rotation.z = 0.2 * p;
    }
  });

  const mat = useMemo(() => {
    const m = new MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
    return m;
  }, [color]);

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
          {/* Right forearm */}
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
          {/* Left forearm */}
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
            {/* Shoe */}
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
