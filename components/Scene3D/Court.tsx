'use client';
import { useMemo } from 'react';
import { Vector3, CatmullRomCurve3 } from 'three';

// Scale: 1 unit ≈ 3.33 ft  |  Court: 28.2 × 15 units  |  z: ±14.1  |  x: ±7.5
// Baskets at z = ±12.5,  baseline at z = ±14.1,  free throw line 4.5 units from basket

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
        <ringGeometry args={[1.5, 1.65, 64]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* Center line */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[15, 0.05, 0.1]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>

      {/* Court boundary lines */}
      <CourtBorder position={[-7.44, 0, 0]} size={[0.1, 28.2]} />
      <CourtBorder position={[7.44, 0, 0]} size={[0.1, 28.2]} />
      <CourtBorder position={[0, 0, -14.05]} size={[15, 0.1]} />
      <CourtBorder position={[0, 0, 14.05]} size={[15, 0.1]} />

      {/* Paint areas — one per basket */}
      <PaintArea basketZ={-12.5} />
      <PaintArea basketZ={12.5} />

      {/* 3-point lines */}
      <ThreePointArc basketZ={-12.5} />
      <ThreePointArc basketZ={12.5} />

      {/* Baskets */}
      <Basket position={[0, 0, -12.5]} />
      <Basket position={[0, 0, 12.5]} flipped />

      {/* Hardwood grain */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -13 + i * 2]}>
          <planeGeometry args={[15, 0.02]} />
          <meshStandardMaterial color="#B07820" opacity={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Court boundary lines as thin raised boxes so they're visible from any angle
function CourtBorder({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={[position[0], 0.025, position[2]]}>
      <boxGeometry args={[size[0], 0.05, size[1]]} />
      <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
    </mesh>
  );
}

// ─── Paint area (key / lane) ──────────────────────────────────────────────────

function PaintArea({ basketZ }: { basketZ: number }) {
  const towardCenter = basketZ < 0 ? 1 : -1;
  const baselineZ = basketZ < 0 ? -14.1 : 14.1;
  const freeThrowZ = basketZ + towardCenter * 4.5;
  const paintCenterZ = (baselineZ + freeThrowZ) / 2;
  const paintLen = Math.abs(freeThrowZ - baselineZ); // ≈ 6.1 units
  const arcRotY = towardCenter > 0 ? Math.PI : 0;
  const arcRotYInside = towardCenter > 0 ? 0 : Math.PI;

  return (
    <group>
      {/* Colored key rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, paintCenterZ]}>
        <planeGeometry args={[4.8, paintLen]} />
        <meshStandardMaterial color="#C85E20" opacity={0.35} transparent />
      </mesh>

      {/* Free throw line — raised box so it's visible from any angle */}
      <mesh position={[0, 0.025, freeThrowZ]}>
        <boxGeometry args={[4.8, 0.05, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Free throw circle — outside half (toward center court) */}
      <mesh rotation={[-Math.PI / 2, arcRotY, 0]} position={[0, 0.016, freeThrowZ]}>
        <ringGeometry args={[1.7, 1.88, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.95} transparent />
      </mesh>

      {/* Free throw circle — inside half (dashed look via lower opacity) */}
      <mesh rotation={[-Math.PI / 2, arcRotYInside, 0]} position={[0, 0.017, freeThrowZ]}>
        <ringGeometry args={[1.7, 1.88, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>

      {/* Lane (boundary) lines — raised boxes */}
      <mesh position={[-2.4, 0.025, paintCenterZ]}>
        <boxGeometry args={[0.1, 0.05, paintLen]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[2.4, 0.025, paintCenterZ]}>
        <boxGeometry args={[0.1, 0.05, paintLen]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Restricted area arc — opens toward center court */}
      <mesh rotation={[-Math.PI / 2, arcRotY, 0]} position={[0, 0.016, basketZ]}>
        <ringGeometry args={[1.10, 1.28, 48, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      </mesh>
    </group>
  );
}

// ─── 3-point line ─────────────────────────────────────────────────────────────
//
//  Arc inner radius: 7.05 units (≈ 23.5 ft)
//  Corner x:         ±6.6 units (22 ft from basket center)
//  Arc spans corner-to-corner only — thetaStart = acos(6.6/7.05) ≈ 20.6°
//
//  Uses TubeGeometry (3D tube) so the arc is visible from any camera angle.
//  Flat ring geometry disappears when viewed edge-on; a tube does not.

function ThreePointArc({ basketZ }: { basketZ: number }) {
  const towardCenter = basketZ < 0 ? 1 : -1;
  const arcRotY = basketZ < 0 ? Math.PI : 0;

  const innerR = 7.05;
  const midR = 7.15;
  const cornerX = 6.6;
  const arcJunctionZ = Math.sqrt(innerR * innerR - cornerX * cornerX); // ≈ 2.477
  const thetaStart = Math.acos(cornerX / innerR);   // ≈ 0.359 rad
  const thetaLength = Math.PI - 2 * thetaStart;     // ≈ 2.423 rad

  const baselineDist = 1.6;
  const overlapExtend = 0.4;
  const straightLen = baselineDist + arcJunctionZ + overlapExtend;
  const straightCenterZ = towardCenter * (arcJunctionZ + overlapExtend - baselineDist) / 2;

  // Build the arc center-line path in local space relative to the group.
  // arcRotY=PI  → point at theta maps to (-r·cosθ,  0, r·sinθ)  [HOME basket]
  // arcRotY=0   → point at theta maps to ( r·cosθ,  0, -r·sinθ) [AWAY basket]
  const arcCurve = useMemo(() => {
    const pts: Vector3[] = [];
    const segs = 48;
    for (let i = 0; i <= segs; i++) {
      const theta = thetaStart + (i / segs) * thetaLength;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      pts.push(
        arcRotY === Math.PI
          ? new Vector3(-midR * c, 0, midR * s)
          : new Vector3(midR * c, 0, -midR * s),
      );
    }
    return new CatmullRomCurve3(pts);
  }, [basketZ]); // basketZ determines arcRotY, thetaStart, thetaLength

  return (
    <group position={[0, 0.013, basketZ]}>
      {/* Corner straight lines — boxes so they stay visible edge-on */}
      <mesh position={[-cornerX, 0, straightCenterZ]}>
        <boxGeometry args={[0.1, 0.05, straightLen]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[cornerX, 0, straightCenterZ]}>
        <boxGeometry args={[0.1, 0.05, straightLen]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 3PT arc — tube so it's visible from any angle */}
      <mesh>
        <tubeGeometry args={[arcCurve, 48, 0.07, 8, false]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ─── Basket ───────────────────────────────────────────────────────────────────

function Basket({ position, flipped }: { position: [number, number, number]; flipped?: boolean }) {
  const rimY = 3.05;
  const bbZ = flipped ? 1.1 : -1.1;

  return (
    <group position={position}>
      {/* Support pole */}
      <mesh position={[0, rimY * 0.5, bbZ * 1.25]}>
        <cylinderGeometry args={[0.05, 0.05, rimY, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Backboard */}
      <mesh position={[0, rimY + 0.3, bbZ]}>
        <boxGeometry args={[1.83, 1.07, 0.05]} />
        <meshStandardMaterial color="#ffffff" opacity={0.25} transparent />
      </mesh>

      {/* Rim */}
      <mesh position={[0, rimY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.03, 12, 48]} />
        <meshStandardMaterial
          color="#FF6B00"
          metalness={0.6}
          roughness={0.4}
          emissive="#FF4400"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Net */}
      <mesh position={[0, rimY - 0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.44, 0.6, 16, 1, true]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.55} transparent />
      </mesh>
    </group>
  );
}
