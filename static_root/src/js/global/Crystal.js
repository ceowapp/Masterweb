import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';        
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Text } from 'troika-three-text';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import Audio from './Audio.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
let particleTexture =  "../static/src/assets/dataset/textures/particle.dcae8b12.webp";
let im = "../static/src/assets/dataset/textures/background.jpg";
import addPageManager from './utils/PageManager.js';

//let dot = '../static/src/assets/dataset/textures/background.jpg';
//https://threejs.org/examples/#webgl_lights_spotlights
//https://threejs.org/examples/webgl_shader_lava.html
//https://threejs.org/examples/webgl_postprocessing_dof.html

//https://tympanus.net/Development/AmbientCanvasBackgrounds/index4.html
///////////////////////////////////////////////////////////////////////////////
//**********************************UTILITY FUNCTIONS************************//                          
//////////////////////////////////////////////////////////////////////////////
/**
 * check if the output of a function is false
 * @function isFalse
 * @param value 
 * @return boolean false
 * @example isFalse("1>2") 
*/
const isFalse = function (value) {
  return value === false;
};

function mathPower(base, exponent) {
  return Math.pow(base, exponent);
}

/**
 * check if the output of a function is true
 * @function isTRUE
 * @param value 
 * @return boolean true
 * @example isTRUE("1>2") 
 */
const isTrue = function (value) {
  return value === true;
};

/**
 * combine filepath and filename
 * @function combineStrings
 * @param path, filename 
 * @return file path string
 * @example combineStrings("C./", "test.txt") 
 */
const combineStrings = function (path, filename) {
  // Ensure path ends with a slash
  const formattedPath = path.endsWith('/') ? path : path + '/';
  // Combine the path and filename
  const fullPath = formattedPath + filename;
  return fullPath;
};

/**
 * add EventListener though you can add directly
 * @function addCustomEventListener
 * @param obj, eventName, handler 
 * @example addCustomEventListener(window, "resize", someFunc) 
 * 
 */
const addCustomEventListener = function (obj, eventName, handler) {
  if (!obj.customEventListeners) {
    obj.customEventListeners = {};
  }
  if (!obj.customEventListeners[eventName]) {
    obj.customEventListeners[eventName] = [];
  }
  obj.customEventListeners[eventName].push(handler);
  obj.addEventListener(eventName, handler);
};

/**
 * remove all EventListeners though you can remove directly
 * @function removeAllEventListeners
 * @param obj
 * @example removeAllEventListeners(window) 
 * 
 */
const removeAllEventListeners = function (obj) {
  if (obj.customEventListeners) {
    const eventNames = Object.keys(obj.customEventListeners);
    for (const eventName of eventNames) {
      const eventListeners = obj.customEventListeners[eventName];
      for (const listener of eventListeners) {
        obj.removeEventListener(eventName, listener);
      }
    }
    obj.customEventListeners = {};
  }
};

/**
 * check if object has EventListener
 * @function checkifExistEventListener
 * @param obj
 * @example checkifExistEventListener(window) 
 * 
*/
const checkifExistEventListener = function (obj) {
  return obj.hasOwnProperty("listeners") && Object.keys(obj.listeners).length > 0;
};

/**
 * clear object children from THREEJS 3D OBJECT
 * @function clear
 * @param
 * @example checkifExistEventListener(window) 
 * 
*/

const noiseC = new SimplexNoise();

const CubemapFilterShader = {
  uniforms: {
    cubeTexture: { value: null },
    mipIndex: { value: 0 },
  },

  vertexShader: /* glsl */ `

    varying vec3 vWorldDirection;

    #include <common>

    void main() {
      vWorldDirection = transformDirection(position, modelMatrix);
      #include <begin_vertex>
      #include <project_vertex>
      gl_Position.z = gl_Position.w; // set z to camera.far
    }

    `,

  fragmentShader: /* glsl */ `

    uniform samplerCube cubeTexture;
    varying vec3 vWorldDirection;

    uniform float mipIndex;

    #include <common>

    void main() {
      vec3 cubeCoordinates = normalize(vWorldDirection);
      
      // Colorize mip levels
      vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
      if (mipIndex == 0.0) color.rgb = vec3(1.0, 1.0, 1.0);
      else if (mipIndex == 1.0) color.rgb = vec3(0.0, 0.0, 1.0);
      else if (mipIndex == 2.0) color.rgb = vec3(0.0, 1.0, 1.0);
      else if (mipIndex == 3.0) color.rgb = vec3(0.0, 1.0, 0.0);
      else if (mipIndex == 4.0) color.rgb = vec3(1.0, 1.0, 0.0);            

      gl_FragColor = textureCube(cubeTexture, cubeCoordinates, 0.0) * color;
    }

    `,
};

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

const vertexBackface = `
  varying vec3 worldNormal;
  void main() {
    vec4 transformedNormal = vec4(normal, 0.);
    vec4 transformedPosition = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      transformedNormal = instanceMatrix * transformedNormal;
      transformedPosition = instanceMatrix * transformedPosition;
    #endif
    worldNormal = normalize(modelViewMatrix * transformedNormal).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * transformedPosition;
}`;
const fragmentBackface =  `
  varying vec3 worldNormal;
  void main() {
    gl_FragColor = vec4(worldNormal, 1.0);
}`;
const vertexRefraction = `
  varying vec3 worldNormal;
    varying vec3 viewDirection;
    void main() {
      vec4 transformedNormal = vec4(normal, 0.);
      vec4 transformedPosition = vec4(position, 1.0);
      #ifdef USE_INSTANCING
        transformedNormal = instanceMatrix * transformedNormal;
        transformedPosition = instanceMatrix * transformedPosition;
      #endif
      worldNormal = normalize( modelViewMatrix * transformedNormal).xyz;
      viewDirection = normalize((modelMatrix * vec4( position, 1.0)).xyz - cameraPosition);;
      gl_Position = projectionMatrix * modelViewMatrix * transformedPosition;
  }`;
const fragmentRefraction = ` 
    uniform sampler2D envMap;
    uniform sampler2D backfaceMap;
    uniform vec2 resolution;
    varying vec3 worldNormal;
    varying vec3 viewDirection;
    float fresnelFunc(vec3 viewDirection, vec3 worldNormal) {
      return pow(1.05 + dot(viewDirection, worldNormal), 100.0);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      vec3 normal = worldNormal * (1.0 - 0.7) - texture2D(backfaceMap, uv).rgb * 0.7;
      vec4 color = texture2D(envMap, uv += refract(viewDirection, normal, 1.0/1.5).xy);
      //gl_FragColor = vec4(mix(color.rgb, vec3(0.15), fresnelFunc(viewDirection, normal)), 1.0);
      gl_FragColor = vec4(mix(color.rgb, vec3(0.4), fresnelFunc(viewDirection, normal)), 1.0);
  }`;


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
       
const vertexPlane = `
 uniform float scale;
      uniform float shift;
      varying vec2 vUv;
      void main() {
        vec3 pos = position;
        pos.y = pos.y + ((sin(uv.x * 3.1415926535897932384626433832795) * shift * 1.5) * 0.125);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
      }`;
const fragmentPlane = ` 
      uniform sampler2D texture1;
      uniform float hasTexture;
      uniform float shift;
      uniform float scale;
      uniform vec3 color;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float angle = 1.55;
        vec2 p = (vUv - vec2(0.5, 0.5)) * (1.0 - scale) + vec2(0.5, 0.5);
        vec2 offset = shift / 4.0 * vec2(cos(angle), sin(angle));
        vec4 cr = texture2D(texture1, p + offset);
        vec4 cga = texture2D(texture1, p);
        vec4 cb = texture2D(texture1, p - offset);
        if (hasTexture == 1.0) gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        else gl_FragColor = vec4(color, opacity);
      }`;

const vertexPassthrough = `  
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

const fragmentPassthrough = `  
 uniform sampler2D tDiffuse;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );
  }
`;

const fragmentVolumetric = `  
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 lightPosition;
  uniform float exposure;
  uniform float decay;
  uniform float density;
  uniform float weight;
  uniform int samples;
  const int MAX_SAMPLES = 100;
  void main()
  {
    vec2 texCoord = vUv;
    vec2 deltaTextCoord = texCoord - lightPosition;
    deltaTextCoord *= 1.0 / float(samples) * density;
    vec4 color = texture2D(tDiffuse, texCoord);
    float illuminationDecay = 1.0;
    for(int i=0; i < MAX_SAMPLES; i++) {
      if(i == samples) {
        break;
      }
      texCoord -= deltaTextCoord;
      vec4 sample = texture2D(tDiffuse, texCoord);
      sample *= illuminationDecay * weight;
      color += sample;
      illuminationDecay *= decay;
    }
    gl_FragColor = color * exposure;
  }
`;

const fragmentAdditive = `  
  uniform sampler2D tDiffuse;
  uniform sampler2D tAdd;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D( tDiffuse, vUv );
    vec4 add = texture2D( tAdd, vUv );
    gl_FragColor = color + add;
  }
`;


const vertexBackground = `  
 precision highp float;
precision highp int;

#define GLSLIFY 1
attribute vec3 w_pos;
attribute float size;

varying vec3 vNormal;
varying vec3 vWPos;
// varying vec3 vPos;
varying vec2 vUv;
varying float vDistanceToPlanet;
varying float vDistanceToCamera;
varying float vDistanceToMouse;

uniform float _Size;
uniform float _SizeDispersion;
uniform float _Time;
uniform float _NoiseFrequency;
uniform float _SizeFrequency;
uniform float _NoiseAmplitude;

uniform float _NoiseOffset;
uniform float _RotationSpeed;
uniform float _RotationDispersion;
uniform float _TwistSpeed;
uniform float _TwistDispersion;
uniform float _TwistDispersionFrequency;
uniform float _TwistFrequency;
uniform float _TwistAmplitude;

uniform vec3 _MouseWorldPosition;
uniform float _MouseSphereRadius;
uniform float _MouseSphereAttractionRadius;
uniform float _MouseSphereFalloff;
uniform float _UseMouse;

uniform float _UseConeShape;
#define PLANET_COUNT 6
uniform vec4 _PlanetsData[PLANET_COUNT];

#define GLSLIFY 1
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
  return mod289(((x*34.0)+10.0)*x);
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


mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);

  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

float saturateFunc(float x)
{
  return clamp(x, 0.0, 1.0);
}

vec3 curl_noise(vec3 p)
{

  // return curlNoise(p);
  const float step = 0.01;
  float ddx = cnoise(p+vec3(step, 0.0, 0.0)) - cnoise(p-vec3(step, 0.0, 0.0));
  float ddy = cnoise(p+vec3(0.0, step, 0.0)) - cnoise(p-vec3(0.0, step, 0.0));
  float ddz = cnoise(p+vec3(0.0, 0.0, step)) - cnoise(p-vec3(0.0, 0.0, step));

  const float divisor = 1.0 / ( 2.0 * step );
  return ( vec3(ddy - ddz, ddz - ddx, ddx - ddy) * divisor );
}


vec3 fbm_vec3(vec3 p, float frequency, float offset)
{
  return vec3(
    cnoise((p+vec3(offset))*frequency),
    cnoise((p+vec3(offset+20.0))*frequency),
    cnoise((p+vec3(offset-30.0))*frequency)
  );
}
vec3 compute_twist_offset(vec3 p)
{
  float twist_scale = cnoise(w_pos * _TwistDispersionFrequency)*0.5+0.5;
  vec3 world_pos = rotation3dY(_Time*(_TwistSpeed+twist_scale*_TwistDispersion)+length(w_pos.xz*1.0)) * p;
  vec3 offset = fbm_vec3(world_pos, _TwistFrequency, 0.);
  return offset * _TwistAmplitude;
}

vec3 compute_main_offset(vec3 p)
{
  return fbm_vec3(p, 0., 0.);
}

vec3 get_point_on_mouse(vec3 pos, float t)
{
  vec3 dir = (pos - _MouseWorldPosition);
  return mix(pos, _MouseWorldPosition + normalize(dir) * 0.3, t);
}
void main()
{
  float particle_size = cnoise(w_pos * _SizeFrequency)*0.5+0.5;
  vec3 world_pos = rotation3dY(5.*_Time* (_RotationSpeed + particle_size*_RotationDispersion)) * w_pos;
  vec3 offset = 1.*compute_twist_offset(world_pos);
  vec3 offset2 = 1.*compute_main_offset(world_pos+offset);
  vec3 particle_w_pos = (modelMatrix * vec4(world_pos+offset+offset2, 1.0)).xyz;
  // vec3 particle_w_pos = (modelMatrix * vec4(w_pos, 1.0)).xyz;
  // mouse
  vDistanceToMouse = 1.0-saturateFunc((length(_MouseWorldPosition.xz-particle_w_pos.xz)-0.4));
  particle_w_pos = get_point_on_mouse(particle_w_pos, pow(vDistanceToMouse, 2.0));
  // particle_w_pos.y = length(_MouseWorldPosition.xz-particle_w_pos.xz);
  //final
  vec4 view_pos = viewMatrix  * vec4(particle_w_pos, 1.0);
  // sizes
  view_pos.xyz += position* (_Size + particle_size * _SizeDispersion);
  gl_Position = projectionMatrix * view_pos;
  vUv = position.xy + vec2(0.5);
  // gl_Position = projectionMatrix*viewMatrix  * vec4(particle_w_pos, 1.0);;
}
`;

const fragmentBackground = `  
precision highp float;
precision highp int;
#define HIGH_PRECISION
#define GLSLIFY 1
uniform sampler2D _MainTexture;
uniform vec3 _Color;
varying vec2 vUv;
varying vec3 vWPos;

uniform float _Opacity;
uniform float _CameraFadeout;
varying float vDistanceToPlanet;
varying float vDistanceToCamera;
//varying float vDistanceToMouse;

float saturateFunc(float x)
{
  return clamp(x, 0.0, 1.0);
}

vec3 SRGBtoLinear(vec3 srgb) {
    vec3 linOut = pow(srgb.xyz, vec3(2.2));
    return vec3(linOut);
}
vec3 linearToSRGB(vec3 color) {
    return pow(color, vec3(1.0 / 2.2));
}

void main(){
  vec2 uv = vUv*2.0-vec2(1.0);
  float strength = exp(-5.0*saturateFunc(length(uv)));
  vec3 col = texture2D(_MainTexture, vUv).rgb;
  //col = SRGBtoLinear(col);
  // planet_mask *= 1.0-exp(-(vDistanceToCamera-2.0));
  gl_FragColor = vec4(_Color, col.r);
  //gl_FragColor.a = linearToSRGB(vec3(gl_FragColor.a)).r ;
  // gl_FragColor.rgb = vec3(vDistanceToMouse);
  // gl_FragColor.rgb = vec3(1.0-exp(-(vDistanceToCamera-1.0)));
  // gl_FragColor = vec4(1.);
  // gl_FragColor.a = 1.0;
  // gl_FragColor.rgb *= planet_mask;
  //gl_FragColor.a = 1.0;
  //gl_FragColor.rgb = vec3(vUv, 0.0);
}
`;

const vertexBackground2 = `  
#define GLSLIFY 1
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;
uniform sampler2D texture1;
attribute float opacity;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  vOpacity = opacity;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
  gl_PointSize = 10000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentBackground2 = `  
#define GLSLIFY 1
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;
float PI = 3.141592653589793238;
void main(){
  vec2 uv = vec2(gl_PointCoord.x,1. - gl_PointCoord.y);
  vec2 cUV = 2.*uv - 1.;
  vec3 originalColor = vec3(4./255.,10./255.,20./255.);
  vec4 color = vec4(0.08/length(cUV));
  color.rgb = min(vec3(10.),color.rgb);
  color.rgb *= originalColor*1200.;
  color *= vOpacity;
  color.a = min(1.,color.a)*30.;
  float disc = length(cUV);
  // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
  gl_FragColor = vec4(1. - disc,0.,0.,1.)*vOpacity;
  gl_FragColor = vec4(color.rgb,color.a);
  // gl_FragColor = vec4(1.,1.,1.,1.);
}
`;

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS LOOKING GLASS****************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize 
 * @class 
 * @param options 
*/

function getCircleY(radians, radius) {
  return Math.sin(radians) * radius;
}


class MoveParticles {
  constructor(options){
    this._options = options || {};
    this.geometry = options.geometry;
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    const sPosition = this.geometry.attributes.position;
    //const geo = new THREE.BufferGeometry( ).setFromPoints( pts );
    this.sphere = new THREE.BufferGeometry();
    this.sphere.copy(this.geometry);
    this.lights = [];
    this.sphere.setAttribute('position', new THREE.BufferAttribute(sPosition.array, 3));
    this.sphere.attributes.position.setUsage(THREE.DynamicDrawUsage);
    this.init();
  }
  init() {
    this.initLights();
    this.getLonCurve();
    //this.getLatCurve();
    this.startPath();
    this.onFrame(0);
  }
  initParticles() {
    const { scene } = this;
    this.particles = new Particles();
    this.particles.clusters.forEach((cluster) => {
      scene.add(cluster.points);
    });
  }
   getLonCurve() {
    let num1 = 4;
    let num2 = 4;
    let curvePoints = [];
    let sphere_radius = 13;
      for (let i = 0; i < num1; i++) {
        getCircleY(Math.PI)
        let phi = 0.1*Math.PI/2+i*0.02; 
        let theta = 0.1* Math.PI/2+i*0.2;
        curvePoints.push(new THREE.Vector3().setFromSphericalCoords(sphere_radius, phi, theta))
      }
       for (let i = 0; i < num2; i++) {
        getCircleY(Math.PI)
        let phi = sphere_radius*Math.PI/2+i*0.1; 
        let theta = sphere_radius* Math.PI/2+i*0.1;
        curvePoints.push(new THREE.Vector3().setFromSphericalCoords(sphere_radius, phi, theta))
      }
        const path = new THREE.CatmullRomCurve3(curvePoints);
        path.tension = 0.7;
        path.closed = true;
        const points = path.getPoints(50);
        this.intensity1 = {value: 20};
        this.color1 = {value: 0xff8888};
        this.light1 = new THREE.PointLight( this.color1.value, this.intensity1.value, 20 );
        this.light1.castShadow = true;
        this.light1.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
        let sgeometry = new THREE.SphereGeometry( 0.3, 12, 6 );
        let smaterial = new THREE.MeshBasicMaterial( { color: this.color1.value } );
        smaterial.color.multiplyScalar( this.intensity1.value );
        let sphere = new THREE.Mesh( sgeometry, smaterial );
        this.light1.add( sphere );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        // Create the final object to add to the scene
        const curveObject = new THREE.Line( geometry, material );
        this.scene.add(curveObject);
        curveObject.position.set(-20,1,-15);
        this.light1.position.set(-20,1,-10);
        sphere.position.set(-20,1,-10);
        this.scene.add(this.light1);
        this.lights.push(this.light1);
        this.flow1 = new Flow(this.light1);
        this.flow1.updateCurve(0, path);
        this.scene.add(this.flow1.object3D);
  }


  getLon1Curve() {
    let num = 10;
    let curvePoints = [];
    let sphere_radius = 10;
    for (let i = 0; i < num; i++) {
      let phi = THREE.MathUtils.randFloat(0, Math.PI * 2);
      let theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      curvePoints.push(new THREE.Vector3().setFromSphericalCoords(sphere_radius, phi, theta))
    }
    let numPath = 10;
    let newCurves = [];
    let curves = [];
    for (let j = 0; j < numPath; j++) {
      curvePoints.forEach((vec)=>{
        let distX = vec.x + j * 0.1; // Changed from 'i' to 'j'
        vec.setX(distX);
        curves.push(vec);
      })
    newCurves.push(curves);
    }
    for (let j = 0; j < numPath; j++) {
        const path = new THREE.CatmullRomCurve3(newCurves[j]);
        path.tension = 0.7;
        path.closed = false;
        const points = path.getPoints(50);
        const light = new THREE.PointLight( 0xfffff, 0.1, 5);
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        // Create the final object to add to the scene
        const curveObject = new THREE.Line( geometry, material );
        curveObject.position.set(0,0,-20);
        this.scene.add(curveObject);
        this.lights.push(light);
        const flow = new Flow(light);
        flow.updateCurve(0, path);
        this.scene.add(flow.object3D);
    }
  }


  getLatCurve() {
    let num = 10;
    let curvePoints = [];
    let sphere_radius = 10;
    for (let i = 0; i < num; i++) {
      let theta = (i / num) * Math.PI / 2;
      let disX = 0.5;
      let disY = 0.5;
      curvePoints.push(new THREE.Vector3().setFromSphericalCoords(sphere_radius, i * disX + Math.PI / 2, i * disY + Math.PI / 2));
    }
    let numPath = 10;
    let newCurves = [];
    let curves = [];
    for (let j = 0; j < numPath; j++) {
      curvePoints.forEach((vec)=>{
        let distX = vec.x; // Changed from 'i' to 'j'
        vec.setX(distX);
        curves.push(vec);
      })
    newCurves.push(curves);
    }

    for (let j = 0; j < numPath; j++) {
        const path = new THREE.CatmullRomCurve3(newCurves[j]);
        path.tension = 0.7;
        path.closed = true;
        const points = path.getPoints(50);
        const light = new THREE.PointLight( 0xfffff, 0.1, 5);
        this.lights.push(light);
        const flow = new Flow(light);
        flow.updateCurve(0, path);
        this.scene.add(flow.object3D);
    }
  }

  initLights() {
    const { scene } = this;
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.15 );
    const innerLight = new THREE.PointLight(0xfffff);
    const outterLight = new THREE.PointLight(0xc743ff, 3 , 25);
    outterLight.position.set(14, 14, 14);
    this.outterLight = outterLight;
    //Utils.AddDot(scene, pointLight.position);
    this.scene.add( innerLight );
    this.scene.add( outterLight );
    this.scene.add( ambientLight );
  }

  startPath() {
      this.timeline = new TimelineMax({});
      this.timeline.to(this.intensity1, 0.2, { delay: 0.4, value: 1.5 * 4 * Math.PI }); 
      this.timeline.to(this.color1, 0.4, { delay: 0.4, value: 0x0088ff }); 
  }

  setupProstprocessing() {
    const { composer } = this;
    const { innerWidth: w, innerHeight: h } = window;
    this.effectFXAA = new ShaderPass( FocusShader );
    this.effectFXAA.uniforms[ 'screenWidth' ].value = w;
    this.effectFXAA.uniforms[ 'screenHeight' ].value = h;
    composer.addPass( this.effectFXAA );
    this.bloomPass = new UnrealBloomPass( new THREE.Vector2(w, h), 1.5, 0.4, 0.85 );
    this.bloomPass.renderToScreen = true;
    composer.addPass( this.bloomPass);
  }

  setupComposer() {
    const { renderer, camera, scene } = this;
    const { innerWidth: w, innerHeight: h } = window;
    const scale = 0.5;
    this.occlusionRenderTarget = new THREE.WebGLRenderTarget( w * scale, h * scale);
    this.occlusionComposer = new EffectComposer(renderer, this.occlusionRenderTarget);
    this.occlusionComposer.addPass( new RenderPass(scene, camera));
    let occPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value:null },
        lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
        exposure: { value: 0.21 },
        decay: { value: 0.95 },
        density: { value: 0.1 },
        weight: { value: 0.7 },
        samples: { value: 50 }
      },
      vertexShader: vertexPassthrough,
      fragmentShader: fragmentVolumetric    
    });
    occPass.needsSwap = false;
    this.occlusionPass = occPass;
    this.occlusionComposer.addPass(occPass);
  
    this.composer = new EffectComposer( renderer );
    this.composer.addPass( new RenderPass( scene, camera ));
    let addPass = new ShaderPass( {
      uniforms: {
        tDiffuse: { value:null },
        tAdd: { value: null }
      },
      vertexShader: vertexPassthrough,
      fragmentShader: fragmentAdditive
    } );
    
    addPass.uniforms.tAdd.value = this.occlusionRenderTarget.texture;
    this.composer.addPass(addPass);
    //addPass.renderToScreen = true;
  }

  updateSize() {
    const { renderer, camera, composer, occlusionComposer } = this;
    const { innerWidth: w, innerHeight: h } = window;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.setSize(w, h);
    occlusionComposer.setSize(w, h);
    this.width = w;
    this.height = h;
  }
  
  updateOcclusionIntensity(time) {
    const { uniforms: u } = this.occlusionPass;
    const n0 = (noiseC.noise(time * 0.0005, 0) + 1) * 0.5;
    const n1 = (noiseC.noise(0, time * 0.0005) + 1) * 0.5;
    u.exposure.value = THREE.MathUtils.lerp(0.05, 0.21, n0);
    u.decay.value = THREE.MathUtils.lerp(0.95, 0.98, n1);
    u.density.value = THREE.MathUtils.lerp(0.2, 0.4, n0);
    u.weight.value = THREE.MathUtils.lerp(0.1, 0.7, n1);
  }

  onFrame(time) {
    const { renderer, camera, scene, clock } = this;
    camera.layers.set(1);
    renderer.setClearColor(0x0, 0);
    camera.layers.set(0);
    camera.lookAt( scene.position );
    renderer.render(scene, camera);
  }
}


class Particles {
  constructor() {
    this.clusters = [];
    this.scales = [];
    this.initParticles();
  }
  
  initParticles() {
    this.texture = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/204379/particle.png'); 
    for( let i = 0; i < 5; i++ ) {
      const cluster = {
        scale: i + 2,
        speed: THREE.MathUtils.randFloat(0.5, 1.8),
        points: this.getCluster(100),
      }
      this.clusters.push(cluster);
    }
  }
  
  getCluster(count) {
    const geo = new THREE.Geometry();
    const mat = new THREE.PointsMaterial({ 
      color: 0xffff00,
      size: THREE.MathUtils.randFloat(0.1, 0.25),
      map: this.texture,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });
    
    for( let i = 0; i < count; i++) {
      let p = new THREE.Vector3();
      p.x = THREE.MathUtils.randFloatSpread( 2 );
      p.y = THREE.MathUtils.randFloatSpread( 2 );
      p.z = THREE.MathUtils.randFloatSpread( 2 );
      geo.vertices.push(p);
    }
    return new THREE.Points(geo, mat);
  }
  
  update(delta) {
    for( let i = 0; i < this.clusters.length; i++ ) {
      const cluster = this.clusters[i];
      
      if (cluster.scale > 12) {
        cluster.scale = 2;
        cluster.points.material.opacity = 1;
      }
      
      cluster.scale += 0.45 * delta * cluster.speed;
      cluster.points.scale.set(cluster.scale, cluster.scale, cluster.scale);
      //const color = this.startColor.lerp(this.endColor, cluster.scale / 12);
      
      
      if (cluster.scale > 8) {
        const opacity = THREE.Math.lerp(1, 0, 1 - ((12 - cluster.scale) / 4));
        cluster.points.material.opacity = opacity;
      }
    
    }
  }
}

 
class Crystal{
  constructor(options) {
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color()
    //this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer( { alpha: true } );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.preserveDrawingBuffer = true;
    this.container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.ratio = this.width / this.height;
    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 3, 30);
    this.camera.lookAt(this.scene.position);
    this.clock = new THREE.Clock();
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.mesh;
    this.material =  new THREE.MeshBasicMaterial();
    this.isPlaying = true;
    this.pointLight = new THREE.PointLight( 0xffffff, 0, 0, 2 );
    this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    this.pointLight.position.set( 0, 0, -20);
    //this.scene.add( this.pointLight );
    // PLANE
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry( 100, 100 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
    );
    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.point = new THREE.Vector3(0,0,0);
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
    ); // use a full url path
    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.dracoLoader);
    this.particleoptions = [
        {
          particle_size: .02,
          particle_size_frequency: 1.188,
          particle_size_dispersion: .3,
          rotation_dispersion: .1,
          time_scale: .01,
          twist_speed: 0,
          twist_frequency: 3,
          twist_dispersion: .1,
          twist_dispersion_frequency: 2,
          twist_amplitude: 5,
          rotation_speed: 0,
          frequency: 0,
          amplitude: .346,
          offset: 0,
          opacity: 1,
          cone_shape: 0,
          color: "#f9ebb8",
          instance_count: 1e3,
          min_radius: 3,
          max_radius: 5.3,
      },
      {
        particle_size: .03,
        particle_size_frequency: .658,
        particle_size_dispersion: .197,
        time_scale: .098,
        twist_speed: 1.76,
        twist_dispersion: .3,
        twist_dispersion_frequency: 1.196,
        twist_frequency: .2136,
        twist_amplitude: .5,
        rotation_speed: .1,
        rotation_dispersion: .168,
        frequency: .69,
        amplitude: .092,
        offset: .6,
        opacity: .276,
        cone_shape: 1,
        color: "#f7b373",
        instance_count: 1e4,
        min_radius: .5,
        max_radius: 5,
     },
     {
      particle_size: .0184,
      particle_size_frequency: 1.62,
      particle_size_dispersion: .144,
      time_scale: .147,
      twist_speed: .12,
      twist_dispersion: 1.3,
      twist_dispersion_frequency: .72,
      twist_frequency: .183,
      twist_amplitude: 0,
      rotation_speed: .12,
      rotation_dispersion: .01,
      frequency: 1.37,
      amplitude: .188,
      offset: 2.22,
      opacity: .22,
      cone_shape: 1,
      color: "#88b3ce",
      instance_count: 2e4 ,
      min_radius: .5,
      max_radius: 5,
      }
    ];
    this.arr = [];
    this.materials = [];
    /*this.particleoptions.forEach(opt=>{
      this.createBackground(opt);
    })*/
    this.getData()
    this.createBackground2();
    this.scene.add(plane);
    this.settings();
    this.setMaterials();
    //if(this.light) this.scene.add( this.light );
    //this.addPlane();
    //this.addPlane();
    this.addPointLights();
    this.createText();
    this.addDiamonds();
    this.addSpheres();
    this.setupResize();
    this.animate();
  }

  raycasterEvent(){
    let mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100,100,1000,100).rotateX(-Math.PI/2),
      new THREE.MeshBasicMaterial({color: 0xff0000,wireframe: true})
    )
    this.scene.add(mesh);
    let testmesh =  new THREE.Mesh(
      new THREE.SphereGeometry(0.1,20,20),
      new THREE.MeshBasicMaterial({color: 0xff0000,wireframe: true})
    )
    window.addEventListener( 'pointermove', (event)=>{
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.setFromCamera( this.pointer, this.camera );
      const intersects = this.raycaster.intersectObjects([mesh] );
      if(intersects[0]){
        this.point = intersects[0].point
        testmesh.position.copy(intersects[0].point)
      }
    });
  }

  settings() {
    this._settings = [
      {
        pos: new THREE.Vector3(-40, 4, -24),
        ros: new THREE.Vector3(-Math.PI/4, Math.PI / 2, Math.PI / 2),
        axis: new THREE.Vector3(4, 0, 7).normalize(),
        speed: 0.01,
        scale: 0.01
      },
      {
        pos: new THREE.Vector3(40, -3, -24),
        ros: new THREE.Vector3(-Math.PI/3, -Math.PI / 2, -Math.PI/2),
        axis: new THREE.Vector3(0, 0, 1).normalize(),
        speed: 0.01,
        scale: 0.01
      },
    ];
    this.textSettings = {
      title: "mniBus",
      bevelEnabled: true,
      fontName: 'optimer',
      // helvetiker, optimer, gentilis, droid sans, droid serif
      fontWeight: 'bold',
      height: 20,
      size: 70,
      hover: 5,
      curveSegments:4,
      bevelThickness: 2,
      bevelSize: 1.5
    };
     this.backgroundSettings = {
      progress: 0
    };

  }

  createText() {
    var textUniforms = {
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
    
    this.textMaterial = new THREE.ShaderMaterial({
      uniforms: textUniforms,
      vertexShader: vertexText,
      side:THREE.DoubleSide, 
      fragmentShader: fragmentText,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
    this.text = new Text();
    this.text.text = 'WE CONSTRUCT THE FUTURE';
    this.text.fontSize = 3;
    this.text.position.z = 2;
    this.text.position.y = 5;
    this.text.anchorX = 'center';
    this.text.material = this.backfaceMaterial;
    this.text.sync();
    // LOAD FONT
    this.onLoadFont()
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
  }



    createBackground(opts) {
    let count = opts.instance_count;
    let min_radius = opts.min_radius;
    let max_radius = opts.max_radius;
    let startergeo = new THREE.PlaneGeometry(100, 100);
    let geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", startergeo.getAttribute("position")),
      (geo.index = startergeo.index);
    const wpos = new Float32Array(3 * count);
    for (let r = 0; r < count; r++) {
      let i = 0.05 * (2 * Math.random() - 1);
      let s = 0.2 * (2 * Math.random() - 1);
      let a = 0.05 * (2 * Math.random() - 1);
      let l = Math.pow(r / (count - 1), 0.5);
      let c = 2 * Math.PI * 0.618033 * r;
      let u = new THREE.Vector3(l * Math.cos(c) + i, 0, l * Math.sin(c) + a);
      u
        .multiplyScalar(max_radius - min_radius)
        .add(u.clone().normalize().multiplyScalar(min_radius)),
        (wpos[3 * r + 0] = u.x);
      wpos[3 * r + 1] = u.y + s;
      wpos[3 * r + 2] = u.z;
    }
    let attr = new THREE.InstancedBufferAttribute(wpos, 3, false);
    geo.setAttribute("w_pos", attr);
    geo.instanceCount = count;
    let material1 = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        _MainTexture: {
          value: new THREE.TextureLoader().load(particleTexture),
        },
        _Opacity: {
          value: opts.opacity,
        },
        _MouseWorldPosition: {
          value: new THREE.Vector3(100, 0, 0),
        },
        _Size: {
          value: opts.particle_size,
        },
        _Time: {
          value: 0,
        },
        _RotationSpeed: {
          value: opts.rotation_speed,
        },
        _TwistSpeed: {
          value: opts.twist_speed,
        },
        _TwistFrequency: {
          value: opts.twist_frequency,
        },
        _TwistDispersion: {
          value: opts.twist_dispersion,
        },
        _TwistDispersionFrequency: {
          value: opts.twist_dispersion_frequency,
        },
        _RotationDispersion: {
          value: opts.rotation_dispersion,
        },
        _SizeFrequency: {
          value: opts.particle_size_frequency,
        },
        _SizeDispersion: {
          value: opts.particle_size_dispersion,
        },
        _TwistAmplitude: {
          value: opts.twist_amplitude,
        },
        _NoiseOffset: {
          value: opts.offset,
        },
        _NoiseFrequency: {
          value: 0,
        },
        _NoiseAmplitude: {
          value: opts.amplitude,
        },
        _Color: {
          // value: new THREE.Color('#f9ebb8'),
          value: new THREE.Color(opts.color),
        },
        _UseConeShape: {
          value: 0,
        },
        _MouseSphereRadius: {
          value: 0.3,
        },
        _MouseSphereAttractionRadius: {
          value: 0.4,
        },
        _MouseSphereFalloff: {
          value: 1,
        },
        _UseMouse: {
          value: 0,
        },
        _CameraFadeout: {
          value: 1,
        },
      },
      // wireframe: true,
      depthWrite: false,
      transparent: true,
      vertexShader: vertexBackground,
      fragmentShader: fragmentBackground,
    });
    this.cloud = new THREE.Mesh(geo, material1);
    this.cloud.frustumCulled = false;
    this.scene.add(this.cloud);
    this.materials.push(material1)
  }

   getData(){
    this.svg = [...document.querySelectorAll('.cls-1')]
    this.lines = [];
    this.svg.forEach((path,j)=>{
      let len = path.getTotalLength();
      let numberOfPoints = Math.floor(len/5);
      let points = []
      for (let i = 0; i < numberOfPoints; i++) {
        let pointAt = len * i/numberOfPoints;
        let p = path.getPointAtLength(pointAt);
        let randX = (Math.random() - 0.5)*5
        let randY = (Math.random() - 0.5)*5
        points.push(new THREE.Vector3(p.x - 1024 + randX,p.y - 512 + randY,0))
      }

      this.lines.push({
        id: j,
        path: path,
        length: len,
        number: numberOfPoints,
        points: points,
        currentPos: 0,
        speed: 1
      })
    })
  }

  createBackground2() {
    this.mMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
      vertexShader: vertexBackground2,
      fragmentShader: fragmentBackground2
    });

    this.mGeometry = new THREE.PlaneGeometry(0.01, 0.01, 0.1, 0.1);
    this.mGeometry = new THREE.BufferGeometry();
    this.max = this.lines.length*100;
    this.mPositions = new Float32Array(this.max*3);
    this.mOpacity = new Float32Array(this.max);

    // this.lines.forEach(line=>{
    //   line.points.forEach(p=>{
    //     this.positions.push(p.x,p.y,p.z);
    //     this.opacity.push(Math.random()/5);
    //   })
    // })
    for (let i = 0; i < this.max; i++) {
      this.mOpacity.set([Math.random()/5],i);
      this.mPositions.set([Math.random()*100,Math.random()*1000,0],i*3)
    }
    this.mGeometry.setAttribute( 'position', new THREE.BufferAttribute( this.mPositions, 3 ) );
    this.mGeometry.setAttribute( 'opacity', new THREE.BufferAttribute(  this.mOpacity, 1 ) );
    this.mPlane = new THREE.Points(this.mGeometry, this.mMaterial);
    this.mPlane.position.set(0, 0, -750)
    this.scene.add(this.mPlane);
    let loader = new THREE.TextureLoader();
    loader.load(im,
      // onLoad callback
      (texture) => {
          texture.flipY = false;
          let map = new THREE.Mesh(
            new THREE.PlaneGeometry(2048,1024,1,1),
            new THREE.MeshBasicMaterial({
              color: 0x000066,
              map: texture
            })
          )
          map.position.set(-50,0,-400)
          //this.scene.add(map);
      },
      // onProgress callback currently not supported
      undefined,
      // onError callback
       (err) => {
        console.error( 'An error happened.' );
      }
    );
  }

  addPointLights(){
    const sphere = new THREE.SphereGeometry( 0.2, 16, 8 );
    this.light1 = new THREE.PointLight( 0xff0040, 400 );
    this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    this.light1.position.set(-20,1,-10);
    this.scene.add( this.light1 );
    this.light2 = new THREE.PointLight( 0x0040ff, 400 );
    this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    this.light2.position.set(-15,1,-10);
    this.scene.add( this.light2 );
    this.light3 = new THREE.PointLight( 0x80ff80, 400 );
    this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
    this.light3.position.set(-25,1,-10);
    this.scene.add( this.light3 );
    this.light4 = new THREE.PointLight( 0xffaa00, 400 );
    this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
    this.light4.position.set(-10,1,-10);
    this.scene.add( this.light4 );
  }


  renderLight() {
    const time = Date.now() * 0.0005;
    const delta = this.clock.getDelta();
    this.light1.position.x = Math.sin( time * 0.7 ) * 30;
    this.light1.position.y = Math.cos( time * 0.5 ) * 40;
    this.light1.position.z = Math.cos( time * 0.3 ) * 30;
    this.light2.position.x = Math.cos( time * 0.3 ) * 30;
    this.light2.position.y = Math.sin( time * 0.5 ) * 40;
    this.light2.position.z = Math.sin( time * 0.7 ) * 30;
    this.light3.position.x = Math.sin( time * 0.7 ) * 30;
    this.light3.position.y = Math.cos( time * 0.3 ) * 40;
    this.light3.position.z = Math.sin( time * 0.5 ) * 30;
    this.light4.position.x = Math.sin( time * 0.3 ) * 30;
    this.light4.position.y = Math.cos( time * 0.7 ) * 40;
    this.light4.position.z = Math.sin( time * 0.5 ) * 30;
  }

  updateThings(){
    let j=0;
    this.lines.forEach(line=>{
      line.currentPos += line.speed;
      line.currentPos = line.currentPos%line.number;
      for (let i = 0; i < 100; i++) {
        let index = (line.currentPos + i)%line.number;
        let p = line.points[index];
        this.mPositions.set([p.x,p.y,p.z],j*3)
        this.mOpacity.set([Math.pow(i/1000,1.3)],j)
        j++;
      }
    })
    this.mGeometry.attributes.position.array = this.mPositions;
    this.mGeometry.attributes.position.needsUpdate = true;
  }


   createBackground1() {
    const loader = new THREE.TextureLoader();
    const textureSphereBg = loader.load('https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg');
    const texturenucleus = loader.load('https://i.ibb.co/hcN2qXk/star-nc8wkw.jpg');
    const textureStar = loader.load("https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png");
    const texture1 = loader.load("https://i.ibb.co/F8by6wW/p2-b3gnym.png");  
    const texture2 = loader.load("https://i.ibb.co/yYS2yx5/p3-ttfn70.png");
    const texture4 = loader.load("https://i.ibb.co/yWfKkHh/p4-avirap.png");
    /*    Sphere  Background   */
    textureSphereBg.anisotropy = 16;
    let geometrySphereBg = new THREE.SphereGeometry(10, 20, 20);
    let materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg,
    });
    this.sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    this.sphereBg.position.set(0,0,-10);
    this.scene.add(this.sphereBg);
    const randomPointSphere = function (radius) {
        let theta = 2 * Math.PI * Math.random();
        let phi = Math.acos(2 * Math.random() - 1);
        let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
        let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
        let dz = 0 + (radius * Math.cos(phi));
        return new THREE.Vector3(dx, dy, dz);
    }

    /*    Moving Stars   */
    let starsGeometry = new THREE.BufferGeometry();
    const pts = new Float32Array();
    let starsVertices = [];
    for (let i = 0; i < 50; i++) {
        let particleStar = randomPointSphere(150); 
        particleStar.startX = particleStar.x;
        particleStar.startY = particleStar.y;
        particleStar.startZ = particleStar.z;
        starsVertices.push(particleStar.x, particleStar.y, particleStar.z);
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3));

    let starsMaterial = new THREE.PointsMaterial({
        size: 5,
        color: "#ffffff",
        transparent: true,
        opacity: 0.8,
        map: textureStar,
        blending: THREE.AdditiveBlending,
    });
    starsMaterial.depthWrite = false;  
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
    /*    Fixed Stars   */
    const createStars = function (texture, size, total) {
        let pointGeometry = new THREE.BufferGeometry();
        let ptVertices = [];
        const pts = new Float32Array();
        let pointMaterial = new THREE.PointsMaterial({
            size: size,
            map: texture,
            blending: THREE.AdditiveBlending,                      
        });

        for (let i = 0; i < total; i++) {
            let radius = THREE.MathUtils.randInt(149, 70); 
            let particles = randomPointSphere(radius);
            ptVertices.push(particles.x, particles.y, particles.z);
        }
      pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(ptVertices, 3));
        return new THREE.Points(pointGeometry, pointMaterial);
    };


    this.scene.add(createStars(texture1, 15, 20));   
    this.scene.add(createStars(texture2, 5, 5));
    this.scene.add(createStars(texture4, 7, 5));
  }

  //LOAD FONT
  onLoadFont() {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('../../static/src/fonts/' + this.textSettings.fontName + '_' + this.textSettings.fontWeight + '.typeface.json', 
        (font) => {
          this.onFontLoaded();
          this.font = font;
          this.onRefreshTextMesh();
          resolve('Font loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onFontLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
          console.log(loadingPercentage + '% loaded');
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        }
      );
    });
  }

  onFontLoadError(error) {
    console.error('Error loading font:', error);
    document.body.classList.remove('loading');
  }

  onFontLoad() {
    document.body.classList.add('loading');
  }

  onFontLoaded() {
    document.body.classList.remove('loading');
  }

  // CREATE TEXT MESH
  createTextMesh(scene, config) {
    let metalMaterial;
    let metalMaterialSettings;
    let envmaploader = new THREE.PMREMGenerator(this.renderer);
    let font = this.font;
    let group = new THREE.Group();
    new RGBELoader().setPath('../static/src/assets/global/textures/environment/').load('aerodynamics_workshop_1k.hdr', 
      (hdrmap) => {
           let envmap = envmaploader.fromCubemap(hdrmap);
            let texture1 = new THREE.CanvasTexture(new FlakesTexture());
            texture1.wrapS = THREE.RepeatWrapping;
            texture1.wrapT = THREE.RepeatWrapping;
            texture1.repeat.x = 10;
            texture1.repeat.y = 6;


            const metalMaterialSettings = {
                clearcoat: 1.0,
                cleacoatRoughness:0.1,
                metalness: 0.9,
                roughness:0.5,
                color: 0x8418ca,
                transmission: 0.5,
                specularIntensity: 0.5,
                normalMap: texture1,
                normalScale: new THREE.Vector2(0.15,0.15),
                envMap: envmap.texture
              };
              metalMaterial = new THREE.MeshPhysicalMaterial(metalMaterialSettings);
              const textGeo = new TextGeometry(config.title, {
                font: font,
                size: config.size,
                height: config.height,
                curveSegments: config.curveSegments,
                bevelThickness: config.bevelThickness,
                bevelSize: config.bevelSize,
                bevelEnabled: config.bevelEnabled
              });

              textGeo.computeBoundingBox();
              const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
              const textMesh1 = new THREE.Mesh(textGeo, metalMaterial);
              textMesh1.position.x = centerOffset;
              textMesh1.position.y = config.hover;
              textMesh1.position.z = -25;
              textMesh1.rotation.x = 0;
              textMesh1.rotation.y = Math.PI * 2;
              group.scale.set(0.1, 0.1, 0.1);
              group.translateX(5);
              group.translateZ(-3);
              group.add(textMesh1);
              scene.add(group);
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        } 
    );
  }
  
  // REFRESH TEXT MESH
  onRefreshTextMesh() {
    this.createTextMesh(this.scene, this.textSettings);
    if (!this.textSettings.title) return;
  }

  addToScene(scene, obj, pos, ros, scale){
    obj.scale.set(scale, scale, scale);
    obj.position.set(pos);
    obj.rotation.set(ros);
    scene.add(obj);
    return obj
  }

  setMaterials(){
    // Remove unnecessary Promise and resolve
    this.envFbo = new THREE.WebGLRenderTarget(this.width * this.ratio, this.height * this.ratio);
    this.backfaceFbo = new THREE.WebGLRenderTarget(this.width * this.ratio, this.height * this.ratio);
    this.backfaceMaterial = new THREE.ShaderMaterial({
          extensions: {
              derivatives: "#extension GL_OES_standard_derivatives : enable"
          },
          side: THREE.BackSide,
          vertexShader: vertexBackface,
          fragmentShader: fragmentBackface
    });
    this.refractionMaterial = new THREE.ShaderMaterial({
      extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      uniforms: {
        envMap: this.envFbo.texture,
        backfaceMap: this.backfaceFbo.texture,
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: vertexRefraction,
      fragmentShader: fragmentRefraction
    });
     this.transparentMaterial = new THREE.ShaderMaterial({
      extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      uniforms: {
        mRefractionRatio: { value: 1.02 },
        mFresnelBias: { value: 0.1 },
        mFresnelPower: { value: 2.0 },
        mFresnelScale: { value: 1.0 },
        tCube: { value: null }
      },
      vertexShader: vertexTransparent,
      fragmentShader: fragmentTransparent
    });
    }
    
    async loadCubeTexture( urls ) {
      return new Promise( function ( resolve ) {
        new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {
          resolve( cubeTexture );
          });
      });
    }

    allocateCubemapRenderTarget( cubeMapSize ) {
        const params = {
          magFilter: THREE.LinearFilter,
          minFilter: THREE.LinearMipMapLinearFilter,
          generateMipmaps: false,
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          colorSpace: THREE.LinearSRGBColorSpace,
          depthBuffer: false,
        };
        const rt = new THREE.WebGLCubeRenderTarget( cubeMapSize, params );
        const mipLevels = Math.log( cubeMapSize ) * Math.LOG2E + 1.0;
        for ( let i = 0; i < mipLevels; i ++ ) rt.texture.mipmaps.push( {} );
        rt.texture.mapping = THREE.CubeReflectionMapping;
        return rt;
    }

    renderToCubeTexture( cubeMapRenderTarget, sourceCubeTexture ) {
        const cameras = [];
        for ( let i = 0; i < 6; i ++ ) {
          cameras.push( new THREE.PerspectiveCamera( - 150, 1, 1, 10 ) );
        }
        cameras[ 0 ].up.set( 0, 1, 0 );
        cameras[ 0 ].lookAt( 1, 0, 0 );
        cameras[ 1 ].up.set( 0, 1, 0 );
        cameras[ 1 ].lookAt( - 1, 0, 0 );
        cameras[ 2 ].up.set( 0, 0, - 1 );
        cameras[ 2 ].lookAt( 0, 1, 0 );
        cameras[ 3 ].up.set( 0, 0, 1 );
        cameras[ 3 ].lookAt( 0, - 1, 0 );
        cameras[ 4 ].up.set( 0, 1, 0 );
        cameras[ 4 ].lookAt( 0, 0, 1 );
        cameras[ 5 ].up.set( 0, 1, 0 );
        cameras[ 5 ].lookAt( 0, 0, - 1 );
        for ( let i = 0; i < 6; i ++ ) cameras[ i ].updateMatrixWorld();
        const geometry = new THREE.BoxGeometry( 5, 5, 5 );
        const material = new THREE.ShaderMaterial( {
          name: 'FilterCubemap',
          uniforms: THREE.UniformsUtils.clone( CubemapFilterShader.uniforms ),
          vertexShader: CubemapFilterShader.vertexShader,
          fragmentShader: CubemapFilterShader.fragmentShader,
          side: THREE.BackSide,
          blending: THREE.NoBlending,
        });
        material.uniforms.cubeTexture.value = sourceCubeTexture;
        const mesh = new THREE.Mesh( geometry, material );
        const currentRenderTarget = this.renderer.getRenderTarget();
        const currentXrEnabled = this.renderer.xr.enabled;
        this.renderer.xr.enabled = false;
        for ( let faceIndex = 0; faceIndex < 6; faceIndex ++ ) {
          let mipIndex = 0;
          let mipSize = cubeMapRenderTarget.width;
          // Render to each texture mip level
          while ( mipSize >= 1 ) {
            cubeMapRenderTarget.viewport.set( 0, 0, mipSize, mipSize );
            this.renderer.setRenderTarget( cubeMapRenderTarget, faceIndex, mipIndex );
            material.uniforms.mipIndex.value = mipIndex;
            material.needsUpdate = true;
            this.renderer.render( mesh, cameras[ faceIndex ] );
            mipSize >>= 1;
            mipIndex ++;
          }
        }
        this.renderer.setRenderTarget( currentRenderTarget );
        this.renderer.xr.enabled = currentXrEnabled;
        mesh.geometry.dispose();
        mesh.material.dispose();
    }


    addMetalMaterial(md){
      let metalMaterial;
      let metalMaterialSettings;
      let envmaploader = new THREE.PMREMGenerator(this.renderer);
      new RGBELoader().setPath('../static/src/assets/global/textures/environment/').load('memorial.hdr', function(hdrmap) {   
        let envmap = envmaploader.fromCubemap(hdrmap);
        let texture1 = new THREE.CanvasTexture(new FlakesTexture());
        texture1.wrapS = THREE.RepeatWrapping;
        texture1.wrapT = THREE.RepeatWrapping;
        texture1.repeat.x = 10;
        texture1.repeat.y = 6;
        const metalMaterialSettings = {
            clearcoat: 1.0,
            cleacoatRoughness:0.1,
            metalness: 0.9,
            roughness:0.5,
            color: 0x8418ca,
            normalMap: texture1,
            normalScale: new THREE.Vector2(0.15,0.15),
            envMap: envmap.texture
          };
          metalMaterial = new THREE.MeshPhysicalMaterial(metalMaterialSettings);
          md.material = metalMaterial;
      });
    }

    addPlane(){
      this.planeMaterial = new THREE.ShaderMaterial({
        extensions: {
            derivatives: "#extension GL_OES_standard_derivatives : enable"
        },
         uniforms: {
          texture1: { value: this.envFbo.texture},
          hasTexture: { value: 1. },
          scale: { value: 2.},
          shift: { value: -0.4 },
          opacity: { value: 0.1 },
          color: { value: new THREE.Color("white") }
        },
        vertexShader: vertexPlane,
        fragmentShader: fragmentPlane
      });
      this.planeGeo = new THREE.PlaneGeometry(50, 50, 32, 32);
      this.plane = new THREE.Mesh(this.planeGeo, this.planeMaterial);
      this.scene.add(this.plane);
    }
 
    addLights() {
      const textureLoader = new THREE.TextureLoader();
      const textureFlare0 = textureLoader.load( "../static/src/assets/global/textures/lensflare/lensflare0.png" );
      const textureFlare3 = textureLoader.load( "../static/src/assets/global/textures/lensflare/lensflare3.png" );
      const light = new THREE.PointLight( 0xffffff, 1.5, 2000, 0 );
      const addLight = function (h, s, l, x, y, z ) {
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        const lensflare = new Lensflare();
        lensflare.addElement( new LensflareElement( textureFlare0, 700, 0, light.color ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) );
        light.add( lensflare );
      };
      addLight( 0.55, 0.9, 0.5, 10, 0, 2 );
      addLight( 0.08, 0.8, 0.5, 0, 0, 2 );
      addLight( 0.995, 0.5, 0.9, -10, 0, 2 );
      return light;
    }

    addDiamonds() {
    const loader = new GLTFLoader().setPath("../static/src/assets/dataset/models/diamond/");
    loader.load("diamond.glb",
      (gltf) => {
      this.geometry = gltf.scene.children[0].geometry;
      //this.geometry = gltf.scene.children[0].children[0].children[0].children[0].children[0].geometry;
      const r = '../static/src/assets/global/textures/diamond/';
      const urls = [
        r + 'px.jpg', r + 'nx.jpg',
        r + 'py.jpg', r + 'ny.jpg',
        r + 'pz.jpg', r + 'nz.jpg'
      ];
      this.loadCubeTexture( urls ).then(( cubeTexture ) => {
        const cubeMapRenderTarget = this.allocateCubemapRenderTarget( 512 );
        this.renderToCubeTexture( cubeMapRenderTarget, cubeTexture );
        let material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: cubeTexture });
        material.envMap = cubeMapRenderTarget.texture;
        this.mesh = new THREE.InstancedMesh(this.geometry, material, this._settings.length);
        this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
        this.mesh.scale.set(0.8, 0.8, 0.8);
        this.scene.add(this.mesh);
        addPageManager(this.container, 'loaded');
        });
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        } 
        // Add the single instance of InstancedMesh to the scene
    );
   }
    addSpheres() {
      const loader = new GLTFLoader().setPath("../static/src/assets/dataset/models/sphere/");
      loader.load("scene.gltf",
      (gltf) => {
       this.sphere = gltf.scene;
        console.log("this sphere", this.sphere)
        /*gltf.scene.traverse( child => {
            if ( child.isMesh ) {
              child.castShadow = true;
              child.receiveShadow = true;
              if ( child.material.map ) {
                child.material.map.anisotropy = 8;
            }
          }
        });*/
        this.sphere.position.set(-25, 5,-20);
        this.sphere.scale.set(0.08, 0.08, 0.08);
        this.aLight = new THREE.DirectionalLight(0xffffff, 10.0);
        this.aLight.position.set(-25, 5,-20);
        this.scene.add(this.aLight);
        this.scene.add(this.sphere);
        let o = {
          geometry: this.sphere.children[0].children[0].children[0].children[0].children[0].geometry,
          scene: this.scene,
          camera: this.camera,
          renderer: this.renderer
        };
        //this.test = new MoveParticles(o);
        //this.flow1 = this.test.flow1;
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        }
      ); 
    }

    addDot(scene, position, size = 5) {
      const geo = new THREE.Geometry();
      geo.vertices.push(position.clone());
      const mat = new THREE.PointsMaterial( {
        size,
        sizeAttenuation: false,
        color: 0xffffff
      });
      const dot = new THREE.Points(geo, mat);
      //scene.add( dot );
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
    // RENDER
    render() {
      this.time += 0.05;
      var delta = 0;
      var speed = 2;
      delta = this.clock.getDelta();
      var frame = 2;
      frame+=0.5;
      const ROTATE_TIME = 10; // Time in seconds for a full rotation
      const xAxis = new THREE.Vector3(1, 0, 0);
      const yAxis = new THREE.Vector3(0, 1, 0);
      const rotateX = (delta / ROTATE_TIME) * Math.PI;
      const rotateY = (delta / ROTATE_TIME) * Math.PI;
      const rotateZ = (delta / ROTATE_TIME) * Math.PI;
      if(this.mesh){
        let time = performance.now() * 0.001;
        this.model = new THREE.Object3D();
        this.mesh.position.x = Math.sin( time * 2);
        this.mesh.position.y = Math.sin( time * 4)+ 0.2;
        this.mesh.position.z = Math.sin( time * 2 );
        this.mesh.rotateZ(rotateZ);
        this.mesh.rotateY(rotateY);
        time += 0.5;
        this._settings.forEach((data, i) => {
          const t = this.clock.getElapsedTime() / 2;
          const { pos, ros, axis, speed, scale } = data;
          const s = (this.width / 35) * scale;
          this.model.position.copy(data.pos);
          this.model.rotation.set(data.ros.x, data.ros.y, data.ros.z);
          this.model.updateMatrix();
          this.mesh.setMatrixAt(i, this.model.matrix);
        });
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.computeBoundingSphere();
      }
     // Stars Animation
      /*const starsAttributes = this.stars.geometry.attributes;

      for (let i = 0; i < starsAttributes.position.count; i++) {
          const startX = starsAttributes.position.getX(i);
          const startY = starsAttributes.position.getY(i);
          const startZ = starsAttributes.position.getZ(i);
          let velocity = THREE.MathUtils.randInt(50, 300);
          velocity -= 0.03;
          starsAttributes.position.setX(i, startX + (0 - startX) / velocity);
          starsAttributes.position.setY(i, startY + (0 - startY) / velocity);
          starsAttributes.position.setZ(i, startZ + (0 - startZ) / velocity);
          if (
              startX <= 5 && startX >= -5 &&
              startZ <= 5 && startZ >= -5
          ) {
              starsAttributes.position.setX(i, startX);
              starsAttributes.position.setY(i, startY);
              starsAttributes.position.setZ(i, startZ);
              velocity = THREE.MathUtils.randInt(50, 300);
          }
      }

      // Update the BufferGeometry to reflect the changes
      starsAttributes.position.needsUpdate = true;
      this.stars.geometry.verticesNeedUpdate = true;
    //Sphere Beckground Animation
    //this.sphereBg.rotation.x += delta*0.1;
    //this.sphereBg.rotation.y += delta*0.1;
    //this.sphereBg.rotation.z += delta*0.1;*/

    this.updateThings();
    this.renderLight();
    this.mMaterial.uniforms.time.value = this.time;

    // this.material.uniforms.time.value = this.time;
    /*this.materials.forEach(m=>{
      m.uniforms._Time.value = this.time*0.1;
      m.uniforms._MouseWorldPosition.value = this.point
    })*/
      //this.textMaterial.uniforms.time.value = 0.01 * delta * frame;
      this.renderer.render(this.scene, this.camera);
      this.renderer.clearDepth();
    }

    setupResize() {
    window.addEventListener("resize", this.onResize.bind(this));
    }
    // RESIZE
    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //ROTATE OBJECT
    onRotation = function(obj, axis, speed) {
      obj.rotateOnAxis(axis, speed);
    }

    // ANIMATE 
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.render();
    }
}
//Load CRYSTAL 
var C = new Crystal({
    container: document.querySelector('.crystal-container')
});

//Load AUDIO
const preloadAudio = () => {
    let o = {
        container: document.querySelector('.crystal-container'),
    };
    new Audio(o);
};


if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
    preloadAudio();
else
  document.addEventListener("DOMContentLoaded", preloadAudio ); 


    
 
