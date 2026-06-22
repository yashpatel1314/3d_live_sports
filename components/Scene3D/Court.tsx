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

  // Tube-center radius for free throw circle (midpoint of NBA 6ft inner/outer)
  const FT_R = 1.79;
  // Tube-center radius for restricted area arc
  const RA_R = 1.19;

  // Free throw circle — solid outer half (faces toward center court)
  const ftOuter = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const theta = (i / 32) * Math.PI;
      pts.push(new Vector3(FT_R * Math.cos(theta), 0, towardCenter * FT_R * Math.sin(theta)));
    }
    return new CatmullRomCurve3(pts);
  }, [basketZ]);

  // Free throw circle — inner half (faces toward basket, lower opacity = dashed look)
  const ftInner = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const theta = (i / 32) * Math.PI;
      pts.push(new Vector3(FT_R * Math.cos(theta), 0, -towardCenter * FT_R * Math.sin(theta)));
    }
    return new CatmullRomCurve3(pts);
  }, [basketZ]);

  // Restricted area arc — solid half facing center court
  const restrictedCurve = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const theta = (i / 24) * Math.PI;
      pts.push(new Vector3(RA_R * Math.cos(theta), 0, towardCenter * RA_R * Math.sin(theta)));
    }
    return new CatmullRomCurve3(pts);
  }, [basketZ]);

  return (
    <group>
      {/* Colored key rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, paintCenterZ]}>
        <planeGeometry args={[4.8, paintLen]} />
        <meshStandardMaterial color="#C85E20" opacity={0.35} transparent />
      </mesh>

      {/* Free throw line — raised box */}
      <mesh position={[0, 0.025, freeThrowZ]}>
        <boxGeometry args={[4.8, 0.05, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Free throw circle — solid outer half (toward center court) */}
      <mesh position={[0, 0.013, freeThrowZ]}>
        <tubeGeometry args={[ftOuter, 32, 0.07, 8, false]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Free throw circle — inner half (toward basket, lower opacity for dashed look) */}
      <mesh position={[0, 0.013, freeThrowZ]}>
        <tubeGeometry args={[ftInner, 32, 0.07, 8, false]} />
        <meshStandardMaterial color="#ffffff" opacity={0.45} transparent />
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

      {/* Restricted area arc — tube opens toward center court */}
      <mesh position={[0, 0.013, basketZ]}>
        <tubeGeometry args={[restrictedCurve, 24, 0.07, 8, false]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ─── 3-point line ─────────────────────────────────────────────────────────────
//
//  Single seamless TubeGeometry: corner straight → arc → corner straight.
//  Corner x is derived from midR so the junction coordinates match exactly.

function ThreePointArc({ basketZ }: { basketZ: number }) {
  const towardCenter = basketZ < 0 ? 1 : -1;
  const arcRotY = basketZ < 0 ? Math.PI : 0;

  const innerR = 7.05;
  const midR = 7.15;
  const thetaStart = Math.acos(6.6 / innerR);      // ≈ 0.359 rad (NBA 22 ft corner)
  const thetaLength = Math.PI - 2 * thetaStart;     // ≈ 2.423 rad

  // Exact tube-center coordinates at the arc/straight junction
  const juncX = midR * Math.cos(thetaStart);        // ≈ 6.694
  const juncZ = midR * Math.sin(thetaStart);        // ≈ 2.512

  // Local z coords (relative to group positioned at basketZ)
  const baselineLocalZ = (basketZ < 0 ? -14.1 : 14.1) - basketZ;  // −1.6 HOME, +1.6 AWAY
  const junctionLocalZ = towardCenter * juncZ;                       // +2.512 HOME, −2.512 AWAY

  const fullPath = useMemo(() => {
    const pts: Vector3[] = [];
    const SSEGS = 6;   // points per corner straight (excluding shared junction endpoints)
    const ASEGS = 48;  // points along arc

    if (arcRotY === Math.PI) {
      // HOME basket: left corner baseline → left junction → arc → right junction → right corner baseline
      for (let i = 0; i < SSEGS; i++) {
        pts.push(new Vector3(-juncX, 0, baselineLocalZ + (i / SSEGS) * (junctionLocalZ - baselineLocalZ)));
      }
      for (let i = 0; i <= ASEGS; i++) {
        const theta = thetaStart + (i / ASEGS) * thetaLength;
        pts.push(new Vector3(-midR * Math.cos(theta), 0, midR * Math.sin(theta)));
      }
      for (let i = 1; i <= SSEGS; i++) {
        pts.push(new Vector3(juncX, 0, junctionLocalZ + (i / SSEGS) * (baselineLocalZ - junctionLocalZ)));
      }
    } else {
      // AWAY basket: right corner baseline → right junction → arc → left junction → left corner baseline
      for (let i = 0; i < SSEGS; i++) {
        pts.push(new Vector3(juncX, 0, baselineLocalZ + (i / SSEGS) * (junctionLocalZ - baselineLocalZ)));
      }
      for (let i = 0; i <= ASEGS; i++) {
        const theta = thetaStart + (i / ASEGS) * thetaLength;
        pts.push(new Vector3(midR * Math.cos(theta), 0, -midR * Math.sin(theta)));
      }
      for (let i = 1; i <= SSEGS; i++) {
        pts.push(new Vector3(-juncX, 0, junctionLocalZ + (i / SSEGS) * (baselineLocalZ - junctionLocalZ)));
      }
    }

    return new CatmullRomCurve3(pts);
  }, [basketZ]);

  return (
    <group position={[0, 0.013, basketZ]}>
      <mesh>
        <tubeGeometry args={[fullPath, 128, 0.07, 8, false]} />
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
