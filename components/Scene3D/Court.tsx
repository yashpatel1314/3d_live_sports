'use client';
import { useRef } from 'react';
import { Mesh } from 'three';

// NBA court: 94ft × 50ft — scaled to 28.2 × 15 (1 unit ≈ 3.33 ft)
// Basket centers at z = ±12.5

export function BasketballCourt() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[15, 28.2]} />
        <meshStandardMaterial color="#C8882A" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.6, 64]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>

      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[15, 0.06]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>

      {/* Sideline borders */}
      <CourtLine position={[-7.45, 0.01, 0]} size={[0.06, 28.2]} />
      <CourtLine position={[7.45, 0.01, 0]} size={[0.06, 28.2]} />
      <CourtLine position={[0, 0.01, -14.05]} size={[15, 0.06]} />
      <CourtLine position={[0, 0.01, 14.05]} size={[15, 0.06]} />

      {/* Paint areas (keys) */}
      <PaintArea z={-10} />
      <PaintArea z={10} flip />

      {/* 3-point arcs */}
      <ThreePointArc z={-12.5} />
      <ThreePointArc z={12.5} flip />

      {/* Baskets */}
      <Basket position={[0, 0, -12.5]} />
      <Basket position={[0, 0, 12.5]} flip />

      {/* Wood floor grain lines */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -13 + i * 2]}>
          <planeGeometry args={[15, 0.02]} />
          <meshStandardMaterial color="#B07820" opacity={0.4} transparent />
        </mesh>
      ))}
    </group>
  );
}

function CourtLine({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
    </mesh>
  );
}

function PaintArea({ z, flip }: { z: number; flip?: boolean }) {
  const dir = flip ? 1 : -1;
  return (
    <group>
      {/* Painted rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, z + dir * 2]}>
        <planeGeometry args={[4.9, 5.8]} />
        <meshStandardMaterial color="#C85E20" opacity={0.35} transparent />
      </mesh>
      {/* Free throw circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z + dir * 4.5]}>
        <ringGeometry args={[1.79, 1.85, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      {/* Lane lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.45, 0.01, z + dir * 2]}>
        <planeGeometry args={[0.06, 5.8]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.45, 0.01, z + dir * 2]}>
        <planeGeometry args={[0.06, 5.8]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
    </group>
  );
}

function ThreePointArc({ z, flip }: { z: number; flip?: boolean }) {
  const dir = flip ? 1 : -1;
  // The 3-point arc radius ≈ 7.1 units (23.75ft / 3.33ft per unit)
  return (
    <group position={[0, 0.01, z]}>
      {/* Arc */}
      <mesh rotation={[-Math.PI / 2, flip ? 0 : Math.PI, 0]}>
        <ringGeometry args={[7.05, 7.12, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      {/* Corner 3-point lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.65, 0, dir * 2.65]}>
        <planeGeometry args={[0.06, 5.3]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.65, 0, dir * 2.65]}>
        <planeGeometry args={[0.06, 5.3]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
    </group>
  );
}

function Basket({ position, flip }: { position: [number, number, number]; flip?: boolean }) {
  const backboardZ = flip ? 1.0 : -1.0;
  const rimY = 3.05; // ~10ft / 3.33

  return (
    <group position={position}>
      {/* Backboard */}
      <mesh position={[0, rimY + 0.3, backboardZ]}>
        <boxGeometry args={[1.83, 1.07, 0.05]} />
        <meshStandardMaterial color="#ffffff" opacity={0.25} transparent />
      </mesh>
      {/* Backboard border */}
      <mesh position={[0, rimY + 0.3, backboardZ + 0.03]}>
        <boxGeometry args={[1.83, 1.07, 0.02]} />
        <meshStandardMaterial color="#ffffff" opacity={0.1} transparent wireframe />
      </mesh>
      {/* Support pole */}
      <mesh position={[0, rimY * 0.5, backboardZ * 1.3]}>
        <cylinderGeometry args={[0.05, 0.05, rimY, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, rimY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.03, 12, 48]} />
        <meshStandardMaterial color="#FF6B00" metalness={0.6} roughness={0.4} emissive="#FF4400" emissiveIntensity={0.2} />
      </mesh>
      {/* Net (simplified as a cone) */}
      <mesh position={[0, rimY - 0.3, 0]}>
        <coneGeometry args={[0.44, 0.6, 16, 1, true]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.5} transparent />
      </mesh>
    </group>
  );
}
