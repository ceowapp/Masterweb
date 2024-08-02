import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Environment from './Text.js';
import Audio from './Audio.js';

const sunTexture = '../../static/src/assets/dataset/textures/cloud.png';
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
   uniform mat4 uViewProjection;
   uniform float uOpacity;
   uniform float uHueSpread;
   uniform float uHue;
   mat4 m4 = mat4( 0.00, 0.80, 0.60, -0.4, -0.80,  0.36, -0.48, -0.5, -0.60, -0.48, 0.64, 0.2, 0.40, 0.30, 0.20,0.4);    
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
    }  
    return sum;   
    }
    vec3 getPos(float phase, float animPhase){
        float size = distance(aPos0, aPos1);
        vec3 n = normalize((aPos0 + aPos1) * 0.5);
        vec3 p = mix(aPos0, aPos1, phase);
        float amp = sin(phase * 3.14) * size * uAmp;
        //amp *= max(sin((uTime* 0.05 * (aWireRandom.y * 0.5) + aWireRandom.x) * 6.28), 0.);
        amp *= animPhase;
        p += n * amp;
        p += twistedSineNoise(vec4(p * uNoiseFrequency,uTime ), 0.707).xyz * (amp * uNoiseAmplitude);
        //p += n * (0.5 - abs( phase - 0.5)) * size * 5.;
        return p;
    }
     #define hue(v)  ( .6 + .6 * cos( 6.3*(v)  + vec3(0,23,21)  ) )
     vec3 spectrum(in float d){
        return smoothstep(0.25, 0., abs(d + vec3(-0.375,-0.5,-0.625)));
    }
    void main() {
        vUVY = aPos.z;
        float animPhase = fract(uTime * 0.3 * (aWireRandom.y * 0.5) + aWireRandom.x);
        vec3 p = getPos(aPos.x, animPhase);
        vec3 p1 = getPos(aPos.x + 0.01, animPhase);
        vec3 dir = p1 - p;
        dir = normalize(dir);
        vec3 v = normalize(p - uCamPos);
        vec3 side = normalize(cross(v, dir));
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
        gl_Position = uViewProjection * vec4(p , 1.);
    }
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
    uniform float uDirection;
    uniform samplerCube uCloudsTexture;
    uniform samplerCube uTexture;
    uniform float uSpatialFrequency;
    uniform float uTemporalFrequency;
    uniform float uAmplitude;
    uniform float uH;
    uniform float uTime;
    varying float vUVY;
    varying float vOpacity;
    varying vec3 vColor;
    varying vec3 vNormal;
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
            //sum += max(s, 0.);
            a *= uH;
            f /= uH;
            //f *= 2.;
        }
        return sum;
    }

    float getAlpha(vec3 n){
        vec3 l = vec3(0.57735,0.57735,0.57735);
        float nDotL = dot(n, l) * uDirection;
        return smoothstep(1., 1.5, nDotL + uVisibility * 2.5);
    }
    void main(void) {
        vec3 c = vec3(1,0.6,0.4) ;
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
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
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
    this.getCube();
    this.addObjects();
    this.addAround();
    this.addClouds();
    // this.addTubes()
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

    const path = new CustomSinCurve( 2 );
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

  addClouds(){
    let t = new THREE.TextureLoader().load(sunTexture);
    this.materialCloud = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
        transparent: true,
      // side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uCloudsTexture: { value: t },
        uSpatialFrequency: { value: 6 },
        uTemporalFrequency: { value: .1 },
        uAmplitude: { value: .02 },
        uVisibility: { value: 0.57735 },
        uLightView: { value: 0.57735 },
        uDirection: { value: 0.57735 },
        uH: { value: 1 },
        uTexture: { value: null },
        resolution: { value: new THREE.Vector4()}
      },
      // wireframe: true,
      transparent: true,
      side: THREE.BackSide,
      vertexShader: vertexSunCloud,
      fragmentShader: fragmentSunCloud
    });
    this.geometry = new THREE.SphereGeometry(1,40,40);
    this.cloud = new THREE.Mesh(this.geometry, this.materialCloud);
    // this.around = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color:0xff0000,side: THREE.BackSide,}));
    this.scene.add(this.cloud);
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
    this.material.uniforms.uPerlinCube.value =  this.cubeRenderTarget1.texture;
    this.materialCloud.uniforms.uTexture.value =  this.cubeRenderTarget1.texture;
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    this.materialCloud.uniforms.uTime.value = this.time;
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


  





