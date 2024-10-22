import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

function BrainTubeMaterial (){
const TubeMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.1, 0.3, 0.6),
    mouse: new THREE.Vector3(0., 0., 0. )
  },
  /*glsl*/`
    varying vec2 vUv;
    uniform float time;
    uniform vec3 mouse;
    varying float vProgress;
    void main() {
      vUv = uv;
      vProgress = smoothStep(-1., 1., sin(vUv.x * 8.0 + time * 3.0));
      vec3 p = position;
      float maxDist = 0.05;
      float dist = length(mouse - p);
      if(dist < maxDist) {
        vec3 dir = normalize(mouse - p);
        dir *= (1.0 - dist / maxDist);
        p -= dir * 0.03;
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  /*glsl*/`
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying float vProgress;
    void main() {
      vec3 finalColor = mix(color, color * 0.25, vProgress);
      float hideCorners = smoothstep(1.0, 0.9, vUv.x);
      float hideCorners1 = smoothstep(0.0, 0.1, vUv.x);
      gl_FragColor = vec4(finalColor, hideCorners * hideCorners1);
    }
  `
  );

    return TubeMaterial;
}


export default BrainTubeMaterial
