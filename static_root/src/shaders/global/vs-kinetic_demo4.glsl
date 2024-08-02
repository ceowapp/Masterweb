varying vec2 vUv;
varying float vWave;
uniform float uTime;

void main() {
  vUv = uv;

  vec3 pos = position;
  float freq = 0.5;
  float amp = 1.;
  float time = uTime * 3.5;
  pos.z += sin((pos.x - pos.y) * freq - time) * amp;

  vWave = pos.z;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
