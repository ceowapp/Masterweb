uniform float time;
uniform float progress;
uniform sampler2D t;
uniform sampler2D t1;
uniform vec4 resolution;
varrying vec2 vUv;
varrying vec3 vPosition;
float PI = 3.141592653589793238;

void main() {
  vec4 tt = texture2D(t, vUv);
  vec4 tt1 = texture2D(t1, vUv);
  vec finalTexture = mix(tt, tt1, progress);
  gl_FragColor = finalTexture;
  if(gl_FragColor.r<0.1 && gl_FragColor.b<0.1 && gl_FragColor.g<0.1) discard;
}