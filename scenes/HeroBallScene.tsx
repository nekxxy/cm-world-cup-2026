"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL = "/models/ball.glb";
useGLTF.preload(MODEL);

const IDLE_SPEED = 0.35; // rad/s slow idle spin
const DRAG_SENS = 0.0045; // pixels/sec -> rad/s
const DAMP = 4; // higher = snappier; lower = floatier (input damping)
const MAX_VEL = 8; // clamp so a hard flick can't go wild
const TILT_LIMIT = 0.6;

function Ball({ primary, secondary }: { primary: string; secondary: string }) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<THREE.Group>(null);
  const vel = useRef({ x: 0, y: IDLE_SPEED });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const delta = useRef({ x: 0, y: 0 }); // accumulated pointer delta per frame

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    dragging.current = true;
    last.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    delta.current.x += e.nativeEvent.clientX - last.current.x;
    delta.current.y += e.nativeEvent.clientY - last.current.y;
    last.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    dragging.current = false;
    (e.target as Element)?.releasePointerCapture?.(e.pointerId);
  };

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.05); // guard against tab-switch spikes

    // Build a *target* angular velocity, then damp toward it — raw pointer
    // deltas never touch rotation directly.
    let targetY = IDLE_SPEED;
    let targetX = 0;
    if (dragging.current) {
      targetY = THREE.MathUtils.clamp((delta.current.x / dt) * DRAG_SENS, -MAX_VEL, MAX_VEL);
      targetX = THREE.MathUtils.clamp((delta.current.y / dt) * DRAG_SENS, -MAX_VEL, MAX_VEL);
      delta.current.x = 0;
      delta.current.y = 0;
    }
    vel.current.y = THREE.MathUtils.damp(vel.current.y, targetY, DAMP, dt);
    vel.current.x = THREE.MathUtils.damp(vel.current.x, targetX, DAMP, dt);

    g.rotation.y += vel.current.y * dt;
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + vel.current.x * dt, -TILT_LIMIT, TILT_LIMIT);
  });

  return (
    <>
      {/* Full-frame invisible catcher so a drag anywhere spins the ball. */}
      <mesh position={[0, 0, 2]} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={group}>
        <primitive object={scene} />
      </group>

      {/* Lighting in the team's colours. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-3, 1, 2]} intensity={28} distance={12} color={primary} />
      <pointLight position={[3, -2, 2]} intensity={22} distance={12} color={secondary} />
    </>
  );
}

export default function HeroBallScene({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <Canvas
      style={{ background: "transparent", touchAction: "none" }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
    >
      <Suspense fallback={null}>
        <Ball primary={primary} secondary={secondary} />
      </Suspense>
    </Canvas>
  );
}
