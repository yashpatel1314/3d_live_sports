'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Matrix4, Color, Vector3 } from 'three';

interface Particle {
  pos: Vector3;
  vel: Vector3;
  life: number;
}

const COUNT = 60;
const SPAWN_POS = new Vector3(0, 3.05, -12.5); // basket

interface ScoreParticlesProps {
  active: boolean;
  teamColor: string;
}

export function ScoreParticles({ active, teamColor }: ScoreParticlesProps) {
  const ref = useRef<InstancedMesh>(null);
  const particles = useRef<Particle[]>([]);
  const triggered = useRef(false);
  const matrix = useMemo(() => new Matrix4(), []);

  const colorObj = useMemo(() => new Color(teamColor), [teamColor]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    if (active && !triggered.current) {
      triggered.current = true;
      particles.current = Array.from({ length: COUNT }, () => ({
        pos: SPAWN_POS.clone(),
        vel: new Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 4
        ),
        life: 1,
      }));
    }

    if (!active) {
      triggered.current = false;
      for (let i = 0; i < COUNT; i++) {
        matrix.makeScale(0, 0, 0);
        ref.current.setMatrixAt(i, matrix);
      }
      ref.current.instanceMatrix.needsUpdate = true;
      return;
    }

    for (let i = 0; i < particles.current.length; i++) {
      const p = particles.current[i];
      p.life -= delta * 0.8;
      p.vel.y -= 9.8 * delta;
      p.pos.addScaledVector(p.vel, delta);

      if (p.life <= 0) {
        matrix.makeScale(0, 0, 0);
      } else {
        const s = p.life * 0.12;
        matrix.makeScale(s, s, s);
        matrix.setPosition(p.pos);
      }
      ref.current.setMatrixAt(i, matrix);
    }

    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color={colorObj} emissive={colorObj} emissiveIntensity={0.5} />
    </instancedMesh>
  );
}
