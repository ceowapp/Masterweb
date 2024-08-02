import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Text } from 'troika-three-text';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshPhysicalNodeMaterial, normalWorld, timerLocal, mx_noise_vec3, mx_worley_noise_vec3, mx_cell_noise_float, mx_fractal_noise_vec3 } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';

const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragment = `
uniform float time;
uniform float progress;
uniform sampler2D scene;
varying vec2 vUv;
void main(){
    float mixer = smoothstep(0.0, 1.0, progress);
    vec4 s = texture2D(scene, vUv);
    vec4 finalTexture = mix(s, s, mixer);
    gl_FragColor = vec4(position, 1.0);
}
`;

const noise = `
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Many thanks to Ian McEwan of Ashima Arts for the
  // ideas for permutation and gradient selection.
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/ashima/webgl-noise
  //

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }
`;

const rotation = `
  mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }
  
  vec3 rotateY(vec3 v, float angle) {
    return rotation3dY(angle) * v;
  }  
`;

const vertexShader = `  
  varying vec2 vUv;
  varying float vDistort;
  
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseDensity;
  uniform float uNoiseStrength;
  uniform float uFrequency;
  uniform float uAmplitude;
  
  ${noise}
  
  ${rotation}
  
  void main() {
    vUv = uv;
    
    float t = uTime * uSpeed;
    float distortion = pnoise((normal + t) * uNoiseDensity, vec3(10.0)) * uNoiseStrength;

    vec3 pos = position + (normal * distortion);
    float angle = sin(uv.y * uFrequency + t) * uAmplitude;
    pos = rotateY(pos, angle);    
    
    vDistort = distortion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }  
`;


const vertexText = `
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Many thanks to Ian McEwan of Ashima Arts for the
  // ideas for permutation and gradient selection.
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/ashima/webgl-noise
  //
  vec3 mod289(vec3 x)
  {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  vec4 mod289(vec4 x)
  {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  vec4 permute(vec4 x)
  {
  return mod289(((x*34.0)+1.0)*x);
  }
  vec4 taylorInvSqrt(vec4 r)
  {
  return 1.79284291400159 - 0.85373472095314 * r;
  }
  vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
  }
  // Classic Perlin noise
  float cnoise(vec3 P)
  {
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 1.2 * n_xyz;
  }
  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.0 * n_xyz;
  }
  varying vec3 vNormal;
  uniform float time;
  uniform float weight;
  uniform float morph;  
  void main() {
    float f = morph * pnoise( normal + time, vec3( 10.0 ) );
    vNormal = normalize(normal);
    vec4 pos = vec4( position + f * normal, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * pos;
  }`;

const fragmentText = `
     //
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/ashima/webgl-noise
  //
  vec3 mod289(vec3 x)
  {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  vec4 mod289(vec4 x)
  {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  vec4 permute(vec4 x)
  {
  return mod289(((x*34.0)+1.0)*x);
  }
  vec4 taylorInvSqrt(vec4 r)
  {
  return 1.79284291400159 - 0.85373472095314 * r;
  }
  vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
  }
  // Classic Perlin noise
  float cnoise(vec3 P)
  {
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
  }
  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 10.0 * n_xyz;
  }
  varying vec3 vNormal;
  uniform sampler2D tShine;
  uniform float time;
  uniform float RGBr;
  uniform float RGBg;
  uniform float RGBb;
  uniform float RGBn;
  uniform float RGBm;
  uniform float dnoise;
  
  float PI = 3.14159265358979323846264;
  void main() {
    float r = ( pnoise( RGBr * ( vNormal + time ), vec3( 10.0 ) ) );
    float g = ( pnoise( RGBg * ( vNormal + time ), vec3( 10.0 ) ) );
    float b = ( pnoise( RGBb * ( vNormal + time ), vec3( 10.0 ) ) );
    float n = pnoise( -1.0 * ( vNormal + time ), vec3( 10.0 ) );
    //n = pow( 1.0, n );
    n = 50.0 * pnoise( (RGBn) * ( vNormal ), vec3( 10.0 ) ) * pnoise( RGBm * ( vNormal + time ), vec3( 10.0 ) );
    n -= 0.10 * pnoise( dnoise * vNormal, vec3( 10.0 ) );
    vec3 color = vec3( r + n, g + n, b + n );
    gl_FragColor = vec4( color, 1.0 );
  }
`;


const fragmentShader = `
  varying vec2 vUv;
  varying float vDistort;
  
  uniform float uTime;
  uniform float uIntensity;
  
  vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
  }     
  
  void main() {
    float distort = vDistort * uIntensity;
    
    vec3 brightness = vec3(0.5, 0.5, 0.5);
    vec3 contrast = vec3(0.5, 0.5, 0.5);
    vec3 oscilation = vec3(1.0, 1.0, 1.0);
    vec3 phase = vec3(0.0, 0.1, 0.2);
  
    vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);
    
    gl_FragColor = vec4(color, 1.0);
  }  
`;


const vertexTransparent = `
uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

  vec3 I = worldPosition.xyz - cameraPosition;

  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );
  gl_Position = projectionMatrix * mvPosition;
}`;

const fragmentTransparent = ` 
uniform samplerCube tCube;
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main() {
  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  vec4 refractedColor = vec4( 1.0 );

  refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

  gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
}`;


const vertexSphere3 = `

  //
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Many thanks to Ian McEwan of Ashima Arts for the
  // ideas for permutation and gradient selection.
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/stegu/webgl-noise
  //

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise
  float cnoise(vec3 P)
  {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }


  #define PHYSICAL
  varying vec3 vViewPosition;
  #ifndef FLAT_SHADED
    varying vec3 vNormal;
  #endif
  #include <common>
  #include <uv_pars_vertex>
  #include <uv2_pars_vertex>
  #include <displacementmap_pars_vertex>
  #include <color_pars_vertex>
  #include <fog_pars_vertex>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>
  #include <shadowmap_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  #include <clipping_planes_pars_vertex>
  varying float noise;
  uniform float time;
  varying float vDisplacement;

  void main() {
    noise = pnoise(position *0.08 + time * 0.5, vec3(100.0));
    noise = clamp(noise, 0.0, 1.0);
    float displacement = (noise) *20.0;
    vDisplacement = noise;
    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #ifndef FLAT_SHADED
    vNormal = normalize( transformedNormal );
    #endif
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    //transformed = transformed - normal * displacement;
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    vViewPosition = - mvPosition.xyz;
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
    vec3 newPosition = position - normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

  }`;

const fragmentSphere3 = `
  #define PHYSICAL
  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform float roughness;
  uniform float metalness;
  uniform float opacity;

  #ifndef STANDARD
    uniform float clearCoat;
    uniform float clearCoatRoughness;
  #endif

  varying vec3 vViewPosition;

  #ifndef FLAT_SHADED
    varying vec3 vNormal;
  #endif

  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <bsdfs>
  #include <cube_uv_reflection_fragment>
  #include <envmap_pars_fragment>
  #include <envmap_physical_pars_fragment>
  #include <fog_pars_fragment>
  #include <lights_pars_begin>
  #include <lights_physical_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <roughnessmap_pars_fragment>
  #include <metalnessmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>


  varying float vDisplacement;
  uniform sampler2D tExplosion;


  void main() {
    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <emissivemap_fragment>
    #include <lights_physical_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>


    // lookup vertically in the texture, using noise and offset
    // to get the right RGB colour
    vec2 stripPos = vec2( 0.0, vDisplacement );
    vec4 stripColor = texture2D( tExplosion, stripPos );
    stripColor *= pow(0.1, vDisplacement); // darkening intern pixels to fake ambient occlusion

    gl_FragColor *= vec4( stripColor.rgb, 1.0 );
  }`;

       
class Sphere1 {
    constructor(options) {
        this._options = options || {};
        this.container = options.container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.container,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        //this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        //this.scene1.background = new THREE.Color( 0xff0000 );
        this.camera = new THREE.PerspectiveCamera(27, this.width / this.height, 1, 1000);
        this.camera.position.set(0, 0, -50);
        this.camera.lookAt(this.scene.position);
        this.mat = options.mat;
        this.time = 0;
        this.targetRotation = 0;
        this.isPlaying = true;
        this.group = new THREE.Group();
        this.group.position.set(this._options.pos.model.x, this._options.pos.model.y, this._options.pos.model.z);
        this.scene.add(this.group);
        this.getMaterial = (args, callback)=>{
            let material = callback(args);
            return material;
        };
        this.addLight();
        this.addObjects();
        this.resize();
        this.animate();
        this.setupResize();
    }

    settings() {
        this.settings = {
            progress: 0,
        };
    }

    addLight(){
        this.particleLight = new THREE.Mesh(
            new THREE.SphereGeometry( 0.4, 8, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        this.particleLight.position.set(this._options.pos.light.x, this._options.pos.light.y, this._options.pos.light.z);
        this.particleLight.add( new THREE.PointLight( 0xffffff, 100000 ) );
        this.aLight = new THREE.DirectionalLight(0xffffff, 30000.0);
        this.aLight.position.set(0, 3, -5);
        this.aLight1 = new THREE.DirectionalLight(0xffffff, 30000.0);
        this.aLight1.position.set(0, 3, -5);
        this.scene.add(this.aLight);
    }

    addObjects(){
        const geometry = new THREE.SphereGeometry( 8, 64, 32 );
        const offsetNode = timerLocal();
        const customUV = normalWorld.mul( 10 ).add( offsetNode );
        this.material = new MeshPhysicalNodeMaterial();
        this.material.colorNode = mx_noise_vec3( customUV );
        this.mesh = new THREE.Mesh( geometry, this.material );
        this.mesh.scale.set(0.8, 0.8, 0.8);
        this.group.add( this.mesh );
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.render()
            this.isPlaying = true;
        }
    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.005;
        const timer = Date.now() * 0.00025;
        this.particleLight.position.x = Math.sin( timer * 7 ) * 30;
        this.particleLight.position.y = Math.cos( timer * 5 ) * 40;
        this.particleLight.position.z = Math.cos( timer * 3 ) * 30;
        this.targetRotation = Math.PI; 
        this.mesh.rotation.y = this.targetRotation* 0.1 * this.time;
        this.renderer.render(this.scene, this.camera);
    }
      //ANIMATE 
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        nodeFrame.update();
        this.render();
    }
}


class Sphere2 {
  constructor(options) {
    this.container = options.container;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.container,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.camera = new THREE.PerspectiveCamera(27, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 0, 10);
    this.aspect = this.width / this.height;
    this.camera.lookAt(this.scene.position);
    //this.controls1 = new OrbitControls(this.camera1, this.renderer.domElement);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.time = 0;
    this.isPlaying = true;
    this.start = Date.now();
    this.settings = {
      speed: 0.2,
      density: 1.5,
      strength: 0.2,
      frequency: 3.0,
      amplitude: 6.0,
      intensity: 7.0,
    };
    this.addElements();
    this.resize();
    this.render();
    this.setupResize();
    this.animate();
  }

  addlight() {
    const pointLight1 = new THREE.PointLight( 0xffffff, 3, 0, 0 );
    pointLight1.position.set( 0, 0, 0 );
    this.scene.add( pointLight1 );
    const pointLight2 = new THREE.PointLight( 0xffffff, 1, 0, 0 );
    pointLight2.position.set(0, 0, 0 );
    this.scene.add( pointLight2 );
  }

  addElements() {
    const geometry = new THREE.IcosahedronGeometry(1, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: this.settings.speed },
        uNoiseDensity: { value: this.settings.density },
        uNoiseStrength: { value: this.settings.strength },
        uFrequency: { value: this.settings.frequency },
        uAmplitude: { value: this.settings.amplitude },
        uIntensity: { value: this.settings.intensity },
      },
      // wireframe: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0, 0);
    this.mesh.scale.set(1.2, 1.2, 1.2);
    this.group.add(this.mesh);
    const axesHelper = new THREE.AxesHelper( 5 );
    //this.group.add( axesHelper );
  }

  addObject() {
       const sphere =  new THREE.SphereGeometry( 200, 20, 10 )
       //const sphere = new THREE.Mesh( new THREE.SphereGeometry( 200, 20, 10 ), new THREE.MeshPhongMaterial( { flatShading: true } ) );
       this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', { invert: false } );
       this.effect.setSize( window.innerWidth, window.innerHeight );
       //this.effect.domElement.style.color = 'white';
       //this.effect.domElement.style.backgroundColor = 'black';
       this.mesh = initEdgeFinder( // returns THREE.Mesh
           sphere, // THREE buffer geometry, indexed geometry will be converted to non-indexed
           THREE.Mesh, 
           THREE.ShaderMaterial, 
           THREE.Float32BufferAttribute, 
           config, 
           0.001, // edge detection precision in range (0, 1), higher values detect sharper edges only
           0.001, // matching vertice positions detection precision (for example, along uv seams)
        );
        this.scene.add( this.mesh );
        this.container.appendChild( this.effect.domElement );
     }
        
    render() {
      if (!this.isPlaying) return;   
      this.time += 0.5; 
      // Update uniforms
      this.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
      this.mesh.material.uniforms.uSpeed.value = this.settings.speed;    
      this.mesh.material.uniforms.uNoiseDensity.value = this.settings.density;
      this.mesh.material.uniforms.uNoiseStrength.value = this.settings.strength;
      this.mesh.material.uniforms.uFrequency.value = this.settings.frequency;
      this.mesh.material.uniforms.uAmplitude.value = this.settings.amplitude;
      this.mesh.material.uniforms.uIntensity.value = this.settings.intensity;
      this.targetRotation = Math.PI; 
      this.mesh.rotation.y = this.targetRotation* 0.1*this.time;
      this.renderer.render(this.scene, this.camera);
    }
    stop() {
      this.isPlaying = false;
    }

    play() {
      if(!this.isPlaying){
        this.render()
        this.isPlaying = true;
      }
    }

  //ADD EVENT LISTENER
  addEventListeners() {
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }

  //RESIZE
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  // RESIZE
    resize() {
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}


class Sphere3 {
  constructor(options) {
    this.container = options.container;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.container,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.camera = new THREE.PerspectiveCamera(27, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 0, -50);
    this.aspect = this.width / this.height;
    this.camera.lookAt(this.scene.position);
    //this.controls1 = new OrbitControls(this.camera1, this.renderer.domElement);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.time = 0;
    this.targetRotation = 0;
    this.isPlaying = true;
    this.start = Date.now();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.settings = {
      speed: 0.2,
      density: 1.5,
      strength: 0.2,
      frequency: 3.0,
      amplitude: 6.0,
      intensity: 7.0,
    };
    this.addElements();
    this.resize();
    this.render();
    this.setupResize();
    this.animate();
  }

  addlight() {
    const pointLight1 = new THREE.PointLight( 0xffffff, 3, 0, 0 );
    pointLight1.position.set( 0, 0, 0 );
    this.scene.add( pointLight1 );
    const pointLight2 = new THREE.PointLight( 0xffffff, 1, 0, 0 );
    pointLight2.position.set(0, 0, 0 );
    this.scene.add( pointLight2 );
  }

  addElements() {
    var unforms = {
      time: {
        type: "f",
        value: 0.0
      },
      RGBr: {
        type: "f",
        value: 0.8
      },
      RGBg: {
        type: "f",
        value: 0.5
      },
      RGBb: {
        type: "f",
        value: 0.4
      },
      RGBn: {
        type: "f",
        value: 0.03
      },
      RGBm: {
        type: "f",
        value: 1.5
      },
      morph: {
        type: 'f',
        value: 0
      },
      dnoise: {
        type: 'f',
        value: 0
      }
    };
    const geometry = new THREE.SphereGeometry( 8, 64, 32 );
    this.material = new THREE.ShaderMaterial({
          uniforms: unforms,
          vertexShader: vertexText,
          side:THREE.DoubleSide, 
          fragmentShader: fragmentText,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true
    });
    var material = new THREE.MeshBasicMaterial();
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.scale.set(0.8, 0.8, 0.8);
    this.group.add(this.mesh);
  }

    addObject() {
       const sphere =  new THREE.SphereGeometry( 200, 20, 10 )
       //const sphere = new THREE.Mesh( new THREE.SphereGeometry( 200, 20, 10 ), new THREE.MeshPhongMaterial( { flatShading: true } ) );
       this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', { invert: false } );
       this.effect.setSize( window.innerWidth, window.innerHeight );
       //this.effect.domElement.style.color = 'white';
       //this.effect.domElement.style.backgroundColor = 'black';
       this.mesh = initEdgeFinder( // returns THREE.Mesh
           sphere, // THREE buffer geometry, indexed geometry will be converted to non-indexed
           THREE.Mesh, 
           THREE.ShaderMaterial, 
           THREE.Float32BufferAttribute, 
           config, 
           0.001, // edge detection precision in range (0, 1), higher values detect sharper edges only
           0.001, // matching vertice positions detection precision (for example, along uv seams)
        );
        this.scene.add( this.mesh );
        this.container.appendChild( this.effect.domElement );
     }
        
    render() {
      if (!this.isPlaying) return;    
      // Update uniforms    
      var speed = 2;
      var delta = this.clock.getDelta();
      var frame = 2;
      this.material.uniforms.time.value = 0.01 * delta * frame;
      frame+=0.5;
      this.renderer.render(this.scene, this.camera);
      this.targetRotation = Math.PI; 
      this.mesh.rotation.y = this.targetRotation*this.time*0.1;
      this.time += 0.5;
      this.renderer.render(this.scene, this.camera);
    }

    stop() {
      this.isPlaying = false;
    }

    play() {
      if(!this.isPlaying){
        this.render()
        this.isPlaying = true;
      }
    }

  //ADD EVENT LISTENER
  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }

  //RESIZE
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  // RESIZE
    resize() {
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}


class Sphere4 {
    constructor(options) {
        this._options = options || {};
        this.container = options.container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.container,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        //this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        //this.scene1.background = new THREE.Color( 0xff0000 );
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 0, 7);
        this.camera.lookAt(this.scene.position);
        this.clock = new THREE.Clock();
        this.time = 0;
        this.targetRotation = 0;
        this.loopSpeed = 0;
        this.rot = 0;
        this.isPlaying = true;
        this.group = new THREE.Group();
        this.group.position.set(0, 0, -10);
        this.scene.add(this.group);
        this.addObjects();
        this.resize();
        this.animate();
        this.setupResize();
    }

    settings() {
        this.settings = {
            progress: 0,
        };
    }

    addLight(){
        this.particleLight = new THREE.Mesh(
            new THREE.SphereGeometry( 0.4, 8, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        this.particleLight.position.set(this._options.pos.light.x, this._options.pos.light.y, this._options.pos.light.z);
        this.particleLight.add( new THREE.PointLight( 0xffffff, 100000 ) );
        this.aLight = new THREE.DirectionalLight(0xffffff, 30000.0);
        this.aLight.position.set(0, 3, -5);
        this.aLight1 = new THREE.DirectionalLight(0xffffff, 30000.0);
        this.aLight1.position.set(0, 3, -5);
        this.scene.add(this.aLight);
    }

    addObjects(){
        const geometry = new THREE.IcosahedronGeometry(1, 10);
        const geometryPos = geometry.getAttribute("position").array;
        this.mesh = [];
        this.normalDirection = [];
        for (let i = 0; i < geometryPos.length; i += 9) {
            const geometry2 = new THREE.BufferGeometry();
            const vertices = new Float32Array([
              geometryPos[i],
              geometryPos[i + 1],
              geometryPos[i + 2],
              geometryPos[i + 3],
              geometryPos[i + 4],
              geometryPos[i + 5],
              geometryPos[i + 6],
              geometryPos[i + 7],
              geometryPos[i + 8]
            ]);
            geometry2.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
            geometry2.setAttribute("normal", new THREE.BufferAttribute(vertices, 3));
            const normal = new THREE.Vector3(
              (geometryPos[i] + geometryPos[i + 3] + geometryPos[i + 6]) / 3,
              (geometryPos[i + 1] + geometryPos[i + 4] + geometryPos[i + 7]) / 3,
              (geometryPos[i + 2] + geometryPos[i + 5] + geometryPos[i + 8]) / 3
            );
            normal.normalize();
            const icoSphereGeometry = new THREE.IcosahedronGeometry(0.1, 1);
            const material = new THREE.MeshBasicMaterial({
              wireframe: false,
              color: 0xc100eb
            });
            const sphere = new THREE.Mesh(icoSphereGeometry, material);
            this.mesh.push(sphere);
            this.normalDirection.push(normal);
        }
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.render()
            this.isPlaying = true;
        }
    }

    updateTransform() {
        if (!this.isPlaying) return;
        this.rot += 0.3;
        const cameraAngle = (this.rot * Math.PI) / 180;
        let z = this.cameraSetBackDist * Math.cos(cameraAngle);
        let x = this.cameraSetBackDist * Math.sin(cameraAngle);
        this.camera.position.set(x, 0, z);
        this.camera.lookAt(0, 0, 0);
        const elapsedTime = this.clock.getElapsedTime();
        this.mesh.map((spheremesh, index) => {
          const coordinateAverageValue =
            (this.normalDirection[index].x +
             this.normalDirection[index].y +
             this.normalDirection[index].z) / 3;
          const addAngle = coordinateAverageValue * elapsedTime * 1;
          const distance = 1;
          this.loopSpeed += 0.002;
          const radians = (this.loopSpeed * Math.PI) / 180;
          const angle = radians + addAngle;
          const loop = (Math.sin(angle) + 1) * distance;
          const scale = (Math.sin(angle) + 1.1) * 0.3;
          spheremesh.position.set(
            this.normalDirection[index].x * loop,
            this.normalDirection[index].y * loop,
            this.normalDirection[index].z * loop
          );
          spheremesh.scale.set(scale, scale, scale);
          const h = Math.abs(Math.sin(angle)) * 360;
          const s = 100;
          const l = 70;
          const color = new THREE.Color(`hsl(${h},${s}%,${l}%)`);
          spheremesh.material.color = color;
          this.group.add(spheremesh);
        });
    }

    render() {
        this.updateTransform();
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }
}


// settings
var isMobile = typeof window.orientation !== 'undefined'
var isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
var width = window.innerWidth; 
var height = window.innerHeight;
var icoQuality = isMobile ? 6 : 7;

var palleteRed = {
  colors:[
    { c: "#3D0000", l:1 },
    { c: "#F94A4A", l:1 },
    { c: "#E80000", l:1 },
    { c: "#FFCCCC", l:1 },
    { c: "#7C0B0B", l:1 }
  ],
  topColor:"#FFCCCC",
  topColorL:5,
  repeat:20,
  shuffle:true
}

var palleteBlack = {
  colors:[
    { c: "#111111", l:10 },
    { c: "#ed254e", l:1 },
    { c: "#f9dc5c", l:1 },
    { c: "#c2eabd", l:1 },
    { c: "#011936", l:1 },
    { c: "#465362", l:1 },
  ],
  topColor:"#111111",
  topColorL:5,
  repeat:20,
  shuffle:true
}

var themes = [
  {
    name:"#1",
    nameColor:"#E80000",
    pallete:palleteRed, 
    bg:"bg_red",
    roughness:isIOS ? 0.3 : 0.5, 
    metalness:0.1,
    mapIntensity: isMobile ? (isIOS ? 2 : 6) : 12
  },
  {
    name:"#2",
    nameColor:"#111111",
    pallete:palleteBlack, 
    bg:"bg_black",
    roughness:isIOS ? 0.3 : 0.5, 
    metalness:0.5,
    mapIntensity:isMobile ? (isIOS ? 2: 5) : 8
  }
]
var tParam = new URLSearchParams(window.location.search).get("t")
var themeIndex = tParam ? tParam : 1;
var theme = themes[themeIndex];
var scene, camera, renderer;
var start;
var mouse = {x:0, y:0, sx:0, sy:0, dx:0, dy:0};
var textureLoader;
var cubemap;
var cubeRenderTarget;
var cubeTexture;
var capturer;
var timeToStopRecord;
var mousePos = []
var clock;
var loading;
var palleteObj;
var palleteImg;
var palleteTexture;

function loadEnv(url, scene, renderer, icoMaterial){
  new THREE.TextureLoader().load(url, function ( texture ) {
    texture.format = THREE.RGBFormat;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    var cubemapGenerator = new OMNI.EquirectangularToCubeGenerator( texture, { resolution: 1024} );
    var cubeMapTexture = cubemapGenerator.update( renderer );
    var pmremGenerator = new THREE.PMREMGenerator( cubeMapTexture );
    pmremGenerator.update( renderer );
    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
    pmremCubeUVPacker.update( renderer );
    cubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
    texture.dispose();
    cubemapGenerator.dispose();
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();
    envLoaded(scene, icoMaterial)
  });
}


function loadExrEnv(url, scene, renderer, icoMaterial){
  new OMNI.EXRLoader().load( url, function ( texture ) {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.encoding = THREE.LinearEncoding;
    texture.generateMipmaps = true;
    texture.mapping = THREE.UVMapping;
    var cubemapGenerator = new OMNI.EquirectangularToCubeGenerator( texture, { resolution: 1024, type: THREE.HalfFloatType } );
    var cubeMapTexture = cubemapGenerator.update( renderer );
    var pmremGenerator = new THREE.PMREMGenerator( cubeMapTexture );
    pmremGenerator.update( renderer );
    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
    pmremCubeUVPacker.update( renderer );
    cubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
    texture.dispose();
    cubemapGenerator.dispose();
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();
    envLoaded(scene, icoMaterial)
  });
}

function envLoaded(scene, icoMaterial){
    scene.remove(ambLight)
    icoMaterial.envMap = cubeRenderTarget.texture;
    icoMaterial.needsUpdate=true;
}

function inputstart(e){
  inputmove(e);
  mouse.dx = 0;
  mouse.dy = 0;
  mouse.sx = mouse.x;
  mouse.sy = mouse.y;
  prevRotX = rotX;
  prevRotY = rotY;
  
}

function inputmove(e){
  if(e.type == "touchmove")
    e.preventDefault();
  var x, y
  if(e.type.indexOf("mouse") >= 0){
    x = e.clientX;
    y = e.clientY;
  }else{
    x = e.changedTouches[0].clientX
    y = e.changedTouches[0].clientY
  }
  
  mouse.x = (x / window.innerWidth) - 0.5
  mouse.y = (y / window.innerHeight) - 0.5
  mouse.dx = mouse.x - mouse.sx
  mouse.dy = mouse.y - mouse.sy
}

function inputend(e){
  // e.preventDefault();

}

function resize(){
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize( width, height );
}

var changed=false;
var rotX = 0;
var rotY = 0;
var prevRotX = 0
var prevRotY = 0
var rotXEase =0;
var rotYEase =0;


function MeshCustomMaterial (parameters, uniforms, vertexShader, fragmentShader) {
  new THREE.MeshStandardMaterial(this );
  this.uniforms = THREE.UniformsUtils.merge([
    THREE.ShaderLib.standard.uniforms,
    uniforms
  ]);
  this.vertexShader = vertexShader;
  this.fragmentShader = fragmentShader;
  this.type = 'MeshCustomMaterial';
  this.setValues(parameters);
}

MeshCustomMaterial.prototype = Object.create( THREE.MeshStandardMaterial.prototype );
MeshCustomMaterial.prototype.constructor = MeshCustomMaterial;
MeshCustomMaterial.prototype.isMeshStandardMaterial = true;
OMNI.EXRLoader = function ( manager ) {
  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

OMNI.EXRLoader.prototype = Object.create( THREE.DataTextureLoader.prototype );

OMNI.EXRLoader.prototype._parser = function ( buffer ) {
  const USHORT_RANGE = (1 << 16);
  const BITMAP_SIZE = (USHORT_RANGE >> 3);
  const HUF_ENCBITS = 16;  // literal (value) bit length
  const HUF_DECBITS = 14;  // decoding bit size (>= 8)
  const HUF_ENCSIZE = (1 << HUF_ENCBITS) + 1;  // encoding table size
  const HUF_DECSIZE = 1 << HUF_DECBITS;        // decoding table size
  const HUF_DECMASK = HUF_DECSIZE - 1;
  const SHORT_ZEROCODE_RUN = 59;
  const LONG_ZEROCODE_RUN = 63;
  const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;
  const LONGEST_LONG_RUN = 255 + SHORTEST_LONG_RUN;
  const BYTES_PER_HALF = 2;
  const ULONG_SIZE = 8;
  const FLOAT32_SIZE = 4;
  const INT32_SIZE = 4;
  const INT16_SIZE = 2;
  const INT8_SIZE = 1;
  function reverseLutFromBitmap( bitmap, lut ) {
    var k = 0;
    for ( var i = 0; i < USHORT_RANGE; ++ i ) {
      if ( ( i == 0 ) || ( bitmap[ i >> 3 ] & ( 1 << ( i & 7 ) ) ) ) {
        lut[ k ++ ] = i;
      }
    }
    var n = k - 1;
    while ( k < USHORT_RANGE ) lut[ k ++ ] = 0;
    return n;
  }

  function hufClearDecTable( hdec ) {
    for ( var i = 0; i < HUF_DECSIZE; i ++ ) {
      hdec[ i ] = {};
      hdec[ i ].len = 0;
      hdec[ i ].lit = 0;
      hdec[ i ].p = null;
    }
  }

  const getBitsReturn = { l: 0, c: 0, lc: 0 };
  function getBits( nBits, c, lc, uInt8Array, inOffset ) {
    while ( lc < nBits ) {
      c = ( c << 8 ) | parseUint8Array( uInt8Array, inOffset );
      lc += 8;
    }
    lc -= nBits;
    getBitsReturn.l = ( c >> lc ) & ( ( 1 << nBits ) - 1 );
    getBitsReturn.c = c;
    getBitsReturn.lc = lc;
  }

  const hufTableBuffer = new Array( 59 );

  function hufCanonicalCodeTable( hcode ) {
    for ( var i = 0; i <= 58; ++ i ) hufTableBuffer[ i ] = 0;
    for ( var i = 0; i < HUF_ENCSIZE; ++ i ) hufTableBuffer[ hcode[ i ] ] += 1;
    var c = 0;
    for ( var i = 58; i > 0; -- i ) {
      var nc = ( ( c + hufTableBuffer[ i ] ) >> 1 );
      hufTableBuffer[ i ] = c;
      c = nc;
    }

    for ( var i = 0; i < HUF_ENCSIZE; ++ i ) {
      var l = hcode[ i ];
      if ( l > 0 ) hcode[ i ] = l | ( hufTableBuffer[ l ] ++ << 6 );
    }
  }

  function hufUnpackEncTable( uInt8Array, inDataView, inOffset, ni, im, iM, hcode ) {
    var p = inOffset;
    var c = 0;
    var lc = 0;
    for ( ; im <= iM; im ++ ) {
      if ( p.value - inOffset.value > ni ) return false;
      getBits( 6, c, lc, uInt8Array, p );
      var l = getBitsReturn.l;
      c = getBitsReturn.c;
      lc = getBitsReturn.lc;
      hcode[ im ] = l;
      if ( l == LONG_ZEROCODE_RUN ) {
        if ( p.value - inOffset.value > ni ) {
          throw 'Something wrong with hufUnpackEncTable';
        }
        getBits( 8, c, lc, uInt8Array, p );
        var zerun = getBitsReturn.l + SHORTEST_LONG_RUN;
        c = getBitsReturn.c;
        lc = getBitsReturn.lc;
        if ( im + zerun > iM + 1 ) {
          throw 'Something wrong with hufUnpackEncTable';
        }

        while ( zerun -- ) hcode[ im ++ ] = 0;
        im --;
      } else if ( l >= SHORT_ZEROCODE_RUN ) {
        var zerun = l - SHORT_ZEROCODE_RUN + 2;
        if ( im + zerun > iM + 1 ) {
          throw 'Something wrong with hufUnpackEncTable';
        }
        while ( zerun -- ) hcode[ im ++ ] = 0;
        im --;
      }
    }
    hufCanonicalCodeTable( hcode );
  }

  function hufLength( code ) { return code & 63; }

  function hufCode( code ) { return code >> 6; }

  function hufBuildDecTable( hcode, im, iM, hdecod ) {
    for ( ; im <= iM; im ++ ) {
      var c = hufCode( hcode[ im ] );
      var l = hufLength( hcode[ im ] );
      if ( c >> l ) {
        throw 'Invalid table entry';
      }

      if ( l > HUF_DECBITS ) {
        var pl = hdecod[ ( c >> ( l - HUF_DECBITS ) ) ];
        if ( pl.len ) {
          throw 'Invalid table entry';
        }
        pl.lit ++;
        if ( pl.p ) {
          var p = pl.p;
          pl.p = new Array( pl.lit );
          for ( var i = 0; i < pl.lit - 1; ++ i ) {
            pl.p[ i ] = p[ i ];
          }
        } else {
          pl.p = new Array( 1 );
        }
        pl.p[ pl.lit - 1 ] = im;
      } else if ( l ) {
        var plOffset = 0;
        for ( var i = 1 << ( HUF_DECBITS - l ); i > 0; i -- ) {
          var pl = hdecod[ ( c << ( HUF_DECBITS - l ) ) + plOffset ];
          if ( pl.len || pl.p ) {
            throw 'Invalid table entry';
          }
          pl.len = l;
          pl.lit = im;
          plOffset ++;
        }
      }
    }
    return true;
  }

  const getCharReturn = { c: 0, lc: 0 };

  function getChar( c, lc, uInt8Array, inOffset ) {
    c = ( c << 8 ) | parseUint8Array( uInt8Array, inOffset );
    lc += 8;
    getCharReturn.c = c;
    getCharReturn.lc = lc;
  }

  const getCodeReturn = { c: 0, lc: 0 };

  function getCode( po, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outBufferOffset, outBufferEndOffset ) {
    if ( po == rlc ) {
      if ( lc < 8 ) {
        getChar( c, lc, uInt8Array, inOffset );
        c = getCharReturn.c;
        lc = getCharReturn.lc;
      }
      lc -= 8;
      var cs = ( c >> lc );
      var cs = new Uint8Array([cs])[0];
      if ( outBufferOffset.value + cs > outBufferEndOffset ) {
        return false;
      }
      var s = outBuffer[ outBufferOffset.value - 1 ];
      while ( cs-- > 0 ) {
        outBuffer[ outBufferOffset.value ++ ] = s;
      }
    } else if ( outBufferOffset.value < outBufferEndOffset ) {
      outBuffer[ outBufferOffset.value ++ ] = po;
    } else {
      return false;
    }
    getCodeReturn.c = c;
    getCodeReturn.lc = lc;
  }

  var NBITS = 16;
  var A_OFFSET = 1 << ( NBITS - 1 );
  var M_OFFSET = 1 << ( NBITS - 1 );
  var MOD_MASK = ( 1 << NBITS ) - 1;
  function UInt16( value ) {
    return ( value & 0xFFFF );
  }

  function Int16( value ) {
    var ref = UInt16( value );
    return ( ref > 0x7FFF ) ? ref - 0x10000 : ref;
  }

  const wdec14Return = { a: 0, b: 0 };

  function wdec14( l, h ) {
    var ls = Int16( l );
    var hs = Int16( h );
    var hi = hs;
    var ai = ls + ( hi & 1 ) + ( hi >> 1 );
    var as = ai;
    var bs = ai - hi;
    wdec14Return.a = as;
    wdec14Return.b = bs;
  }

  function wav2Decode( j, buffer, nx, ox, ny, oy, mx ) {
    var n = ( nx > ny ) ? ny : nx;
    var p = 1;
    var p2;
    while ( p <= n ) p <<= 1;
    p >>= 1;
    p2 = p;
    p >>= 1;
    while ( p >= 1 ) {
      var py = 0;
      var ey = py + oy * ( ny - p2 );
      var oy1 = oy * p;
      var oy2 = oy * p2;
      var ox1 = ox * p;
      var ox2 = ox * p2;
      var i00, i01, i10, i11;
      for ( ; py <= ey; py += oy2 ) {
        var px = py;
        var ex = py + ox * ( nx - p2 );
        for ( ; px <= ex; px += ox2 ) {
          var p01 = px + ox1;
          var p10 = px + oy1;
          var p11 = p10 + ox1;
          wdec14( buffer[ px + j ], buffer[ p10 + j ] );
          i00 = wdec14Return.a;
          i10 = wdec14Return.b;
          wdec14( buffer[ p01 + j ], buffer[ p11 + j ] );
          i01 = wdec14Return.a;
          i11 = wdec14Return.b;
          wdec14( i00, i01 );
          buffer[ px + j ] = wdec14Return.a;
          buffer[ p01 + j ] = wdec14Return.b;
          wdec14( i10, i11 );
          buffer[ p10 + j ] = wdec14Return.a;
          buffer[ p11 + j ] = wdec14Return.b;
        }

        if ( nx & p ) {
          var p10 = px + oy1;
          wdec14( buffer[ px + j ], buffer[ p10 + j ] );
          i00 = wdec14Return.a;
          buffer[ p10 + j ] = wdec14Return.b;
          buffer[ px + j ] = i00;
        }
      }

      if ( ny & p ) {
        var px = py;
        var ex = py + ox * ( nx - p2 );
        for ( ; px <= ex; px += ox2 ) {
          var p01 = px + ox1;
          wdec14( buffer[ px + j ], buffer[ p01 + j ] );
          i00 = wdec14Return.a;
          buffer[ p01 + j ] = wdec14Return.b;
          buffer[ px + j ] = i00;
        }
      }
      p2 = p;
      p >>= 1;
    }
    return py;
  }

  function hufDecode( encodingTable, decodingTable, uInt8Array, inDataView, inOffset, ni, rlc, no, outBuffer, outOffset ) {
    var c = 0;
    var lc = 0;
    var outBufferEndOffset = no;
    var inOffsetEnd = Math.trunc( inOffset.value + ( ni + 7 ) / 8 );
    while ( inOffset.value < inOffsetEnd ) {
      getChar( c, lc, uInt8Array, inOffset );
      c = getCharReturn.c;
      lc = getCharReturn.lc;
      while ( lc >= HUF_DECBITS ) {
        var index = ( c >> ( lc - HUF_DECBITS ) ) & HUF_DECMASK;
        var pl = decodingTable[ index ];
        if ( pl.len ) {
          lc -= pl.len;
          getCode( pl.lit, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset );
          c = getCodeReturn.c;
          lc = getCodeReturn.lc;
        } else {
          if ( ! pl.p ) {
            throw 'hufDecode issues';
          }
          var j;
          for ( j = 0; j < pl.lit; j ++ ) {
            var l = hufLength( encodingTable[ pl.p[ j ] ] );
            while ( lc < l && inOffset.value < inOffsetEnd ) {
              getChar( c, lc, uInt8Array, inOffset );
              c = getCharReturn.c;
              lc = getCharReturn.lc;
            }
            if ( lc >= l ) {
              if ( hufCode( encodingTable[ pl.p[ j ] ] ) == ( ( c >> ( lc - l ) ) & ( ( 1 << l ) - 1 ) ) ) {
                lc -= l;
                getCode( pl.p[ j ], rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset );
                c = getCodeReturn.c;
                lc = getCodeReturn.lc;
                break;
              }
            }
          }

          if ( j == pl.lit ) {
            throw 'hufDecode issues';
          }
        }
      }
    }
    var i = ( 8 - ni ) & 7;
    c >>= i;
    lc -= i;
    while ( lc > 0 ) {
      var pl = decodingTable[ ( c << ( HUF_DECBITS - lc ) ) & HUF_DECMASK ];
      if ( pl.len ) {
        lc -= pl.len;
        getCode( pl.lit, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset );
        c = getCodeReturn.c;
        lc = getCodeReturn.lc;
      } else {
        throw 'hufDecode issues';
      }
    }
    return true;
  }

  function hufUncompress( uInt8Array, inDataView, inOffset, nCompressed, outBuffer, outOffset, nRaw ) {
    var initialInOffset = inOffset.value;
    var im = parseUint32( inDataView, inOffset );
    var iM = parseUint32( inDataView, inOffset );
    inOffset.value += 4;
    var nBits = parseUint32( inDataView, inOffset );
    inOffset.value += 4;
    if ( im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE ) {
      throw 'Something wrong with HUF_ENCSIZE';
    }

    var freq = new Array( HUF_ENCSIZE );
    var hdec = new Array( HUF_DECSIZE );
    hufClearDecTable( hdec );
    var ni = nCompressed - ( inOffset.value - initialInOffset );
    hufUnpackEncTable( uInt8Array, inDataView, inOffset, ni, im, iM, freq );
    if ( nBits > 8 * ( nCompressed - ( inOffset.value - initialInOffset ) ) ) {
      throw 'Something wrong with hufUncompress';
    }

    hufBuildDecTable( freq, im, iM, hdec );
    hufDecode( freq, hdec, uInt8Array, inDataView, inOffset, nBits, iM, nRaw, outBuffer, outOffset );
  }

  function applyLut( lut, data, nData ) {
    for ( var i = 0; i < nData; ++ i ) {
      data[ i ] = lut[ data[ i ] ];
    }
  }

  function decompressPIZ( outBuffer, outOffset, uInt8Array, inDataView, inOffset, tmpBufSize, num_channels, exrChannelInfos, dataWidth, num_lines ) {
    var bitmap = new Uint8Array( BITMAP_SIZE );
    var minNonZero = parseUint16( inDataView, inOffset );
    var maxNonZero = parseUint16( inDataView, inOffset );
    if ( maxNonZero >= BITMAP_SIZE ) {
      throw 'Something is wrong with PIZ_COMPRESSION BITMAP_SIZE';
    }

    if ( minNonZero <= maxNonZero ) {
      for ( var i = 0; i < maxNonZero - minNonZero + 1; i ++ ) {
        bitmap[ i + minNonZero ] = parseUint8( inDataView, inOffset );
      }
    }

    var lut = new Uint16Array( USHORT_RANGE );
    var maxValue = reverseLutFromBitmap( bitmap, lut );

    var length = parseUint32( inDataView, inOffset );

    hufUncompress( uInt8Array, inDataView, inOffset, length, outBuffer, outOffset, tmpBufSize );

    var pizChannelData = new Array( num_channels );

    var outBufferEnd = 0;

    for ( var i = 0; i < num_channels; i ++ ) {

      var exrChannelInfo = exrChannelInfos[ i ];

      var pixelSize = 2; // assumes HALF_FLOAT

      pizChannelData[ i ] = {};
      pizChannelData[ i ][ 'start' ] = outBufferEnd;
      pizChannelData[ i ][ 'end' ] = pizChannelData[ i ][ 'start' ];
      pizChannelData[ i ][ 'nx' ] = dataWidth;
      pizChannelData[ i ][ 'ny' ] = num_lines;
      pizChannelData[ i ][ 'size' ] = 1;

      outBufferEnd += pizChannelData[ i ].nx * pizChannelData[ i ].ny * pizChannelData[ i ].size;

    }

    var fooOffset = 0;

    for ( var i = 0; i < num_channels; i ++ ) {

      for ( var j = 0; j < pizChannelData[ i ].size; ++ j ) {

        fooOffset += wav2Decode(
          j + fooOffset,
          outBuffer,
          pizChannelData[ i ].nx,
          pizChannelData[ i ].size,
          pizChannelData[ i ].ny,
          pizChannelData[ i ].nx * pizChannelData[ i ].size,
          maxValue
        );

      }

    }

    applyLut( lut, outBuffer, outBufferEnd );

    return true;

  }

  function parseNullTerminatedString( buffer, offset ) {

    var uintBuffer = new Uint8Array( buffer );
    var endOffset = 0;

    while ( uintBuffer[ offset.value + endOffset ] != 0 ) {

      endOffset += 1;

    }

    var stringValue = new TextDecoder().decode(
      uintBuffer.slice( offset.value, offset.value + endOffset )
    );

    offset.value = offset.value + endOffset + 1;

    return stringValue;

  }

  function parseFixedLengthString( buffer, offset, size ) {

    var stringValue = new TextDecoder().decode(
      new Uint8Array( buffer ).slice( offset.value, offset.value + size )
    );

    offset.value = offset.value + size;

    return stringValue;

  }

  function parseUlong( dataView, offset ) {

    var uLong = dataView.getUint32( 0, true );

    offset.value = offset.value + ULONG_SIZE;

    return uLong;

  }

  function parseUint32( dataView, offset ) {

    var Uint32 = dataView.getUint32(offset.value, true);

    offset.value = offset.value + INT32_SIZE;

    return Uint32;

  }

  function parseUint8Array( uInt8Array, offset ) {

    var Uint8 = uInt8Array[offset.value];

    offset.value = offset.value + INT8_SIZE;

    return Uint8;

  }

  function parseUint8( dataView, offset ) {

    var Uint8 = dataView.getUint8(offset.value);

    offset.value = offset.value + INT8_SIZE;

    return Uint8;

  }

  function parseFloat32( dataView, offset ) {

    var float = dataView.getFloat32(offset.value, true);

    offset.value += FLOAT32_SIZE;

    return float;

  }

  // https://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
  function decodeFloat16( binary ) {

    var exponent = ( binary & 0x7C00 ) >> 10,
      fraction = binary & 0x03FF;

    return ( binary >> 15 ? - 1 : 1 ) * (
      exponent ?
        (
          exponent === 0x1F ?
            fraction ? NaN : Infinity :
            Math.pow( 2, exponent - 15 ) * ( 1 + fraction / 0x400 )
        ) :
        6.103515625e-5 * ( fraction / 0x400 )
    );

  }

  function parseUint16( dataView, offset ) {

    var Uint16 = dataView.getUint16( offset.value, true );

    offset.value += INT16_SIZE;

    return Uint16;

  }

  function parseFloat16( buffer, offset ) {

    return decodeFloat16( parseUint16( buffer, offset) );

  }

  function parseChlist( dataView, buffer, offset, size ) {

    var startOffset = offset.value;
    var channels = [];

    while ( offset.value < ( startOffset + size - 1 ) ) {

      var name = parseNullTerminatedString( buffer, offset );
      var pixelType = parseUint32( dataView, offset ); // TODO: Cast this to UINT, HALF or FLOAT
      var pLinear = parseUint8( dataView, offset );
      offset.value += 3; // reserved, three chars
      var xSampling = parseUint32( dataView, offset );
      var ySampling = parseUint32( dataView, offset );

      channels.push( {
        name: name,
        pixelType: pixelType,
        pLinear: pLinear,
        xSampling: xSampling,
        ySampling: ySampling
      } );

    }

    offset.value += 1;

    return channels;

  }

  function parseChromaticities( dataView, offset ) {

    var redX = parseFloat32( dataView, offset );
    var redY = parseFloat32( dataView, offset );
    var greenX = parseFloat32( dataView, offset );
    var greenY = parseFloat32( dataView, offset );
    var blueX = parseFloat32( dataView, offset );
    var blueY = parseFloat32( dataView, offset );
    var whiteX = parseFloat32( dataView, offset );
    var whiteY = parseFloat32( dataView, offset );

    return { redX: redX, redY: redY, greenX: greenX, greenY: greenY, blueX: blueX, blueY: blueY, whiteX: whiteX, whiteY: whiteY };

  }

  function parseCompression( dataView, offset ) {

    var compressionCodes = [
      'NO_COMPRESSION',
      'RLE_COMPRESSION',
      'ZIPS_COMPRESSION',
      'ZIP_COMPRESSION',
      'PIZ_COMPRESSION'
    ];

    var compression = parseUint8( dataView, offset );

    return compressionCodes[ compression ];

  }

  function parseBox2i( dataView, offset ) {

    var xMin = parseUint32( dataView, offset );
    var yMin = parseUint32( dataView, offset );
    var xMax = parseUint32( dataView, offset );
    var yMax = parseUint32( dataView, offset );

    return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };

  }

  function parseLineOrder( dataView, offset ) {

    var lineOrders = [
      'INCREASING_Y'
    ];

    var lineOrder = parseUint8( dataView, offset );

    return lineOrders[ lineOrder ];

  }

  function parseV2f( dataView, offset ) {

    var x = parseFloat32( dataView, offset );
    var y = parseFloat32( dataView, offset );

    return [ x, y ];

  }

  function parseValue( dataView, buffer, offset, type, size ) {

    if ( type === 'string' || type === 'iccProfile' ) {

      return parseFixedLengthString( buffer, offset, size );

    } else if ( type === 'chlist' ) {

      return parseChlist( dataView, buffer, offset, size );

    } else if ( type === 'chromaticities' ) {

      return parseChromaticities( dataView, offset );

    } else if ( type === 'compression' ) {

      return parseCompression( dataView, offset );

    } else if ( type === 'box2i' ) {

      return parseBox2i( dataView, offset );

    } else if ( type === 'lineOrder' ) {

      return parseLineOrder( dataView, offset );

    } else if ( type === 'float' ) {

      return parseFloat32( dataView, offset );

    } else if ( type === 'v2f' ) {

      return parseV2f( dataView, offset );

    } else if ( type === 'int' ) {

      return parseUint32( dataView, offset );

    } else {

      throw 'Cannot parse value for unsupported type: ' + type;

    }

  }

  var bufferDataView = new DataView(buffer);
  var uInt8Array = new Uint8Array(buffer);

  var EXRHeader = {};

  var magic = bufferDataView.getUint32( 0, true );
  var versionByteZero = bufferDataView.getUint8( 4, true );
  var fullMask = bufferDataView.getUint8( 5, true );

  // start of header

  var offset = { value: 8 }; // start at 8, after magic stuff

  var keepReading = true;

  while ( keepReading ) {

    var attributeName = parseNullTerminatedString( buffer, offset );

    if ( attributeName == 0 ) {

      keepReading = false;

    } else {

      var attributeType = parseNullTerminatedString( buffer, offset );
      var attributeSize = parseUint32( bufferDataView, offset );
      var attributeValue = parseValue( bufferDataView, buffer, offset, attributeType, attributeSize );

      EXRHeader[ attributeName ] = attributeValue;

    }

  }

  // offsets

  var dataWindowHeight = EXRHeader.dataWindow.yMax + 1;
  var scanlineBlockSize = 1; // 1 for NO_COMPRESSION

  if ( EXRHeader.compression === 'PIZ_COMPRESSION' ) {

    scanlineBlockSize = 32;

  }

  var numBlocks = dataWindowHeight / scanlineBlockSize;

  for ( var i = 0; i < numBlocks; i ++ ) {

    var scanlineOffset = parseUlong( bufferDataView, offset );

  }

  // we should be passed the scanline offset table, start reading pixel data

  var width = EXRHeader.dataWindow.xMax - EXRHeader.dataWindow.xMin + 1;
  var height = EXRHeader.dataWindow.yMax - EXRHeader.dataWindow.yMin + 1;
  var numChannels = EXRHeader.channels.length;

  var byteArray = new Float32Array( width * height * numChannels );

  var channelOffsets = {
    R: 0,
    G: 1,
    B: 2,
    A: 3
  };

  if ( EXRHeader.compression === 'NO_COMPRESSION' ) {

    for ( var y = 0; y < height; y ++ ) {

      var y_scanline = parseUint32( bufferDataView, offset );
      var dataSize = parseUint32( bufferDataView, offset );

      for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {

        var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

        if ( EXRHeader.channels[ channelID ].pixelType === 1 ) {

          // HALF
          for ( var x = 0; x < width; x ++ ) {

            var val = parseFloat16( bufferDataView, offset );

            byteArray[ ( ( ( height - y_scanline ) * ( width * numChannels ) ) + ( x * numChannels ) ) + cOff ] = val;

          }

        } else {

          throw 'Only supported pixel format is HALF';

        }

      }

    }

  } else if ( EXRHeader.compression === 'PIZ_COMPRESSION' ) {

    for ( var scanlineBlockIdx = 0; scanlineBlockIdx < height / scanlineBlockSize; scanlineBlockIdx ++ ) {

      var line_no = parseUint32( bufferDataView, offset );
      var data_len = parseUint32( bufferDataView, offset );

      var tmpBufferSize = width * scanlineBlockSize * ( EXRHeader.channels.length * BYTES_PER_HALF );
      var tmpBuffer = new Uint16Array( tmpBufferSize );
      var tmpOffset = { value: 0 };

      decompressPIZ( tmpBuffer, tmpOffset, uInt8Array, bufferDataView, offset, tmpBufferSize, numChannels, EXRHeader.channels, width, scanlineBlockSize );

      for ( var line_y = 0; line_y < scanlineBlockSize; line_y ++ ) {

        for ( var channelID = 0; channelID < EXRHeader.channels.length; channelID ++ ) {

          var cOff = channelOffsets[ EXRHeader.channels[ channelID ].name ];

          if ( EXRHeader.channels[ channelID ].pixelType === 1 ) {

            // HALF
            for ( var x = 0; x < width; x ++ ) {

              var val = decodeFloat16( tmpBuffer[ ( channelID * ( scanlineBlockSize * width ) ) + ( line_y * width ) + x ] );

              var true_y = line_y + ( scanlineBlockIdx * scanlineBlockSize );

              byteArray[ ( ( ( height - true_y ) * ( width * numChannels ) ) + ( x * numChannels ) ) + cOff ] = val;

            }

          } else {

            throw 'Only supported pixel format is HALF';

          }

        }

      }

    }

  } else {

    throw 'Cannot decompress unsupported compression';

  }

  return {
    header: EXRHeader,
    width: width,
    height: height,
    data: byteArray,
    format: EXRHeader.channels.length == 4 ? THREE.RGBAFormat : THREE.RGBFormat,
    type: THREE.FloatType
  };

};


/**
* @author Richard M. / https://github.com/richardmonette
*/

OMNI.EquirectangularToCubeGenerator = function ( sourceTexture, options ) {

  this.sourceTexture = sourceTexture;
  this.resolution = options.resolution || 512;

  this.views = [
    { t: [ 1, 0, 0 ], u: [ 0, - 1, 0 ] },
    { t: [ - 1, 0, 0 ], u: [ 0, - 1, 0 ] },
    { t: [ 0, 1, 0 ], u: [ 0, 0, 1 ] },
    { t: [ 0, - 1, 0 ], u: [ 0, 0, - 1 ] },
    { t: [ 0, 0, 1 ], u: [ 0, - 1, 0 ] },
    { t: [ 0, 0, - 1 ], u: [ 0, - 1, 0 ] },
  ];

  this.camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10 );
  this.boxMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), this.getShader() );
  this.boxMesh.material.side = THREE.BackSide;
  this.scene = new THREE.Scene();
  this.scene.add( this.boxMesh );

  var params = {
    format: options.format || this.sourceTexture.format,
    magFilter: this.sourceTexture.magFilter,
    minFilter: this.sourceTexture.minFilter,
    type: options.type || this.sourceTexture.type,
    generateMipmaps: this.sourceTexture.generateMipmaps,
    anisotropy: this.sourceTexture.anisotropy,
    encoding: this.sourceTexture.encoding
  };

  this.renderTarget = new THREE.WebGLRenderTargetCube( this.resolution, this.resolution, params );

};

OMNI.EquirectangularToCubeGenerator.prototype = {

  constructor: THREE.EquirectangularToCubeGenerator,

  update: function ( renderer ) {

    for ( var i = 0; i < 6; i ++ ) {

      this.renderTarget.activeCubeFace = i;

      var v = this.views[ i ];

      this.camera.position.set( 0, 0, 0 );
      this.camera.up.set( v.u[ 0 ], v.u[ 1 ], v.u[ 2 ] );
      this.camera.lookAt( v.t[ 0 ], v.t[ 1 ], v.t[ 2 ] );

      renderer.render( this.scene, this.camera, this.renderTarget, true );

    }

    return this.renderTarget.texture;

  },

  getShader: function () {

    var shaderMaterial = new THREE.ShaderMaterial( {

      uniforms: {
        "equirectangularMap": { value: this.sourceTexture },
      },

      vertexShader:
        "varying vec3 localPosition;\n\
        \n\
        void main() {\n\
          localPosition = position;\n\
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
        }",

      fragmentShader:
        "#include <common>\n\
        varying vec3 localPosition;\n\
        uniform sampler2D equirectangularMap;\n\
        \n\
        vec2 EquirectangularSampleUV(vec3 v) {\n\
          vec2 uv = vec2(atan(v.z, v.x), asin(v.y));\n\
          uv *= vec2(0.1591, 0.3183); // inverse atan\n\
          uv += 0.5;\n\
          return uv;\n\
        }\n\
        \n\
        void main() {\n\
          vec2 uv = EquirectangularSampleUV(normalize(localPosition));\n\
          gl_FragColor = texture2D(equirectangularMap, uv);\n\
        }",

      blending: THREE.NoBlending

    } );

    shaderMaterial.type = 'EquirectangularToCubeGenerator';

    return shaderMaterial;

  },

  dispose: function () {

    this.boxMesh.geometry.dispose();
    this.boxMesh.material.dispose();
    this.renderTarget.dispose();

  }

};

/**
 * @author Prashant Sharma / spidersharma03
 * @author Ben Houston / bhouston, https://clara.io
 *
 * To avoid cube map seams, I create an extra pixel around each face. This way when the cube map is
 * sampled by an application later(with a little care by sampling the centre of the texel), the extra 1 border
 *  of pixels makes sure that there is no seams artifacts present. This works perfectly for cubeUV format as
 *  well where the 6 faces can be arranged in any manner whatsoever.
 * Code in the beginning of fragment shader's main function does this job for a given resolution.
 *  Run Scene_PMREM_Test.html in the examples directory to see the sampling from the cube lods generated
 *  by this class.
 */

OMNI.PMREMGenerator = function ( sourceTexture, samplesPerLevel, resolution ) {

  this.sourceTexture = sourceTexture;
  this.resolution = ( resolution !== undefined ) ? resolution : 256; // NODE: 256 is currently hard coded in the glsl code for performance reasons
  this.samplesPerLevel = ( samplesPerLevel !== undefined ) ? samplesPerLevel : 16;

  var monotonicEncoding = ( sourceTexture.encoding === THREE.LinearEncoding ) ||
    ( sourceTexture.encoding === THREE.GammaEncoding ) || ( sourceTexture.encoding === THREE.sRGBEncoding );

  this.sourceTexture.minFilter = ( monotonicEncoding ) ? THREE.LinearFilter : THREE.NearestFilter;
  this.sourceTexture.magFilter = ( monotonicEncoding ) ? THREE.LinearFilter : THREE.NearestFilter;
  this.sourceTexture.generateMipmaps = this.sourceTexture.generateMipmaps && monotonicEncoding;

  this.cubeLods = [];

  var size = this.resolution;
  var params = {
    format: this.sourceTexture.format,
    magFilter: this.sourceTexture.magFilter,
    minFilter: this.sourceTexture.minFilter,
    type: this.sourceTexture.type,
    generateMipmaps: this.sourceTexture.generateMipmaps,
    anisotropy: this.sourceTexture.anisotropy,
    encoding: this.sourceTexture.encoding
   };

  // how many LODs fit in the given CubeUV Texture.
  this.numLods = Math.log( size ) / Math.log( 2 ) - 2; // IE11 doesn't support Math.log2

  for ( var i = 0; i < this.numLods; i ++ ) {

    var renderTarget = new THREE.WebGLRenderTargetCube( size, size, params );
    renderTarget.texture.name = "PMREMGenerator.cube" + i;
    this.cubeLods.push( renderTarget );
    size = Math.max( 16, size / 2 );

  }

  this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0.0, 1000 );

  this.shader = this.getShader();
  this.shader.defines[ 'SAMPLES_PER_LEVEL' ] = this.samplesPerLevel;
  this.planeMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2, 0 ), this.shader );
  this.planeMesh.material.side = THREE.DoubleSide;
  this.scene = new THREE.Scene();
  this.scene.add( this.planeMesh );
  this.scene.add( this.camera );

  this.shader.uniforms[ 'envMap' ].value = this.sourceTexture;
  this.shader.envMap = this.sourceTexture;

};

OMNI.PMREMGenerator.prototype = {

  constructor: THREE.PMREMGenerator,

  /*
   * Prashant Sharma / spidersharma03: More thought and work is needed here.
   * Right now it's a kind of a hack to use the previously convolved map to convolve the current one.
   * I tried to use the original map to convolve all the lods, but for many textures(specially the high frequency)
   * even a high number of samples(1024) dosen't lead to satisfactory results.
   * By using the previous convolved maps, a lower number of samples are generally sufficient(right now 32, which
   * gives okay results unless we see the reflection very carefully, or zoom in too much), however the math
   * goes wrong as the distribution function tries to sample a larger area than what it should be. So I simply scaled
   * the roughness by 0.9(totally empirical) to try to visually match the original result.
   * The condition "if(i <5)" is also an attemt to make the result match the original result.
   * This method requires the most amount of thinking I guess. Here is a paper which we could try to implement in future::
   * http://http.developer.nvidia.com/GPUGems3/gpugems3_ch20.html
   */
  update: function ( renderer ) {

    this.shader.uniforms[ 'envMap' ].value = this.sourceTexture;
    this.shader.envMap = this.sourceTexture;

    var gammaInput = renderer.gammaInput;
    var gammaOutput = renderer.gammaOutput;
    var toneMapping = renderer.toneMapping;
    var toneMappingExposure = renderer.toneMappingExposure;
    var currentRenderTarget = renderer.getRenderTarget();

    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.gammaInput = false;
    renderer.gammaOutput = false;

    for ( var i = 0; i < this.numLods; i ++ ) {

      var r = i / ( this.numLods - 1 );
      this.shader.uniforms[ 'roughness' ].value = r * 0.9; // see comment above, pragmatic choice
      this.shader.uniforms[ 'queryScale' ].value.x = ( i == 0 ) ? - 1 : 1;
      var size = this.cubeLods[ i ].width;
      this.shader.uniforms[ 'mapSize' ].value = size;
      this.renderToCubeMapTarget( renderer, this.cubeLods[ i ] );

      if ( i < 5 ) this.shader.uniforms[ 'envMap' ].value = this.cubeLods[ i ].texture;

    }

    renderer.setRenderTarget( currentRenderTarget );
    renderer.toneMapping = toneMapping;
    renderer.toneMappingExposure = toneMappingExposure;
    renderer.gammaInput = gammaInput;
    renderer.gammaOutput = gammaOutput;

  },

  renderToCubeMapTarget: function ( renderer, renderTarget ) {

    for ( var i = 0; i < 6; i ++ ) {

      this.renderToCubeMapTargetFace( renderer, renderTarget, i );

    }

  },

  renderToCubeMapTargetFace: function ( renderer, renderTarget, faceIndex ) {

    renderTarget.activeCubeFace = faceIndex;
    this.shader.uniforms[ 'faceIndex' ].value = faceIndex;
    renderer.render( this.scene, this.camera, renderTarget, true );

  },

  getShader: function () {

    var shaderMaterial = new THREE.ShaderMaterial( {

      defines: {
        "SAMPLES_PER_LEVEL": 20,
      },

      uniforms: {
        "faceIndex": { value: 0 },
        "roughness": { value: 0.5 },
        "mapSize": { value: 0.5 },
        "envMap": { value: null },
        "queryScale": { value: new THREE.Vector3( 1, 1, 1 ) },
        "testColor": { value: new THREE.Vector3( 1, 1, 1 ) },
      },

      vertexShader:
        "varying vec2 vUv;\n\
        void main() {\n\
          vUv = uv;\n\
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
        }",

      fragmentShader:
        "#include <common>\n\
        varying vec2 vUv;\n\
        uniform int faceIndex;\n\
        uniform float roughness;\n\
        uniform samplerCube envMap;\n\
        uniform float mapSize;\n\
        uniform vec3 testColor;\n\
        uniform vec3 queryScale;\n\
        \n\
        float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n\
          float a = ggxRoughness + 0.0001;\n\
          a *= a;\n\
          return ( 2.0 / a - 2.0 );\n\
        }\n\
        vec3 ImportanceSamplePhong(vec2 uv, mat3 vecSpace, float specPow) {\n\
          float phi = uv.y * 2.0 * PI;\n\
          float cosTheta = pow(1.0 - uv.x, 1.0 / (specPow + 1.0));\n\
          float sinTheta = sqrt(1.0 - cosTheta * cosTheta);\n\
          vec3 sampleDir = vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);\n\
          return vecSpace * sampleDir;\n\
        }\n\
        vec3 ImportanceSampleGGX( vec2 uv, mat3 vecSpace, float Roughness )\n\
        {\n\
          float a = Roughness * Roughness;\n\
          float Phi = 2.0 * PI * uv.x;\n\
          float CosTheta = sqrt( (1.0 - uv.y) / ( 1.0 + (a*a - 1.0) * uv.y ) );\n\
          float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );\n\
          return vecSpace * vec3(SinTheta * cos( Phi ), SinTheta * sin( Phi ), CosTheta);\n\
        }\n\
        mat3 matrixFromVector(vec3 n) {\n\
          float a = 1.0 / (1.0 + n.z);\n\
          float b = -n.x * n.y * a;\n\
          vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);\n\
          vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);\n\
          return mat3(b1, b2, n);\n\
        }\n\
        \n\
        vec4 testColorMap(float Roughness) {\n\
          vec4 color;\n\
          if(faceIndex == 0)\n\
            color = vec4(1.0,0.0,0.0,1.0);\n\
          else if(faceIndex == 1)\n\
            color = vec4(0.0,1.0,0.0,1.0);\n\
          else if(faceIndex == 2)\n\
            color = vec4(0.0,0.0,1.0,1.0);\n\
          else if(faceIndex == 3)\n\
            color = vec4(1.0,1.0,0.0,1.0);\n\
          else if(faceIndex == 4)\n\
            color = vec4(0.0,1.0,1.0,1.0);\n\
          else\n\
            color = vec4(1.0,0.0,1.0,1.0);\n\
          color *= ( 1.0 - Roughness );\n\
          return color;\n\
        }\n\
        void main() {\n\
          vec3 sampleDirection;\n\
          vec2 uv = vUv*2.0 - 1.0;\n\
          float offset = -1.0/mapSize;\n\
          const float a = -1.0;\n\
          const float b = 1.0;\n\
          float c = -1.0 + offset;\n\
          float d = 1.0 - offset;\n\
          float bminusa = b - a;\n\
          uv.x = (uv.x - a)/bminusa * d - (uv.x - b)/bminusa * c;\n\
          uv.y = (uv.y - a)/bminusa * d - (uv.y - b)/bminusa * c;\n\
          if (faceIndex==0) {\n\
            sampleDirection = vec3(1.0, -uv.y, -uv.x);\n\
          } else if (faceIndex==1) {\n\
            sampleDirection = vec3(-1.0, -uv.y, uv.x);\n\
          } else if (faceIndex==2) {\n\
            sampleDirection = vec3(uv.x, 1.0, uv.y);\n\
          } else if (faceIndex==3) {\n\
            sampleDirection = vec3(uv.x, -1.0, -uv.y);\n\
          } else if (faceIndex==4) {\n\
            sampleDirection = vec3(uv.x, -uv.y, 1.0);\n\
          } else {\n\
            sampleDirection = vec3(-uv.x, -uv.y, -1.0);\n\
          }\n\
          mat3 vecSpace = matrixFromVector(normalize(sampleDirection * queryScale));\n\
          vec3 rgbColor = vec3(0.0);\n\
          const int NumSamples = SAMPLES_PER_LEVEL;\n\
          vec3 vect;\n\
          float weight = 0.0;\n\
          for( int i = 0; i < NumSamples; i ++ ) {\n\
            float sini = sin(float(i));\n\
            float cosi = cos(float(i));\n\
            float r = rand(vec2(sini, cosi));\n\
            vect = ImportanceSampleGGX(vec2(float(i) / float(NumSamples), r), vecSpace, roughness);\n\
            float dotProd = dot(vect, normalize(sampleDirection));\n\
            weight += dotProd;\n\
            vec3 color = envMapTexelToLinear(textureCube(envMap,vect)).rgb;\n\
            rgbColor.rgb += color;\n\
          }\n\
          rgbColor /= float(NumSamples);\n\
          //rgbColor = testColorMap( roughness ).rgb;\n\
          gl_FragColor = linearToOutputTexel( vec4( rgbColor, 1.0 ) );\n\
        }",

      blending: THREE.NoBlending

    } );

    shaderMaterial.type = 'PMREMGenerator';

    return shaderMaterial;

  },

  dispose: function () {

    for ( var i = 0, l = this.cubeLods.length; i < l; i ++ ) {

      this.cubeLods[ i ].dispose();

    }

    this.planeMesh.geometry.dispose();
    this.planeMesh.material.dispose();

  }

};

/**
 * @author Prashant Sharma / spidersharma03
 * @author Ben Houston / bhouston, https://clara.io
 *
 * This class takes the cube lods(corresponding to different roughness values), and creates a single cubeUV
 * Texture. The format for a given roughness set of faces is simply::
 * +X+Y+Z
 * -X-Y-Z
 * For every roughness a mip map chain is also saved, which is essential to remove the texture artifacts due to
 * minification.
 * Right now for every face a PlaneMesh is drawn, which leads to a lot of geometry draw calls, but can be replaced
 * later by drawing a single buffer and by sending the appropriate faceIndex via vertex attributes.
 * The arrangement of the faces is fixed, as assuming this arrangement, the sampling function has been written.
 */

OMNI.PMREMCubeUVPacker = function ( cubeTextureLods ) {

  this.cubeLods = cubeTextureLods;
  var size = cubeTextureLods[ 0 ].width * 4;

  var sourceTexture = cubeTextureLods[ 0 ].texture;
  var params = {
    format: sourceTexture.format,
    magFilter: sourceTexture.magFilter,
    minFilter: sourceTexture.minFilter,
    type: sourceTexture.type,
    generateMipmaps: sourceTexture.generateMipmaps,
    anisotropy: sourceTexture.anisotropy,
    encoding: ( sourceTexture.encoding === THREE.RGBEEncoding ) ? THREE.RGBM16Encoding : sourceTexture.encoding
  };

  if ( params.encoding === THREE.RGBM16Encoding ) {

    params.magFilter = THREE.LinearFilter;
    params.minFilter = THREE.LinearFilter;

  }

  this.CubeUVRenderTarget = new THREE.WebGLRenderTarget( size, size, params );
  this.CubeUVRenderTarget.texture.name = "PMREMCubeUVPacker.cubeUv";
  this.CubeUVRenderTarget.texture.mapping = THREE.CubeUVReflectionMapping;
  this.camera = new THREE.OrthographicCamera( - size * 0.5, size * 0.5, - size * 0.5, size * 0.5, 0, 1 ); // top and bottom are swapped for some reason?

  this.scene = new THREE.Scene();

  this.objects = [];

  var geometry = new THREE.PlaneBufferGeometry( 1, 1 );

  var faceOffsets = [];
  faceOffsets.push( new THREE.Vector2( 0, 0 ) );
  faceOffsets.push( new THREE.Vector2( 1, 0 ) );
  faceOffsets.push( new THREE.Vector2( 2, 0 ) );
  faceOffsets.push( new THREE.Vector2( 0, 1 ) );
  faceOffsets.push( new THREE.Vector2( 1, 1 ) );
  faceOffsets.push( new THREE.Vector2( 2, 1 ) );

  var textureResolution = size;
  size = cubeTextureLods[ 0 ].width;

  var offset2 = 0;
  var c = 4.0;
  this.numLods = Math.log( cubeTextureLods[ 0 ].width ) / Math.log( 2 ) - 2; // IE11 doesn't support Math.log2
  for ( var i = 0; i < this.numLods; i ++ ) {

    var offset1 = ( textureResolution - textureResolution / c ) * 0.5;
    if ( size > 16 ) c *= 2;
    var nMips = size > 16 ? 6 : 1;
    var mipOffsetX = 0;
    var mipOffsetY = 0;
    var mipSize = size;

    for ( var j = 0; j < nMips; j ++ ) {

      // Mip Maps
      for ( var k = 0; k < 6; k ++ ) {

        // 6 Cube Faces
        var material = this.getShader();
        material.uniforms[ 'envMap' ].value = this.cubeLods[ i ].texture;
        material.envMap = this.cubeLods[ i ].texture;
        material.uniforms[ 'faceIndex' ].value = k;
        material.uniforms[ 'mapSize' ].value = mipSize;

        var planeMesh = new THREE.Mesh( geometry, material );
        planeMesh.position.x = faceOffsets[ k ].x * mipSize - offset1 + mipOffsetX;
        planeMesh.position.y = faceOffsets[ k ].y * mipSize - offset1 + offset2 + mipOffsetY;
        planeMesh.material.side = THREE.BackSide;
        planeMesh.scale.setScalar( mipSize );
        this.scene.add( planeMesh );
        this.objects.push( planeMesh );

      }
      mipOffsetY += 1.75 * mipSize;
      mipOffsetX += 1.25 * mipSize;
      mipSize /= 2;

    }
    offset2 += 2 * size;
    if ( size > 16 ) size /= 2;

  }

};

OMNI.PMREMCubeUVPacker.prototype = {

  constructor: THREE.PMREMCubeUVPacker,

  update: function ( renderer ) {

    var gammaInput = renderer.gammaInput;
    var gammaOutput = renderer.gammaOutput;
    var toneMapping = renderer.toneMapping;
    var toneMappingExposure = renderer.toneMappingExposure;
    var currentRenderTarget = renderer.getRenderTarget();

    renderer.gammaInput = false;
    renderer.gammaOutput = false;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.render( this.scene, this.camera, this.CubeUVRenderTarget, false );

    renderer.setRenderTarget( currentRenderTarget );
    renderer.toneMapping = toneMapping;
    renderer.toneMappingExposure = toneMappingExposure;
    renderer.gammaInput = gammaInput;
    renderer.gammaOutput = gammaOutput;

  },

  getShader: function () {

    var shaderMaterial = new THREE.ShaderMaterial( {

      uniforms: {
        "faceIndex": { value: 0 },
        "mapSize": { value: 0 },
        "envMap": { value: null },
        "testColor": { value: new THREE.Vector3( 1, 1, 1 ) }
      },

      vertexShader:
        "precision highp float;\
        varying vec2 vUv;\
        void main() {\
          vUv = uv;\
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
        }",

      fragmentShader:
        "precision highp float;\
        varying vec2 vUv;\
        uniform samplerCube envMap;\
        uniform float mapSize;\
        uniform vec3 testColor;\
        uniform int faceIndex;\
        \
        void main() {\
          vec3 sampleDirection;\
          vec2 uv = vUv;\
          uv = uv * 2.0 - 1.0;\
          uv.y *= -1.0;\
          if(faceIndex == 0) {\
            sampleDirection = normalize(vec3(1.0, uv.y, -uv.x));\
          } else if(faceIndex == 1) {\
            sampleDirection = normalize(vec3(uv.x, 1.0, uv.y));\
          } else if(faceIndex == 2) {\
            sampleDirection = normalize(vec3(uv.x, uv.y, 1.0));\
          } else if(faceIndex == 3) {\
            sampleDirection = normalize(vec3(-1.0, uv.y, uv.x));\
          } else if(faceIndex == 4) {\
            sampleDirection = normalize(vec3(uv.x, -1.0, -uv.y));\
          } else {\
            sampleDirection = normalize(vec3(-uv.x, uv.y, -1.0));\
          }\
          vec4 color = envMapTexelToLinear( textureCube( envMap, sampleDirection ) );\
          gl_FragColor = linearToOutputTexel( color );\
        }",

      blending: THREE.NoBlending

    } );

    shaderMaterial.type = 'PMREMCubeUVPacker';

    return shaderMaterial;

  },

  dispose: function () {

    for ( var i = 0, l = this.objects.length; i < l; i ++ ) {

      this.objects[ i ].material.dispose();

    }

    this.objects[ 0 ].geometry.dispose();

  }

};


class Sphere5 {
    constructor(options) {
        this._options = options || {};
        this.container = options.container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.container,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        //this.container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        //this.scene1.background = new THREE.Color( 0xff0000 );
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 10000);
        this.camera.position.set(0, 0, 60);
        this.camera.lookAt(this.scene.position);
        this.clock = new THREE.Clock();
        this.time = 0;
        this.targetRotation = 0;
        this.isPlaying = true;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.getMaterial = (args, callback)=>{
            let material = callback(args);
            return material;
        };
        this.addLight();
        this.addObjects();
        this.resize();
        this.animate();
        this.setupResize();
    }

    settings() {
        this.settings = {
            progress: 0,
        };
    }

    addLight(){
        this.particleLight = new THREE.Mesh(
            new THREE.SphereGeometry( 0.4, 8, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        this.particleLight.position.set(this._options.pos.light.x, this._options.pos.light.y, this._options.pos.light.z);
        this.particleLight.add( new THREE.PointLight( 0xffffff, 100000 ) );
        this.aLight = new THREE.DirectionalLight(0xffffff, 30000.0);
        this.aLight.position.set(0, 3, -5);
        this.aLight1 = new THREE.DirectionalLight(0xffffff, 30000.0);
        this.aLight1.position.set(0, 3, -5);
        this.scene.add(this.aLight);
    }

    createPalleteImg(palleteObj){
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var pallete = this.expandPallete(palleteObj)
        var texH = 1024;
        var colorH = texH / pallete.length;
        canvas.width = 1;
        canvas.height = texH
        for(var i=0; i < pallete.length; i++){
            ctx.fillStyle = pallete[i];
            ctx.fillRect(0, colorH * i, canvas.width, colorH)
          }
        return canvas.toDataURL()
    }

    expandPallete(palleteObj){
      var pallete = []
      for(var x=0; x < palleteObj.repeat; x++){
        for(var i=0; i < palleteObj.colors.length; i++){
          var colors = palleteObj.shuffle ? this.shuffle(palleteObj.colors.slice()) : palleteObj.colors;
          var c = colors[i];
          for(var j=0; j < c.l; j++){
            pallete.push(c.c);
          }
        }
      }
      if(palleteObj.topColor){
        for(var i=0; i < palleteObj.topColorL; i++)
          pallete.push(palleteObj.topColor);
      }
      return pallete
    }

    shuffle(o) {
      for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    menuThemes(){
      var menuEl = document.createElement("div")
      menuEl.className = "theme_menu"
      document.body.appendChild(menuEl);
      for(var i = 0; i < themes.length; i++){
        var el = document.createElement("a");
        el.className = "theme_btn"
        el.innerHTML = "<span>" + themes[i].name + "</span>"
        el.style.background = themes[i].nameColor
        el.setAttribute("href", window.location.origin + window.location.pathname + "?t="+ i)
        menuEl.appendChild(el)
      }
    }

    addObjects(){
     this.start = performance.now();
     this.textureLoader = new THREE.TextureLoader();
     const palleteObj = theme.pallete;
     const palleteImg = this.createPalleteImg(palleteObj);
     this.palleteTexture = this.textureLoader.load(palleteImg);
     this.setup();
     const geometry = new THREE.IcosahedronGeometry(this.width > this.height ? 22 : 15, icoQuality  );
     if(isMobile) 
        loadEnv('../static/src/assets/global/textures/Anim/Basic_Studio_wavelet.jpg', this.scene, this.renderer, this.icoMaterial)
     else
        loadExrEnv('../static/src/assets/global/textures/Anim/Basic_Studio_wavelet.exr', this.scene, this.renderer, this.icoMaterial)
    this.icoMaterial = new MeshCustomMaterial({
        roughness:theme.roughness,
        metalness:theme.metalness,
        envMapIntensity:theme.mapIntensity
      },
      {
        tExplosion: {
          type: "t",
          value: palleteTexture
        },
        time: { 
          type: "f",
          value: 0.0
        }
      },
      vertexSphere3,
      fragmentSphere3
      );
      this.icoSphere = new THREE.Mesh(geometry, this.icoMaterial)
      console.log("this icosphere", this.icoSphere)
      this.group.add(this.icoSphere)
    }

    setup() {
      if(isMobile){
           window.addEventListener("touchstart", inputstart, {passive:false})
           window.addEventListener("touchmove", inputmove, {passive:false})
           window.addEventListener("touchend", inputend, {passive:false})
         }
         else{
           window.addEventListener("mousedown", inputstart)
           window.addEventListener("mousemove", inputmove)
           window.addEventListener("mouseup", inputend)
       }
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.render()
            this.isPlaying = true;
        }
    }

    render() {
        if (!this.isPlaying) return;
        var dt = this.clock.getDelta();
        var time = this.clock.getElapsedTime();
        this.icoMaterial.uniforms[ 'time' ].value = time * 0.4
        this.icoMaterial.uniforms[ 'tExplosion' ].value = palleteTexture;
        this.targetRotation = Math.PI; 
        this.icoSphere.rotation.y = this.targetRotation*this.time*0.1;
        this.time += 0.5;
        this.renderer.render(this.scene, this.camera);
    }

    //ANIMATE 
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        nodeFrame.update();
        this.render();
    }
}


export default class Anim {
    constructor() {
        this.settings = [
            {
                title: "Design",
                cameraPos: new THREE.Vector3(0, 0, 2)
            },
            {
                title: 'Development',
                cameraPos: new THREE.Vector3(0, 0, 2)
            },
            {
                title: 'Vision',
                cameraPos: new THREE.Vector3(0, 0, 2)
            }
        ];
        const parent = document.querySelector(".items-1C6Vg7Z");
        this.currentArr = [].slice.call(parent.getElementsByTagName('li'));
        this.target = document.querySelector('#target');
        this.canvasArr = [].slice.call(parent.getElementsByTagName('canvas'));
        const mx_noise_vec3_func = (uv) => {
          return mx_noise_vec3(uv);
        };
        const mx_cell_noise_float_func = (uv) => {
          return mx_cell_noise_float(uv.mul( .2 ));
        };

        const mx_worley_noise_vec3_func = (uv) => {
          return mx_worley_noise_vec3(uv);
        };
        const mx_fractal_noise_vec_3_func = (uv) => {
          return mx_fractal_noise_vec3(uv);
        };
        this.optionArr = 
        [
            {
                container: this.canvasArr[0],
                mat: mx_noise_vec3_func, 
                pos: {
                    model: new THREE.Vector3(0, 0, 0),
                    light: new THREE.Vector3(0.6, -0.025, 0),
                }
            },
            {
                container: this.canvasArr[1],
                mat: mx_cell_noise_float_func,
                pos: {
                    model: new THREE.Vector3(0, 0, 0),
                    light: new THREE.Vector3(0.5, 0, 0),
                }
            },
            {
                container: this.canvasArr[2],
                mat: mx_worley_noise_vec3_func,
                pos: {
                    model: new THREE.Vector3(0, 0, 0),
                    light: new THREE.Vector3(0.5, 0, 0),
                }
            },
            {
                container: this.canvasArr[3],
                mat: mx_fractal_noise_vec_3_func,
                pos: {
                    model: new THREE.Vector3(0, 0, 0),
                    light: new THREE.Vector3(0.5, 0, 0),
                }
            },

        ];
        //this.reset = this.reset.bind(this);
        //this.onClick = this.onClick.bind(this);
        //this.onScroll = this.onScroll.bind(this);
        this.addScene();
        //this.render();
        //this.addEvents();
    }

    settings() {
        this.settings = {
            progress: 0,
        };
    }

    addEvents() {
        window.addEventListener('refresh', this.reset);
        document.addEventListener('wheel', this.onScroll);
        document.querySelector(".previous-wElckdt").addEventListener("click", this.onClick);
        document.querySelector(".next-mNE2mCE").addEventListener("click", this.onClick);
    }

    reset() {
        if (this.scrollEvent) this.scrollEvent.kill(); // Use kill to clear ScrollTrigger
        this.currentArr.forEach((el, index) => {
          window.scrollTo(0, 0);
          gsap.set(document.body, { overflow: "" });
          gsap.set(el, { clearProps: 'all' });
          if (this.tl) this.tl.kill(); // Use kill to clear the timeline
        });
      }

      setTimeline(element, distanceX, distanceY) {
        this.tl = gsap.timeline({});
        this.tl.to(element, {
          duration: PARAMS.duration,
          x: distanceX,
          y: distanceY,
          ease: PARAMS.ease,
        });
      }

      downEvent() {
        this.currentArr.forEach((el, index) => {
          this.setTimeline(this.currentArr[index], 0, -this.currentArr[index].clientHeight);
        });
      }

      upEvent() {
        this.currentArr.forEach((el, index) => {
          this.setTimeline(this.currentArr[index], 0, this.currentArr[index].clientHeight);
        });
      }

      onClick(e) {
        if (this.scrollEvent) this.scrollEvent.kill(); // Disable ScrollTrigger
        if (e.target.id === "leftArrow" || e.target.id === "rightArrow") {
          e.target.id === "rightArrow" ? this.downEvent() : this.upEvent();
        }
      }

      onScroll(e) {
        const PARAMS = {
          duration: 1.88,
          ease: 'Power2.easeOut',
        };
        const triggerElement = document.querySelector('.devices-block');
        if (!this.scrollEvent) {
          this.scrollEvent = ScrollTrigger.create({
            start: 'top 80%',
            end: "top 90%",
            trigger: triggerElement,
            markers: true,
            toggleActions: "play none none reverse",
          });
        }
        e.deltaY > 0 ? this.downEvent() : this.upEvent();
      }

    /*handleWheel() {
        const triggerElement = document.querySelector('.devices-block');
        const target1 = this.currentArr[0];
        const target2 = this.currentArr[1];
        const target3 = this.currentArr[2];
        const tl = gsap.timeline({
            scrollTrigger: {
              trigger: triggerElement,
              start: 'top 80%',
              markers: true,    'Quint.easeIn': 'Quint.easeIn',
              toggleActions: "play none none reverse"
            }
        })

        tl.to(target1, {
            duration: PARAMS.duration,
            x: 0,
            y: -(target1.clientHeight),
            ease: PARAMS.ease,
         })

        gsap.set(target2, {
            marginTop: -target2.clientHeight,
        })

    }*/

    addDownEvents1() {
        let prevArr = [];
        this.currentArr.forEach((el, index) => {
            const nextIndex = (index + 1) % this.currentArr.length;
            prevArr.push(this.currentArr[nextIndex]);
        });
        this.currentArr = prevArr;
        this.target.removeEventListener('wheel', (e) => { this.handleWheel(e); });
        this.target = this.currentArr[0];
        this.target.addEventListener('wheel', (e) => { this.handleWheel(e); });
    }

    addUpEvents1() {
        let prevArr = [];
        this.currentArr.forEach((el, index) => {
            const nextIndex = (index - 1 + this.currentArr.length) % this.currentArr.length;
            TweenMax.to(this.currentArr[nextIndex], {
                y: 343,
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    this.currentArr[index].style.opacity = 0;
                    this.currentArr[index] = this.currentArr[nextIndex];
                    console.log("prev", this.currentArr[index]);
                    console.log("next", this.currentArr[nextIndex]);
                }
            });

            prevArr.push(this.currentArr[nextIndex]);
        });

        this.currentArr = prevArr;
        this.target.removeEventListener('wheel', (e) => { this.handleWheel(e); });
        this.target = this.currentArr[0];
        this.target.addEventListener('wheel', (e) => { this.handleWheel(e); });
    }

    addScene(){
        console.log("this is loading....")
        const SP01 = new Sphere1(this.optionArr[0]);
        const SP02 = new Sphere2(this.optionArr[1]);
        const SP03 = new Sphere3(this.optionArr[2]);
    }

    loadModels() {
        const loader = new GLTFLoader();
        Promise.all([
            // Model 1
            new Promise(resolve => {
                loader.load("../static/src/assets/dataset/models/pencil/scene.gltf", gltf => {
                    this.addSettings(this.scene1, 0, gltf.scene, 0.01);
                    resolve(gltf);
                });
            }),
            // Model 2
            new Promise(resolve => {
                loader.load("../static/src/assets/dataset/models/hammer/scene.gltf", gltf => {
                    this.addSettings(this.scene2, 1, gltf.scene, 0.01);
                    resolve(gltf);
                });
            }),
            // Model 3
            new Promise(resolve => {
                loader.load("../static/src/assets/dataset/models/telescope/scene.gltf", gltf => {
                    this.addSettings(this.scene3, 2, gltf.scene, 1);
                    resolve(gltf);
                });
            })
        ]).then(results => {
            console.log(results);
        }).catch(err => {
            console.error(err);
        });
    }

}

(function () {
    function init() {
        var A = new Anim();
        particlesJS("particles-js", {
          "particles": {
            "number": {
              "value": 380,
              "density": {
                "enable": true,
                "value_area": 800
              }
            },
            "color": {
              "value": "#ffffff"
            },
            "shape": {
              "type": "circle",
              "stroke": {
                "width": 0,
                "color": "#000000"
              },
              "polygon": {
                "nb_sides": 5
              },
              "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
              }
            },
            "opacity": {
              "value": 0.5,
              "random": false,
              "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
              }
            },
            "size": {
              "value": 3,
              "random": true,
              "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
              }
            },
            "line_linked": {
              "enable": true,
              "distance": 150,
              "color": "#ffffff",
              "opacity": 0.4,
              "width": 1
            },
            "move": {
              "enable": true,
              "speed": 6,
              "direction": "none",
              "random": false,
              "straight": false,
              "out_mode": "out",
              "bounce": false,
              "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
              }
            }
          },
          "interactivity": {
            "detect_on": "canvas",
            "events": {
              "onhover": {
                "enable": true,
                "mode": "grab"
              },
              "onclick": {
                "enable": true,
                "mode": "push"
              },
              "resize": true
            },
            "modes": {
              "grab": {
                "distance": 140,
                "line_linked": {
                  "opacity": 1
                }
              },
              "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
              },
              "repulse": {
                "distance": 200,
                "duration": 0.4
              },
              "push": {
                "particles_nb": 4
              },
              "remove": {
                "particles_nb": 2
              }
            }
          },
          "retina_detect": true
        });
    
    }

    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();



