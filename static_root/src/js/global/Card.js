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
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { init as initEdgeFinder } from './lib/edge_finder.js';

 class Card {
  constructor(options) {
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    this.camera.position.y = 150;
    this.camera.position.z = 450;
    this.aspect = this.width / this.height;
    this.camera.lookAt(this.scene.position);
    //this.controls1 = new OrbitControls(this.camera1, this.renderer.domElement);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.time = 0;
    this.isPlaying = true;
    this.start = Date.now();
    this.addlight();
    this.addObject();
    this.onResize();
    this.render();
    this.setupResize();
    this.animate();
    this.addEventListeners();
  }

  addlight() {
    const pointLight1 = new THREE.PointLight( 0xffffff, 3, 0, 0 );
    pointLight1.position.set( 500, 500, 500 );
    this.scene.add( pointLight1 );
    const pointLight2 = new THREE.PointLight( 0xffffff, 1, 0, 0 );
    pointLight2.position.set( - 500, - 500, - 500 );
    this.scene.add( pointLight2 );
  }

  addObject() {
      const config = {
         width: 0.2, // border width, range [0, 1]
         alpha: true, // solid mesh background
         invert: false, // swap border/background style
         mode: 0, // border style: 0 - solid, 1 - smooth, 2 - neon
         wave: 0, // repeating border, 0 - disabled, recommended values [1, 2, 3, 4, ...]
         exp: 1, // border falloff: 1 - smoothstep, otherwise exponential, recommended range [2, 100]
      };
      const torus = new THREE.TorusKnotGeometry( 50, 15, 500, 80 ); 
       const sphere =  new THREE.SphereGeometry( 200, 20, 10 )
       //const sphere = new THREE.Mesh( new THREE.SphereGeometry( 200, 20, 10 ), new THREE.MeshPhongMaterial( { flatShading: true } ) );
       this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', { invert: false } );
       this.effect.setSize( window.innerWidth, window.innerHeight );
       //this.effect.domElement.style.color = 'white';
       //this.effect.domElement.style.backgroundColor = 'black';
       this.mesh = initEdgeFinder( // returns THREE.Mesh
           sphere, // THREE buffer geometry, indexed geometry will be converted to non-indexed
           THREE.Mesh, 
           THREE.ShaderMaterial, 
           THREE.Float32BufferAttribute, 
           config, 
           0.001, // edge detection precision in range (0, 1), higher values detect sharper edges only
           0.001, // matching vertice positions detection precision (for example, along uv seams)
        );
        this.scene.add( this.mesh );
        this.container.appendChild( this.effect.domElement );
     }
        
    render() {
      if (!this.isPlaying) return;
      const timer = Date.now() - this.start;
      this.mesh.position.y = Math.abs( Math.sin( timer * 0.002 ) ) * 150;
      this.mesh.rotation.x = timer * 0.0003;
      this.mesh.rotation.z = timer * 0.0002;
      this.effect.render(this.scene, this.camera );
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

  //RESIZE
  setupResize() {
    window.addEventListener("resize", this.onResize.bind(this));
  }

  // RESIZE
  onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

(function () {
   const randomHaze = () => {
      let deg = gsap.utils.random(25, 115)
      let deg2 = gsap.utils.random(218, 320)
      gsap.to('.panel-grid-inner', {
        duration: 1,
        '--degree': `${deg}deg`,
        '--degree2': `${deg2}deg`,
        '--color': "rgb(random(0,155,100), random(1,255,0), random(155,0,1), 0.5)",
        '--color2': "rgb(random(0,155,100), random(1,255,0), random(155,0,1), 0.56)",
        ease: 'none',
        yoyo: true,
        onComplete: randomHaze
      })
    };
    function init() {
      var o = {
      container:  document.querySelector('.canvas-header')
      };
      var CA = new Card(o);
      randomHaze()
    }
    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();

