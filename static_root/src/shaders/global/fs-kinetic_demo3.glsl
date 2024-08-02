varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
  float time = uTime * 0.25;
  vec2 uv = fract(vUv * 3. - vec2(time, 0.));
  vec3 texture = texture2D(uTexture, uv).rgb;

  gl_FragColor = vec4(texture, 1.);
}