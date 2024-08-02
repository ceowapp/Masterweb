import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

function BrainParticle({curve}){
  let density = 10;
  let numberOfPoints = density*curve.length;
  const myPoints = useRef([]);
  const brainGeo = useRef();
  let positions = useMemo(()=>{
    let positions = [];
      for (let i = 0; i < numberOfPoints; i++) {
        positions.push(
          randomRange(-1, 1),
          randomRange(-1, 1),
          randomRange(-1, 1)
        )
      }
      return new Float32Array(positions)
  }, []);
  let randoms = useMemo(()=>{
      let randoms = []; 
        for (let i = 0; i < numberOfPoints; i++) {
          randoms.push(
            randomRange(0.3, 1.)
          )
        }
       return new Float32Array(randoms)
  },[]);
  useEffect(()=>{
    for (let i=0; i < curve.length; i++) { 
      for (let j = 0; j < density; j++) {
        myPoints.current.push({
          currentOffset: Math.random(), 
          speed: Math.random()*0.01, 
          curve: curve[i], 
          curPosition: Math.random()
        });
      }
    }
  });    
  useFrame(({clock})=>{
    let curPositions = brainGeo.current.attributes.position.array;
    for (let i=0; i < myPoints.current.length; i++) {
      myPoints.current[i].curPosition += myPoints.current[1].speed; 
      myPoints.current[i].curPosition = myPoints.current[i].curPosition%1;
      let curPoint = myPoints.current[i].curve.getPointAt(myPoints.current[1].curPosition)
      curPositions[i*3] = curPoint.x;
      curPositions[i*3 + 1] = curPoint.y;
      curPositions[i*3 + 2] = curPoint.z;
    }
    brainGeo.current.attributes.position.needsUpdate = true;
  });

  const BrainParticleMaterial = shaderMaterial(
    {
      time: 0,
      color: new THREE.Color(0.1, 0.3, 0.6),
      mouse: new THREE.Vector3(0., 0., 0. )
    },
    //vertexShader
    /*glsl*/`
    varying vec2 vUv; 
    uniform float time;
    attribute float randoms;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec4 myPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = randoms *2. * (1. / -mvPosition.z);
      // gl_PointSize = 50;
    }
    `,
    //fragmentShader
    /*glsl*/`
    uniform float time;
    void main() {
      float disc = length(gl_PointCoord.xy - vec2(0.5));
      float opacity = 0.3*smoothstep(0.5, 0.4, disc);
      gl_FragColor =  vec4(vec3(opacity), 1.);
    }
    `,
  );
  extend({ BrainParticleMaterial });
  
  return (
    <>
      <points>
        <bufferGeometry attach="geometry" ref={brainGeo}>
          <bufferAttribute
            attach={'attributes-position'}
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach={'attributes-randoms'}
            count={randoms.length}
            array={randoms}
            itemSize={1}
          />
        </bufferGeometry>
        <brainParticleMaterial
          attach="material"
          depthTest={false}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export function BrainParticles({allthecurve}) {
  return (
  <>
  {allthecurve.map((curve, index) =>(
    <BrainParticle curve={curve} key={index}/>
  ))}
  </>
 )
}
    



