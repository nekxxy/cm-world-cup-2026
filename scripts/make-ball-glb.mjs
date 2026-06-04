// Generates a placeholder low-poly football GLB at public/models/ball.glb.
// Geometry: a faceted icosphere (flat-shaded reads as a low-poly ball).
// Run once with: node scripts/make-ball-glb.mjs  (the .glb is committed).

import { IcosahedronGeometry } from "three";
import { NodeIO, Document } from "@gltf-transform/core";
import { mkdirSync } from "node:fs";

const geo = new IcosahedronGeometry(1, 2); // detail 2 = chunky but round-ish
const pos = geo.attributes.position.array; // non-indexed: 3 verts per face
const count = pos.length / 3;

// Flat normals per triangle so facets read crisply under coloured light.
const normals = new Float32Array(pos.length);
for (let i = 0; i < count; i += 3) {
  const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2];
  const bx = pos[i * 3 + 3], by = pos[i * 3 + 4], bz = pos[i * 3 + 5];
  const cx = pos[i * 3 + 6], cy = pos[i * 3 + 7], cz = pos[i * 3 + 8];
  const e1 = [bx - ax, by - ay, bz - az];
  const e2 = [cx - ax, cy - ay, cz - az];
  let nx = e1[1] * e2[2] - e1[2] * e2[1];
  let ny = e1[2] * e2[0] - e1[0] * e2[2];
  let nz = e1[0] * e2[1] - e1[1] * e2[0];
  const len = Math.hypot(nx, ny, nz) || 1;
  nx /= len; ny /= len; nz /= len;
  for (let k = 0; k < 3; k++) {
    normals[(i + k) * 3] = nx;
    normals[(i + k) * 3 + 1] = ny;
    normals[(i + k) * 3 + 2] = nz;
  }
}

const doc = new Document();
const buffer = doc.createBuffer();
const position = doc.createAccessor().setType("VEC3").setArray(new Float32Array(pos)).setBuffer(buffer);
const normal = doc.createAccessor().setType("VEC3").setArray(normals).setBuffer(buffer);

const material = doc
  .createMaterial("Ball")
  .setBaseColorFactor([0.9, 0.9, 0.92, 1])
  .setMetallicFactor(0.0)
  .setRoughnessFactor(0.55);

const prim = doc
  .createPrimitive()
  .setAttribute("POSITION", position)
  .setAttribute("NORMAL", normal)
  .setMaterial(material);

const mesh = doc.createMesh("Ball").addPrimitive(prim);
const node = doc.createNode("Ball").setMesh(mesh);
doc.createScene("Scene").addChild(node);

mkdirSync("public/models", { recursive: true });
await new NodeIO().write("public/models/ball.glb", doc);
console.log(`Wrote public/models/ball.glb (${count} verts, ${count / 3} faces)`);
