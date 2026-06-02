"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Procedural hex-panel football texture (white base, soft seams). */
function makeBallTexture() {
  const w = 1024;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#eef0f4";
  ctx.fillRect(0, 0, w, h);

  const size = 46;
  const hexH = Math.sqrt(3) * size;
  const colStep = 1.5 * size;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(22,26,36,0.16)";
  let col = 0;
  for (let x = -size; x < w + size; x += colStep, col++) {
    const yOff = col % 2 ? hexH / 2 : 0;
    for (let y = -hexH; y < h + hexH; y += hexH) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = x + size * Math.cos(a);
        const py = y + yOff + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Fine grain
  const img = ctx.getImageData(0, 0, w, h);
  for (let p = 0; p < img.data.length; p += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[p] += n;
    img.data[p + 1] += n;
    img.data[p + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function MatchBall({
  velocityRef,
  flashRef,
  radius = 1.4,
}: {
  velocityRef: MutableRefObject<{ x: number; y: number }>;
  flashRef: MutableRefObject<number>;
  radius?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const tex = useMemo(() => makeBallTexture(), []);

  useFrame((_, delta) => {
    const v = velocityRef.current;
    if (group.current) {
      group.current.rotation.y += v.x * delta;
      group.current.rotation.x += v.y * delta;
    }
    // Momentum decay + gentle idle spin baseline.
    v.x *= 0.985;
    v.y *= 0.985;
    v.x += (0.35 - v.x) * 0.004;
    v.x = clamp(v.x, -8, 8);
    v.y = clamp(v.y, -8, 8);

    // Tap flash decay.
    flashRef.current *= 0.9;
    if (mat.current) mat.current.emissiveIntensity = 0.02 + flashRef.current * 0.7;
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial
          ref={mat}
          map={tex}
          color="#eef0f4"
          roughness={0.32}
          metalness={0}
          clearcoat={0.7}
          clearcoatRoughness={0.22}
          sheen={0.5}
          sheenColor="#ffe6b8"
          emissive="#ffcaa0"
          emissiveIntensity={0.02}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* Gold trim seam */}
      <mesh rotation={[Math.PI / 2.3, 0.4, 0]}>
        <torusGeometry args={[radius * 1.002, 0.012, 10, 90]} />
        <meshStandardMaterial
          color="#e9b24c"
          metalness={0.7}
          roughness={0.3}
          emissive="#e9b24c"
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
