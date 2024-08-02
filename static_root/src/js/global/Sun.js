import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Environment from './Text.js';
import Audio from './Audio.js';

const sunTexture = '../../static/src/assets/global/textures/cloud.png';
const vertex = `
    #define GLSLIFY 1
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 pixels;
    float PI = 3.141592653589793238;
    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

const fragment = `
  #define GLSLIFY 1
  #define OCTAVES  6
  uniform float time;
  uniform float progress;
  uniform sampler2D texture1;
  uniform vec4 resolution;
  varying vec2 vUv;
  varying vec3 vPosition;
  float PI = 3.141592653589793238;

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }


    float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
    }

    float permute(float x) {
    return mod289(((x*34.0)+1.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r)
    {
    return 1.79284291400159 - 0.85373472095314 * r;
    }

    float taylorInvSqrt(float r)
    {
    return 1.79284291400159 - 0.85373472095314 * r;
    }

    vec4 grad4(float j, vec4 ip)
    {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
    }

    // (sqrt(5) - 1)/4 = F4, used once below
    #define F4 0.309016994374947451

    float snoise(vec4 v)
    {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
    0.276393202250021,  // 2 * G4
    0.414589803375032,  // 3 * G4
    -0.447213595499958); // -1 + 4 * G4

    // First corner
    vec4 i  = floor(v + dot(v, vec4(F4)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

    // Other corners

    // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    // Permutations
    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
    i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
    + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
    + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
    + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
    + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
    }

    vec2 fbm(vec4 p) {
        float f = 1.;
        float a = 1.;
        vec2 sum = vec2(0);
        for(int i = 0; i < OCTAVES ; i++){
            sum.x +=  snoise(p * f) *a;
            sum.x +=  abs(snoise(p * f)) * a;
            p.w += 100.;
            a *= 0.9;
            f *= 2.;
        }
        return sum;
    }
    void main(){
        float uContrast = 0.25;
        float uFlatten = 0.72;
        float uSpatialFrequency = 3.;
        float uTemporalFrequency = 0.005;
        vec3 world = normalize(vPosition);
        vec4 p = vec4(world * uSpatialFrequency, time * uTemporalFrequency);
        gl_FragColor.xy = fbm(p) * uContrast + 0.5;
        vec4 p2 = vec4(world * 2., time * uTemporalFrequency);
        float modulate = max(snoise(p2) , 0.);
        gl_FragColor.x *= mix(1., modulate, uFlatten);
    }
`;


const vertexSun = `
    #define GLSLIFY 1
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 pixels;
    float PI = 3.141592653589793238;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    varying vec3 eyeVector;
    mat2 getMatrix(float a){
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
    }
    void setLayers(vec3 p){
        float t = time * 0.015;
        mat2 m = getMatrix(t);
        vec3 p1 = p;
        p1.yz = m * p1.yz;
        vLayer0 = p1;
        p1 = p;
        m = getMatrix(t + 2.094);
        p1.zx = m * p1.zx;
        vLayer1 = p1;
        p1 = p;
        m = getMatrix(t + 4.188);
        p1.xy = m * p1.xy;
        vLayer2 = p1;
    }

    void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0);
        eyeVector = normalize(worldPosition.xyz - cameraPosition);
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        setLayers(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

const fragmentSun = `
    #define GLSLIFY 1
    #define OCTAVES  6
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform vec4 resolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    varying vec3 eyeVector;
    float PI = 3.141592653589793238;
    uniform samplerCube uPerlinCube;
    float uTint = 0.26;
    float uBrightness = 0.6;
    vec3 brightnessToColor(float b){
        b *= uTint;
        return (vec3(b, b * b, b*b*b * b)/ (uTint)) * uBrightness;
    }
    float ocean(in vec3 p){
        float sum = 0.;
        sum += textureCube(uPerlinCube, vLayer0).r;
        sum += textureCube(uPerlinCube, vLayer1).r;
        sum += textureCube(uPerlinCube, vLayer2).r;
        return sum * 0.33;
    }

    float Fresnel(vec3 eyeVector, vec3 worldNormal) {
        return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
    }

    void main(){
        gl_FragColor = textureCube(uPerlinCube,vPosition);
        gl_FragColor = vec4(ocean(vPosition));
        float fresnel = Fresnel(eyeVector, vNormal);
        float brightness = ocean(vPosition);
        brightness = brightness * 4. + 1.;
        brightness += fresnel;
        vec3 col = brightnessToColor(brightness);
        col = clamp(col, 0., 1.);
        gl_FragColor.rgb = col;
    }
`;

const vertexSunCloud = `
    attribute vec3 aPos;
    attribute vec3 aPos0;
    attribute vec3 aPos1;
    attribute vec4 aWireRandom;
    varying float vUVY;
    varying float vOpacity;
    varying vec3 vColor;
    varying vec3 vNormal;
    uniform float uWidth;
    uniform float uAmp;
    uniform float uTime;
    uniform float uNoiseFrequency;
    uniform float uNoiseAmplitude;
    uniform vec3 uCamPos;
    uniform float uOpacity;
    uniform float uHueSpread;
    uniform float uHue;
    #define m4  mat4( 0.00, 0.30, 0.10, -0.3, -0.60,  0.16, -0.48, -0.1, -0.30, -0.38, 0.4, 0.1, 0.20, 0.05, 0.20,0.1)

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

    vec4 twistedSineNoise(vec4 q, float falloff){
        float a = 2.; 
        float f = 3.;    
        vec4 sum = vec4(0);   
        for(int i = 0; i < 4 ; i++){
            q = m4 * q;  
            float distortion = pnoise((normal + uTime), vec3(1.0) * 0.02) * 0.2;
            q.xyz += distortion*5.;
            vec4 s = sin( q.ywxz * f) * a ;
            q += s;
            sum += s;         
            //sum += max(s, 0.);
            a *= falloff;
            f /= falloff;
            //f *= 2.;
        }
        return sum;
    }
    vec3 getPos(float phase, float animPhase){
        float size = distance(aPos0, aPos1);
        vec3 n = normalize((aPos0 + aPos1) * 0.5);
        vec3 p = mix(aPos0, aPos1, phase);
        float amp = sin(phase * 3.14) * size * uAmp;
        //amp *= max(sin((uTime* 0.5 * (aWireRandom.z * 0.05) + aWireRandom.z) * 6.28), 0.);
        amp *= animPhase;
        p += n * amp;
        p += twistedSineNoise(vec4(p * uNoiseFrequency, uTime ), 0.707).xyz * (amp * 0.002);
        //p += n * (0.5 - abs( phase - 0.5)) * size * 5.;
        return p;
    }
     vec3 hue(float v){
        vec3 sum = vec3(0);
        vec3 s = .6 + .6 * cos( 6.3*(v)  + vec3(0,23,21));
        sum += s;
        return sum;
    }
    vec3 spectrum(in float d){
        return smoothstep(0.25, 0., abs(d + vec3(-0.375,-0.5,-0.625)));
    }
    void main(void) {
        vUVY = aPos.z;
        float animPhase = fract(uTime * 0.3 * (aWireRandom.z * 0.5) + aWireRandom.x);
        vec3 p = getPos(aPos.x, animPhase);
        vec3 p1 = getPos(aPos.x+ 0.1, animPhase);
        vec3 dir = p1 - p;
        dir = normalize(dir);
        vec3 v = normalize(p - uCamPos);
        vec3 side = (cross(v, dir));
        float width = uWidth  * aPos.z;
        width *= 1. + animPhase;
        p += side * width;
        vNormal = normalize(p);
        //transparent base
        vOpacity = smoothstep(1., 1.05, length(p));
        //fade out while growing
        vOpacity *= 1. - animPhase;
        vOpacity *= uOpacity;
        vColor = hue (aWireRandom.w * uHueSpread + uHue);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p , 1.);
    }
`;

const fragmentSunCloud = `
    #define GLSLIFY 1
    #define OCTAVES 6
    precision highp float;
    uniform vec4 resolution;
    varying vec2 vUv;
    varying vec3 vNormal;
    float PI = 3.141592653589793238;
    varying vec3 vWorld;
    uniform vec3 uLightView;
    uniform float uVisibility;
    uniform float uSpatialFrequency;
    uniform float uTemporalFrequency;
    uniform float uAmplitude;
    uniform float uH;
    uniform float uTime;
    varying float vUVY;
    uniform float uDirection;
    varying float vOpacity;
    varying vec3 vColor;
    uniform float uAlphaBlended;
    uniform float uHueSpread;
    uniform float uHue;
    mat4 m4 = mat4(0.00, 0.80, 0.60, -0.4, -0.80,  0.36, -0.48, -0.5, -0.60, -0.48, 0.64, 0.2, 0.40, 0.30, 0.20,0.4);
    vec4 twistedSineNoise(vec4 q){
        float a = 1.;
        float f = 1.;
        vec4 sum = vec4(0);
        for(int i = 0; i < 4 ; i++){
            q = m4 * q;
            vec4 s = sin( q.ywxz * f) * a;
            q += s;
            sum += s;
            sum += max(s, 0.);
            a *= uH;
            f /= uH;
            f *= 2.;
        }
        return sum;
    }

    float getAlpha(vec3 n){
        vec3 l = vec3(0.57735,0.57735,0.57735);
        float nDotL = dot(n, l) * uDirection;
        return smoothstep(1., 1.5, nDotL + uVisibility * 2.5);
    }

     vec3 brightnessToColor(float b){
        b *= uHueSpread;
        return (vec3(b, b * b, b*b*b*b)/ (uHueSpread)) * uHue;
    }

    void main(void) {
        vec3 c = vec3(1,0.6,0.4);
        float alpha = smoothstep(1., 0., abs(vUVY));
        alpha *= alpha;
        alpha *= vOpacity;
        alpha *= getAlpha(vNormal);
        float brightness = 1. + alpha * 0.53;
        vec3 finalColor = vec3(vColor.x*brightness*brightness,vColor.y*brightness*brightness*brightness, vColor.z*brightness*brightness*brightness*brightness);
        gl_FragColor = vec4(finalColor, 0.15);  
  }
`;

const vertexSunCloud1 = `
    attribute vec3 aPos;
    attribute vec3 aPos0;
    attribute vec4 aWireRandom;
    varying float vUVY;
    varying float vOpacity;
    varying vec3 vColor;
    varying vec3 vNormal;
    uniform float uLength;
    uniform float uWidth;
    uniform float uAmp;
    uniform float uTime;
    uniform float uNoiseFrequency;
    uniform float uNoiseAmplitude;
    uniform vec3 uCamPos;
    uniform float uOpacity;
    uniform float uHueSpread;
    uniform float uHue;
    #define m4  mat4( 0.00, 0.80, 0.60, -0.4, -0.80,  0.36, -0.48, -0.5, -0.60, -0.48, 0.64, 0.2, 0.40, 0.30, 0.20,0.4)
    vec4 twistedSineNoise(vec4 q, float falloff){
        float a = 1.; 
        float f = 1.;    
        vec4 sum = vec4(0);   
        for(int i = 0; i < 4 ; i++){
            q = m4 * q;   
            vec4 s = sin( q.ywxz * f) * a;
            q += s;
            sum += s;         
            //sum += max(s, 0.);
            a *= falloff;
            f /= falloff;
            //f *= 2.;
        }
        return sum;
    }
    vec3 getPos(float phase, float animPhase){
        float size = aWireRandom.z + 0.2;
        float d = phase * uLength * size;
        vec3 p = aPos0 + aPos0 * d;
        p += twistedSineNoise(vec4(p * uNoiseFrequency,uTime ), 0.707).xyz * (d * uNoiseAmplitude);
        return p;
    }


   vec3 hue(float v){
        vec3 sum = vec3(0);
        vec3 s = .6 + .6 * cos( 6.3*(v)  + vec3(0,23,21));
        sum += s;
        return sum;
    }

    float distToCenter(vec3 ro, vec3 rd){
        float d = dot(- ro, rd);
        return length(ro + d * rd);
    }
    vec3 spectrum(in float d){
        return smoothstep(0.25, 0., abs(d + vec3(-0.375,-0.5,-0.625)));
    }
    void main(void) {
        vUVY = aPos.z;
        float animPhase = fract(uTime * 0.3 * (aWireRandom.y * 0.5) + aWireRandom.x);
        vec3 p = getPos(aPos.x, animPhase);
        vec3 p1 = getPos(aPos.x + 0.01, animPhase);
        vec3 dir = p1 - p;
        dir = normalize(dir);
        vec3 v = normalize(p - uCamPos);
        vec3 side = normalize(cross(v, dir));
        float width = uWidth  * aPos.z * (1. - aPos.x);
        vNormal = normalize(p);
        p += side * width;
        vOpacity = uOpacity * (0.5 + aWireRandom.w);
        vColor = spectrum (aWireRandom.w * uHueSpread + uHue);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p , 1.);
    }
`;

const fragmentSunCloud1 = `
    #define GLSLIFY 1
    #define OCTAVES 6
    precision highp float;
    uniform vec4 resolution;
    varying vec2 vUv;
    varying vec3 vNormal;
    float PI = 3.141592653589793238;
    varying vec3 vWorld;
    uniform vec3 uLightView;
    uniform float uVisibility;
    uniform float uSpatialFrequency;
    uniform float uTemporalFrequency;
    uniform float uAmplitude;
    uniform float uH;
    uniform float uTime;
    varying float vUVY;
    uniform float uDirection;
    varying float vOpacity;
    varying vec3 vColor;
    uniform float uAlphaBlended;
    mat4 m4 = mat4(0.00, 0.80, 0.60, -0.4, -0.80,  0.36, -0.48, -0.5, -0.60, -0.48, 0.64, 0.2, 0.40, 0.30, 0.20,0.4);
    vec4 twistedSineNoise(vec4 q){
        float a = 1.;
        float f = 1.;
        vec4 sum = vec4(0);
        for(int i = 0; i < 4 ; i++){
            q = m4 * q;
            vec4 s = sin( q.ywxz * f) * a;
            q += s;
            sum += s;
            sum += max(s, 0.);
            a *= uH;
            f /= uH;
            f *= 2.;
        }
        return sum;
    }

    float getAlpha(vec3 n){
        vec3 l = vec3(0.57735,0.57735,0.57735);
        float nDotL = dot(n, l) * uDirection;
        return smoothstep(1., 1.5, nDotL + uVisibility * 2.5);
    }
    void main(void) {
        vec3 c = vec3(1,0.6,0.4);
        float alpha = smoothstep(1., 0., abs(vUVY));
        alpha *= alpha;
        alpha *= vOpacity;
        alpha *= getAlpha(vNormal);
        gl_FragColor = vec4(vColor * alpha, alpha * uAlphaBlended);  
    }
`;

const vertexSunAround = `
    #define GLSLIFY 1
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 pixels;
    float PI = 3.141592653589793238;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;


const fragmentSunAround = `
    #define GLSLIFY 1
    #define OCTAVES 6
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform vec4 resolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    float PI = 3.141592653589793238;
    uniform samplerCube uPerlinCube;
    float uTint = 0.36;
    float uBrightness = 0.6;
    vec3 brightnessToColor(float b){
        b *= uTint;
        return (vec3(b, b * b, b*b*b*b)/ (uTint)) * uBrightness;
    }
    float getAlpha(vec3 n){
        float nDotL = dot(n, normalize(vec3(1.))) ;
        return smoothstep(1., 1.5, nDotL +  2.5);
    }
    void main(){
        gl_FragColor = vec4(1.,0.,0.,1.);
        gl_FragColor = vec4(vPosition.z,0.,0.,1.);
        float vRadial = vPosition.z;
        float alpha = (1. - vRadial);
        alpha *= alpha*alpha;
        float brightness = 1. + alpha * 0.83;
        gl_FragColor.xyz = brightnessToColor(brightness) * alpha;
    }
`;
const fragmentSunAround1 = `
    #define GLSLIFY 1
    #define OCTAVES 6
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform vec3 resolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    float PI = 3.141592653589793238;
    float uTint = 0.36;
    float uBrightness = 0.6;

    float snoise(vec3 uv, float res)    // by trisomie21
{
    const vec3 s = vec3(1e0, 1e2, 1e4);
    
    uv *= res;
    
    vec3 uv0 = floor(mod(uv, res))*s;
    vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
    
    vec3 f = fract(uv); f = f*f*(3.0-2.0*f);
    
    vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
                  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
    
    vec4 r = fract(sin(v*1e-3)*1e5);
    float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
    
    r = fract(sin((v + uv1.z - uv0.z)*1e-3)*1e5);
    float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
    
    return mix(r0, r1, f.z)*2.-1.;
}

    void main()
{

    float brightness    = 0.25 * 0.25 * 0.25 * 0.25 + 0.25 * 0.25 * 0.25 * 0.25 * 0.25;
    float radius        = 0.24 + brightness * 0.2;
    float invRadius     = 1.0/radius;

    vec3 orange         = vec3( 0.8, 0.65, 0.3 );
    vec3 orangeRed      = vec3( 0.8, 0.35, 0.1 );
    float aspect    = resolution.x/resolution.y;
    vec2 uv1         = gl_FragColor.xy / resolution.xy;
    vec2 p          = -0.5 + uv1;
    p.x *= aspect;

    float fade      = pow( length( 2.0 * p ), 0.5 );
    float fVal1     = 1.0 - fade;
    float fVal2     = 1.0 - fade;
    
    float angle     = atan( p.x, p.y )/6.2832;
    float dist      = length(p);
    vec3 coord      = vec3( angle, dist, time * 0.1 );
    
    float newTime1  = abs( snoise( coord + vec3( 0.0, -time * ( 0.35 + brightness * 0.001 ), time * 0.015 ), 15.0 ) );
    float newTime2  = abs( snoise( coord + vec3( 0.0, -time * ( 0.15 + brightness * 0.001 ), time * 0.015 ), 45.0 ) );  
    for( int i=1; i<=7; i++ ){
        float power = pow( 2.0, float(i + 1) );
        fVal1 += ( 0.5 / power ) * snoise( coord + vec3( 0.0, -time, time * 0.2 ), ( power * ( 10.0 ) * ( newTime1 + 1.0 ) ) );
        fVal2 += ( 0.5 / power ) * snoise( coord + vec3( 0.0, -time, time * 0.2 ), ( power * ( 25.0 ) * ( newTime2 + 1.0 ) ) );
    }
    
    float corona        = pow( fVal1 * max( 1.1 - fade, 0.0 ), 2.0 ) * 50.0;
    corona              += pow( fVal2 * max( 1.1 - fade, 0.0 ), 2.0 ) * 50.0;
    corona              *= 1.2 - newTime1;
    vec3 sphereNormal   = vec3( 0.0, 0.0, 1.0 );
    vec3 dir            = vec3( 0.0 );
    vec3 center         = vec3( 0.5, 0.5, 1.0 );
    vec3 starSphere     = vec3( 0.0 );
    
    vec2 sp = -1.0 + 2.0 * vUv;
    sp.x *= aspect;
    sp *= ( 2.0 - brightness );
    float r = dot(sp,sp);
    float f = (1.0-sqrt(abs(1.0-r)))/(r) + brightness * 0.5;
    if( dist < radius ){
        corona          *= pow( dist * invRadius, 24.0 );
        vec2 newUv;
        newUv.x = sp.x*f;
        newUv.y = sp.y*f;
        newUv += vec2( time, 0.0 );
        
        vec3 texSample  = texture( texture1, newUv ).rgb;
        float uOff      = ( texSample.g * brightness * 4.5 + time );
        vec2 starUV     = newUv + vec2( uOff, 0.0 );
        starSphere      = texture( texture1, starUV ).rgb;
    }
    
    float starGlow  = min( max( 1.0 - dist * ( 1.0 - brightness ), 0.0 ), 1.0 );
    //fragColor.rgb = vec3( r );
    gl_FragColor.rgb   = vec3( f * ( 0.75 + brightness * 0.3 ) * orange ) + starSphere + corona * orange + starGlow * orangeRed;
    gl_FragColor.a     = 1.0;
}`;


const vertexTube = `
   #define GLSLIFY 1
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 pixels;
    float PI = 3.141592653589793238;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    varying vec3 eyeVector;
    mat2 getMatrix(float a){
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
    }
    void setLayers(vec3 p){
        float t = time * 0.015;
        mat2 m = getMatrix(t);
        vec3 p1 = p;
        p1.yz = m * p1.yz;
        vLayer0 = p1;
        p1 = p;
        m = getMatrix(t + 2.094);
        p1.zx = m * p1.zx;
        vLayer1 = p1;
        p1 = p;
        m = getMatrix(t + 4.188);
        p1.xy = m * p1.xy;
        vLayer2 = p1;
    }
    void main() {
        vec4 worldPosition = modelMatrix * vec4( position, 1.0);
        eyeVector = normalize(worldPosition.xyz - cameraPosition);
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        setLayers(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

const fragmentTube = `
    #define GLSLIFY 1
    #define OCTAVES 6
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform vec4 resolution;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vLayer0;
    varying vec3 vLayer1;
    varying vec3 vLayer2;
    varying vec3 vNormal;
    varying vec3 eyeVector;
    float PI = 3.141592653589793238;
    uniform samplerCube uPerlinCube;
    float uTint = 0.26;
    float uBrightness = 0.6;
    vec3 brightnessToColor(float b){
        b *= uTint;
        return (vec3(b, b * b, b*b*b * b)/ (uTint)) * uBrightness;
    }
    float ocean(in vec3 p){
        float sum = 0.;
        sum += textureCube(uPerlinCube, vLayer0).r;
        sum += textureCube(uPerlinCube, vLayer1).r;
        sum += textureCube(uPerlinCube, vLayer2).r;
        return sum * 0.33;
    }
    float Fresnel(vec3 eyeVector, vec3 worldNormal) {
        return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
    }
    void main(){
        gl_FragColor = textureCube(uPerlinCube,vPosition);
        gl_FragColor = vec4(ocean(vPosition));
        float fresnel = Fresnel(eyeVector, vNormal);
        float brightness = ocean(vPosition);
        brightness = brightness * 4. + 1.;
        brightness += fresnel;
        vec3 col = brightnessToColor(brightness);
        col = clamp(col, 0., 1.);
        gl_FragColor.rgb = col;
        gl_FragColor.a = 1. - pow(fresnel, 0.3);
    }
`;


export default class Sun {
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
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.camera.lookAt(this.scene.position);
    this.time = 0;
    this.isPlaying = true;
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    this.getCube();
    this.addObjects();
    this.addAround();
    this.addClouds();
    this.addClouds1();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  addTubes(){
    class CustomSinCurve extends THREE.Curve {
      constructor( scale = 1 ) {
        super();
        this.scale = scale;
      }
      getPoint( t, optionalTarget = new THREE.Vector3() ) {
        const tx = t * 3 - 1.5;
        const ty = Math.sin( 2 * Math.PI * t );
        const tz = 0;
        return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
      }
    }

    this.materialTube = new THREE.ShaderMaterial({
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
      vertexShader: vertexTube,
      fragmentShader: fragmentTube
    });

    const path = new CustomSinCrve( 2 );
    const geometry = new THREE.TubeGeometry( path, 20, 0.1, 8, false );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const mesh = new THREE.Mesh( geometry,this.materialTube );
    this.scene.add( mesh );
  }

  getCube(){
    this.scene1 = new THREE.Scene()
    this.cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 256, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
    });

    this.cubeCamera1 = new THREE.CubeCamera( 0.1, 10, this.cubeRenderTarget1 );
    this.materialPerlin = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });
    this.geometry = new THREE.SphereGeometry(1,40,40);
    this.perlin = new THREE.Mesh(this.geometry, this.materialPerlin);
    this.scene1.add(this.perlin);
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    //this.gui = new dat.GUI();
    //this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }
         

    /*addParticles() {
        this.xVelocity = Math.random() - 0.5;
        this.yVelocity =  Math.random() - 0.5;
        this.colorSets = [
            '#000000',
            '#586F7C',
            '#B8DBD9',
            '#04724D'
        ];
        const randomColor = this.getRandomInt(0, this.colorSets.length - 1);
        this.color = this.colorSets[randomColor];
        this.alpha = this.getRandom();
        this.minRadius = this.getRandomInt(2, 5);
        this.radius = this.minRadius;
        this.maxRadius =  30;
        this.x = Math.random() * (this.width - this.radius * 2) + this.radius;
        this.y = Math.random() * (this.width - this.radius * 2) + this.radius;
    }

     getRandom (min = 0, max = 1) {
        let n = parseFloat((Math.random() * (max - min) + min).toFixed(1));
        if(n > 0.88){
            n = Math.round(n)
        }
        return n;
    }

    getRandomInt(min = 0, max = 1) {
        let n = Math.floor(Math.random() * (max - min + 1) + min);
        return n;
    }


    renderParticles(){
        if(this.x - this.radius < 0 + this.radius || this.x + this.radius > this.width + this.radius){
            this.xVelocity = -this.xVelocity
        }

        if(this.y - this.radius < 0 + this.radius  || this.y + this.radius > this.height + this.radius){
            this.yVelocity = -this.yVelocity
        }
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        if(this.mouse.x - this.x < 50 && this.mouse.x - this.x > -50 
            && this.mouse.y - this.y < 50 && this.mouse.y - this.y > -50
            ){
            this.grow();
        } else {
            this.shrink();
        }

        this.show();
    }
    grow(){
        if(this.radius < this.maxRadius){
            this.radius += 1;
        }
    }

    shrink(){
        if(this.radius > this.minRadius){
            this.radius -= 1;
        }
    }*/
    

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    // image cover
    this.imageAspect = 853/1280;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;
    // optional - cover with quad
    // const dist  = this.camera.position.z;
    // const height = 1;
    // this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

    // // if(w/h>1) {
    // if(this.width/this.height>1){
    //   this.plane.scale.x = this.camera.aspect;
    //   // this.plane.scale.y = this.camera.aspect;
    // } else{
    //   this.plane.scale.y = 1/this.camera.aspect;
    // }
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uPerlinCube: { value: null },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertexSun,
      fragmentShader: fragmentSun
    });
    this.geometry = new THREE.SphereGeometry(1,40,40);
    this.sun = new THREE.Mesh(this.geometry, this.material);
    this.sun.name = 'Sun';
    this.scene.add(this.sun);
  }



  addAround(){
    this.materialAround = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      // side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uPerlinCube: { value: null },
        texture1: { value: new THREE.TextureLoader().load("../static/src/assets/global/textures/flame/noise9.jpg")},
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      transparent: true,
      side: THREE.BackSide,
      vertexShader: vertexSunAround,
      fragmentShader: fragmentSunAround
    });
    this.geometry = new THREE.SphereGeometry(1.2,40,40);
    this.around = new THREE.Mesh(this.geometry, this.materialAround);
    // this.around = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color:0xff0000,side: THREE.BackSide,}));
    this.scene.add(this.around);
  }

    addClouds() {
        let t = new THREE.TextureLoader().load(sunTexture);
        let camPos = new THREE.Vector3();
        this._lineLength = 16,
        this._lineCount = 2047;
        this.camera.getWorldPosition(camPos);
        this.materialCloud = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                uCloudsTexture: { value: t },
                uSpatialFrequency: { value: 0.6 },
                uTemporalFrequency: { value: .1 },
                uAmp: { value: .5 },
                uHueSpread: { value: .16 },
                uHue: { value: 0 },
                uWidth: { value: .05 },
                uOpacity: { value: .2 },
                uAlphaBlended: { value: .65 },
                uNoiseFrequency: { value: 4 },
                uNoiseAmplitude: { value: .2 },
                uCamPos: { value: camPos },
                uVisibility: { value: 0.01},
                uLightView: { value: 0.57735 },
                uDirection: { value: -1 },
                uLineLength: { value: this._lineLength},
                uH: { value: 1 },
                uTexture: { value: null },
                resolution: { value: new THREE.Vector4(this._lineLength,this._lineCount,1 / this._lineLength,1 / this._lineCount) }
            },
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: vertexSunCloud,
            fragmentShader: fragmentSunCloud
        });
        /*if (lowResolution) {
            this._lineCount = 1024;
            this._lineLength = 8;
        }*/
        const vertices = new Float32Array(this._lineCount * this._lineLength * 2 * 3);
        const vertices0 = new Float32Array(this._lineCount * this._lineLength * 2 * 3);
        const vertices1 = new Float32Array(this._lineCount * this._lineLength * 2 * 3);
        const attributes = new Float32Array(this._lineCount * this._lineLength * 2 * 4);
        const indices = new Uint16Array(this._lineCount * (this._lineLength - 1) * 2 * 3);
        let vertexIndex = 0;
        let vertexIndex0 = 0;
        let attributeIndex = 0;
        let indexIndex = 0;
        this.geometry = new THREE.SphereGeometry(1.1, 40, 40);
        this.newgeometry = new THREE.BufferGeometry();  
        this.newgeometry1 = new THREE.BufferGeometry();
        this.newgeometry2 = new THREE.BufferGeometry()
        this.newgeometry3 = new THREE.BufferGeometry();
        this.newgeometry.copy(this.geometry);   
        const randomShpere = function(geometry) {
            const positions = geometry.attributes.position;
            const count = geometry.attributes.position.count;
            for (let i = 0; i < count; i++) {
                let px = positions.getX( i );
                let py = positions.getY( i );
                let pz = positions.getZ( i );
                positions.setXYZ(
                    i,
                    px = 2 * Math.random() - 1,
                    py = 2 * Math.random() - 1,
                    pz = 2 * Math.random() - 1
                );
            }
            return positions;
        };
        const normalize = function (positions) {
            const count = positions.count;
            for (let i = 0; i < count; i++) {
                let pt = new THREE.Vector3();
                let px = positions.getX(i);
                let py = positions.getY(i);
                let pz = positions.getZ(i);
                pt.x = px;
                pt.y = py;
                pt.z = pz;
                pt.normalize();
                positions.setX(i, pt.x);
                positions.setY(i, pt.y);
                positions.setZ(i, pt.z);
            }
            return positions;
        };

       const multiplyScalar = function (positions, multiFactor) {
            const count = positions.count;
            for (let i = 0; i < count; i++) {
                let pt = new THREE.Vector3();
                let px = positions.getX(i);
                let py = positions.getY(i);
                let pz = positions.getZ(i);
                pt.x = px * multiFactor;
                pt.y = py * multiFactor;
                pt.z = pz * multiFactor;
                positions.setXYZ(i, pt.x, pt.y, pt.z);
            }
            return positions;
        };

        const add = function (position1, position2) {
            const count = position1.count;
            const resultPositions = new Float32Array(3 * count);
            for (let i = 0; i < count; i++) {
                let pt1 = new THREE.Vector3();
                let pt2 = new THREE.Vector3();
                let px1 = position1.getX(i);
                let py1 = position1.getY(i);
                let pz1 = position1.getZ(i);
                let px2 = position2.getX(i);
                let py2 = position2.getY(i);
                let pz2 = position2.getZ(i);
                pt1.x = px1;
                pt1.y = py1;
                pt1.z = pz1;
                pt2.x = px2;
                pt2.y = py2;
                pt2.z = pz2;
                let resultPt = pt1.add(pt2);
                resultPositions[3 * i] = resultPt.x;
                resultPositions[3 * i + 1] = resultPt.y;
                resultPositions[3 * i + 2] = resultPt.z;
            }
            return new THREE.BufferAttribute(resultPositions, 3);

        };

        const sPosition = this.geometry.attributes.position;
        var positions1 = randomShpere(this.newgeometry);
        var post_pos1 = normalize(positions1);
        this.newgeometry1.setAttribute('position', new THREE.BufferAttribute(post_pos1.array, 3));
        var positions2 = randomShpere(this.newgeometry1);
        var post_pos2 = multiplyScalar(positions1, 0.1);
        var post_pos3 = add(post_pos1, post_pos2);
        var post_pos4 = normalize(post_pos3);
        this.newgeometry2.setAttribute('position', new THREE.BufferAttribute(post_pos4.array, 3));
        var positions5 = randomShpere(this.newgeometry2);
        var positions6 =multiplyScalar(positions5, 0.02);
        var post_pos5 = add(positions5, positions6);
        var post_pos6 = normalize(post_pos5);
        this.newgeometry3.setAttribute('position', new THREE.BufferAttribute(post_pos6.array, 3));
        var positions7 = randomShpere(this.newgeometry3);
        var positions8 =multiplyScalar(positions7, 0.075);
        var post_pos7 = add(positions7, positions8);
        var post_pos8 = normalize(post_pos7);

        console.log("positions8", post_pos8)
        console.log("positions6", post_pos6)
        for (let v = 0; v < this._lineCount; v++){
          for (let m = 0; m < this._lineLength; m++) {
                for (let y = 0; y <= 1; y++) {
                    vertices[vertexIndex++] = (m + 0.5) / this._lineLength;
                    vertices[vertexIndex++] = (v + 0.5) / this._lineCount;
                    vertices[vertexIndex++] = 2 * y - 1;

                    const randomValuesArray = [Math.random(), Math.random(), Math.random(), Math.random()];
                    for (let i = 0; i < 4; i++) {
                        attributes[attributeIndex++] = randomValuesArray[i];
                    }
                    vertices0[vertexIndex0++] = post_pos6.array[v++];
                    vertices0[vertexIndex0++] = post_pos6.array[v++];
                    vertices0[vertexIndex0++] = post_pos6.array[v++];

                    vertices1[vertexIndex0++] = post_pos8.array[v++];
                    vertices1[vertexIndex0++] = post_pos8.array[v++];
                    vertices1[vertexIndex0++] = post_pos8.array[v++];
                }

                if (m < this._lineLength - 1) {
                    indices[indexIndex++] = 2 * (v * this._lineLength + m) + 0;
                    indices[indexIndex++] = 2 * (v * this._lineLength + m) + 1;
                    indices[indexIndex++] = 2 * (v * this._lineLength + m) + 2;

                    indices[indexIndex++] = 2 * (v * this._lineLength + m) + 2;
                    indices[indexIndex++] = 2 * (v * this._lineLength + m) + 1;
                    indices[indexIndex++] = 2 * (v * this._lineLength + m) + 3;
                }
            }
        }
        //const geo = new THREE.BufferGeometry( ).setFromPoints( pts );
        this.finalGeometry = new THREE.BufferGeometry();
        this.finalGeometry.copy(this.geometry);
        this.finalGeometry.setAttribute('position', new THREE.BufferAttribute(sPosition.array, 3));
        this.finalGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        this.finalGeometry.setAttribute("aPos", new THREE.BufferAttribute(vertices, 3));
        this.finalGeometry.setAttribute("aPos0", new THREE.BufferAttribute(vertices0, 3));
        this.finalGeometry.setAttribute("aPos1", new THREE.BufferAttribute(vertices1, 3));
        this.finalGeometry.setAttribute("aWireRandom",new THREE.BufferAttribute(attributes, 4));
        //this.finalGeometry.setIndex(indices);
        //this.finalGeometry.setIndex(indices);
        this.cloud = new THREE.Line(this.finalGeometry, this.materialCloud);
        this.scene.add(this.cloud);
    }

    addClouds1() {
        let t = new THREE.TextureLoader().load(sunTexture);
        let camPos = new THREE.Vector3();
        this.camera.getWorldPosition(camPos);
        this._lineLength1 = 8,
        this._lineCount1 = 4095;
        this.materialCloud1 = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                uCloudsTexture: { value: t },
                uSpatialFrequency: { value: 0.6 },
                uTemporalFrequency: { value: .1 },
                uAmp: { value: .05 },
                uHueSpread: { value: .2 },
                uHue: { value: 0.2 },
                uNoiseFrequency: { value: 8 },
                uWidth: { value: .05 },
                uLength: { value: .2 },
                uNoiseAmplitude: { value: .2 },
                uOpacity: { value: .05 },
                uAlphaBlended: { value: .3 },
                uCamPos: { value: camPos },
                uVisibility: { value: 0.01},
                uLightView: { value: 0.57735 },
                uDirection: { value: -1 },
                uH: { value: 1 },
                uTexture: { value: null },
                resolution: { value: new THREE.Vector4(this._lineLength1,this._lineCount1,1 / this._lineCount1,1 / this._lineCount1) }
            },
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: vertexSunCloud1,
            fragmentShader: fragmentSunCloud1
        });
        
        const vertices = new Float32Array(this._lineCount1 * this._lineLength1 * 2 * 3);
        const vertices0 = new Float32Array(this._lineCount1 * this._lineLength1 * 2 * 3);
        const attributes = new Float32Array(this._lineCount1 * this._lineLength1 * 2 * 4);
        const indices = new Uint16Array(this._lineCount1 * (this._lineLength1 - 1) * 2 * 3);
        let vertexIndex = 0;
        let vertexIndex0 = 0;
        let attributeIndex = 0;
        let indexIndex = 0;
        this.geometry1 = new THREE.SphereGeometry(1.1, 40, 40);
        this.newgeometry5 = new THREE.BufferGeometry();  
        this.newgeometry6 = new THREE.BufferGeometry();
        this.newgeometry7 = new THREE.BufferGeometry();  
        this.newgeometry5.copy(this.geometry1);   
        const randomShpere = function(geometry) {
            const positions = geometry.attributes.position;
            const count = geometry.attributes.position.count;
            for (let i = 0; i < count; i++) {
                let px = positions.getX( i );
                let py = positions.getY( i );
                let pz = positions.getZ( i );
                positions.setXYZ(
                    i,
                    px = 2 * Math.random() - 1,
                    py = 2 * Math.random() - 1,
                    pz = 2 * Math.random() - 1
                );
            }
            return positions;
        };
        const normalize = function (positions) {
            const count = positions.count;
            for (let i = 0; i < count; i++) {
                let pt = new THREE.Vector3();
                let px = positions.getX(i);
                let py = positions.getY(i);
                let pz = positions.getZ(i);
                pt.x = px;
                pt.y = py;
                pt.z = pz;
                pt.normalize();
                positions.setX(i, pt.x);
                positions.setY(i, pt.y);
                positions.setZ(i, pt.z);
            }
            return positions;
        };

       const multiplyScalar = function (positions, multiFactor) {
            const count = positions.count;
            for (let i = 0; i < count; i++) {
                let pt = new THREE.Vector3();
                let px = positions.getX(i);
                let py = positions.getY(i);
                let pz = positions.getZ(i);
                pt.x = px * multiFactor;
                pt.y = py * multiFactor;
                pt.z = pz * multiFactor;
                positions.setXYZ(i, pt.x, pt.y, pt.z);
            }
            return positions;
        };

        const add = function (position1, position2) {
            const count = position1.count;
            const resultPositions = new Float32Array(3 * count);
            for (let i = 0; i < count; i++) {
                let pt1 = new THREE.Vector3();
                let pt2 = new THREE.Vector3();
                let px1 = position1.getX(i);
                let py1 = position1.getY(i);
                let pz1 = position1.getZ(i);
                let px2 = position2.getX(i);
                let py2 = position2.getY(i);
                let pz2 = position2.getZ(i);
                pt1.x = px1;
                pt1.y = py1;
                pt1.z = pz1;
                pt2.x = px2;
                pt2.y = py2;
                pt2.z = pz2;
                let resultPt = pt1.add(pt2);
                resultPositions[3 * i] = resultPt.x;
                resultPositions[3 * i + 1] = resultPt.y;
                resultPositions[3 * i + 2] = resultPt.z;
            }
            return new THREE.BufferAttribute(resultPositions, 3);

        };

        const sPosition = this.geometry1.attributes.position;
        var positions1 = randomShpere(this.newgeometry5);
        var post_pos1 = normalize(positions1);
        this.newgeometry6.setAttribute('position', new THREE.BufferAttribute(post_pos1.array, 3));
        var positions2 = randomShpere(this.newgeometry6);
        var post_pos2 = multiplyScalar(positions2, 0.025);
        var post_pos3 = add(post_pos1, post_pos2);
        var finalPos = normalize(post_pos3);

        for (let v = 0; v < this._lineCount1; v++){
          for (let m = 0; m < this._lineLength1; m++) {
                for (let y = 0; y <= 1; y++) {
                    vertices[vertexIndex++] = (m + 0.5) / this._lineLength1;
                    vertices[vertexIndex++] = (v + 0.5) / this._lineCount1;
                    vertices[vertexIndex++] = 2 * y - 1;

                    const randomValuesArray = [Math.random(), Math.random(), Math.random(), Math.random()];
                    for (let i = 0; i < 4; i++) {
                        attributes[attributeIndex++] = randomValuesArray[i];
                    }
                    vertices0[vertexIndex0++] = finalPos.array[v++];
                    vertices0[vertexIndex0++] = finalPos.array[v++];
                    vertices0[vertexIndex0++] = finalPos.array[v++];
                }

                if (m < this._lineLength1 - 1) {
                    indices[indexIndex++] = 2 * (v * this._lineLength1 + m) + 0;
                    indices[indexIndex++] = 2 * (v * this._lineLength1 + m) + 1;
                    indices[indexIndex++] = 2 * (v * this._lineLength1 + m) + 2;

                    indices[indexIndex++] = 2 * (v * this._lineLength1 + m) + 2;
                    indices[indexIndex++] = 2 * (v * this._lineLength1 + m) + 1;
                    indices[indexIndex++] = 2 * (v * this._lineLength1 + m) + 3;
                }
            }
        }
        //const geo = new THREE.BufferGeometry( ).setFromPoints( pts );
        this.finalGeometry1 = new THREE.BufferGeometry();
        this.finalGeometry1.copy(this.geometry1);
        this.finalGeometry1.setAttribute('position', new THREE.BufferAttribute(sPosition.array, 3));
        this.finalGeometry1.attributes.position.setUsage(THREE.DynamicDrawUsage);
        this.finalGeometry1.setAttribute("aPos", new THREE.BufferAttribute(vertices, 3));
        this.finalGeometry1.setAttribute("aPos0", new THREE.BufferAttribute(vertices0, 3));
        this.finalGeometry1.setAttribute("aWireRandom",new THREE.BufferAttribute(attributes, 4));
        this.finalGeometry1.setAttribute("index",new THREE.BufferAttribute(indices, 3));
        //this.finalGeometry.setIndex(indices);
        this.cloud1 = new THREE.Points(this.finalGeometry1, this.materialCloud1);
        this.scene.add(this.cloud1);
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

  render() {
    this.cubeCamera1.update( this.renderer, this.scene1 );
    this.finalGeometry.attributes.position.needsUpdate = true;
    this.material.uniforms.uPerlinCube.value =  this.cubeRenderTarget1.texture;
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    this.materialCloud.uniforms.uTime.value = this.time;
    this.materialAround.uniforms.time.value = this.time;
    this.materialPerlin.uniforms.time.value = this.time;
    this.renderer.autoClear = true;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

//Load SUN 
var S = new Sun({
    container: document.querySelector('.sun-container')
});

//Load TEXT
const preload = () => {
  let manager = new THREE.LoadingManager();
  let o = {
    container:document.querySelector('.sun-container'),
    renderer: S.renderer
  }
  manager.onLoad = function() { 
    const environment = new Environment( o, typo, particle );
    console.log("environment", environment);
  }

  var typo = null;
  const loader = new FontLoader( manager );
  const font = loader.load('https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json', function ( font ) { typo = font; });
  const particle = new THREE.TextureLoader( manager ).load( 'https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png');

}

//Load AUDIO
const preloadAudio = () => {
    let o = {
        container: document.querySelector('.sun-container'),
    };
    new Audio(o);
};


if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
  preload ();
else
  document.addEventListener("DOMContentLoaded", preload ); 


if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll))
    preloadAudio();
else
  document.addEventListener("DOMContentLoaded", preloadAudio ); 


  





