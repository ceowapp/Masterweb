///////////////////////////////////////////////////////////////////////////////
//**********************IMPORTING PACKAGES/LIBRARIES************************//                               
//////////////////////////////////////////////////////////////////////////////
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Text } from 'troika-three-text';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
let particleTexture =  "../static/src/assets/dataset/textures/particle.dcae8b12.webp";
import addPageManager from './utils/PageManager.js';
import GTLFCustomLoader from "./LoadGLTFModel.js";
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import TWEEN from 'three/addons/libs/tween.module.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

const vert = `
    varying vec3 vNormal;
    varying vec3 camPos;
    varying vec2 vUv;

    void main() {
    vNormal = normal;
    vUv = uv;
    camPos = cameraPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;

const frag = `
#define NUM_OCTAVES 5
#define M_PI 3.1415926535897932384626433832795
uniform vec4 resolution;
varying vec3 vNormal;
uniform sampler2D perlinnoise;
uniform sampler2D sparknoise;
uniform float time;
uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 color5;
varying vec3 camPos;
varying vec2 vUv;

float setOpacity(float r, float g, float b, float tonethreshold) {
  float tone = (r + g + b) / 3.0;
  float alpha = 1.0;
  if(tone<tonethreshold) {
    alpha = 0.0;
  }
  return alpha;
}

vec3 rgbcol(vec3 col) {
  return vec3(col.r/255.0,col.g/255.0,col.b/255.0);
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

vec2 UnityPolarCoordinates (vec2 UV, vec2 Center, float RadialScale, float LengthScale){
  //https://twitter.com/Cyanilux/status/1123950519133908995/photo/1
  vec2 delta = UV - Center;
  float radius = length(delta) * 2. * RadialScale;
  float angle = atan(delta.x, delta.y) * 1.0/6.28 * LengthScale;
  return vec2(radius, angle);
}

void main() {
  vec2 olduv = gl_FragCoord.xy/resolution.xy ;
  vec2 uv = vUv ; 
  vec2 imguv = uv;
  float scale = 1.;
  olduv *= 0.5 + time; 
  olduv.y = olduv.y ;
  vec2 p = olduv*scale;
  vec4 txt = texture2D(perlinnoise, olduv);
  float gradient = dot(normalize( -camPos ), normalize( vNormal ));
  float pct = distance(vUv,vec2(0.5));

  vec3 rgbcolor0 = rgbcol(color0);
  vec3 rgbcolor1 = rgbcol(color1);
  vec3 rgbcolor2 = rgbcol(color2);
  vec3 rgbcolor5 = rgbcol(color5);

  // set solid background
  float y = smoothstep(0.16,0.525,pct);
  vec3 backcolor = mix(rgbcolor0, rgbcolor5, y);

  gl_FragColor = vec4(backcolor,1.);

  // set polar coords
  vec2 center = vec2(0.5);
  vec2 cor = UnityPolarCoordinates(vec2(vUv.x,vUv.y), center, 1., 1.);

  // set textures
  vec2 newUv = vec2(cor.x + time,cor.x*0.2+cor.y);
  vec3 noisetex = texture2D(perlinnoise,mod(newUv,1.)).rgb;    
  vec3 noisetex2 = texture2D(sparknoise,mod(newUv,1.)).rgb;    


  // set textures tones
  float tone0 =  1. - smoothstep(0.3,0.6,noisetex.r);
  float tone1 =  smoothstep(0.3,0.6,noisetex2.r);


  // set opacity for each tone
  float opacity0 = setOpacity(tone0,tone0,tone0,.29);
  float opacity1 = setOpacity(tone1,tone1,tone1,.49);

  //set final render
  if(opacity1>0.0){
    gl_FragColor = vec4(rgbcolor2,0.)*vec4(opacity1);
  } else if(opacity0>0.0){
    gl_FragColor = vec4(rgbcolor1,0.)*vec4(opacity0);
  }   
}
`;

const vertcylinder = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vec3 pos = vec3(position.x/1.,position.y,position.z/1.);
        if(pos.y >= 1.87){
            pos = vec3(position.x*(sin((position.y - 0.6)*1.27)-0.16),position.y,position.z*(sin((position.y - 0.6)*1.27)-0.16));
        } else{
            pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.75),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.75));
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
`;

const fragcylinder = `
    varying vec2 vUv;
    uniform sampler2D perlinnoise;
    uniform vec3 color4;
    uniform float time;
    varying vec3 vNormal;

    vec3 rgbcol(vec3 col) {
        return vec3(col.r/255.0,col.g/255.0,col.b/255.0);
    }

    void main() {
        vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y-time*2.,vUv.x + time*1.),1.)).rgb;    
        gl_FragColor = vec4(noisetex.r);

        if(gl_FragColor.r >= 0.5){
            gl_FragColor = vec4(rgbcol(color4),gl_FragColor.r);
        }else{
            gl_FragColor = vec4(0.);
        }
        gl_FragColor *= vec4(sin(vUv.y) - 0.1);
        gl_FragColor *= vec4(smoothstep(0.3,0.628,vUv.y));

    }

`;

const vertflame = `
    varying vec2 vUv;
    varying vec3 camPos;
    varying vec3 vNormal;
    varying vec3 nois;
    uniform sampler2D noise;
    uniform float time;

    void main() {
        vUv = uv;
        camPos = cameraPosition;
        vNormal = normal;
        vec3 pos = vec3(position.x/1.,position.y,position.z/1.);
        vec3 noisetex = texture2D(noise,mod(1.*vec2(vUv.y-time*2.,vUv.x + time*1.),1.)).rgb;
        if(pos.y >= 1.87){
            pos = vec3(position.x*(sin((position.y - 0.64)*1.27)-0.12),position.y,position.z*(sin((position.y - 0.64)*1.27)-0.12));
        } else{
            pos = vec3(position.x*(sin((position.y/2. -  .01)*.11)+0.79),position.y,position.z*(sin((position.y/2. -  .01)*.11)+0.79));
        }
        pos.xz *= noisetex.r;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    }
`;

const fragflame = `
    varying vec2 vUv;
    uniform sampler2D perlinnoise;
    uniform sampler2D noise;
    uniform vec3 color4;
    uniform float time;
    varying vec3 camPos;
    varying vec3 vNormal;
    varying vec3 nois;

    vec3 rgbcol(vec3 col) {
        return vec3(col.r/255.0,col.g/255.0,col.b/255.0);
    }

      
    void main() {
        // vec3 noisetex = texture2D(perlinnoise,mod(1.*vec2(vUv.y-time*2.,vUv.x + time*1.),1.)).rgb;    
        // gl_FragColor += vec4(sin((vUv.y - time)*(20. + vUv.y)));
        vec3 noisetex = texture2D(noise,mod(1.*vec2(vUv.y-time*2.,vUv.x + time*1.),1.)).rgb;
        // nois = noisetex;
        gl_FragColor = vec4(noisetex.r);

        if(gl_FragColor.r >= 0.44){
            gl_FragColor = vec4(rgbcol(color4),gl_FragColor.r);
        }
        // else if(gl_FragColor.r >= 0.9){
        //     // gl_FragColor = vec4(rgbcol(color4),gl_FragColor.r)*0.5;
        // }
        else{
            gl_FragColor = vec4(0.);
        }
        gl_FragColor *= vec4(smoothstep(0.2,0.628,vUv.y));
        // gl_FragColor = vec4(vUv.y - 0.3 );
        // gl_FragColor = 1. - vec4(dot(normalize(vNormal),normalize(camPos)).r);
    }`;

const fragmentFire = `
uniform sampler2D texture1;
varying vec4 vColor;
varying float vAngle;   
void main() {
    gl_FragColor = vColor;
    float c = cos(vAngle);
    float s = sin(vAngle);",
    vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,
    c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);
    vec4 rotatedTexture = texture2D( texture1,  rotatedUV );
    gl_FragColor = gl_FragColor * rotatedTexture;
}`;


const vertexEngine = `
    #define GLSLIFY 1
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 pixels;
    float PI = 3.141592653589793238;
    void main() {
        vUv = uv;
        vPosition = position;
        gl_PointSize = 20.;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`;
const fragmentEngine = `
uniform float time;
uniform vec4 iResolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;
float noise(vec3 p) //Thx to Las^Mercury
{
  vec3 i = floor(p);
  vec4 a = dot(i, vec3(1., 57., 21.)) + vec4(0., 57., 21., 78.);
  vec3 f = cos((p-i)*acos(-1.))*(-.5)+.5;
  a = mix(sin(cos(a)*a),sin(cos(1.+a)*(1.+a)), f.x);
  a.xy = mix(a.xz, a.yw, f.y);
  return mix(a.x, a.y, f.z);
}

float sphere(vec3 p, vec4 spr)
{
  return length(spr.xyz-p) - spr.w;
}

float flame(vec3 p)
{
  float d = sphere(p*vec3(1.,.5,1.), vec4(.0,-1.,.0,1.));
  return d + (noise(p+vec3(.0,time*2.,.0)) + noise(p*3.)*.5)*.25*(p.y) ;
}

float scene(vec3 p)
{
  return min(100.-length(p) , abs(flame(p)) );
}

vec4 raymarch(vec3 org, vec3 dir)
{
  float d = 0.0, glow = 0.0, eps = 0.02;
  vec3  p = org;
  bool glowed = false;
  
  for(int i=0; i<64; i++)
  {
    d = scene(p) + eps;
    p += d * dir;
    if( d>eps )
    {
      if(flame(p) < .0)
        glowed=true;
      if(glowed)
            glow = float(i)/64.;
    }
  }
  return vec4(p,glow);
}

void main()
{
  vec2 v = -1.0 + 2.0 * gl_PointCoord.xy / iResolution.xy;
  v.x *= iResolution.x/iResolution.y;
  
  vec3 org = vec3(0., -2., 4.);
  vec3 dir = normalize(vec3(v.x*1.6, -v.y, -1.5));
  
  vec4 p = raymarch(org, dir);
  float glow = p.w;
  
  vec4 col = mix(vec4(1.,.5,.1,1.), vec4(0.1,.5,1.,1.), p.y*.02+.4);
  
  vec4 fragColor = mix(vec4(0.), col, pow(glow*2.,4.));
  gl_FragColor = fragColor;
  //fragColor = mix(vec4(1.), mix(vec4(1.,.5,.1,1.),vec4(0.1,.5,1.,1.),p.y*.02+.4), pow(glow*2.,4.));

}`;


const fires = `
precision highp float;
uniform float time;
uniform vec4 iResolution;
float PI = 3.141592653589793238;
vec2 hash( vec2 p )
{
  p = vec2( dot(p,vec2(127.1,311.7)),
       dot(p,vec2(269.5,183.3)) );
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;
  
  vec2 i = floor( p + (p.x+p.y)*K1 );
  
  vec2 a = p - i + (i.x+i.y)*K2;
  vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0*K2;
  
  vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
  
  vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  
  return dot( n, vec3(70.0) );
}

float fbm(vec2 uv)
{
  float f;
  mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
  f  = 0.5000*noise( uv ); uv = m*uv;
  // f += 0.2500*noise( uv ); uv = m*uv;
  // f += 0.1250*noise( uv ); uv = m*uv;
  // f += 0.0625*noise( uv ); uv = m*uv;
  f = 0.5 + 0.5*f;
  return f;
}

uniform float strength;
uniform float velocity;
void main(){
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 q = uv;
  float T3 = velocity*time;
  q.x = fract(q.x)-0.5;
  float n = fbm(strength*q - vec2(0.0,T3));
  float c = 1. - 16. * pow( max( 0., length(q*vec2(2.+q.y*2.,0.5) ) - n * max( 0., q.y+0.3 ) ),2. );
  float c1 = n * c * (magicF-pow(magic*uv.y,4.));
  c1=clamp(c1,0.,1.);
  vec3 col = vec3(1.5*c1, 1.5*c1*c1*c1, c1*c1*c1*c1*c1*c1);
  //vec3 col = vec3(n, n*n*n, n*n*n*n*n*n);
  vec4 fragColor = vec4( mix(vec3(0.),col,a), 1.0);
  gl_FragColor = fragColor;
}`

function Tween(timeArray, valueArray)
{
    this.times  = timeArray || [];
    this.values = valueArray || [];
}

Tween.prototype.lerp = function(t)
{
    var i = 0;
    var n = this.times.length;
    while (i < n && t > this.times[i])  
        i++;
    if (i == 0) return this.values[0];
    if (i == n) return this.values[n-1];
    var p = (t - this.times[i-1]) / (this.times[i] - this.times[i-1]);
    if (this.values[0] instanceof THREE.Vector3)
        return this.values[i-1].clone().lerp( this.values[i], p );
    else // its a float
        return this.values[i-1] + p * (this.values[i] - this.values[i-1]);
}

///////////////////////////////////////////////////////////////////////////////

////////////////////
// PARTICLE CLASS //
////////////////////

function Particle()
{
    this.position     = new THREE.Vector3();
    this.velocity     = new THREE.Vector3(); // units per second
    this.acceleration = new THREE.Vector3();

    this.angle             = 0;
    this.angleVelocity     = 0; // degrees per second
    this.angleAcceleration = 0; // degrees per second, per second
    
    this.size = 16.0;

    this.color   = new THREE.Color();
    this.opacity = 1.0;
            
    this.age   = 0;
    this.alive = 0; // use float instead of boolean for shader purposes 
}

Particle.prototype.update = function(dt)
{
    this.position.add( this.velocity.clone().multiplyScalar(dt) );
    this.velocity.add( this.acceleration.clone().multiplyScalar(dt) );
    
    // convert from degrees to radians: 0.01745329251 = Math.PI/180
    this.angle         += this.angleVelocity     * 0.01745329251 * dt;
    this.angleVelocity += this.angleAcceleration * 0.01745329251 * dt;

    this.age += dt;
    
    // if the tween for a given attribute is nonempty,
    //  then use it to update the attribute's value

    if ( this.sizeTween.times.length > 0 )
        this.size = this.sizeTween.lerp( this.age );
                
    if ( this.colorTween.times.length > 0 )
    {
        var colorHSL = this.colorTween.lerp( this.age );
        this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );
    }
    
    if ( this.opacityTween.times.length > 0 )
        this.opacity = this.opacityTween.lerp( this.age );
}
    
///////////////////////////////////////////////////////////////////////////////

///////////////////////////
// PARTICLE ENGINE CLASS //
///////////////////////////

var Type = Object.freeze({ "CUBE":1, "SPHERE":2 });

function ParticleEngine(){
    /////////////////////////
    // PARTICLE PROPERTIES //
    /////////////////////////
    
    this.positionStyle = Type.CUBE;     
    this.positionBase   = new THREE.Vector3();
    // cube shape data
    this.positionSpread = new THREE.Vector3();
    // sphere shape data
    this.positionRadius = 0; // distance from base at which particles start
    
    this.velocityStyle = Type.CUBE; 
    // cube movement data
    this.velocityBase       = new THREE.Vector3();
    this.velocitySpread     = new THREE.Vector3(); 
    // sphere movement data
    //   direction vector calculated using initial position
    this.speedBase   = 0;
    this.speedSpread = 0;
    
    this.accelerationBase   = new THREE.Vector3();
    this.accelerationSpread = new THREE.Vector3();  
    
    this.angleBase               = 0;
    this.angleSpread             = 0;
    this.angleVelocityBase       = 0;
    this.angleVelocitySpread     = 0;
    this.angleAccelerationBase   = 0;
    this.angleAccelerationSpread = 0;
    
    this.sizeBase   = 0.0;
    this.sizeSpread = 0.0;
    this.sizeTween  = new Tween();
            
    // store colors in HSL format in a THREE.Vector3 object
    // http://en.wikipedia.org/wiki/HSL_and_HSV
    this.colorBase   = new THREE.Vector3(0.0, 1.0, 0.5); 
    this.colorSpread = new THREE.Vector3(0.0, 0.0, 0.0);
    this.colorTween  = new Tween();
    
    this.opacityBase   = 1.0;
    this.opacitySpread = 0.0;
    this.opacityTween  = new Tween();

    this.blendStyle = THREE.NormalBlending; // false;

    this.particleArray = [];
    this.particlesPerSecond = 100;
    this.particleDeathAge = 1.0;
    
    ////////////////////////
    // EMITTER PROPERTIES //
    ////////////////////////
    
    this.emitterAge      = 0.0;
    this.emitterAlive    = true;
    this.emitterDeathAge = 60; // time (seconds) at which to stop creating particles.
    
    // How many particles could be active at any time?
    this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );

    //////////////
    // THREE.JS //
    //////////////
    
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleTexture  = null;
    this.particleMaterial = new THREE.ShaderMaterial( 
    {
        uniforms: 
        {
            texture1:   { type: "t", value: this.particleTexture },
        },
        attributes:     
        {
            customVisible:  { type: 'f',  value: [] },
            customAngle:    { type: 'f',  value: [] },
            customSize:     { type: 'f',  value: [] },
            customColor:    { type: 'c',  value: [] },
            customOpacity:  { type: 'f',  value: [] }
        },
        vertexShader:   vertexFire,
        fragmentShader: fragmentFire,
        transparent: true, // alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
        blending: THREE.NormalBlending, depthTest: true,
        
    });
    this.particleMesh = new THREE.Mesh();
}
    
ParticleEngine.prototype.setValues = function( parameters )
{
    if ( parameters === undefined ) return;
    
    // clear any previous tweens that might exist
    this.sizeTween    = new Tween();
    this.colorTween   = new Tween();
    this.opacityTween = new Tween();
    
    for ( var key in parameters ) 
        this[ key ] = parameters[ key ];
    
    // attach tweens to particles
    Particle.prototype.sizeTween    = this.sizeTween;
    Particle.prototype.colorTween   = this.colorTween;
    Particle.prototype.opacityTween = this.opacityTween;    
    
    // calculate/set derived particle engine values
    this.particleArray = [];
    this.emitterAge      = 0.0;
    this.emitterAlive    = true;
    this.particleCount = this.particlesPerSecond * Math.min( this.particleDeathAge, this.emitterDeathAge );
    
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleMaterial = new THREE.ShaderMaterial( 
    {
        uniforms: 
        {
            texture1:   { type: "t", value: this.particleTexture },
        },
        attributes:     
        {
            customVisible:  { type: 'f',  value: [] },
            customAngle:    { type: 'f',  value: [] },
            customSize:     { type: 'f',  value: [] },
            customColor:    { type: 'c',  value: [] },
            customOpacity:  { type: 'f',  value: [] }
        },
        vertexShader:   vertexFire,
        fragmentShader: fragmentFire,
        transparent: true,  alphaTest: 0.5, // if having transparency issues, try including: alphaTest: 0.5, 
        blending: THREE.NormalBlending, depthTest: true
    });
    this.particleMesh = new OMNI.ParticleSystem();
}
    
// helper functions for randomization
ParticleEngine.prototype.randomValue = function(base, spread)
{
    return base + spread * (Math.random() - 0.5);
}
ParticleEngine.prototype.randomVector3 = function(base, spread)
{
    var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
    return new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, rand3 ) );
}


ParticleEngine.prototype.createParticle = function()
{
    var particle = new Particle();

    if (this.positionStyle == Type.CUBE)
        particle.position = this.randomVector3( this.positionBase, this.positionSpread ); 
    if (this.positionStyle == Type.SPHERE)
    {
        var z = 2 * Math.random() - 1;
        var t = 6.2832 * Math.random();
        var r = Math.sqrt( 1 - z*z );
        var vec3 = new THREE.Vector3( r * Math.cos(t), r * Math.sin(t), z );
        particle.position = new THREE.Vector3().addVectors( this.positionBase, vec3.multiplyScalar( this.positionRadius ) );
    }
        
    if ( this.velocityStyle == Type.CUBE )
    {
        particle.velocity     = this.randomVector3( this.velocityBase,     this.velocitySpread ); 
    }
    if ( this.velocityStyle == Type.SPHERE )
    {
        var direction = new THREE.Vector3().subVectors( particle.position, this.positionBase );
        var speed     = this.randomValue( this.speedBase, this.speedSpread );
        particle.velocity  = direction.normalize().multiplyScalar( speed );
    }
    
    particle.acceleration = this.randomVector3( this.accelerationBase, this.accelerationSpread ); 

    particle.angle             = this.randomValue( this.angleBase,             this.angleSpread );
    particle.angleVelocity     = this.randomValue( this.angleVelocityBase,     this.angleVelocitySpread );
    particle.angleAcceleration = this.randomValue( this.angleAccelerationBase, this.angleAccelerationSpread );

    particle.size = this.randomValue( this.sizeBase, this.sizeSpread );

    var color = this.randomVector3( this.colorBase, this.colorSpread );
    particle.color = new THREE.Color().setHSL( color.x, color.y, color.z );
    
    particle.opacity = this.randomValue( this.opacityBase, this.opacitySpread );

    particle.age   = 0;
    particle.alive = 0; // particles initialize as inactive
    return particle;
}

ParticleEngine.prototype.initialize = function(group)
{
    // link particle data with geometry/material data
    for (var i = 0; i < this.particleCount; i++)
    {
        // remove duplicate code somehow, here and in update function below.
        this.particleArray[i] = this.createParticle();
        this.particleGeometry.vertices[i] = this.particleArray[i].position;
        this.particleMaterial.attributes.customVisible.value[i] = this.particleArray[i].alive;
        this.particleMaterial.attributes.customColor.value[i]   = this.particleArray[i].color;
        this.particleMaterial.attributes.customOpacity.value[i] = this.particleArray[i].opacity;
        this.particleMaterial.attributes.customSize.value[i]    = this.particleArray[i].size;
        this.particleMaterial.attributes.customAngle.value[i]   = this.particleArray[i].angle;
    }

    
    this.particleMaterial.blending = this.blendStyle;
    if ( this.blendStyle != THREE.NormalBlending) 
        this.particleMaterial.depthTest = false;
    
    this.particleMesh = new OMNI.ParticleSystem(this.particleGeometry, this.particleMaterial);
    this.particleMesh.dynamic = true;
    this.particleMesh.sortParticles = true;
    group.add( this.particleMesh );
}

ParticleEngine.prototype.update = function(dt)
{
    var recycleIndices = [];
    
    // update particle data
    for (var i = 0; i < this.particleCount; i++)
    {
        if ( this.particleArray[i].alive )
        {
            this.particleArray[i].update(dt);

            // check if particle should expire
            // could also use: death by size<0 or alpha<0.
            if ( this.particleArray[i].age > this.particleDeathAge ) 
            {
                this.particleArray[i].alive = 0.0;
                recycleIndices.push(i);
            }
            // update particle properties in shader
            this.particleMaterial.attributes.customVisible.value[i] = this.particleArray[i].alive;
            this.particleMaterial.attributes.customColor.value[i]   = this.particleArray[i].color;
            this.particleMaterial.attributes.customOpacity.value[i] = this.particleArray[i].opacity;
            this.particleMaterial.attributes.customSize.value[i]    = this.particleArray[i].size;
            this.particleMaterial.attributes.customAngle.value[i]   = this.particleArray[i].angle;
        }       
    }

    // check if particle emitter is still running
    if ( !this.emitterAlive ) return;

    // if no particles have died yet, then there are still particles to activate
    if ( this.emitterAge < this.particleDeathAge )
    {
        // determine indices of particles to activate
        var startIndex = Math.round( this.particlesPerSecond * (this.emitterAge +  0) );
        var   endIndex = Math.round( this.particlesPerSecond * (this.emitterAge + dt) );
        if  ( endIndex > this.particleCount ) 
              endIndex = this.particleCount; 
              
        for (var i = startIndex; i < endIndex; i++)
            this.particleArray[i].alive = 1.0;      
    }

    // if any particles have died while the emitter is still running, we imediately recycle them
    for (var j = 0; j < recycleIndices.length; j++)
    {
        var i = recycleIndices[j];
        this.particleArray[i] = this.createParticle();
        this.particleArray[i].alive = 1.0; // activate right away
        this.particleGeometry.vertices[i] = this.particleArray[i].position;
    }

    // stop emitter?
    this.emitterAge += dt;
    if ( this.emitterAge > this.emitterDeathAge )  this.emitterAlive = false;
}

ParticleEngine.prototype.destroy = function(group)
{
    group.remove( this.particleMesh );
}



 class SpaceStation extends GTLFCustomLoader{
  constructor(options, settings, scene, camera, renderer) {
    super(settings, scene, camera, renderer);
    this.container = options.container;
    this.mdSettings = settings;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.ratio = this.width / this.height;
    this.container.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 3, 100);
    this.camera.lookAt(this.scene.position);
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    const renderModel = new RenderPass( this.scene, this.camera );
    const effectBloom = new BloomPass( 1.25 );
    const outputPass = new OutputPass();
    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( renderModel );
    this.composer.addPass( effectBloom );
    this.composer.addPass( outputPass );
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls = new TrackballControls( this.camera, this.renderer.domElement );
    this.camera1= new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000 );
    this.isPlaying = true;
    this.group = new THREE.Group();
    this.group1 = new THREE.Group();
    this.group.add(this.group1)
    this.target = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    this.PARTICLES_AMOUNT = 30000;
    this.options = {
      exposure: 2.8,
      bloomStrength: 10.,
      bloomRadius: 0.39,
      color0: [0, 0, 0],
      color1: [81, 14, 5],
      color2: [181, 156, 24],
      color3: [66, 66, 66],
      color4: [79, 79, 79],
      color5: [64, 27, 0] 
    };
    //if(this.light) this.scene.add( this.light );
    //this.addPlane();
    //this.addPlane();
    this.addLight();
    this.addObjects();
    this.animate();
    this.addEventListeners();
  }

  addLight(){
    this.aLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.aLight.position.set(0, 0, -5);
    this.scene.add(this.aLight);
  }

  addObjects() {
      this.mdSettings.map((set, index) => {
      // Example usage in some function:
      this.addSingleObject(set)
      .then((model) => {
        this.model = model.scene;
        this.group.add(this.model);
        this.group.scale.set(set.scale, set.scale, set.scale);
        this.group.position.set(set.posX, set.posY, set.posZ);
        this.scene.add(this.group);
        //this.flow = new Flow( this.group );
        //this.addCurve(this.flow);
        //this.scene.add( this.flow.object3D );
        const axesHelper = new THREE.AxesHelper( 5 );
      })
      .catch((error) => {
        // Handle errors during loading
        console.error('Error loading model:', error);
      });
    });
  }

  transform1(model){
    let duration = 5000;
    let tween1 = new TWEEN.Tween(model.position)
          .to( { x: 0, y: 15, z: 0}, duration)
          .easing( TWEEN.Easing.Exponential.InOut )
           .onUpdate(() => {
           model.rotateY(2*Math.PI);
          })
          .onComplete(() => {
            model.position.set(0, 0, 0);
            model.scale.set(1.2, 1.2, 1.2);
        })
        .start();

    let tween2 = new TWEEN.Tween(this.camera.position)
          .to( { x: 0, y: 0, z: 40 }, 2000)
          .easing( TWEEN.Easing.Exponential.InOut )
          .start()
          .onComplete(() => {
            this.camera.position.set(0, 0, 30);
    });
    let tween3 = new TWEEN.Tween(this.camera.up)
          .to( { x: 0, y: -1, z: 0 }, 2000)
          .easing( TWEEN.Easing.Exponential.InOut )
          .start()
          .onComplete(() => {
            this.camera.up.set(0, -1, 0);
    });
    tween1.chain(tween2);
    tween2.chain(tween3);
    tween1.start();
  }

  transform(){
    let duration = 1000;
    this.tweens = [];
    this.posTransforms = [
        [15, 0,  -5],
        [-15, -5, 5],
        [15, -10, -5],
        [-15, -15, 5],
        [0, -18, 0]
    ];
    let tween1;
    this.positions = [];
    var pos =  this.path.getPoint(this.time);
     const length = this.positions.length;
    this.positions.push(pos);
    const tweenFunc = (pos)=>{
       let tween1 = new TWEEN.Tween(this.model.position)
            .to( { x: pos.x, y: pos.y, z: pos.z}, duration)
            .easing( TWEEN.Easing.Exponential.InOut );
        return tween1;
    }
    this.positions.forEach((pos) => {
      let tweenT = tweenFunc(pos);
      tweenT.start();
      this.tweens.push(tweenT);
    });
    let tween2 = new TWEEN.Tween(this.camera.position)
          .to( { x: 0, y: 0, z: 40 }, 2000)
          .easing( TWEEN.Easing.Exponential.InOut )
          .start()
          .onComplete(() => {
            this.camera.position.set(0, 0, 30);
    });
    let tween3 = new TWEEN.Tween(this.camera.up)
          .to( { x: 0, y: -1, z: 0 }, 2000)
          .easing( TWEEN.Easing.Exponential.InOut )
          .start()
          .onComplete(() => {
            this.camera.up.set(0, -1, 0);
    });
    //tween1.chain(tween2);  
  }

  initFlame() {
    this.addMesh();
    this.addFlame();
    this.addCylinder();
    this.postProc
  }

  addMesh() {
    const geometry = new THREE.SphereGeometry(1, 30, 30);
    this.material1 = new THREE.ShaderMaterial({
      uniforms: {
        time: { type: "f", value: 0.0 },
        strength: { type: "f", value: 2.0 },
        velocity: { type: "f", value: 2.0 },
        iResolution: { type: 'v3', value: new THREE.Vector3(0, this.width, this.height)},
        perlinnoise: { type: "t", value: new THREE.TextureLoader().load("../static/src/assets/global/textures/flame/noise9.jpg") },
        sparknoise: { type: "t",value: new THREE.TextureLoader().load("../static/src/assets/global/textures/flame/sparklenoise.jpg") },
        color5: { value: new THREE.Vector3(this.options.color5) },
        color4: { value: new THREE.Vector3(this.options.color4) },
        color3: { value: new THREE.Vector3(this.options.color3) },
        color2: {value: new THREE.Vector3(this.options.color2) },
        color1: {value: new THREE.Vector3(this.options.color1) },
        color0: {value: new THREE.Vector3(this.options.color0) },
        resolution: { value: new THREE.Vector4(this.width, this.height, 1., 1.) } },
        vertexShader: vert,
        fragmentShader: frag 
    });
    const mesh = new THREE.Mesh(geometry, this.material1);
     mesh.position.set(0, 0, 0);
    mesh.rotateY(Math.PI)
    mesh.scale.set(0.78, 0.78, 0.78);
    this.group1.add(mesh);
  }

 addCylinder() {
  const geometry = new THREE.CylinderGeometry(1.11, 0, 5.3, 50, 50, true);
  this.material2 = new THREE.ShaderMaterial({
    uniforms: {
      perlinnoise: { type: "t", value: new THREE.TextureLoader().load("../static/src/assets/global/textures/flame/water-min.jpg") },
      color4: { value: new THREE.Vector3(this.options.color4) },
      time: { type: "f", value: 0.0 },
      noise: { type: "t", value: new THREE.TextureLoader().load( "../static/src/assets/global/textures/flame/noise9.jpg") } },
      // wireframe:true,
      vertexShader: vertcylinder,
      fragmentShader: fragcylinder,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide 
    });
    const mesh = new THREE.Mesh(geometry, this.material2);
    mesh.position.set(0, -6.5, 0);
    mesh.rotateY(Math.PI)
    mesh.scale.set(1.5, 1.7, 1.5);
    this.group1.add(mesh);
  }

  addFlame() {
    const geometry = new THREE.CylinderGeometry(1, 0, 5.3, 50, 50, true);
    this.material3 = new THREE.ShaderMaterial({
      uniforms: {
        perlinnoise: { type: "t", value: new THREE.TextureLoader().load( "../static/src/assets/global/textures/flame/water-min.jpg") },
        color4: { value: new THREE.Vector3(this.options.color5) },
        time: { type: "f", value: 0.0 },
        iResolution: { type: 'v3', value: new THREE.Vector3(0, this.width, this.height)},
        noise: { type: "t", value: new THREE.TextureLoader().load( "../static/src/assets/global/textures/flame/noise9.jpg") } },
        // wireframe:true,
        vertexShader: vertflame,
        fragmentShader: fragflame,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide 
      });
      const mesh = new THREE.Mesh(geometry, this.material3);
      mesh.position.set(0, -6, 0);
      mesh.rotateY(Math.PI)
      mesh.scale.set(2, 2, 2);
      this.group1.add(mesh);
  }


/*postProc() {
  const renderScene = new RenderPass(scene, camera);
  this.bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85);

  this.bloomPass.threshold = options.bloomThreshold;
  this.bloomPass.strength = options.bloomStrength;
  this.bloomPass.radius = options.bloomRadius;

  this.bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
}*/

  updateDraw(deltaTime) {
    this.material1.uniforms.time.value = -deltaTime / (1000 * 2);
    this.material2.uniforms.time.value = -deltaTime / (3000 * 2);
    this.material3.uniforms.time.value = -deltaTime / (3000 * 2);
    this.material1.uniforms.color5.value = new THREE.Vector3(this.options.color5);
    this.material2.uniforms.color4.value = new THREE.Vector3(this.options.color4);
    this.material3.uniforms.color4.value = new THREE.Vector3(this.options.color5);
    this.material1.uniforms.color3.value = new THREE.Vector3(this.options.color3);
    this.material1.uniforms.color2.value = new THREE.Vector3(this.options.color2);
    this.material1.uniforms.color1.value = new THREE.Vector3(this.options.color1);
    this.material1.uniforms.color0.value = new THREE.Vector3(this.options.color0);
  }

  addFire() {
      this.geometry = new THREE.BufferGeometry();
      this.material = new THREE.ShaderMaterial( {
        uniforms: {
            iResolution: { type: 'v3', value: new THREE.Vector3(0, this.width, this.height)},
            iTime: { type: 'f', value: 0.3},
            iTimeDelta: { type: 'f', value: 0.1 },
            iFrameRate: { type: 'f', value: 0.5 },
            iFrame: { type: 'f', value: 0.5 },
            iChannelTime: { type: 'f', value: 0.5},
            iChannelResolution: { type: 'v3', value: new THREE.Vector3()},
            iMouse: { type: 'v4', value: new THREE.Vector4() },
            iChannel0: { type: 'v2', value: new THREE.Vector2() },
            iDate: { type: 'v4', value: new THREE.Vector4() },
            iSampleRate: { type: 'f', value: 0.5 }
        },
      vertexShader: vertexEngine,
      fragmentShader: fragmentEngine,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: true,
      depthTest: false
     });

    this.geometry = new THREE.PlaneGeometry(400, 400, 400, 400);
    const pointsPositions = this.geometry.attributes.position.clone();
    const particlesGeometry = new THREE.BufferGeometry();
    const count = pointsPositions.count;
    const positions = [];
    particlesGeometry.setAttribute('position', pointsPositions);
    particlesGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    //const pt_mat = new THREE.PointsMaterial({size: 2., color: 0xddeeff});
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.group.add(this.mesh);
  }

        
  addCurve() {
    var radius = 10;
    var turns = 5;
    var objPerTurn = 10;
    var angleStep = (Math.PI * 2) / objPerTurn;
    var heightStep = 0.5;
    this.positions1 = [];
    this.points = [];
    for (let ii = 0; ii < turns * objPerTurn; ii++) {
      this.points.push( new THREE.Vector3(     
        Math.cos(angleStep * ii) * radius,
        heightStep * ii,
        Math.sin(angleStep * ii) * radius) 
      );
    }
    // rotation
    //plane.rotation.y = - angleStep * i;
    this.path = new THREE.CatmullRomCurve3( this.points );
    const divisions = 50;
    const point = new THREE.Vector3();
      for ( let i = 0, l = divisions; i < l; i ++ ) {
          const t = i / l;
          this.path.getPoint( t, point );
          this.positions1.push( point.x, point.y, point.z );
        }

    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions( this.positions1 );
    const matLine = new LineMaterial( {
        color: 0xffffff,
        linewidth: 0.01, // in world units with size attenuation, pixels otherwise
        worldUnits: true,
        vertexColors: true,
        //resolution:  // to be set by renderer, eventually
        alphaToCoverage: true,
      });
      const line = new Line2( lineGeometry, matLine );
      line.computeLineDistances();
      line.scale.set( 0.1, 0.1, 0.1 );
      line.position.set(0, 0, 0);
      //flow.updateCurve( 0, this.path );

    //this.scene.add(this.path);
    }

    //MOUSE MOVE EVENT
      onMouseMove = function(e) {
        this.mouseX = ( e.clientX - window.innerWidth/2 );
        this.mouseY = ( e.clientY - window.innerHeight/2 );
      }



    // RENDER
    renderObject() {
        if (this.model){
            //this.target.x += ( this.mouseX - this.target.x ) * .02;
            //this.target.y += ( - this.mouseY - this.target.y ) * .02;
            //this.target.z = this.camera.position.z;
            //this.model.lookAt( this.target );
            this.renderer.clear();
            this.renderer.render(this.scene, this.camera);
        }
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

  //ADD EVENT LISTENER
  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }
  // RENDER
  render() {
    this.renderObject();
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
  }

  //RESIZE
  onResize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    /*if ( this.flow ) {
          this.flow.moveAlongCurve( 0.001 );

        }*/
    TWEEN.update();
    this.render();
  }
}

(function () {
    function init() {
      var o = {
      container:  document.querySelector('.inner-slider-content')
      };
      var mdSettings =
        [
          {
            path: '../static/src/assets/dataset/models/station/',
            mdName: 'freeport_space_station1.glb',
            scale: 0.5,
            posX: 0,
            posY: 0,
            posZ: 20,
          }
      ];
      var UFO = new SpaceStation(o, mdSettings);
    }
    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();

    
 

