"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  Sparkles,
  Float,
  MeshReflectorMaterial,
  ContactShadows,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { CAMERA, type Palette } from "./env";
import { MatchBall } from "./MatchBall";

type Vel = { x: number; y: number };

/** Drag/swipe to spin (momentum), tap to kick. Touch + mouse. */
function BallControls({
  velocityRef,
  flashRef,
}: {
  velocityRef: React.MutableRefObject<Vel>;
  flashRef: React.MutableRefObject<number>;
}) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let downT = 0;
    let moved = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      downT = performance.now();
      moved = 0;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      velocityRef.current.x += dx * 0.012;
      velocityRef.current.y += dy * 0.012;
    };
    const up = () => {
      if (dragging && moved < 6 && performance.now() - downT < 300) {
        velocityRef.current.x += 2.6; // tap to kick
        flashRef.current = 1;
      }
      dragging = false;
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, velocityRef, flashRef]);
  return null;
}

function CameraRig() {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(...CAMERA.target));
  const dest = useRef(new THREE.Vector3());
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    dest.current.set(
      CAMERA.position[0] + pointer.x * 0.5,
      CAMERA.position[1] + pointer.y * 0.3 + Math.sin(t * 0.25) * 0.06,
      CAMERA.position[2],
    );
    camera.position.lerp(dest.current, 1 - Math.pow(0.003, delta));
    camera.lookAt(look.current);
  });
  return null;
}

function Floor({ palette, reflective }: { palette: Palette; reflective: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
      <planeGeometry args={[60, 60]} />
      {reflective ? (
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={28}
          roughness={0.85}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color={palette.floor}
          metalness={0.5}
        />
      ) : (
        <meshStandardMaterial color={palette.floor} roughness={0.85} metalness={0.2} />
      )}
    </mesh>
  );
}

export function RoadScene({
  palette,
  effects,
  reflectiveFloor,
}: {
  palette: Palette;
  effects: boolean;
  reflectiveFloor: boolean;
}) {
  const velocityRef = useRef<Vel>({ x: 0.35, y: 0 });
  const flashRef = useRef(0);

  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <fogExp2 attach="fog" args={[palette.fog, palette.fogDensity]} />

      <ambientLight intensity={palette.ambient} />
      <directionalLight
        color={palette.key}
        intensity={palette.keyIntensity}
        position={palette.keyPos}
      />
      <directionalLight
        color={palette.rim}
        intensity={palette.rimIntensity}
        position={[-4, 3, -6]}
      />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} color={palette.key} position={[0, 5, -3]} scale={[10, 6, 1]} />
        <Lightformer intensity={1} color={palette.rim} position={[-6, 2, -2]} scale={[3, 6, 1]} />
        <Lightformer intensity={1.2} color="#ffffff" position={[4, 3, 4]} scale={[4, 4, 1]} />
      </Environment>

      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.04, 0.16]}>
        <MatchBall velocityRef={velocityRef} flashRef={flashRef} />
      </Float>

      <Sparkles
        count={effects ? 140 : 60}
        scale={[7, 5, 7]}
        position={[0, 0.3, 0]}
        size={3}
        speed={0.4}
        opacity={0.7}
        noise={1.5}
        color={palette.sparkle}
      />

      <Floor palette={palette} reflective={reflectiveFloor} />
      <ContactShadows
        position={[0, -1.34, 0]}
        scale={12}
        blur={2.6}
        far={4.5}
        opacity={0.55}
        color="#000000"
      />

      <BallControls velocityRef={velocityRef} flashRef={flashRef} />
      <CameraRig />

      {effects ? (
        <EffectComposer>
          <Bloom
            intensity={palette.bloom}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.3} darkness={0.9} />
          <Noise opacity={0.03} />
        </EffectComposer>
      ) : null}
    </>
  );
}
