"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function CameraRig({
  focusPos,
  allowAutoRotate,
  focusDistance = 2.15,
}: {
  /** World-space point to fly the camera to face, or null. */
  focusPos: [number, number, number] | null;
  allowAutoRotate: boolean;
  focusDistance?: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const flyTarget = useRef<THREE.Vector3 | null>(null);
  const autoOn = useRef(allowAutoRotate);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };
  const scheduleResume = (ms: number) => {
    clearIdle();
    if (allowAutoRotate) {
      idleTimer.current = setTimeout(() => {
        autoOn.current = true;
      }, ms);
    }
  };

  // Pause auto-rotate while the user is interacting; resume after a beat.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const onStart = () => {
      autoOn.current = false;
      clearIdle();
    };
    const onEnd = () => scheduleResume(2500);
    c.addEventListener("start", onStart);
    c.addEventListener("end", onEnd);
    return () => {
      c.removeEventListener("start", onStart);
      c.removeEventListener("end", onEnd);
      clearIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowAutoRotate]);

  // New focus → begin fly-to.
  useEffect(() => {
    if (!focusPos) return;
    flyTarget.current = new THREE.Vector3(...focusPos)
      .normalize()
      .multiplyScalar(focusDistance);
    autoOn.current = false;
    clearIdle();
  }, [focusPos, focusDistance]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;

    if (flyTarget.current) {
      c.autoRotate = false;
      const t = 1 - Math.pow(0.0009, delta); // frame-rate independent ease
      camera.position.lerp(flyTarget.current, t);
      if (camera.position.distanceTo(flyTarget.current) < 0.015) {
        flyTarget.current = null;
        scheduleResume(2000);
      }
    } else {
      c.autoRotate = autoOn.current;
    }
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      autoRotate={allowAutoRotate}
      autoRotateSpeed={0.45}
      minDistance={1.5}
      maxDistance={4}
    />
  );
}
