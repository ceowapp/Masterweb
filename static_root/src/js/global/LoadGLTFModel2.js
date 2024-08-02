///////////////////////////////////////////////////////////////////////////////
//**********************IMPORTING PACKAGES/LIBRARIES************************//                               
//////////////////////////////////////////////////////////////////////////////
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';        
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Text } from 'troika-three-text';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import Audio from './Audio.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
let particleTexture =  "../static/src/assets/dataset/textures/particle.dcae8b12.webp";
import addPageManager from './utils/PageManager.js';


///////////////////////////////////////////////////////////////////////////////
//**********************************UTILITY FUNCTIONS************************//                          
//////////////////////////////////////////////////////////////////////////////
/**
 * check if the output of a function is false
 * @function isFalse
 * @param value 
 * @return boolean false
 * @example isFalse("1>2") 
*/
const isFalse = function (value) {
  return value === false;
};

/**
 * check if the output of a function is true
 * @function isTRUE
 * @param value 
 * @return boolean true
 * @example isTRUE("1>2") 
 */
const isTrue = function (value) {
  return value === true;
};

/**
 * combine filepath and filename
 * @function combineStrings
 * @param path, filename 
 * @return file path string
 * @example combineStrings("C./", "test.txt") 
 */
const combineStrings = function (path, filename) {
  // Ensure path ends with a slash
  const formattedPath = path.endsWith('/') ? path : path + '/';
  // Combine the path and filename
  const fullPath = formattedPath + filename;
  return fullPath;
};

/**
 * add EventListener though you can add directly
 * @function addCustomEventListener
 * @param obj, eventName, handler 
 * @example addCustomEventListener(window, "resize", someFunc) 
 * 
 */
const addCustomEventListener = function (obj, eventName, handler) {
  if (!obj.customEventListeners) {
    obj.customEventListeners = {};
  }
  if (!obj.customEventListeners[eventName]) {
    obj.customEventListeners[eventName] = [];
  }
  obj.customEventListeners[eventName].push(handler);
  obj.addEventListener(eventName, handler);
};

/**
 * remove all EventListeners though you can remove directly
 * @function removeAllEventListeners
 * @param obj
 * @example removeAllEventListeners(window) 
 * 
 */
const removeAllEventListeners = function (obj) {
  if (obj.customEventListeners) {
    const eventNames = Object.keys(obj.customEventListeners);
    for (const eventName of eventNames) {
      const eventListeners = obj.customEventListeners[eventName];
      for (const listener of eventListeners) {
        obj.removeEventListener(eventName, listener);
      }
    }
    obj.customEventListeners = {};
  }
};

/**
 * check if object has EventListener
 * @function checkifExistEventListener
 * @param obj
 * @example checkifExistEventListener(window) 
 * 
*/
const checkifExistEventListener = function (obj) {
  return obj.hasOwnProperty("listeners") && Object.keys(obj.listeners).length > 0;
};

/**
 * clear object children from THREEJS 3D OBJECT
 * @function clear
 * @param
 * @example checkifExistEventListener(window) 
 * 
*/


const CubemapFilterShader = {
  uniforms: {
    cubeTexture: { value: null },
    mipIndex: { value: 0 },
  },

  vertexShader: /* glsl */ `

    varying vec3 vWorldDirection;

    #include <common>

    void main() {
      vWorldDirection = transformDirection(position, modelMatrix);
      #include <begin_vertex>
      #include <project_vertex>
      gl_Position.z = gl_Position.w; // set z to camera.far
    }

    `,

  fragmentShader: /* glsl */ `

    uniform samplerCube cubeTexture;
    varying vec3 vWorldDirection;

    uniform float mipIndex;

    #include <common>

    void main() {
      vec3 cubeCoordinates = normalize(vWorldDirection);
      
      // Colorize mip levels
      vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
      if (mipIndex == 0.0) color.rgb = vec3(1.0, 1.0, 1.0);
      else if (mipIndex == 1.0) color.rgb = vec3(0.0, 0.0, 1.0);
      else if (mipIndex == 2.0) color.rgb = vec3(0.0, 1.0, 1.0);
      else if (mipIndex == 3.0) color.rgb = vec3(0.0, 1.0, 0.0);
      else if (mipIndex == 4.0) color.rgb = vec3(1.0, 1.0, 0.0);            

      gl_FragColor = textureCube(cubeTexture, cubeCoordinates, 0.0) * color;
    }

    `,
};

const vertexText = `
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Many thanks to Ian McEwan of Ashima Arts for the
  // ideas for permutation and gradient selection.
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/ashima/webgl-noise
  //
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
  // Classic Perlin noise
  float cnoise(vec3 P)
  {
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
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
  return 1.2 * n_xyz;
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
    return 2.0 * n_xyz;
  }
  varying vec3 vNormal;
  uniform float time;
  uniform float weight;
  uniform float morph;  
  void main() {
    float f = morph * pnoise( normal + time, vec3( 10.0 ) );
    vNormal = normalize(normal);
    vec4 pos = vec4( position + f * normal, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * pos;
  }`;


///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS LOOKING GLASS****************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize 
 * @class 
 * @param options 
*/

 export default class GTLFCustomLoader2{
  constructor(settings) {
    this.scene = new THREE.Scene();
    this.settings = settings;
    //this.scene.background = new THREE.Color()
    //this.scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.container,
      });
    this.renderer = new THREE.WebGLRenderer( { alpha: true } );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.preserveDrawingBuffer = true;
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.ratio = this.width / this.height;
    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 3, 30);
    this.camera.lookAt(this.scene.position);
    this.clock = new THREE.Clock();
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.mesh;
    this.material =  new THREE.MeshBasicMaterial();
    this.isPlaying = true;
    this.pointLight = new THREE.PointLight( 0xffffff, 0, 0, 20 );
    this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    this.pointLight.position.set( 0, 0, -20);
    //this.scene.add( this.pointLight );
    // PLANE
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry( 100, 100 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
    );
    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
  }

  raycasterEvent(){
    let mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100,100,1000,100).rotateX(-Math.PI/2),
      new THREE.MeshBasicMaterial({color: 0xff0000,wireframe: true})
    )
    this.scene.add(mesh);
    let testmesh =  new THREE.Mesh(
      new THREE.SphereGeometry(0.1,20,20),
      new THREE.MeshBasicMaterial({color: 0xff0000,wireframe: true})
    )
    window.addEventListener( 'pointermove', (event)=>{
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.raycaster.setFromCamera( this.pointer, this.camera );
      const intersects = this.raycaster.intersectObjects([mesh] );
      if(intersects[0]){
        this.point = intersects[0].point
        testmesh.position.copy(intersects[0].point)
      }
    });
  }

  settings() {
    this._settings = [
      {
        pos: new THREE.Vector3(-40, 4, -24),
        ros: new THREE.Vector3(-Math.PI/4, Math.PI / 2, Math.PI / 2),
        axis: new THREE.Vector3(4, 0, 7).normalize(),
        speed: 0.01,
        scale: 0.01
      },
      {
        pos: new THREE.Vector3(40, -3, -24),
        ros: new THREE.Vector3(-Math.PI/3, -Math.PI / 2, -Math.PI/2),
        axis: new THREE.Vector3(0, 0, 1).normalize(),
        speed: 0.01,
        scale: 0.01
      },
    ];
    this.textSettings = {
      title: "mniBus",
      bevelEnabled: true,
      fontName: 'optimer',
      // helvetiker, optimer, gentilis, droid sans, droid serif
      fontWeight: 'bold',
      height: 20,
      size: 70,
      hover: 5,
      curveSegments:4,
      bevelThickness: 2,
      bevelSize: 1.5
    };
     this.backgroundSettings = {
      progress: 0
    };

  }

  createText() {
    var textUniforms = {
      time: {
        type: "f",
        value: 0.0
      },
      RGBr: {
        type: "f",
        value: 0.8
      },
      RGBg: {
        type: "f",
        value: 0.5
      },
      RGBb: {
        type: "f",
        value: 0.4
      },
      RGBn: {
        type: "f",
        value: 0.03
      },
      RGBm: {
        type: "f",
        value: 1.5
      },
      morph: {
        type: 'f',
        value: 0
      },
      dnoise: {
        type: 'f',
        value: 0
      }
    };
    
    this.textMaterial = new THREE.ShaderMaterial({
      uniforms: textUniforms,
      vertexShader: vertexText,
      side:THREE.DoubleSide, 
      fragmentShader: fragmentText,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
    this.text = new Text();
    this.text.text = 'WE CONSTRUCT THE FUTURE';
    this.text.fontSize = 3;
    this.text.position.z = 2;
    this.text.position.y = 5;
    this.text.anchorX = 'center';
    this.text.material = this.backfaceMaterial;
    this.text.sync();
    // LOAD FONT
    this.onLoadFont()
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
  }



    createBackground(opts) {
    let count = opts.instance_count;
    let min_radius = opts.min_radius;
    let max_radius = opts.max_radius;
    let startergeo = new THREE.PlaneGeometry(100, 100);
    let geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", startergeo.getAttribute("position")),
      (geo.index = startergeo.index);
    const wpos = new Float32Array(3 * count);
    for (let r = 0; r < count; r++) {
      let i = 0.05 * (2 * Math.random() - 1);
      let s = 0.2 * (2 * Math.random() - 1);
      let a = 0.05 * (2 * Math.random() - 1);
      let l = Math.pow(r / (count - 1), 0.5);
      let c = 2 * Math.PI * 0.618033 * r;
      let u = new THREE.Vector3(l * Math.cos(c) + i, 0, l * Math.sin(c) + a);
      u
        .multiplyScalar(max_radius - min_radius)
        .add(u.clone().normalize().multiplyScalar(min_radius)),
        (wpos[3 * r + 0] = u.x);
      wpos[3 * r + 1] = u.y + s;
      wpos[3 * r + 2] = u.z;
    }
    let attr = new THREE.InstancedBufferAttribute(wpos, 3, false);
    geo.setAttribute("w_pos", attr);
    geo.instanceCount = count;
    let material1 = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        _MainTexture: {
          value: new THREE.TextureLoader().load(particleTexture),
        },
        _Opacity: {
          value: opts.opacity,
        },
        _MouseWorldPosition: {
          value: new THREE.Vector3(100, 0, 0),
        },
        _Size: {
          value: opts.particle_size,
        },
        _Time: {
          value: 0,
        },
        _RotationSpeed: {
          value: opts.rotation_speed,
        },
        _TwistSpeed: {
          value: opts.twist_speed,
        },
        _TwistFrequency: {
          value: opts.twist_frequency,
        },
        _TwistDispersion: {
          value: opts.twist_dispersion,
        },
        _TwistDispersionFrequency: {
          value: opts.twist_dispersion_frequency,
        },
        _RotationDispersion: {
          value: opts.rotation_dispersion,
        },
        _SizeFrequency: {
          value: opts.particle_size_frequency,
        },
        _SizeDispersion: {
          value: opts.particle_size_dispersion,
        },
        _TwistAmplitude: {
          value: opts.twist_amplitude,
        },
        _NoiseOffset: {
          value: opts.offset,
        },
        _NoiseFrequency: {
          value: 0,
        },
        _NoiseAmplitude: {
          value: opts.amplitude,
        },
        _Color: {
          // value: new THREE.Color('#f9ebb8'),
          value: new THREE.Color(opts.color),
        },
        _UseConeShape: {
          value: 0,
        },
        _MouseSphereRadius: {
          value: 0.3,
        },
        _MouseSphereAttractionRadius: {
          value: 0.4,
        },
        _MouseSphereFalloff: {
          value: 1,
        },
        _UseMouse: {
          value: 0,
        },
        _CameraFadeout: {
          value: 1,
        },
      },
      // wireframe: true,
      depthWrite: false,
      transparent: true,
      vertexShader: vertexBackground,
      fragmentShader: fragmentBackground,
    });
    this.cloud = new THREE.Mesh(geo, material1);
    this.cloud.frustumCulled = false;
    this.scene.add(this.cloud);
    this.materials.push(material1)
  }

   getData(){
    this.svg = [...document.querySelectorAll('.cls-1')]
    this.lines = [];
    this.svg.forEach((path,j)=>{
      let len = path.getTotalLength();
      let numberOfPoints = Math.floor(len/5);
      let points = []
      for (let i = 0; i < numberOfPoints; i++) {
        let pointAt = len * i/numberOfPoints;
        let p = path.getPointAtLength(pointAt);
        let randX = (Math.random() - 0.5)*5
        let randY = (Math.random() - 0.5)*5
        points.push(new THREE.Vector3(p.x - 1024 + randX,p.y - 512 + randY,0))
      }

      this.lines.push({
        id: j,
        path: path,
        length: len,
        number: numberOfPoints,
        points: points,
        currentPos: 0,
        speed: 1
      })
    })
  }

  createBackground2() {
    this.mMaterial = new THREE.ShaderMaterial({
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
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
      vertexShader: vertexBackground2,
      fragmentShader: fragmentBackground2
    });

    this.mGeometry = new THREE.PlaneGeometry(0.01, 0.01, 0.1, 0.1);
    this.mGeometry = new THREE.BufferGeometry();
    this.max = this.lines.length*100;
    this.mPositions = new Float32Array(this.max*3);
    this.mOpacity = new Float32Array(this.max);

    // this.lines.forEach(line=>{
    //   line.points.forEach(p=>{
    //     this.positions.push(p.x,p.y,p.z);
    //     this.opacity.push(Math.random()/5);
    //   })
    // })
    for (let i = 0; i < this.max; i++) {
      this.mOpacity.set([Math.random()/5],i);
      this.mPositions.set([Math.random()*100,Math.random()*1000,0],i*3)
    }
    this.mGeometry.setAttribute( 'position', new THREE.BufferAttribute( this.mPositions, 3 ) );
    this.mGeometry.setAttribute( 'opacity', new THREE.BufferAttribute(  this.mOpacity, 1 ) );
    this.mPlane = new THREE.Points(this.mGeometry, this.mMaterial);
    this.mPlane.position.set(0, 0, -750)
    this.scene.add(this.mPlane);
    let loader = new THREE.TextureLoader();
    loader.load(im,
      // onLoad callback
      (texture) => {
          texture.flipY = false;
          let map = new THREE.Mesh(
            new THREE.PlaneGeometry(2048,1024,1,1),
            new THREE.MeshBasicMaterial({
              color: 0x000066,
              map: texture
            })
          )
          map.position.set(-50,0,-400)
          //this.scene.add(map);
      },
      // onProgress callback currently not supported
      undefined,
      // onError callback
       (err) => {
        console.error( 'An error happened.' );
      }
    );
  }

  addPointLights(){
    const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
    this.light1 = new THREE.PointLight( 0xff0040, 400 );
    this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    this.light1.position.set(-20,1,-10);
    this.scene.add( this.light1 );
    this.light2 = new THREE.PointLight( 0x0040ff, 400 );
    this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    this.light2.position.set(-15,1,-10);
    this.scene.add( this.light2 );
    this.light3 = new THREE.PointLight( 0x80ff80, 400 );
    this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
    this.light3.position.set(-25,1,-10);
    this.scene.add( this.light3 );
    this.light4 = new THREE.PointLight( 0xffaa00, 400 );
    this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
    this.light4.position.set(-10,1,-10);
    this.scene.add( this.light4 );
  }


  renderLight() {
    const time = Date.now() * 0.0005;
    const delta = this.clock.getDelta();
    this.light1.position.x = Math.sin( time * 0.7 ) * 30;
    this.light1.position.y = Math.cos( time * 0.5 ) * 40;
    this.light1.position.z = Math.cos( time * 0.3 ) * 30;
    this.light2.position.x = Math.cos( time * 0.3 ) * 30;
    this.light2.position.y = Math.sin( time * 0.5 ) * 40;
    this.light2.position.z = Math.sin( time * 0.7 ) * 30;
    this.light3.position.x = Math.sin( time * 0.7 ) * 30;
    this.light3.position.y = Math.cos( time * 0.3 ) * 40;
    this.light3.position.z = Math.sin( time * 0.5 ) * 30;
    this.light4.position.x = Math.sin( time * 0.3 ) * 30;
    this.light4.position.y = Math.cos( time * 0.7 ) * 40;
    this.light4.position.z = Math.sin( time * 0.5 ) * 30;
  }

  updateThings(){
    let j=0;
    this.lines.forEach(line=>{
      line.currentPos += line.speed;
      line.currentPos = line.currentPos%line.number;
      for (let i = 0; i < 100; i++) {
        let index = (line.currentPos + i)%line.number;
        let p = line.points[index];
        this.mPositions.set([p.x,p.y,p.z],j*3)
        this.mOpacity.set([Math.pow(i/1000,1.3)],j)
        j++;
      }
    })
    this.mGeometry.attributes.position.array = this.mPositions;
    this.mGeometry.attributes.position.needsUpdate = true;
  }


   createBackground1() {
    const loader = new THREE.TextureLoader();
    const textureSphereBg = loader.load('https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg');
    const texturenucleus = loader.load('https://i.ibb.co/hcN2qXk/star-nc8wkw.jpg');
    const textureStar = loader.load("https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png");
    const texture1 = loader.load("https://i.ibb.co/F8by6wW/p2-b3gnym.png");  
    const texture2 = loader.load("https://i.ibb.co/yYS2yx5/p3-ttfn70.png");
    const texture4 = loader.load("https://i.ibb.co/yWfKkHh/p4-avirap.png");
    /*    Sphere  Background   */
    textureSphereBg.anisotropy = 16;
    let geometrySphereBg = new THREE.SphereGeometry(10, 20, 20);
    let materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg,
    });
    this.sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    this.sphereBg.position.set(0,0,-10);
    this.scene.add(this.sphereBg);
    const randomPointSphere = function (radius) {
        let theta = 2 * Math.PI * Math.random();
        let phi = Math.acos(2 * Math.random() - 1);
        let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
        let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
        let dz = 0 + (radius * Math.cos(phi));
        return new THREE.Vector3(dx, dy, dz);
    }

    /*    Moving Stars   */
    let starsGeometry = new THREE.BufferGeometry();
    const pts = new Float32Array();
    let starsVertices = [];
    for (let i = 0; i < 50; i++) {
        let particleStar = randomPointSphere(150); 
        particleStar.startX = particleStar.x;
        particleStar.startY = particleStar.y;
        particleStar.startZ = particleStar.z;
        starsVertices.push(particleStar.x, particleStar.y, particleStar.z);
    }
    starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3));

    let starsMaterial = new THREE.PointsMaterial({
        size: 5,
        color: "#ffffff",
        transparent: true,
        opacity: 0.8,
        map: textureStar,
        blending: THREE.AdditiveBlending,
    });
    starsMaterial.depthWrite = false;  
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
    /*    Fixed Stars   */
    const createStars = function (texture, size, total) {
        let pointGeometry = new THREE.BufferGeometry();
        let ptVertices = [];
        const pts = new Float32Array();
        let pointMaterial = new THREE.PointsMaterial({
            size: size,
            map: texture,
            blending: THREE.AdditiveBlending,                      
        });

        for (let i = 0; i < total; i++) {
            let radius = THREE.MathUtils.randInt(149, 70); 
            let particles = randomPointSphere(radius);
            ptVertices.push(particles.x, particles.y, particles.z);
        }
      pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(ptVertices, 3));
        return new THREE.Points(pointGeometry, pointMaterial);
    };


    this.scene.add(createStars(texture1, 15, 20));   
    this.scene.add(createStars(texture2, 5, 5));
    this.scene.add(createStars(texture4, 7, 5));
  }

  //LOAD FONT
  onLoadFont() {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('../../static/src/fonts/' + this.textSettings.fontName + '_' + this.textSettings.fontWeight + '.typeface.json', 
        (font) => {
          this.onFontLoaded();
          this.font = font;
          this.onRefreshTextMesh();
          resolve('Font loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onFontLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
          console.log(loadingPercentage + '% loaded');
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        }
      );
    });
  }

  onFontLoadError(error) {
    console.error('Error loading font:', error);
    document.body.classList.remove('loading');
  }

  onFontLoad() {
    document.body.classList.add('loading');
  }

  onFontLoaded() {
    document.body.classList.remove('loading');
  }

  // CREATE TEXT MESH
  createTextMesh(scene, config) {
    let metalMaterial;
    let metalMaterialSettings;
    let envmaploader = new THREE.PMREMGenerator(this.renderer);
    let font = this.font;
    let group = new THREE.Group();
    new RGBELoader().setPath('../static/src/assets/global/textures/environment/').load('memorial.hdr', 
      (hdrmap) => {
           let envmap = envmaploader.fromCubemap(hdrmap);
            let texture1 = new THREE.CanvasTexture(new FlakesTexture());
            texture1.wrapS = THREE.RepeatWrapping;
            texture1.wrapT = THREE.RepeatWrapping;
            texture1.repeat.x = 10;
            texture1.repeat.y = 6;
            const metalMaterialSettings = {
                clearcoat: 1.0,
                cleacoatRoughness:0.1,
                metalness: 0.9,
                roughness:0.5,
                color: 0x8418ca,
                normalMap: texture1,
                normalScale: new THREE.Vector2(0.15,0.15),
                envMap: envmap.texture
              };
              metalMaterial = new THREE.MeshPhysicalMaterial(metalMaterialSettings);
              const textGeo = new TextGeometry(config.title, {
                font: font,
                size: config.size,
                height: config.height,
                curveSegments: config.curveSegments,
                bevelThickness: config.bevelThickness,
                bevelSize: config.bevelSize,
                bevelEnabled: config.bevelEnabled
              });
              textGeo.computeBoundingBox();
              const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
              const textMesh1 = new THREE.Mesh(textGeo, metalMaterial);
              textMesh1.position.x = centerOffset;
              textMesh1.position.y = config.hover;
              textMesh1.position.z = -25;
              textMesh1.rotation.x = 0;
              textMesh1.rotation.y = Math.PI * 2;
              group.scale.set(0.1, 0.1, 0.1);
              group.translateX(5);
              group.translateZ(-3);
              group.add(textMesh1);
              scene.add(group);
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        } 
    );
  }
  
  // REFRESH TEXT MESH
  onRefreshTextMesh() {
    this.createTextMesh(this.scene, this.textSettings);
    if (!this.textSettings.title) return;
  }

  addToScene(scene, obj, pos, ros, scale){
    obj.scale.set(scale, scale, scale);
    obj.position.set(pos);
    obj.rotation.set(ros);
    scene.add(obj);
    return obj
  }

  setMaterials(){
    // Remove unnecessary Promise and resolve
    this.envFbo = new THREE.WebGLRenderTarget(this.width * this.ratio, this.height * this.ratio);
    this.backfaceFbo = new THREE.WebGLRenderTarget(this.width * this.ratio, this.height * this.ratio);
    this.backfaceMaterial = new THREE.ShaderMaterial({
          extensions: {
              derivatives: "#extension GL_OES_standard_derivatives : enable"
          },
          side: THREE.BackSide,
          vertexShader: vertexBackface,
          fragmentShader: fragmentBackface
    });
    this.refractionMaterial = new THREE.ShaderMaterial({
      extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      uniforms: {
        envMap: this.envFbo.texture,
        backfaceMap: this.backfaceFbo.texture,
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: vertexRefraction,
      fragmentShader: fragmentRefraction
    });
     this.transparentMaterial = new THREE.ShaderMaterial({
      extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      uniforms: {
        mRefractionRatio: { value: 1.02 },
        mFresnelBias: { value: 0.1 },
        mFresnelPower: { value: 2.0 },
        mFresnelScale: { value: 1.0 },
        tCube: { value: null }
      },
      vertexShader: vertexTransparent,
      fragmentShader: fragmentTransparent
    });
    }
    
    async loadCubeTexture( urls ) {
      return new Promise( function ( resolve ) {
        new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {
          resolve( cubeTexture );
          });
      });
    }

    allocateCubemapRenderTarget( cubeMapSize ) {
        const params = {
          magFilter: THREE.LinearFilter,
          minFilter: THREE.LinearMipMapLinearFilter,
          generateMipmaps: false,
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          colorSpace: THREE.LinearSRGBColorSpace,
          depthBuffer: false,
        };
        const rt = new THREE.WebGLCubeRenderTarget( cubeMapSize, params );
        const mipLevels = Math.log( cubeMapSize ) * Math.LOG2E + 1.0;
        for ( let i = 0; i < mipLevels; i ++ ) rt.texture.mipmaps.push( {} );
        rt.texture.mapping = THREE.CubeReflectionMapping;
        return rt;
    }

    renderToCubeTexture( cubeMapRenderTarget, sourceCubeTexture ) {
        const cameras = [];
        for ( let i = 0; i < 6; i ++ ) {
          cameras.push( new THREE.PerspectiveCamera( - 150, 1, 1, 10 ) );
        }
        cameras[ 0 ].up.set( 0, 1, 0 );
        cameras[ 0 ].lookAt( 1, 0, 0 );
        cameras[ 1 ].up.set( 0, 1, 0 );
        cameras[ 1 ].lookAt( - 1, 0, 0 );
        cameras[ 2 ].up.set( 0, 0, - 1 );
        cameras[ 2 ].lookAt( 0, 1, 0 );
        cameras[ 3 ].up.set( 0, 0, 1 );
        cameras[ 3 ].lookAt( 0, - 1, 0 );
        cameras[ 4 ].up.set( 0, 1, 0 );
        cameras[ 4 ].lookAt( 0, 0, 1 );
        cameras[ 5 ].up.set( 0, 1, 0 );
        cameras[ 5 ].lookAt( 0, 0, - 1 );
        for ( let i = 0; i < 6; i ++ ) cameras[ i ].updateMatrixWorld();
        const geometry = new THREE.BoxGeometry( 5, 5, 5 );
        const material = new THREE.ShaderMaterial( {
          name: 'FilterCubemap',
          uniforms: THREE.UniformsUtils.clone( CubemapFilterShader.uniforms ),
          vertexShader: CubemapFilterShader.vertexShader,
          fragmentShader: CubemapFilterShader.fragmentShader,
          side: THREE.BackSide,
          blending: THREE.NoBlending,
        });
        material.uniforms.cubeTexture.value = sourceCubeTexture;
        const mesh = new THREE.Mesh( geometry, material );
        const currentRenderTarget = this.renderer.getRenderTarget();
        const currentXrEnabled = this.renderer.xr.enabled;
        this.renderer.xr.enabled = false;
        for ( let faceIndex = 0; faceIndex < 6; faceIndex ++ ) {
          let mipIndex = 0;
          let mipSize = cubeMapRenderTarget.width;
          // Render to each texture mip level
          while ( mipSize >= 1 ) {
            cubeMapRenderTarget.viewport.set( 0, 0, mipSize, mipSize );
            this.renderer.setRenderTarget( cubeMapRenderTarget, faceIndex, mipIndex );
            material.uniforms.mipIndex.value = mipIndex;
            material.needsUpdate = true;
            this.renderer.render( mesh, cameras[ faceIndex ] );
            mipSize >>= 1;
            mipIndex ++;
          }
        }
        this.renderer.setRenderTarget( currentRenderTarget );
        this.renderer.xr.enabled = currentXrEnabled;
        mesh.geometry.dispose();
        mesh.material.dispose();
    }

    addMetalMaterial(md){
      let metalMaterial;
      let metalMaterialSettings;
      let envmaploader = new THREE.PMREMGenerator(this.renderer);
      new RGBELoader().setPath('../static/src/assets/global/textures/environment/').load('memorial.hdr', function(hdrmap) {   
        let envmap = envmaploader.fromCubemap(hdrmap);
        let texture1 = new THREE.CanvasTexture(new FlakesTexture());
        texture1.wrapS = THREE.RepeatWrapping;
        texture1.wrapT = THREE.RepeatWrapping;
        texture1.repeat.x = 10;
        texture1.repeat.y = 6;
        const metalMaterialSettings = {
            clearcoat: 1.0,
            cleacoatRoughness:0.1,
            metalness: 0.9,
            roughness:0.5,
            color: 0x8418ca,
            normalMap: texture1,
            normalScale: new THREE.Vector2(0.15,0.15),
            envMap: envmap.texture
          };
          metalMaterial = new THREE.MeshPhysicalMaterial(metalMaterialSettings);
          md.material = metalMaterial;
      });
    }
 
    addLights() {
      const textureLoader = new THREE.TextureLoader();
      const textureFlare0 = textureLoader.load( "../static/src/assets/global/textures/lensflare/lensflare0.png" );
      const textureFlare3 = textureLoader.load( "../static/src/assets/global/textures/lensflare/lensflare3.png" );
      const light = new THREE.PointLight( 0xffffff, 1.5, 2000, 0 );
      const addLight = function (h, s, l, x, y, z ) {
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        const lensflare = new Lensflare();
        lensflare.addElement( new LensflareElement( textureFlare0, 700, 0, light.color ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) );
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) );
        light.add( lensflare );
      };
      addLight( 0.55, 0.9, 0.5, 10, 0, 2 );
      addLight( 0.08, 0.8, 0.5, 0, 0, 2 );
      addLight( 0.995, 0.5, 0.9, -10, 0, 2 );
      return light;
    }

    addSplotLights() {
      const loader = new THREE.TextureLoader().setPath("../static/src/assets/dataset/global/textures/splotLight/");
        const filenames = [ 'disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg' ];
        const textures = { none: null };
        for ( let i = 0; i < filenames.length; i ++ ) {
          const filename = filenames[ i ];
          const texture = loader.load( filename );
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          textures[ filename ] = texture;
        }
        this.spotLight = new THREE.SpotLight( 0xffffff, 100 );
        this.spotLight.position.set( 2.5, 5, 2.5 );
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 1;
        this.spotLight.decay = 2;
        this.spotLight.distance = 0;
        this.spotLight.map = textures[ 'disturb.jpg' ];
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.camera.near = 1;
        this.spotLight.shadow.camera.far = 10;
        this.spotLight.shadow.focus = 1;
        this.scene.add( this.spotLight );
        /*lightHelper = new THREE.SpotLightHelper( spotLight );
        scene.add( lightHelper );*/
    }

    renderSplotLight(){
        const time = performance.now() / 3000;
        this.spotLight.position.x = Math.cos( time ) * 2.5;
        this.spotLight.position.z = Math.sin( time ) * 2.5;
    }
    addInstancedObjects() {
    const loader = new GLTFLoader().setPath("../static/src/assets/dataset/models/diamond/");
    loader.load("diamond.glb",
      (gltf) => {
      this.geometry = gltf.scene.children[0].geometry;
      //this.geometry = gltf.scene.children[0].children[0].children[0].children[0].children[0].geometry;
      const r = '../static/src/assets/global/textures/Park3Med/';
      const urls = [
        r + 'px.jpg', r + 'nx.jpg',
        r + 'py.jpg', r + 'ny.jpg',
        r + 'pz.jpg', r + 'nz.jpg'
      ];
      this.loadCubeTexture( urls ).then(( cubeTexture ) => {
        const cubeMapRenderTarget = this.allocateCubemapRenderTarget( 512 );
        this.renderToCubeTexture( cubeMapRenderTarget, cubeTexture );
        let material = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: cubeTexture });
        material.envMap = cubeMapRenderTarget.texture;
        this.mesh = new THREE.InstancedMesh(this.geometry, material, this._settings.length);
        this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
        this.scene.add(this.mesh);
        addPageManager(this.container, 'loaded');
        });
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          addPageManager(this.container, loadingPercentage);
        },
        (error) => {
          this.onFontLoadError(error);
          reject('Error loading font'); // Reject with a meaningful error message
        } 
        // Add the single instance of InstancedMesh to the scene
    );
  }
  addSingleObject(settings) {
    console.log("this is fired")
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader().setPath(settings.path);

      //dracoLoader.setDecoderPath( 'three/addons/libs/draco/' );
      //loader.setDRACOLoader( dracoLoader );
      loader.load(
        settings.mdName,
        (object) => {
          resolve(object); // Resolve the promise with the loaded object
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          // Handle loading progress if needed
        },
        (error) => {
          // Handle loading error
          console.log('Error loading model', error);
          reject(error); // Reject the promise with the error
        }
      );
    });
  }


  addSingleObjectDraco(settings) {
    console.log("this is fired")
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader().setPath(settings.path);
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath( '../static/src/lib/THREEJS/examples/jsm/libs/draco/' );
      loader.setDRACOLoader( dracoLoader );

      //dracoLoader.setDecoderPath( 'three/addons/libs/draco/' );
      //loader.setDRACOLoader( dracoLoader );
      loader.load(
        settings.mdName,
        (object) => {
          resolve(object); // Resolve the promise with the loaded object
        },
        (xhr) => {
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          // Handle loading progress if needed
        },
        (error) => {
          // Handle loading error
          console.log('Error loading model', error);
          reject(error); // Reject the promise with the error
        }
      );
    });
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
    this.addCustomEventListenerT(window, "resize", (e)=>this.onResize(e));
    this.addCustomEventListenerT(window, "mousemove", (e)=>this.onMouseMove(e));
  }

 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }
    // RENDER
    render() {
      this.time += 0.05;
      var delta = 0;
      var speed = 2;
      delta = this.clock.getDelta();
      var frame = 2;
      frame+=0.5;
      this.target.x += ( this.mouseX - this.target.x ) * .02;
      this.target.y += ( - this.mouseY - this.target.y ) * .02;
      this.target.z = this.camera.position.z;
      this.model.ring.lookAt( this.target );
      this.model.center.lookAt( this.target );
      /*const ROTATE_TIME = 10; // Time in seconds for a full rotation
      const xAxis = new THREE.Vector3(1, 0, 0);
      const yAxis = new THREE.Vector3(0, 1, 0);
      const rotateX = (delta / ROTATE_TIME) * Math.PI;
      const rotateY = (delta / ROTATE_TIME) * Math.PI;
      const rotateZ = (delta / ROTATE_TIME) * Math.PI;
      if(this.mesh){
        let time = performance.now() * 0.001;
        this.model = new THREE.Object3D();
        this.mesh.position.x = Math.sin( time * 2);
        this.mesh.position.y = Math.sin( time * 4)+ 0.2;
        this.mesh.position.z = Math.sin( time * 2 );
        this.mesh.rotateZ(rotateZ);
        this.mesh.rotateY(rotateY);
        time += 0.5;
        this._settings.forEach((data, i) => {
          const t = this.clock.getElapsedTime() / 2;
          const { pos, ros, axis, speed, scale } = data;
          const s = (this.width / 35) * scale;
          this.model.position.copy(data.pos);
          this.model.rotation.set(data.ros.x, data.ros.y, data.ros.z);
          this.model.updateMatrix();
          this.mesh.setMatrixAt(i, this.model.matrix);
        });
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.computeBoundingSphere();
      }
     // Stars Animation
      /*const starsAttributes = this.stars.geometry.attributes;

      for (let i = 0; i < starsAttributes.position.count; i++) {
          const startX = starsAttributes.position.getX(i);
          const startY = starsAttributes.position.getY(i);
          const startZ = starsAttributes.position.getZ(i);
          let velocity = THREE.MathUtils.randInt(50, 300);
          velocity -= 0.03;
          starsAttributes.position.setX(i, startX + (0 - startX) / velocity);
          starsAttributes.position.setY(i, startY + (0 - startY) / velocity);
          starsAttributes.position.setZ(i, startZ + (0 - startZ) / velocity);
          if (
              startX <= 5 && startX >= -5 &&
              startZ <= 5 && startZ >= -5
          ) {
              starsAttributes.position.setX(i, startX);
              starsAttributes.position.setY(i, startY);
              starsAttributes.position.setZ(i, startZ);
              velocity = THREE.MathUtils.randInt(50, 300);
          }
      }

      // Update the BufferGeometry to reflect the changes
      starsAttributes.position.needsUpdate = true;
      this.stars.geometry.verticesNeedUpdate = true;
    //Sphere Beckground Animation
    //this.sphereBg.rotation.x += delta*0.1;
    //this.sphereBg.rotation.y += delta*0.1;
    //this.sphereBg.rotation.z += delta*0.1;*/

    this.renderLight();
    this.renderSplotLight();
    // this.material.uniforms.time.value = this.time;
    /*this.materials.forEach(m=>{
      m.uniforms._Time.value = this.time*0.1;
      m.uniforms._MouseWorldPosition.value = this.point
    })*/
      //this.textMaterial.uniforms.time.value = 0.01 * delta * frame;
      this.renderer.render(this.scene, this.camera);
      this.renderer.clearDepth();
    }

    // RESIZE
    onResize() {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }

    //ROTATE OBJECT
    onRotation = function(obj, axis, speed) {
      obj.rotateOnAxis(axis, speed);
    }

    // ANIMATE 
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.render();
    }
}

    
 

