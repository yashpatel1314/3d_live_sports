'use client';

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
        <ringGeometry args={[1.5, 1.57, 64]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>
      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[15, 0.06]} />
        <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>

      {/* Court boundary lines */}
      <CourtLine position={[-7.44, 0.01, 0]} size={[0.06, 28.2]} />
      <CourtLine position={[7.44, 0.01, 0]} size={[0.06, 28.2]} />
      <CourtLine position={[0, 0.01, -14.05]} size={[15, 0.06]} />
      <CourtLine position={[0, 0.01, 14.05]} size={[15, 0.06]} />

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

function CourtLine({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
    </mesh>
  );
}

// ─── Paint area (key / lane) ──────────────────────────────────────────────────
//
//  basketZ = −12.5  →  towardCenter = +1
//    baseline     = −14.1
//    freeThrow    = −12.5 + 4.5 = −8.0
//    paintCenter  = (−14.1 + −8.0) / 2 = −11.05
//    paintLength  = 6.1
//    arc rotation: [−π/2, π, 0]  →  semicircle opens toward +z (center)
//
//  basketZ = +12.5  →  towardCenter = −1  (mirror image)

function PaintArea({ basketZ }: { basketZ: number }) {
  const towardCenter = basketZ < 0 ? 1 : -1;
  const baselineZ = basketZ < 0 ? -14.1 : 14.1;
  const freeThrowZ = basketZ + towardCenter * 4.5;
  const paintCenterZ = (baselineZ + freeThrowZ) / 2;
  const paintLen = Math.abs(freeThrowZ - baselineZ); // ≈ 6.1 units
  // Semicircle at free throw line that faces center court:
  //   towardCenter = +1 → needs y-rot = π (flip ring so it opens toward +z)
  //   towardCenter = −1 → y-rot = 0   (ring already opens toward −z)
  // Outside half opens toward center court; inside half opens toward baseline
  const arcRotY = towardCenter > 0 ? Math.PI : 0;
  const arcRotYInside = towardCenter > 0 ? 0 : Math.PI;

  return (
    <group>
      {/* Colored key rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, paintCenterZ]}>
        <planeGeometry args={[4.8, paintLen]} />
        <meshStandardMaterial color="#C85E20" opacity={0.35} transparent />
      </mesh>

      {/* Free throw line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, freeThrowZ]}>
        <planeGeometry args={[4.8, 0.06]} />
        <meshStandardMaterial color="#ffffff" opacity={0.55} transparent />
      </mesh>

      {/* Free throw circle — outside half (toward center court) */}
      <mesh rotation={[-Math.PI / 2, arcRotY, 0]} position={[0, 0.016, freeThrowZ]}>
        <ringGeometry args={[1.7, 1.9, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>

      {/* Free throw circle — inside half (toward baseline / into key) — dashed appearance via lower opacity */}
      <mesh rotation={[-Math.PI / 2, arcRotYInside, 0]} position={[0, 0.017, freeThrowZ]}>
        <ringGeometry args={[1.7, 1.9, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.38} transparent />
      </mesh>

      {/* Lane (boundary) lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.4, 0.011, paintCenterZ]}>
        <planeGeometry args={[0.06, paintLen]} />
        <meshStandardMaterial color="#ffffff" opacity={0.45} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.4, 0.011, paintCenterZ]}>
        <planeGeometry args={[0.06, paintLen]} />
        <meshStandardMaterial color="#ffffff" opacity={0.45} transparent />
      </mesh>

      {/* Restricted area arc — 4 ft radius at basket, opens toward center */}
      <mesh rotation={[-Math.PI / 2, arcRotY, 0]} position={[0, 0.016, basketZ]}>
        <ringGeometry args={[1.10, 1.27, 48, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.55} transparent />
      </mesh>
    </group>
  );
}

// ─── 3-point line ─────────────────────────────────────────────────────────────
//
//  Arc radius: 7.13 units (23.75 ft)
//  Corner x:   ±6.6  units (22 ft from basket center)
//  Arc meets straight at: towardCenter * 2.70 from basket (z_local)
//  Straight runs from baseline (z_local = −towardCenter * 1.6)
//      to arc junction (z_local = towardCenter * 2.70)
//  Straight center (local): towardCenter * 0.55   length: 4.3

function ThreePointArc({ basketZ }: { basketZ: number }) {
  const towardCenter = basketZ < 0 ? 1 : -1;
  const arcRotY = basketZ < 0 ? Math.PI : 0;
  const straightCenterZ = towardCenter * 0.55;
  const straightLen = 4.3;

  return (
    <group position={[0, 0.013, basketZ]}>
      {/* Arc */}
      <mesh rotation={[-Math.PI / 2, arcRotY, 0]}>
        <ringGeometry args={[7.05, 7.22, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" opacity={0.65} transparent />
      </mesh>

      {/* Corner straight lines — parallel to sidelines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.6, 0, straightCenterZ]}>
        <planeGeometry args={[0.06, straightLen]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.6, 0, straightCenterZ]}>
        <planeGeometry args={[0.06, straightLen]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
    </group>
  );
}

// ─── Basket ───────────────────────────────────────────────────────────────────

function Basket({ position, flipped }: { position: [number, number, number]; flipped?: boolean }) {
  const rimY = 3.05;
  // Backboard sits on the baseline side of the basket
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

      {/* Net — rotation={[π,0,0]} flips cone so wide opening is at the rim (top)
               and the narrow tip hangs down, matching a real basketball net */}
      <mesh position={[0, rimY - 0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.44, 0.6, 16, 1, true]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.55} transparent />
      </mesh>
    </group>
  );
}
