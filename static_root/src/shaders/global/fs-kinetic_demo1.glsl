varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform sampler2D uTexture;

void main() {
  float time = uTime * 0.4;

  vec2 repeat = -vec2(12., 3.);
  vec2 uv = fract(vUv * repeat - vec2(time, 0.));
  vec3 texture = texture2D(uTexture, uv).rgb;
  // texture *= vec3(uv.x, uv.y, 0.);

  float fog = clamp(vPosition.z / 6., 0., 1.);
  vec3 fragColor = mix(vec3(0.), texture, fog);

  gl_FragColor = vec4(fragColor, 1.);
}
