"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { gsap } from "gsap";
import * as THREE from "three";
import { getBallNormalMap, getBallRoughnessMap } from "./textures";

const IDLE_SPIN = 0.16; // slow, cinematic
const DRAG_SENS = 0.004;
const DAMP = 3.5;
const MAX_VEL = 7;

function Ball({ primary, secondary, onEnter }: { primary: string; secondary: string; onEnter: () => void }) {
  const ball = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.25, 4.6));
  const vel = useRef({ x: 0, y: IDLE_SPIN });
  const dragging = useRef(false);
  const moved = useRef(0);
  const last = useRef({ x: 0, y: 0 });
  const delta = useRef({ x: 0, y: 0 });
  const kicking = useRef(false);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    dragging.current = true;
    moved.current = 0;
    last.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    const dx = e.nativeEvent.clientX - last.current.x;
    const dy = e.nativeEvent.clientY - last.current.y;
    moved.current += Math.abs(dx) + Math.abs(dy);
    delta.current.x += dx;
    delta.current.y += dy;
    last.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    dragging.current = false;
    (e.target as Element)?.releasePointerCapture?.(e.pointerId);
    if (moved.current < 8) kick(); // a tap (not a drag) → kick into the app
  };

  function kick() {
    if (kicking.current || !ball.current) return;
    kicking.current = true;
    const g = ball.current;
    gsap
      .timeline({ onComplete: onEnter })
      .to(g.rotation, { x: g.rotation.x + Math.PI * 2.5, duration: 0.62, ease: "power2.in" }, 0)
      .to(g.position, { y: 0.55, duration: 0.22, ease: "power2.out" }, 0)
      .to(g.position, { y: 0, z: -1.2, duration: 0.4, ease: "power2.in" }, 0.22)
      .to(g.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.4, ease: "power2.in" }, 0.22)
      .to(camera.position, { z: 2.0, y: 0.1, duration: 0.62, ease: "power2.inOut" }, 0);
  }

  useFrame((_, dtRaw) => {
    const g = ball.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.05);
    const t = performance.now() / 1000;

    if (!kicking.current) {
      // Cinematic camera drift.
      camera.position.x = base.current.x + Math.sin(t * 0.28) * 0.22;
      camera.position.y = base.current.y + Math.sin(t * 0.2) * 0.1;
      camera.position.z = base.current.z;
      camera.lookAt(0, 0, 0);

      // Idle spin + damped drag.
      let targetY = IDLE_SPIN;
      let targetX = 0;
      if (dragging.current) {
        targetY = THREE.MathUtils.clamp((delta.current.x / dt) * DRAG_SENS, -MAX_VEL, MAX_VEL);
        targetX = THREE.MathUtils.clamp((delta.current.y / dt) * DRAG_SENS, -MAX_VEL, MAX_VEL);
        delta.current.x = delta.current.y = 0;
      }
      vel.current.y = THREE.MathUtils.damp(vel.current.y, targetY, DAMP, dt);
      vel.current.x = THREE.MathUtils.damp(vel.current.x, targetX, DAMP, dt);
      g.rotation.y += vel.current.y * dt;
      g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + vel.current.x * dt, -0.5, 0.5);
      // gentle bob
      g.position.y = Math.sin(t * 0.8) * 0.04;
    }
  });

  return (
    <group ref={ball}>
      <mesh castShadow onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => (dragging.current = false)}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color={primary}
          metalness={0.35}
          roughness={0.45}
          envMapIntensity={1.15}
          normalMap={getBallNormalMap()}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          roughnessMap={getBallRoughnessMap()}
        />
      </mesh>
      <pointLight position={[2.5, 1, 2]} intensity={12} distance={10} color={secondary} />
    </group>
  );
}

export default function HeroHubScene({
  primary,
  secondary,
  bloom,
  onEnter,
}: {
  primary: string;
  secondary: string;
  bloom: boolean;
  onEnter: () => void;
}) {
  return (
    <Canvas
      style={{ background: "transparent", touchAction: "none" }}
      dpr={[1, 1.5]}
      shadows
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.25, 4.6], fov: 35 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 5, 3]} intensity={0.7} castShadow />

      <Ball primary={primary} secondary={secondary} onEnter={onEnter} />

      {/* Procedural HDRI: team-tinted lightformers (no external asset fetch). */}
      <Environment resolution={128}>
        <Lightformer intensity={1.4} position={[0, 2, 2]} scale={5} color="#ffffff" />
        <Lightformer intensity={0.9} position={[-3, 1, 1]} scale={3} color={primary} />
        <Lightformer intensity={0.9} position={[3, 0, 2]} scale={3} color={secondary} />
        <Lightformer intensity={0.5} position={[0, -2, 1]} scale={4} color="#ffffff" />
      </Environment>

      <ContactShadows position={[0, -1.15, 0]} opacity={0.5} scale={6} blur={2.6} far={3} frames={1} />

      {bloom && (
        <EffectComposer>
          <Bloom intensity={0.32} luminanceThreshold={0.62} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
