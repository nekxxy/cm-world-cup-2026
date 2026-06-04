import * as THREE from "three";

// Procedurally generated PBR maps so the ball gets real surface detail without
// shipping/fetching any image assets (safest for the Telegram WebView). Built
// once and reused.

let normalMap: THREE.DataTexture | null = null;
let roughnessMap: THREE.DataTexture | null = null;

function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Micro-surface normal map: mostly flat (0,0,1) with tiny perturbations. */
export function getBallNormalMap(size = 256): THREE.DataTexture {
  if (normalMap) return normalMap;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = (hash(x, y) - 0.5) * 24; // small XY tilt
      const ny = (hash(x + 7, y + 13) - 0.5) * 24;
      data[i] = 128 + nx;
      data[i + 1] = 128 + ny;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.needsUpdate = true;
  normalMap = tex;
  return tex;
}

/** Roughness map with gentle low-frequency variation for a leathery sheen. */
export function getBallRoughnessMap(size = 256): THREE.DataTexture {
  if (roughnessMap) return roughnessMap;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = 110 + hash(x * 0.5, y * 0.5) * 50; // ~0.43–0.63 roughness
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.needsUpdate = true;
  roughnessMap = tex;
  return tex;
}
