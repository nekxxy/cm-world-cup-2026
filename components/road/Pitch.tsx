"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { GROUND } from "./env";

/** Procedural mowed-stripe grass texture (grayscale luminance, tinted by color). */
function useStripeTexture() {
  return useMemo(() => {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const stripes = 8;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#d2d2d2";
      ctx.fillRect((i / stripes) * size, 0, size / stripes, size);
    }
    // Fine grass grain.
    const img = ctx.getImageData(0, 0, size, size);
    for (let p = 0; p < img.data.length; p += 4) {
      const n = (Math.random() - 0.5) * 22;
      img.data[p] += n;
      img.data[p + 1] += n;
      img.data[p + 2] += n;
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(7, 5);
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export function Pitch({ grass }: { grass: string }) {
  const tex = useStripeTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[GROUND.width, GROUND.depth, 1, 1]} />
      <meshStandardMaterial
        map={tex}
        color={grass}
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  );
}
