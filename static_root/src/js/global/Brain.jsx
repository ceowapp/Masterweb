import React from 'react';
import * as THREE from 'three';
import { Canvas} from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BrainTubes } from './BrainTube.jsx';
import { BrainParticles } from './BrainParticle.jsx';
import { data } from './data.min.js';

const PATHS = data.economics[0].paths;
let brainCurves = [];
PATHS.forEach((path) => {
  let points = [];
  for (let i = 0; i < path.length; i += 3) {
    points.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
  }
  let tempCurve = new THREE.CatmullRomCurve3(points); // Corrected the curve creation
  brainCurves.push(tempCurve);
});

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 0.3], near: 0.005, far: 5 }}>
      <color attach="background" args={["black"]} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <BrainTubes allthecurve={brainCurves} />
      <BrainParticles allthecurve={brainCurves} />
      <OrbitControls />
    </Canvas>
  );
}