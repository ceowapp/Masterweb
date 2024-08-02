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
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Text } from 'troika-three-text';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
let particleTexture =  "../static/src/assets/dataset/textures/particle.dcae8b12.webp";
import addPageManager from './utils/PageManager.js';
import GTLFCustomLoader from "./LoadGLTFModel.js";
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';

const vertexRing = `
  uniform vec2 uvScale;
  varying vec2 vUv;
  void main() {
    vUv = uvScale * uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
  }`;

const fragmentRing = `
  uniform float time;
  uniform float fogDensity;
  uniform vec3 fogColor;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  varying vec2 vUv;
  void main( void ) {
    vec2 position = - 1.0 + 2.0 * vUv;
    vec4 noise = texture2D( texture1, vUv );
    vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
    vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;
    T1.x += noise.x * 2.0;
    T1.y += noise.y * 2.0;
    T2.x -= noise.y * 0.2;
    T2.y += noise.z * 0.2;
    float p = texture2D( texture1, T1 * 2.0 ).a;
    vec4 color = texture2D( texture2, T2 * 2.0 );
    vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );
    if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
    if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
    if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }
    gl_FragColor = temp;
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;
    float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
    fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
    gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

}`;


 class Artificial extends GTLFCustomLoader{
  constructor(options, settings, scene, camera, renderer) {
    super(settings, scene, camera, renderer);
    this.container = options.container;
    this.mdSettings = settings;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.ratio = this.width / this.height;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x000000, 0); 
    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(this.scene.position);
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    this.time = 0;
    /*const renderModel = new RenderPass( scene, camera );
    const effectBloom = new BloomPass( 1.25 );
    const outputPass = new OutputPass();
    this.composer = new EffectComposer( renderer );
    this.composer.addPass( renderModel );
    this.composer.addPass( effectBloom );
    this.composer.addPass( outputPass );*/
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.isPlaying = true;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.target = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    //if(this.light) this.scene.add( this.light );
    //this.addPlane();
    //this.addPlane();
    this.addLight();
    this.onResize();
    this.addObjects();
    this.animate();
    this.addEventListeners();

  }

  addLight(){
    this.aLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.aLight.position.set(0, 3, 10);
    this.scene.add(this.aLight);
  }

 addObjects() {
      this.mdSettings.map((set, index) => {
      // Example usage in some function:
      this.addSingleObject(set)
      .then((model) => {
        this.model = model;
        this.group.add(model.scene);
        this.group.scale.set(set.scale, set.scale, set.scale);
        this.group.position.set(set.posX, set.posY, set.posZ);
        const axesHelper = new THREE.AxesHelper( 5 );
        console.log('Model loaded abstract:', model);
      })
      .catch((error) => {
        // Handle errors during loading
        console.error('Error loading model:', error);
      });
    });
  }

  renderObject(){
      if(this.model){
        this.targetRotation = Math.PI; // Rotate 360 degrees (2 * Math.PI)
        this.model.scene.rotation.y = this.targetRotation * 0.1*this.time;
        this.time += 0.05;
      }
    }



  /*addOuterRing() {
      const vertices = [];
      const colors = [];
      const color = new THREE.Color();
      const divisions = 50;
      for ( let i = 0, l = divisions; i <= l; i ++ ) {
        const t = i / l;
        const v = ( i / divisions ) * ( Math.PI * 2 );
        const x = Math.sin( v );
        const z = Math.cos( v );
        vertices.push( x, 0, z );
        color.setHSL( t, 1.0, 0.5, THREE.SRGBColorSpace );
        colors.push( color.r, color.g, color.b );
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
      geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
      for ( let i = 1; i <= 10; i ++ ) {
        matLineBasic = new THREE.LineBasicMaterial( { vertexColors: true } );
        matLineDashed = new THREE.LineDashedMaterial( { vertexColors: true, scale: 2, dashSize: 1, gapSize: 1 } );
        const line = new THREE.Line( geo, matLineDashed );
        line.computeLineDistances();
        this.group.add(line);
      }
    }

    renderOuterRing() {
      let count = 0;
      const time = performance.now() / 1000;
      this.group.traverse( function ( child ) {
          child.rotation.x = count + ( time / 3 );
          child.rotation.z = count + ( time / 4 );
          count ++;
      });
    }

    addInnerRing() {
      const textureLoader = new THREE.TextureLoader();
      const cloudTexture = textureLoader.load( '../static/src/assets/global/textures/lava/cloud.png' );
      const lavaTexture = textureLoader.load( '../static/src/assets/global/textures/lava/lavatile.jpg');
      lavaTexture.colorSpace = THREE.SRGBColorSpace;
      cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
      lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
      this.uniforms = {
        'fogDensity': { value: 0.45 },
        'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
        'time': { value: 1.0 },
        'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
        'texture1': { value: cloudTexture },
        'texture2': { value: lavaTexture }

      };
      const size = 0.65;
      const material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexRing,
        fragmentShader: fragmentRing
      });
      this.ring = new THREE.Mesh( new THREE.TorusGeometry( size, 0.3, 30, 30 ), material );
      this.ring.rotation.x = 0.3;
      this.scene.add(this.ring);
    }

    renderInnerRing() {
      const delta = 5 * clock.getDelta();
      this.uniforms[ 'time' ].value += 0.2 * delta;
      this.ring.rotation.y += 0.0125 * delta;
      this.ring.rotation.x += 0.05 * delta;
      this.renderer.clear();
      this.composer.render( 0.01 );
    }*/

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
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }
  // RENDER
  render() {
    /*this.renderOuterRing();
    this.renderInnerRing();*/
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
    this.render();
  }
}

(function () {
    function initAbstract() {
      var o2 = {
      container:  document.querySelector('.md-3d')
      };
       var mdSettings2 =
        [
          {
            path: '../static/src/assets/dataset/models/bible/',
            mdName: 'holy_bible.glb',
            scale: 1,
            posX: -1.5,
            posY: 2,
            posZ: 10,
          }
      ];
      var AI = new Artificial(o2, mdSettings2);
    }
    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        initAbstract();
    } else {
        document.addEventListener("DOMContentLoaded", initAbstract);
    }
})();

    
 

