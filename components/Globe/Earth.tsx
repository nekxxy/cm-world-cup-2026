"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  TEXTURES,
  EARTH_RADIUS,
  CLOUD_RADIUS,
  SUN_DIRECTION,
} from "./assets";
import { EARTH_FRAGMENT, EARTH_VERTEX } from "./shaders";

export function EarthSurface() {
  const [day, night, spec] = useTexture([
    TEXTURES.day,
    TEXTURES.night,
    TEXTURES.specular,
  ]);

  const material = useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    spec.colorSpace = THREE.NoColorSpace;
    for (const t of [day, night, spec]) t.anisotropy = 4;

    return new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: day },
        nightMap: { value: night },
        specMap: { value: spec },
        sunDir: { value: new THREE.Vector3(...SUN_DIRECTION).normalize() },
        glintColor: { value: new THREE.Color("#cfe8ff") },
        nightBoost: { value: 1.5 },
      },
      vertexShader: EARTH_VERTEX,
      fragmentShader: EARTH_FRAGMENT,
    });
  }, [day, night, spec]);

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function Clouds() {
  const ref = useRef<THREE.Mesh>(null);
  const clouds = useTexture(TEXTURES.clouds);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.006;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[CLOUD_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={clouds}
        alphaMap={clouds}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}
