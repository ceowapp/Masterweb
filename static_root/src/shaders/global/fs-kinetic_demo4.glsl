varying vec2 vUv;
varying float vWave;

uniform float uTime;
uniform sampler2D uTexture;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  float time = uTime * 0.25;
  vec2 repeat = vec2(4., 16.);
  vec2 uv = fract(vUv * repeat);
  vec3 texture = texture2D(uTexture, uv).rgb;
   texture *= vec3(uv.x, uv.y, 0.);

  float wave = vWave;
  wave = map(wave, -1., 1., 0., 0.1);
  float shadow = 1. - wave;

  vec3 fragColor = texture * shadow;

  gl_FragColor = vec4(fragColor, 1.);
}