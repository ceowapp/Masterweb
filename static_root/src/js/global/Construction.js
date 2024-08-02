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
import FBXCustomLoader from "./LoadFBXModel.js";
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


 class Construction extends FBXCustomLoader{
  constructor(options, settings, scene, camera, renderer) {
    super(settings, scene, camera, renderer);
    console.log("settings", settings)
    this.mdSettings = settings;
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.ratio = this.width / this.height;
    this.container.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(this.scene.position);
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.isPlaying = true;
    this.time = 0;
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
    this.addObjects();
    this.animate();
    this.addEventListeners();
  }

  addLight(){
    this.aLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.aLight.position.set(-5, 5, 5);
    this.scene.add(this.aLight);
  }

  addObjects() {
      this.mdSettings.map((set, index) => {
      // Example usage in some function:
    this.addSingleObject(set)
      .then((model) => {
        this.model = model;
        this.group.add(model);
        this.group.scale.set(set.scale, set.scale, set.scale);
        this.group.position.set(set.posX, set.posY, set.posZ);
        console.log('Model loaded:', model);
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
      this.model.rotation.y = this.targetRotation * 0.1*this.time;
      this.time += 0.05;
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
    this.composer.setSize(this.width, this.height);
  }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

(function () {
    function init() {
      var o = {
        container:  document.querySelector('.md-construction')
      };
      var mdSettings = [
          {
            path: '../static/src/assets/dataset/models/biotech/',
            mdName: 'scene.fbx',
            scale: 0.8,
            posX: -1900,
            posY: -1200,
            posZ: -2700,
          }
      ];
      var CS = new Construction(o, mdSettings);
    }
    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();

    
 

