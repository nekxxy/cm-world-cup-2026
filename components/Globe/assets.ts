/**
 * Earth textures (loaded client-side, CORS-enabled) per the spec's §7.
 * Served from the three.js examples mirror on jsDelivr.
 */
const CDN =
  "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets";

export const TEXTURES = {
  day: `${CDN}/earth_atmos_2048.jpg`,
  specular: `${CDN}/earth_specular_2048.jpg`,
  normal: `${CDN}/earth_normal_2048.jpg`,
  clouds: `${CDN}/earth_clouds_1024.png`,
  night: `${CDN}/earth_lights_2048.png`,
} as const;

/** Globe radius in scene units; pins/clouds/atmosphere derive from this. */
export const EARTH_RADIUS = 1;
export const CLOUD_RADIUS = 1.012;
export const ATMOSPHERE_RADIUS = 1.16;
export const PIN_SURFACE = 1.001;

/** Fixed "sun" direction (world space) for the day/night terminator. */
export const SUN_DIRECTION: [number, number, number] = [1, 0.35, 0.7];
