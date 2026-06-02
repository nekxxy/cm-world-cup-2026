/**
 * GLSL for the realistic Earth. Written for THREE.ShaderMaterial, which
 * auto-injects the standard prefix (projectionMatrix, modelMatrix, viewMatrix,
 * cameraPosition, normalMatrix, and the position/normal/uv attributes) plus
 * resolves #include chunks — so we don't redeclare those.
 */

export const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const EARTH_FRAGMENT = /* glsl */ `
  #include <common>
  #include <colorspace_pars_fragment>

  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform vec3 sunDir;
  uniform vec3 glintColor;
  uniform float nightBoost;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(sunDir);

    // Day/night blend across a soft terminator band.
    float lambert = dot(N, L);
    float dayAmount = smoothstep(-0.12, 0.30, lambert);

    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb * nightBoost;
    vec3 color = mix(night, day, dayAmount);

    // Specular sun-glint on oceans (specular map is bright over water).
    float ocean = texture2D(specMap, vUv).r;
    vec3 R = reflect(-L, N);
    float glint = pow(max(dot(R, normalize(vViewDir)), 0.0), 24.0);
    color += glintColor * glint * ocean * dayAmount * 0.6;

    // Tiny ambient so the night side never reads as a dead black hole.
    color += day * 0.025 * (1.0 - dayAmount);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Rendered on the back faces of an enlarged shell with additive blending,
// producing a soft rim of atmospheric scattering around the limb.
export const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;

  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vViewDir), normalize(vNormalW))), power);
    gl_FragColor = vec4(glowColor, fres * intensity);
  }
`;
