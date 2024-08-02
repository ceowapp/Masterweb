const BrainTubeVertexShader = 
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
`
export default BrainTubeVertexShader
