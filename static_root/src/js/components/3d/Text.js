/**
 * TEXT APP versions-1.0.-2023
 *
 * @author OmniBusAdmin (http://www.OmniBus.com/)
 * @license MIT
*/

/**
* CREDITS
* This app is made possible by contributors 
* This app is defacto a collection of text effects in THREE.JS, CANNON.JS
* For performance purpose, this code execludes the audio section in class TextPoint
* THIS IS THE JS FILES YOU CAN BUILD THIS APP WITH NPM BUILD WITH WEBPACK
*/

///////////////////////////////////////////////////////////////////////////////
//**********************IMPORTING PACKAGES/LIBRARIES************************//                               
//////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';        
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaderNode, uniform, storage, instanceIndex, float, texture, viewportTopLeft, color } from 'three/addons/nodes/Nodes.js';
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import { Water } from 'three/addons/objects/Water2.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { GUI } from '../../../lib/dat.gui/build/dat.gui.module.js';;
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
import { Text } from 'troika-three-text';

//IMPORT LIBRARIES
import { hexRgb } from '../../../lib/hex-rgb/index.js';

//var hexRgb = import('../../../utils/hex-rgb/index.js');
//var gsap = import ('../../../utils/gsap/index.js');

// THREE BMFONT TEXT
//var loadFont = import('../../../utils/load-bmfont/index.js');
//var createTextGeometry = import('../../../utils/three-bmfont-text/index.js');
//var createMSDFShader = import('../../../utils/three-bmfont-text/shaders/msdf.js')

//import loadFont from '../../../js/lib/load-bmfont/index.js';
//import createTextGeometry from '../../../js/lib/three-bmfont-text/index.js';

//Load for physic text//import createMSDFShader from '../../../js/lib/three-bmfont-text/shaders/msdf.js';

//var C = import('../../../utils/cannon/build/cannon.min.js');
import { pick } from '../../../utils/index.js';
import CannonDebugRenderer from '../../../utils/CannonDebugRenderer.js';
//import '../sass/styles.scss'

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
const clear = function () {
  while ( this.children.length > 0 ) {
    const object = this.children.pop();
    object.parent = null;
    object.dispatchEvent( _removedEvent );
  }
  return this;
};

/**
 * clear object children from THREEJS 3D OBJECT
 * @function fractionate
 * @param
 * @example fractionate(window) 
 * 
*/
const fractionate = function (val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
};

/**
 * clear object children from THREEJS 3D OBJECT
 * @function modulate
 * @param
 * @example modulate(window) 
 * 
*/
const modulate = function (val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
};

/**
 * clear object children from THREEJS 3D OBJECT
 * @function avg
 * @param
 * @example avg(window) 
 * 
*/
const avg = function (arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
};

/**
 * clear object children from THREEJS 3D OBJECT
 * @function max
 * @param
 * @example max(window) 
 * 
*/
const max = function (arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
};

/**
 * check for available options
 * @function checkCompatibility
 * @param options
 * @example checkCompatibility(options) 
 * 
*/
const checkCompatibility = function (options) {
    //you can define the defaultOptions and container element here or elsewhere in the code
    /*.eg   
    this.defaultOptions = { 
      camera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 ),
      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      gui: new GUI(),
      index: 0
    }
    */
    if ( options.scene === undefined && isFalseT(options.scene instanceof THREE.Scene)) {
      scene = defaultOptions.scene;
    } else {scene = options.scene;}
     if (isFalseT(options.camera instanceof THREE.PerspectiveCamera)) {
      camera = defaultOptions.camera;
    }else{camera = options.camera;}
    if (isFalseT(options.renderer instanceof THREE.WebGLRenderer)) {
      renderer = defaultOptions.renderer;
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild( renderer.domElement);
    }else{renderer = options.renderer;}
    if (isFalseT(options.gui instanceof GUI)) {gui = defaultOptions.gui;}else{gui=options.gui}
    for (var opt in Object.keys(defaultOptions).filter(key => key !== 'renderer' && key !== 'camera' && key !== 'scene')) {
      if (defaultOptions.hasOwnProperty(opt)) {
          options[opt] = typeof options[opt] === "undefined" ? defaultOptions[opt] : options[opt];
      }
    }
  }


///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS TEXT*******************************//                               
//////////////////////////////////////////////////////////////////////////////

/**
 * call this class to initialize App
 * @class Text
 * @param options 
*/
export default class TEXT {
    constructor(options) {
      this.isFalseT = isFalse.bind(this);
      this.isTrueT = isTrue.bind(this);
      this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
      this.addCustomEventListenerT = addCustomEventListener.bind(this);
      this.removeAllEventListenersT = removeAllEventListeners.bind(this);
      this.options = options || {};
      this.container = this.options.container || document.body;
      this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
      this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
      this.container1 = this.options.container1 || document.body;
      this.container1Width = this.options.container1 ? this.options.container1.clientWidth : window.innerWidth;
      this.container1Height = this.options.container1 ? this.options.container1.clientHeight : window.innerHeight;
      this.container2 = this.options.container2 || document.body;
      this.container2Width = this.options.container2 ? this.options.container2.clientWidth : window.innerWidth;
      this.container2Height = this.options.container2 ? this.options.container2.clientHeight : window.innerHeight;
      this.camera = new THREE.PerspectiveCamera(30, this.containerWidth/ this.containerHeight, 1, 1500);
      this.demoList = {
        class: [
          "demo1",
          "demo2",
          "demo3",
          "demo4",
          "demo5",
          "demo6",
          "demo7"
        ]
      };
      this.texturesToLoad = [
        ['mat_text'       , '../../static/src/assets/components/textApp/sprite/sprite.png'         ], 
        ['flowMap'        , '../../static/src/assets/components/textApp/water/Water_1_M_Flow.jpg' ],
        //['iri_gold'     , 'img/iri/gold.png'           ],
        //['iri_blue'     , 'img/iri/blue.png'           ],
      ];
      this.TEXTURES  = {};
      //THREE.Cache.enabled = true;
      this.TextMesh = window.TextMesh || {}; //for mesh text
      this.TextLine = window.TextLine || {}; //for line text
      this.TextShader = window.TextShader || {}; //for shader text
      this.TextPoint = window.TextPoint || {}; // for point text
      this.TextTrail = window.TextTrail || {}; //for trail text
      this.TextKinetic = window.TextKinetic || {}; //for kinetic text
      this.TextPhysic = window.TextPhysic || {}; // for physic text
      this.gui = new GUI();
      this.gui.width = 250;
      this.gui.domElement.id = 'panel';
      this.palette = {
          color1: '#FF0000', // CSS string
          color2: [ 0, 128, 255 ], // RGB array
          color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
          color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
      };
      //this.gui.addColor(palette, 'color2');
      //this.gui.addColor(palette, 'color3');
      //this.gui.addColor(palette, 'color4');
      this.meshGUI;
      this.lineGUI;
      this.shaderGUI;
      this.pointGUI;
      this.trailGUI;
      this.kineticGUI;
      this.physicGUI;
      this.shaders = new ShaderLoader('shaders' , 'shaders');
      this.textures = new THREE.TextureLoader();
      this.progress = 0;
      this.BOUNDS = 800, this.BOUNDS_HALF = this.BOUNDS/2;
      this.elems = [...document.querySelectorAll('.frame__dem')];
      this.prev = 0;
      this.current = 0;
      this.turn = 0;
      const TextMeshOpts = {
        container: this.container,
      };
      const TextLineOpts = {
        container: this.container,
      };
      const TextShaderOpts = {
        container: this.container,
      };
      const TextPointOpts = {
        container: this.container,
      };
      const TextTrailOpts = {
        container: this.container1,
      };
      const TextKineticOpts = {
        container: this.container2,
      };
      const TextPhysicOpts = {
        container: this.container,
      };
      this.loadMeshText = () => {
        this.TextMesh.APPSET = new TextMesh( TextMeshOpts );
      };
      this.loadLineText = () => {
        this.TextLine.APPSET = new TextLine( TextLineOpts );
      };
      this.loadShaderText = () => {
        this.TextShader.APPSET = new TextShader( TextShaderOpts );
      };
      this.loadPointText = () => {
        this.TextPoint.APPSET = new TextPoint( TextPointOpts );
      };
      this.loadTrailText = () => {
        this.TextTrail.APPSET = new TextTrail( TextTrailOpts );
      };
      this.loadkineticText = () => {
        this.TextKinetic.APPSET = new TextKinetic( TextKineticOpts );
      };
      this.loadPhysicText = () => {
        this.TextPhysic.APPSET = new TextPhysic( TextPhysicOpts );
      };
      this.onInitLoad();
      this.AppSettings = {
        'Text Mesh': () => {
            this.mainScene = null;
            this.destroyGUIs();
            //this.groups.push(this.group1);
            this.m = this.gui.addFolder(" SettingsMesh");
            this.onReloadEventListener();
            this.initMesh();
            this.switchDemo(0);
        },
        'Text Line': () => {
            this.mainScene = null;
            this.destroyGUIs();
            //this.groups.push(this.group1);
            this.l = this.gui.addFolder(" SettingsLine");
            this.onReloadEventListener();
            this.initLine();
            this.switchDemo(1);
        },
        'Text Shader': () => {
            this.mainScene = null;
            this.destroyGUIs();
            //this.groups.push(this.group1);
            //this.onRefreshScene1(this.scene);
            this.s = this.gui.addFolder(" SettingsShader");
            this.onReloadEventListener();
            this.initShader();
            this.switchDemo(2);
        },
        'Text Point': () => {
            this.mainScene = null;
            this.destroyGUIs();
            this.c = this.gui.addFolder(" SettingsPoint");
            this.onReloadEventListener();
            this.initPoint();
            this.switchDemo(3);
        },
        'Text Trail': () => {
            this.mainScene = null;
            this.destroyGUIs();
            this.t = this.gui.addFolder(" SettingsTrail");
            this.onReloadEventListener();
            this.initTrail();
            this.switchDemo(4);
            //this.onRefreshScene1();
        },
        'Text Kinetic': () => {
            this.mainScene = null;
            this.destroyGUIs();
            this.k = this.gui.addFolder(" SettingsKinetic");
            this.onReloadEventListener();
            this.initKinetic();
            this.switchDemo(5);
            //this.onRefreshScene1();
        },
        'Text Physic': () => {
            this.mainScene = null;
            this.destroyGUIs();
            this.p = this.gui.addFolder(" SettingsPhysic");
            this.onReloadEventListener();
            this.initPhysic();
            this.switchDemo(6);
            //this.onRefreshScene1();
        }
      };
    }

    /////////////////////////////////////////
    //**         LOAD SECTION            **//
    ////////////////////////////////////////

    async onInitLoad() {
      return new Promise(async (resolve, reject) => {
        try {
          const v = await this.loadShaders();
          const t = await this.loadTextures();
          if (v && t) {
            console.log("loaded successfully");
            resolve("loaded successfully");
          } else {
            console.log("failed to load.");
            resolve("failed to load.");
          }
        } catch (error) {
          console.error("Error loading shaders or textures:", error);
          reject("failed to load shaders or textures.");
        }
        this.settings();
        this.addGUI();
        //this.addGUISettings();
        //this.setupMaterials();
        resolve("fallback data loaded successfully");
      });
    }

    /////////////////////////////////////////
    //**         FALLBACK SECTION       **//
    ////////////////////////////////////////

    directfallbackShader() {
      //optional for redirect if loaded textures or shaders failed
      console.log("this is for testing");
    }

    directfallbackTexture() {
      //optional for redirect if loaded textures or shaders failed
      console.log("this is for testing");
    }

    directfallback404() {
      //optional for redirect if loaded textures or shaders failed
      console.log("this is for testing");
    }

    settings() {
      return;
    }

    // BIND RESIZE EVENT
    bindEvents() {
      window.addEventListener('resize', () => { this.onResize() })
    }

    // RESIZE
    onResize() {
      this.mainScene.scene.scale.set(1.0, 1.0, 1.0);
    }

    /////////////////////////////////////////
    //**          GUI SECTION           **//
    ////////////////////////////////////////

    // DESTROY PREVIOUSLY LOADED GUIs
    destroyGUIs() {
      if (this.m && this.m instanceof GUI) {this.gui.removeFolder(this.m);this.m=null;}
      if (this.l && this.l instanceof GUI) {this.gui.removeFolder(this.l);this.l=null;}
      if (this.s && this.s instanceof GUI) {this.gui.removeFolder(this.s);this.s=null;}
      if (this.c && this.c instanceof GUI) {this.gui.removeFolder(this.c);this.c=null;}
      if (this.t && this.t instanceof GUI) {this.gui.removeFolder(this.t);this.t=null;}
      if (this.k && this.k instanceof GUI) {this.gui.removeFolder(this.k);this.k=null;}
      if (this.p && this.p instanceof GUI) {this.gui.removeFolder(this.p);this.p=null;}
    }

    // ADD GUI FOR APP CONTROLS
    addGUI() {
      this.gui.add(this.AppSettings, 'Text Mesh');
      this.gui.add(this.AppSettings, 'Text Line');
      this.gui.add(this.AppSettings, 'Text Shader');
      this.gui.add(this.AppSettings, 'Text Point');
      this.gui.add(this.AppSettings, 'Text Trail');
      this.gui.add(this.AppSettings, 'Text Kinetic');
      this.gui.add(this.AppSettings, 'Text Physic');
      this.gui.open();
    }

    // MESH GUI
    addGUIMesh() {
      //this.t.add( this.setup[1], 'changeScene1' ).name( 'Trail Text' );
      this.m.show();
      this.m.open();
      //this.s.hide();
      //this.m.hide();
      //this.c.hide();
      //this.k.hide();
      //this.p.hide();
    }

    // LINE GUI
    addGUILine() {
      //this.t.add( this.setup[1], 'changeScene1' ).name( 'Trail Text' );
      this.l.show();
      this.l.open();
    }

    // SHADER GUI
    addGUIShader() {
      //this.t.add( this.setup[1], 'changeScene1' ).name( 'Trail Text' );
      this.s.show();
      this.s.open();
    }

    // POINT GUI
    addGUIPoint() {
      //this.t.add( this.setup[1], 'changeScene1' ).name( 'Trail Text' );
      this.c.show();
      this.c.open();
    }

    // TRAIL GUI
    addGUITrail() {
      //this.t.add( this.setup[1], 'changeScene1' ).name( 'Trail Text' );
      this.t.show();
      this.t.open();
      //this.s.hide();
      //this.m.hide();
      //this.c.hide();
      //this.k.hide();
      //this.p.hide();
    }

    // KINETIC GUI
    addGUIKinetic() {
      this.k.show();
      this.k.open();
    }

    // PHYSIC GUI
    addGUIPhysic() {
      this.p.show();
      this.p.open();
    }

    /////////////////////////////////////////
    //**          EVENT SECTION         **//
    ////////////////////////////////////////

    //REMOVE ALL PREVIOUSLY LOADED EVENTLISTENERS
    onReloadEventListener() {
      if (this.isTrueT(this.checkifExistEventListenerT(window))){this.removeAllEventListenersT(window)};
      if (this.isTrueT(this.checkifExistEventListenerT(document))){this.removeAllEventListenersT(document)};
      if (this.isTrueT(this.checkifExistEventListenerT(this.container))){this.removeAllEventListenersT(this.container)};
      if (this.isTrueT(this.checkifExistEventListenerT(this.container1))){this.removeAllEventListenersT(this.container1)};
      if (this.isTrueT(this.checkifExistEventListenerT(this.container2))){this.removeAllEventListenersT(this.container2)};
    }
    /*
    //ADD EVENTLISTENERS DYNAMICALLY
    onChangeEventListener(){
      if (this.isTextMesh) {
        console.log("this is loading");
        this.onReloadEventListener();
        this.addCustomEventListener(window, "resize", (e)=>this.onMeshShaderResize(e));
        this.addCustomEventListener(this.container, "pointerdown", (e)=>this.onPointerDown(e));
        this.addCustomEventListener(document, "keypress", (e)=>this.onDocumentKeyPress(e));
        this.addCustomEventListener(document, "keydown", (e)=>this.onDocumentKeyDown(e));} 
        else if (this.isTextShader) {this.onReloadEventListener();
        this.addCustomEventListener(window, "resize", this.onMeshShaderResize);} 
        else if (this.isTextPoint){this.onReloadEventListener();
        this.addCustomEventListener(window, "resize", this.onPointResize);} 
        else if (this.isTextTrail){this.onReloadEventListener();} 
        else if (this.isTextKinetic){this.onReloadEventListener();} 
        else if (this.isTextPhysic){this.onReloadEventListener();}
    }

    onRefreshScene1(scene){
      while(scene.children.length > 0){ 
        scene.children.forEach(function(c){
          scene.remove(c);
        });
      }
    }
    */

    /////////////////////////////////////////
    //**  LOAD SHADER/TEXTTURE SECTION  **//
    ////////////////////////////////////////

    //LOAD TEXTURE
    loadTexture = function(name , file) {
      this.TEXTURES[ name ] = this.textures.load(file);
      this.TEXTURES[ name ].wrapS = THREE.RepeatWrapping;
      this.TEXTURES[ name ].wrapT = THREE.RepeatWrapping;
    }

    //LOAD TEXTURES
    loadTextures = function() {
      for( var i = 0; i < this.texturesToLoad.length; i++ ){
        var t = this.texturesToLoad[i];
        this.loadTexture( t[0] , t[1] );
      }
    }

    //LOAD SHADERS
    loadShaders() {
      var f = '../../static/src/shaders/global/';
      // LINE MATERIAL
      this.shaders.load( f + 'vs-lineText' , 'lineText' , 'vs' );
      this.shaders.load( f + 'fs-lineText' , 'lineText' , 'fs' );
      // SHADER MATERIAL
      this.shaders.load( f + 'vs-shaderText' , 'shaderText' , 'vs' );
      this.shaders.load( f + 'fs-shaderText' , 'shaderText' , 'fs' );
      // MAT MATERIAL
      this.shaders.load( f + 'vs-matText' , 'matText' , 'vs' );
      this.shaders.load( f + 'fs-matText' , 'matText' , 'fs' );
      this.shaders.load( f + 'fs-matTextColor' , 'matTextColor' , 'fs');
      // MAT MATERIAL
      this.shaders.load( f + 'vs-soundText' , 'soundText' , 'vs' );
      this.shaders.load( f + 'fs-soundText' , 'soundText' , 'fs' );
      // TRAIL MATERIAL
      this.shaders.load( f + 'vs-baseVertex' , 'baseVertex' , 'vs' );
      this.shaders.load( f + 'fs-textFragment' , 'textFragment' , 'fs' );
      this.shaders.load( f + 'fs-persistenceFragment' , 'persistenceFragment' , 'fs' );
      // kinetic MATERIAL
      this.shaders.load( f + 'vs-kinetic_demo1' , 'kinetic_demo1', 'vs' );
      this.shaders.load( f + 'fs-kinetic_demo1' , 'kinetic_demo1', 'fs' );
      this.shaders.load( f + 'vs-kinetic_demo2' , 'kinetic_demo2', 'vs' );
      this.shaders.load( f + 'fs-kinetic_demo2' , 'kinetic_demo2', 'fs' );
      this.shaders.load( f + 'vs-kinetic_demo3' , 'kinetic_demo3', 'vs' );
      this.shaders.load( f + 'fs-kinetic_demo3' , 'kinetic_demo3', 'fs' );
      this.shaders.load( f + 'vs-kinetic_demo4' , 'kinetic_demo4', 'vs' );
      this.shaders.load( f + 'fs-kinetic_demo4' , 'kinetic_demo4', 'fs' );
    }  

    /////////////////////////////////////////
    //**          LOAD APP SECTION       **//
    //////////////////////////////////////// 

    // LOAD MESH TEXT APP
    initMesh() {
      this.isTextMesh = true;
      this.isTextLine = false;
      this.isTextShader = false;
      this.isTextPoint = false;
      this.isTextTrail = false;
      this.isTextKinetic = false;
      this.isTextPhysic = false;
      if (this.isTextMesh) {
        //this.onRefreshScene();
        this.onSwitchContainer();
        this.loadMeshText();
        this.mainScene = this.TextMesh.APPSET.scene;
        this.meshGUI = this.TextMesh.APPSET.addGUIMesh(this.m);
        if (this.meshGUI && this.meshGUI instanceof GUI) this.addGUIMesh();        
      }
    }

    // LOAD LINE TEXT APP
    initLine() {
      this.isTextMesh = false;
      this.isTextLine = true;
      this.isTextShader = false;
      this.isTextPoint = false;
      this.isTextTrail = false;
      this.isTextKinetic = false;
      this.isTextPhysic = false;
      if (this.isTextLine) {
        //this.onRefreshScene();
        this.onSwitchContainer();
        this.loadLineText();
        this.mainScene = this.TextLine.APPSET.scene;
        console.log('this app is loaded', this.TextLine.APPSET);
        console.log('this scene is loaded', this.mainScene);
        this.lineGUI = this.TextLine.APPSET.addGUILine(this.l);
        if (this.lineGUI && this.lineGUI instanceof GUI) this.addGUILine();        
      }
    }

    // LOAD SHADER TEXT APP
    initShader() {
      this.isTextMesh = false;
      this.isTextLine = false;
      this.isTextShader = true;
      this.isTextPoint = false;
      this.isTextTrail = false;
      this.isTextKinetic = false;
      this.isTextPhysic = false;
      if (this.isTextShader) {
        //this.onRefreshScene();
        this.loadShaderText();
        this.mainScene = this.TextShader.APPSET.scene;
        this.shaderGUI = this.TextShader.APPSET.addGUIShader(this.s);
        if (this.shaderGUI && this.shaderGUI instanceof GUI) this.addGUIShader();        
      }
    }

    // LOAD POINT TEXT APP
    initPoint() {
      this.isTextMesh = false;
      this.isTextLine = false;
      this.isTextShader = false;
      this.isTextPoint = true;
      this.isTextTrail = false;
      this.isTextKinetic = false;
      this.isTextPhysic = false;
      if (this.isTextPoint) {
        //this.onRefreshScene();
        this.loadPointText();
        this.mainScene = this.TextPoint.APPSET.scene;
        this.pointGUI = this.TextPoint.APPSET.addGUIPoint(this.c);
        if (this.pointGUI && this.pointGUI instanceof GUI) this.addGUIPoint();
      }         
    }

    // LOAD TRAIL TEXT APP
    initTrail() {
      this.isTextMesh = false;
      this.isTextLine = false;
      this.isTextShader = false;
      this.isTextPoint = false;
      this.isTextTrail = true;
      this.isTextKinetic = false;
      this.isTextPhysic = false;
      if (this.isTextTrail) {
        //this.onRefreshScene();
        this.onSwitchContainer();
        this.loadTrailText();
        this.mainScene = this.TextTrail.APPSET.scene;
        this.trailGUI = this.TextTrail.APPSET.addGUITrail(this.t);
        if (this.trailGUI && this.trailGUI instanceof GUI) this.addGUITrail();
        //this.onrefreshTextTrail();
      }         
    }

    // LOAD KINETIC TEXT APP
    initKinetic() {
      this.isTextMesh = false;
      this.isTextLine = false;
      this.isTextShader = false;
      this.isTextPoint = false;
      this.isTextTrail = false;
      this.isTextKinetic = true;
      this.isTextPhysic = false;
      if (this.isTextKinetic) {
        this.onSwitchContainer();
        this.loadkineticText();
        this.mainScene = this.TextKinetic.APPSET.scene;
        this.kineticGUI = this.TextKinetic.APPSET.addGUIKinetic(this.k);
        if (this.kineticGUI && this.kineticGUI instanceof GUI) this.addGUIKinetic();
      }         
    }

    // LOAD PHYSIC TEXT APP
    initPhysic() {
      this.isTextMesh = false;
      this.isTextLine = false;
      this.isTextShader = false;
      this.isTextPoint = false;
      this.isTextTrail = false;
      this.isTextKinetic = false;
      this.isTextPhysic = true;
      if (this.isTextPhysic) {
        //this.onRefreshScene();
        this.onSwitchContainer();
        this.loadPhysicText();
        this.mainScene = this.TextPhysic.APPSET.mainScene;
        this.physicGUI = this.TextPhysic.APPSET.addGUIPhysic(this.p);
        if (this.physicGUI && this.physicGUI instanceof GUI) this.addGUIPhysic();
      }         
    }

    // ON CHANGE CONTAINER
    onSwitchContainer() {
      if(this.isTextMesh){
        this.removeAudioHtml();
        this.container.style.display = 'block';
        this.container1.style.display = 'none';
        this.container2.style.display = 'none';
      }else if (this.isTextLine){
        this.removeAudioHtml();
        this.container.style.display = 'block';
        this.container1.style.display = 'none';
        this.container2.style.display = 'none';
      }else if (this.isTextShader){
        this.removeAudioHtml();
        this.container.style.display = 'block';
        this.container1.style.display = 'none';
        this.container2.style.display = 'none';
      }else if(this.isTextPoint){
        this.removeAudioHtml();
        this.container.style.display = 'block';
        this.container1.style.display = 'none';
        this.container2.style.display = 'none';
      }else if(this.isTextTrail){
        this.removeAudioHtml();
        this.container.style.display = 'none';
        this.container1.style.display = 'block';
        this.container2.style.display = 'none';
      }else if(this.isTextKinetic){
        this.removeAudioHtml();
        this.container.style.display = 'none';
        this.container1.style.display = 'none';
        this.container2.style.display = 'block';
      }else if(this.isTextPhysic){
        this.removeAudioHtml();
        this.container.style.display = 'block';
        this.container1.style.display = 'none';
        this.container2.style.display = 'none';
      }
    }

    // REMOVE HTML
    removeAudioHtml() { 
      const audioElement = document.getElementById('audio-container');
      const startButton = document.getElementById('startButton');
      if (audioElement) audioElement.parentNode.removeChild(audioElement);
    }

    // SWITCH EFFECTS
    switchDemo(index) {
      this.elems.forEach(el => el.classList.remove('frame__demo--current'));
      this.elems[index].classList.add('frame__demo--current');
      this.prev = this.current;
      this.current = index;
      if (this.prev === this.current) return;
      this.turn = (2 * Math.PI);
      if (this.mainScene) {
        gsap.timeline({
          onStart: () => {
            document.body.classList.add(this.demoList.class[index] || ''); // Add a fallback for class
            document.body.classList.add(this.demoList.class[index]);
          }
        })
        .to(this.mainScene.rotation, {
          duration: 1.5,
          ease: "expo.inOut",
          y: `+=${this.turn}`,
        });
      }
    }

    /* depreciated
    onLoadFont() {      
      //document.body.classList.add("loading");
      return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load('fonts/' + this.settings.text1.fontName + '_' + this.settings.text1.fontWeight + '.typeface.json', (response) => {
          this.font = response;
          //if (this.font) document.body.classList.remove("loading");
          setTimeout(() => {
            if (this.isTextMesh) this.onRefreshTextMesh();
            if (this.isTextShader) this.onRefreshTextShader();
            if (this.isTextPoint) this.onRefreshTextPoint();
            resolve(/* pass any result or data here );
          }, 10000); // Simulate a 2-second delay
        });
      });
    }*/
}

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS TextMesh****************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize TextMesh
 * @class TextMesh
 * @param options 
*/
class TextMesh{
  constructor(options) {
    this.options = options;
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.clock = new THREE.Clock();
    this.last = performance.now();
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    this.defaultOptions = { 
      camera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 ),
      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      gui: new GUI(),
      index: 0
    };
    this.palette = {
      color1: '#FF0000', // CSS string
      color2: [ 0, 128, 255 ], // RGB array
      color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
      color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
    };
    this.fontWeight = "bold";
    this.group = new THREE.Group();
    this.isRotating = false;
    this.mirror = true;
    this.font = undefined;
    this.fontMap = {
        'helvetiker': 0,
        'optimer': 1,
        'gentilis': 2,
        'droid/droid_sans': 3,
        'droid/droid_serif': 4

    };
    this.firstLetter = true;
    this.bevelEnabled = true;
    this.fontDefault = undefined;
    this.weightMap = {
        'regular': 0,
        'bold': 1
    };
    this.reverseFontMap = [];
    this.reverseWeightMap = [];
    for ( const i in this.fontMap ) this.reverseFontMap[ this.fontMap[ i ] ] = i;
    for ( const i in this.weightMap ) this.reverseWeightMap[ this.weightMap[ i ] ] = i;
    this.targetRotation = 0;
    this.targetRotationOnPointerDown = 0;
    this.pointerX = 0;
    this.pointerXOnPointerDown = 0;
    this.windowHalfX = window.innerWidth/ 2;
    this.fontIndex = 1;
    this.textMesh1;
    this.textMesh2;
    this.textGeo;
    this.BOUNDS = 800, this.BOUNDS_HALF = this.BOUNDS/2;
    this.audioPlaying = false;
    this.audioStartTime = 0;
    this.settings();
    this.setupMaterials();
    this.init();
    this.addEventListeners();
    this.addGUISettings();
    this.animate();
  }

  // APP SETTINGS
  settings() {
    let that = this;
    this.settings = {
      text: {
        title: "OmniBus",
        bevelEnabled: this.bevelEnabled,
        fontName: 'optimer',
        // helvetiker, optimer, gentilis, droid sans, droid serif
        fontWeight: 'bold',
        height: 20,
        size: 70,
        hover: 30,
        curveSegments:4,
        bevelThickness: 2,
        bevelSize: 1.5,
      }
    }
  }

  // SETUP MATERIALS
  setupMaterials() {
    // MATERIAL
    this.materials = [
      new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
      new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
    ];
  }

  // INIT APP
  init() {
    //SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
    this.scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
    // CAMERA
    this.camera = new THREE.PerspectiveCamera( 30, this.containerWidth/ this.containerHeight, 1, 1500 );
    this.camera.position.set( 0, 400, 700 );
    this.cameraTarget = new THREE.Vector3( 0, 50, 0 );
    this.camera.lookAt(this.cameraTarget);
    //DIR LIGHT
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );
    //POINT LIGHT
    this.pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
    this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    this.pointLight.position.set( 0, 100, 90 );
    this.scene.add( this.pointLight );
    // PLANE
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry( 10000, 10000 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
    );
    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
    this.scene.add(plane);
    // LOAD FONT
    this.onLoadFont()
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
    //RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x222222);
    this.renderer.setClearAlpha(0);
    this.renderer.setSize( this.containerWidth, this.containerHeight );
    this.container.appendChild( this.renderer.domElement );
    //GROUP
    this.scene.add( this.group );
    document.addEventListener("DOMContentLoaded", function () {document.body.classList.remove("loading");});
  }

  //ADD EVENT LISTENER
  addEventListeners() {
    this.addCustomEventListenerT(window, "resize", (e)=>this.onResize(e));
    this.addCustomEventListenerT(this.container, "pointerdown", (e)=>this.onPointerDown(e));
    this.addCustomEventListenerT(document, "keypress", (e)=>this.onDocumentKeyPress(e));
    this.addCustomEventListenerT(document, "keydown", (e)=>this.onDocumentKeyDown(e)); 
  }

  // RESIZE
  onResize() {
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.containerWidth, this.containerHeight);
  }

  // GUI
  addGUIMesh(gui) {
    //this.m.add( this.setup[0], 'changeColor' ).name( 'change color' );
    gui.addColor(this.palette, 'color1').name('Change Color').onChange((val) => {
    //this.pointLight.color.setHSL(val, 1, 0.5);
    //this.pointLight = new THREE.PointLight( val, 4.5, 0, 0 );
    var color = new THREE.Color(val);
    this.pointLight.color.copy(color);
    });
    gui.add(this.setup, 'changeFont').name('change font');
    gui.add(this.setup, 'changeWeight').name('change weight');
    gui.add(this.setup, 'changeBevel').name('change bevel');
    gui.add(this.setup, 'rotateText').name('rotate text');
    return gui;
  }

  // GUI SETTINGS
  addGUISettings() {
    this.setup = {
      //changeColor: (val) => {
        //this.pointLight.color.setHSL(Math.random(), 1, 0.5);
        //this.pointLight = new THREE.PointLight( val, 4.5, 0, 0 ); 
      //},
      changeFont: () => {
        this.fontIndex++;
        this.settings.text.fontName = this.reverseFontMap[this.fontIndex % this.reverseFontMap.length];
        this.onLoadFont();
      },
      changeWeight: () => {
        this.fontWeight = this.fontWeight === 'bold' ? 'regular' : 'bold';
        this.settings.text.fontWeight = this.fontWeight; 
        this.onLoadFont();
      },
      changeBevel: () => {
        this.bevelEnabled = !this.bevelEnabled;
        this.settings.text.bevelEnabled = this.bevelEnabled; 
        this.onRefreshTextMesh();
      },
      rotateText: () => {
        this.isRotating = !this.isRotating;
        this.rotateText();
      }
    };
  }

  //LOAD FONT
  onLoadFont() {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('../../static/src/fonts/' + this.settings.text.fontName + '_' + this.settings.text.fontWeight + '.typeface.json', 
        (font) => {
          this.onFontLoaded();
          this.font = font;
          this.onRefreshTextMesh();
          resolve('Font loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onFontLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
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

  /*depreciated
  //LOAD FONT
    onLoadFont() {      
    //document.body.classList.add("loading");
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('fonts/' + this.settings.text1.fontName + '_' + this.settings.text1.fontWeight + '.typeface.json', (response) => {
        this.font = response;
        //if (this.font) document.body.classList.remove("loading");
        setTimeout(() => {
          if (this.isTextMesh) this.onRefreshTextMesh();
          if (this.isTextShader) this.onRefreshTextShader();
          if (this.isTextPoint) this.onRefreshTextPoint();
          resolve(pass any result or data here );
        }, 10000); // Simulate a 2-second delay
      });
    });
  }*/

  // CREATE TEXT MESH
  createTextMesh(config) {
    this.textGeo = new TextGeometry(config.title, {
      font: this.font,
      size: config.size,
      height: config.height,
      curveSegments: config.curveSegments,
      bevelThickness: config.bevelThickness,
      bevelSize: config.bevelSize,
      bevelEnabled: config.bevelEnabled
    });
    this.textGeo.computeBoundingBox();
    const centerOffset = - 0.5 * (this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x);
    this.textMesh1 = new THREE.Mesh(this.textGeo, this.materials);
    this.textMesh1.position.x = centerOffset;
    this.textMesh1.position.y = this.settings.text.hover;
    this.textMesh1.position.z = 0;
    this.textMesh1.rotation.x = 0;
    this.textMesh1.rotation.y = Math.PI * 2;
    this.group.add(this.textMesh1);
    if (this.mirror) {
      this.textMesh2 = new THREE.Mesh(this.textGeo, this.materials);
      this.textMesh2.position.x = centerOffset;
      this.textMesh2.position.y = - this.settings.text.hover;
      this.textMesh2.position.z = this.settings.text.height;
      this.textMesh2.rotation.x = Math.PI;
      this.textMesh2.rotation.y = Math.PI * 2;
      this.group.add(this.textMesh2);
    }
  }
  
  // REFRESH TEXT MESH
  onRefreshTextMesh() {
    this.group.remove(this.textMesh1);
    if ( this.mirror ) this.group.remove(this.textMesh2);
    if (!this.settings.text.title) return;
    this.createTextMesh(this.settings.text);
  }

  // RENDER TEXT MESH
  renderMesh(scene, camera, renderer) {
    this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05;
    camera.lookAt(this.cameraTarget);
    renderer.clear();
    renderer.render(scene, camera);
  }

  // ANIMATE TEXT MESH
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderMesh(this.scene, this.camera, this.renderer);
  }

  // ROTATE TEXT MESH
  rotateText() {
    if (this.isTrueT(this.isRotating)){
      this.targetRotation += Math.PI * 2; // Rotate 360 degrees (2 * Math.PI)
      this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05;
    }
  }

  // EVENT KEYDOWN
  onDocumentKeyDown(e) {
    if (this.firstLetter) {
      this.firstLetter = false;
      this.settings.text.title = '';
    }
    const keyCode = e.keyCode;
    // backspace
    if (keyCode == 8) {
      e.preventDefault();
      this.settings.text.title = this.settings.text.title.substring(0, this.settings.text.title.length - 1);
      this.onRefreshTextMesh();
      return false;
    }
  }

  // EVENT KEYPRESS
  onDocumentKeyPress(e) {
    const keyCode = e.which;
    // backspace
    if (keyCode == 8) {
      e.preventDefault();
    }else{
      const ch = String.fromCharCode( keyCode );
      console.log("this.settings", this.settings);
      this.settings.text.title += ch;
      this.onRefreshTextMesh();
    }
  }

  // EVENT KEYDOWN
  onPointerDown(e) {
    if (e.isPrimary === false) return;
    this.pointerXOnPointerDown = e.clientX - this.windowHalfX; 
    this.targetRotationOnPointerDown = this.targetRotation;
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  // EVENT POINTERMOVE
  onPointerMove(e) {
    if (e.isPrimary === false) return;
    this.pointerX = e.clientX - this.windowHalfX;
    this.targetRotation = this.targetRotationOnPointerDown + (this.pointerX - this.pointerXOnPointerDown) * 0.02;
  }

  // EVENT POINTERUP
  onPointerUp(e) {
    if (e.isPrimary === false) return;
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

}

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS TextLine****************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize TextLine
 * @class TextLine
 * @param options 
*/
class TextLine{
  constructor(options) {
    this.options = options;
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.clock = new THREE.Clock();
    this.last = performance.now();
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    this.defaultOptions = { 
      camera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 ),
      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      gui: new GUI(),
      index: 0
    };
    this.palette = {
      color1: '#FF0000', // CSS string
      color2: [ 0, 128, 255 ], // RGB array
      color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
      color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
    };
    this.fontWeight = "bold";
    this.group = new THREE.Group();
    this.isRotating = false;
    this.mirror = true;
    this.font = undefined;
    this.fontMap = {
        'helvetiker': 0,
        'optimer': 1,
        'gentilis': 2,
        'droid/droid_sans': 3,
        'droid/droid_serif': 4

    };
    this.firstLetter = true;
    this.bevelEnabled = true;
    this.fontDefault = undefined;
    this.weightMap = {
        'regular': 0,
        'bold': 1
    };
    this.reverseFontMap = [];
    this.reverseWeightMap = [];
    for ( const i in this.fontMap ) this.reverseFontMap[ this.fontMap[ i ] ] = i;
    for ( const i in this.weightMap ) this.reverseWeightMap[ this.weightMap[ i ] ] = i;
    this.targetRotation = 0;
    this.targetRotationOnPointerDown = 0;
    this.pointerX = 0;
    this.pointerXOnPointerDown = 0;
    this.windowHalfX = window.innerWidth/ 2;
    this.textGeo;
    this.fontIndex = 1;
    this.textLine1;
    this.textLine2;
    this.textClone;
    this.BOUNDS = 800, this.BOUNDS_HALF = this.BOUNDS/2;
    this.settings();
    this.setupMaterials();
    this.init();
    this.addEventListeners();
    this.addGUISettings();
    this.animate();
  }

  // APP SETTINGS
  settings() {
    let that = this;
    this.settings = {
      text: {
        title: "OmniBus",
        bevelEnabled: this.bevelEnabled,
        fontName: 'optimer',
        // helvetiker, optimer, gentilis, droid sans, droid serif
        fontWeight: 'bold',
        height: 20,
        size: 70,
        hover: 30,
        curveSegments:4,
        bevelThickness: 2,
        bevelSize: 1.5,
        uniforms: {
          emissiveColor: { value: new THREE.Color(0xff0000) },
          amplitude: { value: 5.0 },
          opacity: { value: 0.3 },
          color: { value: new THREE.Color( 0xffffff ) }
        }
      }
    }
  }

  // SETUP MATERIALS
  setupMaterials() {
    // MATERIAL
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.settings.text.uniforms,
      vertexShader: T.shaders.vs.lineText, 
      fragmentShader: T.shaders.fs.lineText,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
  }

  // INIT APP
  init() {
    //SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
    this.scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
    // CAMERA
    this.camera = new THREE.PerspectiveCamera( 30, this.containerWidth/ this.containerHeight, 1, 1500 );
    this.camera.position.set( 0, 400, 700 );
    this.cameraTarget = new THREE.Vector3( 0, 50, 0 );
    this.camera.lookAt(this.cameraTarget);
    //DIR LIGHT
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );
    //POINT LIGHT
    this.pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
    this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    this.pointLight.position.set( 0, 100, 90 );
    this.scene.add( this.pointLight );
    // PLANE
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry( 10000, 10000 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
    );
    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
    this.scene.add(plane);
    // LOAD FONT
    this.onLoadFont()
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
    //RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x222222);
    this.renderer.setClearAlpha(0);
    this.renderer.setSize( this.containerWidth, this.containerHeight );
    this.container.appendChild( this.renderer.domElement );
    //GROUP
    this.scene.add( this.group );
    document.addEventListener("DOMContentLoaded", function () {document.body.classList.remove("loading");});
  }

  //ADD EVENT LISTENER
  addEventListeners() {
    this.addCustomEventListenerT(window, "resize", (e)=>this.onResize(e));
    this.addCustomEventListenerT(this.container, "pointerdown", (e)=>this.onPointerDown(e));
    this.addCustomEventListenerT(document, "keypress", (e)=>this.onDocumentKeyPress(e));
    this.addCustomEventListenerT(document, "keydown", (e)=>this.onDocumentKeyDown(e)); 
  }

  // RESIZE
  onResize() {
    this.camera.aspect = window.innerWidth  / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // GUI
  addGUILine(gui) {
    //this.m.add( this.setup[0], 'changeColor' ).name( 'change color' );
    gui.addColor(this.palette, 'color1').name('Change Color').onChange((val) => {
    //this.pointLight.color.setHSL(val, 1, 0.5);
    //this.pointLight = new THREE.PointLight( val, 4.5, 0, 0 );
    var color = new THREE.Color(val);
    this.pointLight.color.copy(color);
    });
    gui.add(this.setup, 'changeFont').name('change font');
    gui.add(this.setup, 'changeWeight').name('change weight');
    gui.add(this.setup, 'changeBevel').name('change bevel');
    //gui.add(this.setup, 'rotateText').name('rotate text');
    return gui;
  }

  // GUI SETTINGS
  addGUISettings() {
    this.setup = {
      //changeColor: (val) => {
        //this.pointLight.color.setHSL(Math.random(), 1, 0.5);
        //this.pointLight = new THREE.PointLight( val, 4.5, 0, 0 ); 
      //},
      changeFont: () => {
        this.fontIndex++;
        this.settings.text.fontName = this.reverseFontMap[this.fontIndex % this.reverseFontMap.length];
        this.onLoadFont();
      },
      changeWeight: () => {
        this.fontWeight = this.fontWeight === 'bold' ? 'regular' : 'bold';
        this.settings.text.fontWeight = this.fontWeight; 
        this.onLoadFont();
      },
      changeBevel: () => {
        this.bevelEnabled = !this.bevelEnabled;
        this.settings.text.bevelEnabled = this.bevelEnabled; 
        this.onRefreshTextLine();
      },
      rotateText: () => {
        this.isRotating = !this.isRotating;
        this.rotateText();
      }
    };
  }

  //LOAD FONT
  onLoadFont() {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('../../static/src/fonts/' + this.settings.text.fontName + '_' + this.settings.text.fontWeight + '.typeface.json', 
        (font) => {
          this.onFontLoaded();
          this.font = font;
          this.onRefreshTextLine();
          resolve('Font loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onFontLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
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

  /*depreciated
  //LOAD FONT
    onLoadFont() {      
    //document.body.classList.add("loading");
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('fonts/' + this.settings.text1.fontName + '_' + this.settings.text1.fontWeight + '.typeface.json', (response) => {
        this.font = response;
        //if (this.font) document.body.classList.remove("loading");
        setTimeout(() => {
          if (this.isTextMesh) this.onRefreshTextMesh();
          if (this.isTextShader) this.onRefreshTextShader();
          if (this.isTextPoint) this.onRefreshTextPoint();
          resolve(pass any result or data here );
        }, 10000); // Simulate a 2-second delay
      });
    });
  }*/

  // CREATE TEXT LINE
  createTextLine(config) {
    this.textGeo = new TextGeometry(config.title, {
      font: this.font,
      size: config.size,
      height: config.height,
      curveSegments: config.curveSegments,
      bevelThickness: config.bevelThickness,
      bevelSize: config.bevelSize,
      bevelEnabled: config.bevelEnabled
    });
    this.textGeo.computeBoundingBox();
    const centerOffset = - 0.5 * (this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x);
    const count = this.textGeo.attributes.position.count;
    const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
    this.textGeo.setAttribute( 'displacement', displacement );
    const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
    this.textGeo.setAttribute( 'customColor', customColor );
    const color = new THREE.Color( 0xffffff );
    for ( let i = 0, l = customColor.count; i < l; i ++ ) {
        color.setHSL( i / l, 0.5, 0.5 );
        color.toArray( customColor.array, i * customColor.itemSize );
    }
    //line.rotation.x = 0.2;
    this.textLine1 = new THREE.Line(this.textGeo, this.shaderMaterial);
    this.textLine1.position.x = centerOffset;
    this.textLine1.position.y = this.settings.text.hover;
    this.textLine1.position.z = 0;
    this.textLine1.rotation.x = 0;
    this.textLine1.rotation.y = Math.PI * 2;
    this.textClone = this.textLine1;
    this.group.add(this.textLine1);
    if (this.mirror) {
      this.textLine2 = new THREE.Line(this.textGeo, this.shaderMaterial);
      this.textLine2.position.x = centerOffset;
      this.textLine2.position.y = - this.settings.text.hover;
      this.textLine2.position.z = this.settings.text.height;
      this.textLine2.rotation.x = Math.PI;
      this.textLine2.rotation.y = Math.PI * 2;
      this.group.add(this.textLine2);
    }
  }

  // REFRESH TEXT LINE
  onRefreshTextLine() {
    this.group.remove(this.textLine1);
    if (this.mirror) this.group.remove(this.textLine2);
    if (!this.settings.text.title) return;
    this.createTextLine(this.settings.text);
  }

  // RENDER TEXT LINE
  renderLine(scene, camera, renderer) {
    if (this.group.children.length > 0) {
      this.group.children.forEach((child) => {
        const time = Date.now() * 0.001;
        // Assuming `lineGeo` is part of each child, adjust accordingly
        // child.rotation.y = 0.25 * time;
        this.settings.text.uniforms.amplitude.value = Math.sin(0.5 * time);
        this.settings.text.uniforms.color.value.offsetHSL(0.0005, 0, 0);
        const attributes = child.geometry.attributes;
        const array = attributes.displacement.array;
        for (let i = 0, l = array.length; i < l; i += 3) {
          array[i] += 0.3 * (0.5 - Math.random());
          array[i + 1] += 0.3 * (0.5 - Math.random());
          array[i + 2] += 0.3 * (0.5 - Math.random());
        }
        attributes.displacement.needsUpdate = true;
        child.rotation.y += (this.targetRotation - child.rotation.y) * 0.05;
        camera.lookAt(this.cameraTarget);
        renderer.render(scene, camera);
      });
    }
  }

  // ANIMATE TEXT MESH
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderLine(this.scene, this.camera, this.renderer);
  }

  // ROTATE TEXT MESH
  rotateText() {
    if (this.isTrueT(this.isRotating)){
      this.targetRotation += Math.PI * 2; // Rotate 360 degrees (2 * Math.PI)
      this.group.rotation.y += (this.targetRotation - this.group.rotation.y) * 0.05;
    }
  }

  // EVENT KEYDOWN
  onDocumentKeyDown(e) {
    if (this.firstLetter) {
      this.firstLetter = false;
      this.settings.text.title = '';
    }
    const keyCode = e.keyCode;
    // backspace
    if (keyCode == 8) {
      e.preventDefault();
      this.settings.text.title = this.settings.text.title.substring(0, this.settings.text.title.length - 1);
      this.onRefreshTextLine();
      return false;
    }
  }

  // EVENT KEYPRESS
  onDocumentKeyPress(e) {
    const keyCode = e.which;
    // backspace
    if (keyCode == 8) {
      e.preventDefault();
    }else{
      const ch = String.fromCharCode( keyCode );
      console.log("this.settings", this.settings);
      this.settings.text.title += ch;
      this.onRefreshTextLine();
    }
  }

  // EVENT KEYDOWN
  onPointerDown(e) {
    if (e.isPrimary === false) return;
    this.pointerXOnPointerDown = e.clientX - this.windowHalfX; 
    this.targetRotationOnPointerDown = this.targetRotation;
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  // EVENT POINTERMOVE
  onPointerMove(e) {
    if (e.isPrimary === false) return;
    this.pointerX = e.clientX - this.windowHalfX;
    this.targetRotation = this.targetRotationOnPointerDown + (this.pointerX - this.pointerXOnPointerDown) * 0.02;
  }

  // EVENT POINTERUP
  onPointerUp(e) {
    if (e.isPrimary === false) return;
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

}


///////////////////////////////////////////////////////////////////////////////
//********************************CLASS TextShader***************************//                               
//////////////////////////////////////////////////////////////////////////////

/**
 * call this class to initialize TextShader
 * @class TextShader
 * @param options 
*/
class TextShader{
  constructor(options) {
    this.options = options;
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.maxT = max.bind(this);
    this.avgT = avg.bind(this);
    this.fractionateT = fractionate.bind(this);
    this.modulateT = modulate.bind(this);
    this.clock = new THREE.Clock();
    this.last = performance.now();
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.aspect = this.containerWidth/ this.containerHeight;
    this.defaultOptions = { 
      camera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 ),
      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      gui: new GUI(),
      index: 0
    };
    this.palette = {
      color1: '#FF0000', // CSS string
      color2: [ 0, 128, 255 ], // RGB array
      color3: [ 0, 128, 255, 0.3 ], // RGB with alpha
      color4: { h: 350, s: 0.9, v: 0.3 } // Hue, saturation, value
    };
    this.fontWeight = "bold";
    this.group = new THREE.Group();
    this.isRotating = false;
    this.mirror = true;
    this.font = undefined;
    this.fontMap = {
        'helvetiker': 0,
        'optimer': 1,
        'gentilis': 2,
        'droid/droid_sans': 3,
        'droid/droid_serif': 4

    };
    this.soundIds = {
      'song': {},
      'skullbeatz': {},
      'utopia': {}
    };
    this.firstLetter = true;
    this.bevelEnabled = true;
    this.fontDefault = undefined;
    this.weightMap = {
        'regular': 0,
        'bold': 1
    };
    this.reverseFontMap = [];
    this.reverseWeightMap = [];
    for (const i in this.fontMap) this.reverseFontMap[this.fontMap[ i ]] = i;
    for (const i in this.weightMap) this.reverseWeightMap[this.weightMap[ i ]] = i;
    this.targetRotation = 0;
    this.targetRotationOnPointerDown = 0;
    this.pointerX = 0;
    this.pointerXOnPointerDown = 0;
    this.windowHalfX = window.innerWidth/ 2;
    this.fontIndex = 1;
    this.matShader;
    this.material;
    this.textMesh1;
    this.textMesh2;
    this.meshGeo1 = [];
    this.meshGeo2 = [];
    this.textGeo;
    this.progress = 0;
    this.sound;
    this.BOUNDS = 800, this.BOUNDS_HALF = this.BOUNDS/2;
    this.$audioEl;
    this.auW;
    this.auH;
    this.$startButton;
    this.audioScene;
    this.audioCamera;
    this.audioRenderer;
    this.defaultSoundURL = '../../static/src/assets/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg';
    this.isAudioEnabled = true;
    this.analyser; 
    this.dataArray;
    this.audioUniforms;
    this.listener;
    this.audioElement;
    this.audio;
    this.sound;
    this.oscillator;
    this.audioGroup = new THREE.Group();
    this.noise = new SimplexNoise();
    this.settings();
    this.setupMaterials();
    this.init();
    this.addEventListeners();
    this.addGUISettings();
    this.onInitAudio();
    this.onInitAnimate();
  }

  // APP SETTINGS
  settings () {
    let that = this;
    this.settings = {
      text: {
        title: "OmniBus",
        bevelEnabled: this.bevelEnabled,
        fontName: 'optimer',
        // helvetiker, optimer, gentilis, droid sans, droid serif
        fontWeight: 'bold',
        height: 20,
        size: 70,
        hover: 30,
        curveSegments:4,
        bevelThickness: 2,
        bevelSize: 1.5,
        delay: 400,
        spaceBetween: 10,
        uniforms: {
          emissiveColor: { value: new THREE.Color(0xff0000) },
          amplitude: { value: 5.0 },
          opacity: { value: 0.3 },
          color: { value: new THREE.Color( 0xffffff ) }
        }
      },
      sound: {
        enable: this.isAudioEnabled,
        fullscreen: false,
        showButton: true,
        backgroundmusic: this.defaultSoundURL,
        fftSize: 128,
        loop: true,
        volume: 0.5,
        controls:[],
        soundList:{
          song: document.getElementById('song'),
          skullbeatz: document.getElementById('skullbeatz'),
          utopia: document.getElementById('utopia')
        },
        soundTrackList: {
          song: '../../static/src/assets/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3',
          skullbeatz: '../../static/src/assets/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3',
          utopia: '../../static/src/assets/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3',
        },      
      }
    }
  }

  // LOAD MATERIALS
  setupMaterials() {
    console.log("this mat", this.matShader);
  }

  // INIT APP
  init() {
    //SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
    //this.scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
    // CAMERA
    this.camera = new THREE.PerspectiveCamera( 30, this.containerWidth/ this.containerHeight, 1, 1500 );
    this.camera.position.set( 0, 400, 700 );
    this.cameraTarget = new THREE.Vector3( 0, 50, 0 );
    this.camera.lookAt(this.cameraTarget);
    //DIR LIGHT
    const dirLight = new THREE.DirectionalLight( 0xffffff, 10 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );
    //const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    //this.scene.add(directionalLightHelper);
    //AMBIENT LIGHT
    const ambientLight = new THREE.AmbientLight( 0x404040, 10 ); // soft white light
    this.scene.add( ambientLight );
    //POINT LIGHT
    this.pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
    this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    this.pointLight.position.set( 0, 100, 90 );
    this.scene.add( this.pointLight );
    // LOAD FONT
    this.onLoadFont()
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
    this.mat = new THREE.MeshPhongMaterial({
      map: T.TEXTURES[ 'mat_text' ],
      side: THREE.DoubleSide,
      shininess: 69,
      vertexColors: true, 
      glslVersion: THREE.GLSL3,
    });
    this.mat.onBeforeCompile = (shader) => {
      shader.uniforms.progress = { value: 0 };
      shader.uniforms.uMin = {  
        value: { x: -1, y: 0, z: 0 },
       };
       shader.uniforms.color = {  
        value: { value: new THREE.Color( 0xffffff ) },
       };
      shader.uniforms.uMax = {  
        value: { x: -1, y: 0, z: 0 },
       };
      shader.vertexShader = T.shaders.vs.matText + shader.vertexShader;
      const token_1 = "#include <begin_vertex>";
      const token_2 = "#include <begin_fragment>";
      // vertex shader info using https://en.wikipedia.org/wiki/Gaussian_function to map curve.
      const progress = T.shaders.fs.matText;
      const color = T.shaders.fs.matTextColor;
      shader.fragmentShader = shader.fragmentShader.replace(token_2, color); 
      shader.vertexShader = shader.vertexShader.replace(token_1, progress);
      this.matShader = shader;
    };
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.settings.text.uniforms,
      vertexShader: T.shaders.vs.shaderText, 
      fragmentShader: T.shaders.fs.shaderText,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
    //RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x222222);
    this.renderer.setClearAlpha(0);
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.container.appendChild(this.renderer.domElement);
    //GROUP
    this.scene.add( this.group );
    this.group.position.x = -260;
    this.group.position.y = -80;
    //PSEUDO BUTTONS
    this.createButton();
    document.addEventListener("DOMContentLoaded", function () {document.body.classList.remove("loading");});
  }

  //ADD EVENT LISTENER
  addEventListeners() {
    this.addCustomEventListenerT(window, "resize", (e)=>this.onResize(e));
  }

  // RESIZE
  onResize() {
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.containerWidth, this.containerHeight );
  }

  // GUI
  addGUIShader(gui) {
    //this.m.add( this.setup[0], 'changeColor' ).name( 'change color' );
    /* Text Control */
    this.tex = gui.addFolder('Text Controls');
    this.tex.add(this.setup, 'changeFont').name('change font');
    this.tex.add(this.setup, 'changeWeight').name('change weight');
    this.tex.add(this.setup, 'changeBevel').name('change bevel');
    this.tex.add(this.setup, 'rotateText').name('rotate text');
    this.tex.add(this.setup, 'switchMat').name('mat material');
    this.tex.add(this.setup, 'switchShader').name('shader material');
    this.tex.add(this.setup, 'swirlDisappear').name('disappear text');
    this.tex.add(this.setup, 'swirlAppear').name('appear text');
    this.tex.open();
    /* Sound Control */
    this.sou = gui.addFolder('Sound Controls');
    this.sou.add(this.settings.sound, 'enable').name('enable sound').onChange((val)=> {
      this.settings.sound.enable = val;
      this.addEvent(this.audioElement);
    });
    this.sou.add(this.settings.sound, 'showButton').name('toggle button').onChange((val)=> {
      this.settings.sound.showButton = val;
      this.setup.toggleButton();
    });
    this.sou.add(this.settings.sound, 'fullscreen').name('toogle screen').onChange((val)=> {
      this.isFullScreen = val;
      this.setup.toggleScreen();
    });
    this.sou.add(this.settings.sound, 'backgroundmusic', Object.keys(this.settings.sound.soundTrackList)).onFinishChange((val) => {
      this.settings.sound.backgroundmusic = this.matchSoundtrack(val, this.settings.sound.soundTrackList);
      this.onChangeAudio();
    }).setValue('song');
    this.sou.add(this.settings.sound, 'loop').onChange((val) => {
      this.settings.sound.loop = val;
      this.addEvent(this.audioElement);
    });
    this.sou.add(this.settings.sound, 'volume').min(0.0).max(10).step(0.1).onChange(() => {
      this.addEvent(this.audioElement);
    }).setValue(0.5);
    this.sou.open();
    /*this.sou.add(this.settings.sound.controls[0], 'master').min(0.0).max(1.0).step(0.01).onChange(() => {
      this.listener.setMasterVolume(this.settings.sound.controls[0].master);
    });
    this.sou.add(this.settings.sound.controls[0], 'element').min(0.0).max(1.0).step(0.01).onChange(() => {
      this.sound.setVolume(this.settings.sound.controls[0].element);
    });
    this.sou.add(this.settings.sound.controls[1], 'frequency').min(50.0).max(5000.0).step(1.0).onChange(() => {
      this.oscillator.frequency.setValueAtTime(this.settings.sound.controls[1].frequency, this.listener.context.currentTime);
    });
    this.sou.add(this.settings.sound.controls[1], 'wavetype', ['sine', 'square', 'sawtooth', 'triangle']).onChange(() => {
      this.oscillator.type = this.settings.sound.controls[1].wavetype;
    });*/
    return gui;
  }

  //GUI SETTINGS
  addGUISettings() {
    this.setup = {
      //changeColor: (val) => {
        //this.pointLight.color.setHSL(Math.random(), 1, 0.5);
        //this.pointLight = new THREE.PointLight( val, 4.5, 0, 0 ); 
      //},
      changeFont: () => {
        this.fontIndex++;
        this.settings.text.fontName = this.reverseFontMap[this.fontIndex % this.reverseFontMap.length];
        this.onLoadFont();
      },
      changeWeight: () => {
        this.fontWeight = this.fontWeight === 'bold' ? 'regular' : 'bold';
        this.settings.text.fontWeight = this.fontWeight; 
        this.onLoadFont();
      },
      changeBevel: () => {
        this.bevelEnabled = !this.bevelEnabled;
        this.settings.text.bevelEnabled = this.bevelEnabled; 
        this.onRefreshTextShader();
      },
      rotateText: () => {
        this.isRotating = !this.isRotating;
      },
      switchMat: () => {
        this.switchMaterialMat();
        //this.onRefreshTextShader();
      },
      switchShader: () => {
        this.switchMaterialShader();
        //this.onRefreshTextShader();
      },
      swirlDisappear: () => {
        this.isForward = true;
        this.isBackward = false;
        this.progress = 0;
        this.switchMaterialMat(); 
        //this.onRefreshTextShader();
      },
      swirlAppear: () => {
        this.isForward = false;
        this.isBackward = true;
        this.progress = 1;
        this.switchMaterialMat();
        //this.onRefreshTextShader();
      },   
      toggleButton: () => {
        var button = document.getElementById('startButton');
        if (this.settings.sound.showButton) button.style.display = "block";
        if (!this.settings.sound.showButton) button.style.display = "none";
        //button.style.display = button.style.display === "none" ? "block" : "none";
      },
      toggleScreen: () => {
        this.onToggleAudioScreen();
      }
    };
  }

  //PSEUDO BUTTONS
  createButton() {
    const buttonGeometry = new THREE.PlaneGeometry(100, 50);
    buttonGeometry.rotateX(Math.PI / 2);
    const buttonMaterial1 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const buttonMaterial2 = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
    this.button1 = new THREE.Mesh(buttonGeometry, buttonMaterial1);
    this.button2 = new THREE.Mesh(buttonGeometry, buttonMaterial2);
    this.button1.position.set(-150, 100, 0); // Set the button's position
    this.button2.position.copy(this.button1.position); // Set the button's position
    this.button2.position.setX(150);
    const btnLoader1 = new FontLoader();
    const btnLoader2 = new FontLoader();
    btnLoader1.load('./fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometryBTN1 = new TextGeometry('Click', {
        font: font,
        size:   12,
        height: 1,
        curveSegments: 4
      });
      const textMaterialBTN = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Corrected the syntax here
      const textMeshBTN1 = new THREE.Mesh(textGeometryBTN1, textMaterialBTN);
      textMeshBTN1.position.copy(this.button1.position); // Copy the button's position
      textMeshBTN1.position.y -= 80;
      textMeshBTN1.position.x += 140;
      textMeshBTN1.rotation.x = - Math.PI / 2;
      this.button1.add(textMeshBTN1);
      // Rotate the button to make it stand vertically
      this.button1.rotation.x = Math.PI / 2; // 90 degrees in radians
      this.scene.add(this.button1); // Add the button to the scene
      this.button1.visible = false;
    });

    btnLoader2.load('./fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometryBTN2 = new TextGeometry('Click', {
          font: font,
          size:   12,
          height: 1,
          curveSegments: 4
      });
      const textMaterialBTN = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
      const textMeshBTN2 = new THREE.Mesh(textGeometryBTN2, textMaterialBTN);
      textMeshBTN2.position.copy(this.button2.position); 
      textMeshBTN2.position.y -= 60;
      textMeshBTN2.position.x -= 180;
      textMeshBTN2.position.z -= 10;
      textMeshBTN2.rotation.x = - Math.PI / 2;
      this.button2.add(textMeshBTN2);
      // Rotate the button to make it stand vertically
      this.button2.rotation.x = Math.PI / 2; // 90 degrees in radians
      this.scene.add(this.button2); // Add the button to the scene
      this.button2.visible = false;
    });
  }     

  /*optional for change background color
  /*in case you add the button to the scene and want to call event from button clicked
  /* the below function can be called
  onDocumentClick(e) {                
    e.preventDefault();
    const canvasBounds = this.renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((e.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (button1 && intersects.length > 0 && intersects[0].object === button1) {
      isButton1Clicked = true;
      isButton2Clicked = false;
      progress = 0;
      switchMaterial();               
      refreshText1();
    } else {
      isButton1Clicked = false;
    }
  }


  /* for change background on hover you can call this event listner
  onMouseHover() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    document.addEventListener('mousemove', (e) => {
      e.preventDefault();
      // Calculate mouse position from the event
      const canvasBounds = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
      mouse.y = -((e.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
      // Raycasting to detect intersections with the 3D objects
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      if (button1 && intersects.length > 0 && intersects[0].object === button1) {
        console.log("this condition 1 is met");
        // Change background color when hovering over a specific 3D object
        //this.renderer.setClearColor(backgroundColor1); // Change to desired color
        this.scene.background = new THREE.Color( backgroundColor1 );
      } else if (button2 && intersects.length > 0 && intersects[0].object === button2) {
        // Reset background color when not hovering over any 3D object
        //this.renderer.setClearColor(backgroundColor2); // Change to default color
        this.scene.background = new THREE.Color( backgroundColor2 );
      } else {
        this.scene.background = new THREE.Color(defaultBackgroundColor); // Change to default color
      }
    });
  } 
  //this.onMouseHover();

  // Add an event listener function
  addClickListener() {
    if (isButton1Clicked) {
        document.removeEventListener('click', onDocumentClick1);
        document.addEventListener('click', onDocumentClick2);
    } else if (isButton2Clicked) {
        document.removeEventListener('click', onDocumentClick2);
        document.addEventListener('click', onDocumentClick1);
    } else {
        document.addEventListener('click', onDocumentClick1);
        document.addEventListener('click', onDocumentClick2);
    }
  }*/

  // CREATE TEXT SHADER
  async createTextShader(config) {
      const delayBetweenLetters = config.delay; // Delay between each letter addition in milliseconds
      let totalWidth = 10;
      // Function to create a single letter
      const createLetter = async (letter, index) => {
          return new Promise(resolve => {
            setTimeout(() => {
              this.textGeo = new TextGeometry(letter, {
                font: this.font,
                size: config.size,
                height: config.height,
                curveSegments: config.curveSegments,
                bevelThickness: config.bevelThickness,
                bevelSize: config.bevelSize,
                bevelEnabled: config.bevelEnabled
              });
              if (this.textGeo) {
                this.textGeo.computeBoundingBox();
                const box = new THREE.Box3();
                const mesh = new THREE.Mesh(
                    this.textGeo,
                    new THREE.MeshBasicMaterial()
                );
                box.copy( mesh.geometry.boundingBox ).applyMatrix4( mesh.matrixWorld );
                //const centerOffset = -0.5 * (box.max.x - box.min.x);
                const widthOfCharacter = box.max.x - box.min.x;
                const textPos = this.textGeo.getAttribute('position');
                const count = this.textGeo.attributes.position.count;
                const displacement = new THREE.Float32BufferAttribute(count * 3, 3);
                this.textGeo.setAttribute('displacement', displacement);
                const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
                this.textGeo.setAttribute('customColor', customColor);
                const color = new THREE.Color(0xffffff);
                for (let i = 0, l = customColor.count; i < l; i++) {
                  color.setHSL(i / l, 0.5, 0.5);
                  color.toArray(customColor.array, i * customColor.itemSize);
                }
                this.material = this.shaderMaterial;
                this.textMesh1 = new THREE.Mesh(this.textGeo, this.material);
                this.meshGeo1.push(this.textMesh1);
                this.textMesh1.position.x =  totalWidth;
                this.textMesh1.position.y = this.settings.text.hover;
                this.textMesh1.position.z = 0;
                this.textMesh1.rotation.x = 0;
                this.textMesh1.rotation.y = Math.PI * 2;
                this.group.add(this.textMesh1);                              
                // Update the total width for the next character, including space
                totalWidth += widthOfCharacter + config.spaceBetween;
              }
              //if ( this.mirror ) {
                //this.textLine2 = new THREE.Mesh( this.textGeo2, this.shaderMaterial );
                //this.lineGeo2.push(this.textLine2);
                //this.textLine2.position.x = totalWidth;
                //this.textLine2.position.y = - this.settings.text1.hover;
                //this.textLine2.position.z = this.settings.text1.height;
                //this.textLine2.rotation.x = Math.PI;
                //this.textLine2.rotation.y = Math.PI * 2;
                //this.group2.add(this.textLine2);
              //}
              resolve(); // Resolve the promise after creating the letter
            }, delayBetweenLetters); // Apply the delay between each letter addition
        });
      };
      // Loop through each letter and create it
      for (const [index, letter] of config.title.split('').entries()) {
          await createLetter(letter, index);
      }
  }

  // SWITCH TO MAT MATERIAL
  switchMaterialMat() {
    if (this.meshGeo1) {
      for (let j = 0; j < this.meshGeo1.length; j++) {
        let meshObj = this.meshGeo1[j];
        const count = meshObj.geometry.attributes.position.count;
        const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
        const color = new THREE.Color(0xffffff);
        if (this.mat) {
          console.log("this mesh geo", this.mat);
          for (let i = 0, l = customColor.count; i < l; i++) {
            color.setHSL(i / l, 0.5, 0.5);
            color.toArray(customColor.array, i * customColor.itemSize);
          }
          this.material = this.mat;
          meshObj.material = this.material; 
        } 
      }
    }
  }

  // SWITCH TO SHADER MATERIAL
  switchMaterialShader() {
    if (this.meshGeo1) {
      for (let j = 0; j < this.meshGeo1.length; j++) {
        let meshObj = this.meshGeo1[j];
        const count = meshObj.geometry.attributes.position.count;
        const customColor = new THREE.Float32BufferAttribute(count * 3, 3);
        const color = new THREE.Color(0xffffff);
        if (this.shaderMaterial) {
          for (let i = 0, l = customColor.count; i < l; i++) {
            color.setHSL(i / l, 0.5, 0.5);
            color.toArray(customColor.array, i * customColor.itemSize);
          }
          this.material = this.shaderMaterial;
          meshObj.material = this.material;
        }
      }
    }
  }

  // RENDER SWIRL
  renderSwirl() {
    if (this.meshGeo1) {
      for (let j = 0; j < this.meshGeo1.length; j++) {
        let meshObj = this.meshGeo1[j];
        const geometry = meshObj.geometry;
        const geometry1 = this.button1.geometry.toNonIndexed();
        let len = geometry.attributes.position.count;
        let randoms = new Float32Array(len);
        let centers = new Float32Array(len * 3);
        let len1 = geometry1.attributes.position.count;
        let centers1 = new Float32Array(len * 3);
        for (let i = 0; i < len; i += 3) {
          let r = Math.random();
          randoms[i] = r;
          randoms[i + 1] = r;
          randoms[i + 2] = r;
          let x = geometry.attributes.position.array[i * 3];
          let y = geometry.attributes.position.array[i * 3 + 1];
          let z = geometry.attributes.position.array[i * 3 + 2];
          let x1 = geometry.attributes.position.array[i * 3 + 3];
          let y1 = geometry.attributes.position.array[i * 3 + 4];
          let z1 = geometry.attributes.position.array[i * 3 + 5];
          let x2 = geometry.attributes.position.array[i * 3 + 6];
          let y2 = geometry.attributes.position.array[i * 3 + 7];
          let z2 = geometry.attributes.position.array[i * 3 + 8];
          let center = new THREE.Vector3(x, y, z)
              .add(new THREE.Vector3(x1, y1, z1))
              .add(new THREE.Vector3(x2, y2, z2))
              .divideScalar(3);
          centers.set([center.x, center.y, center.z], i * 3);
          centers.set([center.x, center.y, center.z], (i + 1) * 3);
          centers.set([center.x, center.y, center.z], (i + 2) * 3);
      }
      // Loop through the vertices to assign positions to centers1
      for (let i = 0; i < len1; i += 3) {
        let x = geometry1.attributes.position.array[i * 3];
        let y = geometry1.attributes.position.array[i * 3 + 1];
        let z = geometry1.attributes.position.array[i * 3 + 2];
        let x1 = geometry1.attributes.position.array[i * 3 + 3];
        let y1 = geometry1.attributes.position.array[i * 3 + 4];
        let z1 = geometry1.attributes.position.array[i * 3 + 5];
        let x2 = geometry1.attributes.position.array[i * 3 + 6];
        let y2 = geometry1.attributes.position.array[i * 3 + 7];
        let z2 = geometry1.attributes.position.array[i * 3 + 8];
        let center = new THREE.Vector3(x, y, z)
            .add(new THREE.Vector3(x1, y1, z1))
            .add(new THREE.Vector3(x2, y2, z2))
            .divideScalar(3);
        centers1.set([center.x, center.y, center.z], i * 3);
        centers1.set([center.x, center.y, center.z], (i + 1) * 3);
        centers1.set([center.x, center.y, center.z], (i + 2) * 3);
      }
      // Assign this attribute to lineObj's geometry
      meshObj.geometry.setAttribute('aCenterButton',             
        new THREE.BufferAttribute(centers1, 3)
      );
      meshObj.geometry.setAttribute(
       "aRandom",
        new THREE.BufferAttribute(randoms, 1)
      );
      meshObj.geometry.setAttribute(
        "aCenter",
        new THREE.BufferAttribute(centers, 3)
      );
      this.eventAdapter (this.matShader, meshObj);     
      } 
    }
  }

  // EVENT ADAPTER
  eventAdapter(matShader, element) {
    if (this.matShader && this.isForward) {
        if (this.progress < 1) {
          this.progress += 0.001;
          this.matShader.uniforms.progress.value = this.progress;
        } else if (this.progress === 1) {
          this.element.visible = false;
          this.isForward = false;
          this.isBackward = false;
          return;
      } 
    }

    if (this.matShader && this.isBackward) {
        if (this.progress > 0) {
          this.progress -= 0.001;
          this.matShader.uniforms.progress.value = this.progress;
        } else if (this.progress === 0) {
          this.element.visible = true;
          this.isForward = false;
          this.isBackward = false;
          return;
      } 
    }
  }

  //LOAD FONT
  onLoadFont() {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('../../static/src/fonts/' + this.settings.text.fontName + '_' + this.settings.text.fontWeight + '.typeface.json', 
        (font) => {
          this.onFontLoaded();
          this.font = font;
          this.onRefreshTextShader();
          resolve('Font loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onFontLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
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

  /*depreciated
  //LOAD FONT
    onLoadFont() {      
    //document.body.classList.add("loading");
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('fonts/' + this.settings.text1.fontName + '_' + this.settings.text1.fontWeight + '.typeface.json', (response) => {
        this.font = response;
        //if (this.font) document.body.classList.remove("loading");
        setTimeout(() => {
          if (this.isTextMesh) this.onRefreshTextMesh();
          if (this.isTextShader) this.onRefreshTextShader();
          if (this.isTextPoint) this.onRefreshTextPoint();
          resolve(pass any result or data here );
        }, 10000); // Simulate a 2-second delay
      });
    });
  }*/

  // REFRESH TEXT SHADER
  onRefreshTextShader() {
    this.group.remove(this.textMesh1);
    if (this.mirror) this.group.remove(this.textMesh2);
    if (this.meshGeo1) {
      for (let j = 0; j < this.meshGeo1.length; j++) {
        let meshObj = this.meshGeo1[j];
        this.group.remove(meshObj);
      }
    }
    if (!this.settings.text.title) return;
    this.createTextShader(this.settings.text);
  }

  // RENDER NORMAL
  renderNormal (scene, camera, renderer) {
    renderer.clear();
    renderer.render(scene, camera);
  }

  // RENDER TRANSFORM
  renderTransform(scene, camera, renderer) {
    this.renderSwirl(); 
    renderer.clear();
    renderer.render(scene, camera);          
  }

  // SWITCH ANIMATION
  onInitAnimate(){
    if(!this.isFullScreen) {this.animate();}
    else{this.animateAu();}
  }

  // ANIMATION
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.isBackward || this.isForward) {this.renderTransform(this.scene, this.camera, this.renderer);}
    else {this.renderNormal(this.scene, this.camera, this.renderer);}          
  }

  // ANIMATION
  animateAu() {
    requestAnimationFrame(this.animateAu.bind(this));
    this.renderAudio1();      
  }

  // ROTATE TEXT
  rotateText() {
    if (this.isTrueT(this.isRotating)){
      this.targetRotation += Math.PI * 2; // Rotate 360 degrees (2 * Math.PI)
      this.group.rotation.y += ( this.targetRotation - this.group.rotation.y ) * 0.05;
    }
  }

  ///////////////////////////////
  //**      Audio Section    **//
  ///////////////////////////////

  // LOAD AUDIO
  onInitAudio() {
    //const soundList = this.createAudioList(this.soundIds);
    //this.settings.sound.soundTrackList.push(soundList);
    this.removeAudioHtml();
    this.createAudioHtml();
    this.initAudio();
  }

   // INIT AUDIO
  initAudio() {
    this.listener = new THREE.AudioListener();
    this.audioScene = new THREE.Scene();
    this.audioCamera = new THREE.PerspectiveCamera(15, this.auW / this.auH, 0.01, 50);
    this.audioCamera.add(this.listener);
    this.sound = new THREE.PositionalAudio(this.listener);
    this.oscillator = this.listener.context.createOscillator();
    this.oscillator.type = 'sine';
    this.audioRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.audioRenderer.setPixelRatio(window.devicePixelRatio);
    this.audioRenderer.setSize(this.auW, this.auH);
    this.audioRenderer.setAnimationLoop(this.renderAudio.bind(this));
    this.$audioEl.appendChild(this.audioRenderer.domElement);
    this.onLoadAudio();
    /* optionally you can monitor more sound effects
    /* for performance purpose i exclude these parts
    //this.oscillator.frequency.setValueAtTime(144, this.sound.context.currentTime);
    //connect the oscillator to the positional audio node
    //this.oscillator.connect(this.sound.input);
    //this.sound.setRefDistance(20);
    //this.sound.setVolume(0.5);
    //this.oscillator.start(0);
    //this.sound.setNodeSource(this.oscillator);
    //this.sound.setRefDistance(20);
    //this.sound.setVolume(0.5);
    //this.sound.setMediaElementSource(this.settings.sound.backgroundmusic);
    //this.sound.setLoop(true); // Enable looping
    //this.sound.setVolume(1); // Set volume (adjust as needed)
    //this.analyser1 = new THREE.AudioAnalyser(this.sound, this.fftSize);
    //if (this.line1) this.line1.add(this.sound);
    //this.sound.setBuffer(buffer);
    //const loader = new THREE.AudioLoader();
      //loader.load(this.settings.backgroundmusic, function (buffer) {
      //this.audio.setBuffer( buffer );
    //});
    /*const soundControls = {
      master: this.listener.getMasterVolume(),
      element: this.sound.getVolume(),
    };
    const generatorControls = {
      frequency: this.oscillator.frequency.value,
      wavetype: this.oscillator.type
    };
    this.settings.sound.controls.push(soundControls);
    this.settings.sound.controls.push(generatorControls);*/
    window.addEventListener('resize', this.onWindowResize);
  }

  // REMOVE HTML
  removeAudioHtml() {
    const audioElement = document.getElementById('audio-container');
    const startButton = document.getElementById('startButton');
    if (audioElement) this.container.removeChild(audioElement);
  }

  // CREATE HTML 
  createAudioHtml() {
    this.$audioEl = document.createElement('div');
    this.$audioEl.id = 'audio-container'; // Set the button's id attribute (if needed)
    this.$audioEl.style.width = '360px';
    this.$audioEl.style.height = '240px';
    this.$audioEl.style.left = '16rem'; // Center the container horizontally
    this.$audioEl.style.top = '15rem';  // Center the container vertically
    this.$audioEl.style.position = 'absolute';
    this.$audioEl.style.justifyContent = 'center';
    this.$audioEl.style.alignItem  = 'center';
    this.$audioEl.style.transform = 'translate(-50%, -50%)'; // Correct the position after centering
    this.$audioEl.style.display = 'flex';
    this.$audioEl.style.zIndex = '9999';
    this.container.appendChild(this.$audioEl); // Add the button to the body element
    this.auW = this.$audioEl.clientWidth;
    this.auH = this.$audioEl.clientHeight;
    // Create a button element
    this.$startButton = document.createElement('button');
    // Set button attributes (e.g., text content, id, class, etc.)
    this.$startButton.textContent = 'START'; // Set the button's text content
    this.$startButton.style.position = 'relative'; // Set the button's id attribute (if needed)
    this.$startButton.style.top = '40%'; // Set the button's id attribute (if needed)
    this.$startButton.style.left = '0px'; // Set the button's id attribute (if needed)
    this.$startButton.textContent = 'START';
    this.$startButton.style.width = '100px';
    this.$startButton.style.height = '50px';
    this.$startButton.style.zIndex = '9999';
    this.$startButton.id = 'startButton';
    // Add the button to the HTML document (e.g., to a specific container)
    this.$audioEl.appendChild(this.$startButton); // Add the button to the body element
  }

  // HTML SOUNDLIST 
  createAudioList(audioData) {
    const audioList = {};
    for (const id in audioData) {
      if (audioData.hasOwnProperty(id)) {
        const sources = {};
        const audioElement = document.getElementById(id);
        if (audioElement) {
          const sourceElements = audioElement.getElementsByTagName('source');
          for (const sourceElement of sourceElements) {
            const type = sourceElement.getAttribute('type');
            const src = sourceElement.getAttribute('src');
            if (type && src) {
              sources[type.split('/')[1]] = src;
            }
          }
          audioList[id] = sources;
        }
      }
    }
    return audioList;
  }

  // MATCH SOUNDTRACK 
  matchSoundtrack(val, list) {
    for (const [key, value] of Object.entries(list)) {
        if (key === val) {
        return (value);
      }
    }
  }

  matchSoundtrack1(val, list) {
    for (const [key, value] of Object.entries(list)) {
        if (key === val) {
        return (value.mp3);
      }
    }
  }

  // RESIZE WINDOW 
  onWindowResize() {
    this.audioCamera.aspect = this.auW / this.auH;
    this.audioCamera.updateProjectionMatrix();
  }

  // ONCHANGE AUDIO
  onChangeAudio() {
    if (this.audioGroup.children.length > 0) {
      this.audioGroup.children.parent = null;
      this.audioGroup.remove(this.audioGroup.children);
    }
    if(this.audioElement) this.audioElement.pause();
    this.onLoadAudio();
  }

  // PLAY AUDIO
  createAudioMesh(scene, group, scale, posX, posY, posZ) {
    var planeGeometry = new THREE.PlaneGeometry(80, 80, 20, 20);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x6904ce,
        side: THREE.DoubleSide,
        wireframe: true
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -0.5 * Math.PI;
    this.plane.scale.set(scale, scale, scale);
    this.plane.position.set(posX, posY, posZ);
    group.add(this.plane);
    this.plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane2.scale.set(scale, scale, scale);
    this.plane2.rotation.x = -0.5 * Math.PI;
    this.plane2.position.set(posX, -posY, posZ);
    group.add(this.plane2);
    const material = new THREE.ShaderMaterial({
      uniforms: this.audioUniforms,
      vertexShader: T.shaders.vs.soundText,
      fragmentShader: T.shaders.fs.soundText
    });
    //const geometry = new THREE.PlaneGeometry(1, 1);
    //const mesh = new THREE.Mesh(geometry, material);
    //this.audioScene.add(mesh);
    var icosahedronGeometry = new THREE.IcosahedronGeometry(0.001, 4);
    var lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });
    this.ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    this.ball.scale.set(scale, scale, scale);
    if(!this.isFullScreen)this.ball.position.set(0, 0, posZ);
    if(this.isFullScreen) this.ball.position.set(250, 0, posZ)
    group.add(this.ball);
    var ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    //spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(this.ball);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(group);
  }

  makeRoughBall(mesh, bassFr, treFr) {
    var positionAttribute = mesh.geometry.getAttribute('position');
    var positions = positionAttribute.array;
    var offset = 10;
    var amp = 7;
    var time = window.performance.now();
    var rf = 0.01;
    for (var i = 0; i < positions.length; i += 3) {
        var vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]).normalize();
        var distance = (offset + bassFr) + this.noise.noise3d(vertex.x + time * rf * 7, vertex.y + time * rf * 8, vertex.z + time * rf * 9) * amp * treFr;
        vertex.multiplyScalar(distance);
        positions[i] = vertex.x;
        positions[i + 1] = vertex.y;
        positions[i + 2] = vertex.z;
    }
    positionAttribute.needsUpdate = true;
    var normalAttribute = mesh.geometry.getAttribute('normal');
    if (normalAttribute) {
        normalAttribute.needsUpdate = true;
    }
    mesh.geometry.verticesNeedUpdate=true;
    mesh.geometry.computeVertexNormals();
    //mesh.geometry.computeFaceNormals();
  }

  makeRoughGround(mesh, distortionFr) {
    var positionAttribute = mesh.geometry.getAttribute('position');
    var positions = positionAttribute.array;
    for (var i = 0; i < positions.length; i += 3) {
      var amp = 2;
      var time = Date.now();
      var distance = (this.noise.noise(positions[i] + time * 0.0003, positions[i + 1] + time * 0.0001) + 0) * distortionFr * amp;
      positions[i + 2] = distance;
    }
    positionAttribute.needsUpdate = true;
    var normalAttribute = mesh.geometry.getAttribute('normal');
    if (normalAttribute) {
      normalAttribute.needsUpdate = true;
    }
    mesh.geometry.computeVertexNormals();
  }

  //EVENT LISTENER
  addEvent(audio) {
    const audioControl=(audio, args)=> {
      if (audio) {
        if (args===true){audio.play();}
        else {audio.pause();}
      }
    };
    audioControl(audio, this.settings.sound.enable);
    var startButton = document.getElementById('startButton');
    if(startButton){
      startButton.addEventListener('pointerdown', () => {
        this.settings.sound.enable = this.settings.sound.enable ? false : true;
        audioControl(audio, this.settings.sound.enable);
      });
      audio.setLoop(this.settings.sound.loop); // Enable looping
      audio.setVolume(this.settings.sound.volume); // Set volume (adjust as needed)
    }
  }


  //EVENT LISTENER
  onRemoveText() {
    if (this.textMesh1) this.group.remove(this.textMesh1);
    if (this.meshGeo1) {
      for (let j = 0; j < this.meshGeo1.length; j++) {
        let meshObj = this.meshGeo1[j];
        this.group.remove(meshObj);
      }
    }
  }

  // ON TOOGLE AUDIO VISUALIZER SCREEN
  onToggleAudioScreen() {
    if (this.isFullScreen) {
      this.removeAudioHtml();
      this.onRemoveText();
      this.createAudioMesh(this.scene, this.group, 5, 250, 100, -200);}
    else {
      this.removeAudioHtml();
      this.createAudioHtml();
      this.onRefreshTextShader();
      this.createAudioMesh(this.audioScene, this.audioGroup, 0.01, 0, 0.5, -10);
    }
  }

  /*depreciated
  //LOAD AUDIO
  onLoadAudio() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(this.settings.sound.backgroundmusic);
        if (!response.ok) {
          throw new Error('Failed to fetch audio');
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.decodeAudioData(arrayBuffer);
        this.onAudioLoaded();
        this.audioElement = new THREE.Audio(this.listener);
        this.audioElement.setBuffer(audioBuffer);
        this.analyser = new THREE.AudioAnalyser(this.audioElement, this.settings.sound.fftSize);
        const format = ( this.audioRenderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
          this.audioUniforms = {
            tAudioData: {value: new THREE.DataTexture(this.analyser.data, this.fftSize / 2, 1, format)}
        };
        this.playAudio();
        this.addEvent(this.audioElement);
        resolve('Audio loaded successfully');
      } catch (error) {
        this.onAudioLoadError(error);
        reject('Error loading audio');
      }
    });
  }

  decodeAudioData(arrayBuffer) {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }*/

  //LOAD AUDIO
   onLoadAudio() {
    return new Promise((resolve, reject) => {
      const loader = new THREE.AudioLoader();
      this.audioElement = new THREE.Audio(this.listener);
      loader.load('../static/src/assets/376737_Skullbeatz___Bad_Cat_Maste.ogg',        
      (buffer) => {
          this.onAudioLoaded();
          this.audioElement.setBuffer(buffer);
          //var context = new AudioContext();
          //var src = context.createMediaElementSource(audio);
          //var analyser = context.createAnalyser();
          //src.connect(analyser);
          //analyser.connect(context.destination);
          //analyser.fftSize = 512;
          this.analyser = new THREE.AudioAnalyser(this.audioElement, this.settings.sound.fftSize);
          var bufferLength = this.analyser.analyser.frequencyBinCount;
          this.dataArray = new Uint8Array(bufferLength);
          const format = ( this.audioRenderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
            this.audioUniforms = {
              tAudioData: {value: new THREE.DataTexture(this.analyser.data, this.fftSize / 2, 1, format)}
          };
          this.createAudioMesh(this.audioScene, this.audioGroup, 0.01, 0, 0.5, -10);
          this.addEvent(this.audioElement);
          resolve('Audio loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onAudioLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
          console.log(loadingPercentage + '% loaded');
        },
        (error) => {
          this.onAudioLoadError(error);
          reject('Error loading audio'); // Reject with a meaningful error message
        }
      );
    });
  }

  onAudioLoadError(error) {
    console.error('Error loading audio:', error);
    document.body.classList.remove('loading');
  }

  onAudioLoad() {
    document.body.classList.add('loading');
  }

  onAudioLoaded() {
    document.body.classList.remove('loading');
  }

  // RENDER MINISCREEN 
  renderAudio() {
    if(this.material && this.analyser) {
      const averageFrequency = this.analyser.getAverageFrequency() / 256 * 10;
      this.material.uniforms.emissiveColor.value.setRGB(0, 0, averageFrequency);
    }
    if (this.analyser) this.analyser.getFrequencyData();
    if(this.audioUniforms) this.audioUniforms.tAudioData.value.needsUpdate = true;
    if (this.dataArray && this.plane && this.plane2 && this.ball){
      var lowerHalfArray = this.dataArray.slice(0, (this.dataArray.length/2) - 1);
      var upperHalfArray = this.dataArray.slice((this.dataArray.length/2) - 1, this.dataArray.length - 1);
      var overallAvg = this.avgT(this.dataArray);
      var lowerMax = this.maxT(lowerHalfArray);
      var lowerAvg = this.avgT(lowerHalfArray);
      var upperMax = this.maxT(upperHalfArray);
      var upperAvg = this.avgT(upperHalfArray);
      var lowerMaxFr = lowerMax / lowerHalfArray.length;
      var lowerAvgFr = lowerAvg / lowerHalfArray.length;
      var upperMaxFr = upperMax / upperHalfArray.length;
      var upperAvgFr = upperAvg / upperHalfArray.length;
      this.makeRoughGround(this.plane, this.modulateT(upperAvgFr, 0, 1, 0.5, 4));
      this.makeRoughGround(this.plane2, this.modulateT(lowerMaxFr, 0, 1, 0.5, 4));
      this.makeRoughBall(this.ball, this.modulateT(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulateT(upperAvgFr, 0, 1, 0, 4));
      if (!this.isFullScreen) {
        this.audioGroup.rotation.z += 0.005;
        this.audioRenderer.render(this.audioScene, this.audioCamera);}
      else {
        this.group.rotation.z += 0.005;
      }
    }
  } 

  // RENDER FULLSCREEN
  renderAudio1() {
    if(this.material && this.analyser) {
      const averageFrequency = this.analyser.getAverageFrequency() / 256 * 10;
      this.material.uniforms.emissiveColor.value.setRGB(0, 0, averageFrequency);
    }
    if (this.analyser) this.analyser.getFrequencyData();
    if(this.audioUniforms) this.audioUniforms.tAudioData.value.needsUpdate = true;
    if (this.dataArray && this.plane && this.plane2 && this.ball){
      var lowerHalfArray = this.dataArray.slice(0, (this.dataArray.length/2) - 1);
      var upperHalfArray = this.dataArray.slice((this.dataArray.length/2) - 1, this.dataArray.length - 1);
      var overallAvg = this.avgT(this.dataArray);
      var lowerMax = this.maxT(lowerHalfArray);
      var lowerAvg = this.avgT(lowerHalfArray);
      var upperMax = this.maxT(upperHalfArray);
      var upperAvg = this.avgT(upperHalfArray);
      var lowerMaxFr = lowerMax / lowerHalfArray.length;
      var lowerAvgFr = lowerAvg / lowerHalfArray.length;
      var upperMaxFr = upperMax / upperHalfArray.length;
      var upperAvgFr = upperAvg / upperHalfArray.length;
      this.makeRoughGround(this.plane, this.modulateT(upperAvgFr, 0, 1, 0.5, 4));
      this.makeRoughGround(this.plane2, this.modulateT(lowerMaxFr, 0, 1, 0.5, 4));
      this.makeRoughBall(this.ball, this.modulateT(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulateT(upperAvgFr, 0, 1, 0, 4));
      this.group.rotation.y += 0.005;
      this.renderer.render(this.scene, this.camera);
    }
  } 
}

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS TextPoint***************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize TextPoint
 * @class TextPoint
 * @param options 
*/
class TextPoint {
  constructor(options) {
    this.options = options;
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.clock = new THREE.Clock();
    this.last = performance.now();
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    this.windowHalfX = window.innerWidth/ 2;
    this.palette = {
    color1: '#FF0000', // CSS string
    color2: '#FF0000', // CSS string
    color3: '#FF0000' // CSS string
    };
    this.font = undefined;
    this.group = new THREE.Group();
    this.textGeo;
    this.textpoint;
    this.point;
    this.points = [];
    this.clonepoints = [];
    this.$audioEl;
    this.$startButton;
    this.auW;
    this.auH;
    this.computeNode;
    this.waveBuffer;
    this.sampleRate;
    this.waveGPUBuffer;
    this.soundBuffer;
    this.currentAudio;
    this.currentAnalyser;
    this.analyserBuffer = new Uint8Array( 1024 );
    this.analyserTexture;
    this.source;
    this.audioScene;
    this.audioCamera;
    this.audioRenderer;
    this.water;
    this.bulbLight;
    this.bulbMat;
    this.hemiLight;
    this.previousShadowMap = false;
    this.settings();
    this.init();
    this.addGUISettings();
    this.addEventListeners();
    this.onInitAnimate();
    //this.onInitAudio()
  }

  // APP SETTINGS
  settings () {
    let that = this;
    this.settings = {
      text: {
        title: "OmniBus",
        bevelEnabled: true,
        fontName: 'optimer',
        // helvetiker, optimer, gentilis, droid sans, droid serif
        fontWeight: 'bold',
        height: 20,
        size: 70,
        hover: 30,
        curveSegments:4,
        bevelThickness: 2,
        bevelSize: 1.5,
        pointSize: 10,
        pointColor1: 0xffdd44,
        pointColor2: 0xffffff,
        pointColor3:0xff77dd, 
      },
      sound: {
        enable: true,
        fullscreen: false,
        showButton: true,
        backgroundmusic: this.defaultSoundURL,
        fftSize: 128,
        loop: true,
        volume: 0.5,
        soundList: {
          soundtrack1: '../../static/src/assets/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg',
          soundtrack2: '../../static/src/assets/358232_j_s_song.ogg',
          soundtrack3: '../../static/src/assets/376737_Skullbeatz___Bad_Cat_Maste.ogg',
          soundtrack4: '../../static/src/assets/358232_j_s_song.ogg'
        },
        backgroundmusic: '../../static/src/assets/376737_Skullbeatz___Bad_Cat_Maste.ogg',
        pitch: uniform(1.5),
        delayVolume: uniform(.2),
        delayOffset: uniform(.55)
      },
      light: {
        bulbLuminousPowers: {
          '110000 lm (1000W)': 110000,
          '3500 lm (300W)': 3500,
          '1700 lm (100W)': 1700,
          '800 lm (60W)': 800,
          '400 lm (40W)': 400,
          '180 lm (25W)': 180,
          '20 lm (4W)': 20,
          'Off': 0
        },
        hemiLuminousIrradiances: {
          '0.0001 lx (Moonless Night)': 0.0001,
          '0.002 lx (Night Airglow)': 0.002,
          '0.5 lx (Full Moon)': 0.5,
          '3.4 lx (City Twilight)': 3.4,
          '50 lx (Living Room)': 50,
          '100 lx (Very Overcast)': 100,
          '350 lx (Office Room)': 350,
          '400 lx (Sunrise/Sunset)': 400,
          '1000 lx (Overcast)': 1000,
          '18000 lx (Daylight)': 18000,
          '50000 lx (Direct Sun)': 50000
        }
      }
    }
  }

  // INIT APP
  init() {
    //SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
    //this.scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
    // CAMERA
    this.camera = new THREE.PerspectiveCamera( 30, this.containerWidth/ this.containerHeight, 1, 1500 );
    this.camera.position.set( 0, 700, -1000 );
    this.camera.lookAt( this.scene.position );    
    //this.cameraTarget = new THREE.Vector3( 0, 50, 0 );
    //DIR LIGHT
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );
    //BULB LIGHT
    this.addBulbLight();
    this.addWater();
    //this.scene.add(helper);
    //POINT LIGHT
    this.pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
    this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    this.pointLight.position.set( 0, 100, 90 );
    this.scene.add( this.pointLight );
    // LOAD FONT
    this.onLoadFont()
      .then((message) => {
        console.log(message);
      })
      .catch((error) => {
        console.error(error);
      });
    //RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x222222);
    this.renderer.setClearAlpha(0);
    this.renderer.setSize( this.containerWidth, this.containerHeight );
    this.container.appendChild( this.renderer.domElement );
    // POSTPROCESSING
    this.effectFocus = new ShaderPass( FocusShader );
    this.effectFocus.uniforms[ 'screenWidth' ].value = this.containerWidth * window.devicePixelRatio;
    this.effectFocus.uniforms[ 'screenHeight' ].value = this.containerHeight * window.devicePixelRatio;
    this.composer = new EffectComposer( this.renderer );
    const renderModel = new RenderPass( this.scene, this.camera );
    const effectBloom = new BloomPass( 0.75 );
    const effectFilm = new FilmPass( 0.5, 0.5, 1448, false );
    const outputPass = new OutputPass();
    this.composer.addPass( renderModel );
    //this.composer.addPass( effectBloom );
    //this.composer.addPass( effectFilm );
    //this.composer.addPass( this.effectFocus );
    //this.composer.addPass( outputPass );
    //GROUP
    this.scene.add( this.group );
    this.group.position.y = 100;
    document.addEventListener("DOMContentLoaded", function () {document.body.classList.remove("loading");});
  }


  // ADD BULB LIGHT
  addBulbLight() {
    let scale = 1000;
    const bulbGeometry = new THREE.SphereGeometry( 0.02, 1600, 800 );
    bulbGeometry.scale(scale, scale, scale);
    this.bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
    this.bulbMat = new THREE.MeshStandardMaterial( {
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000
    });
    this.bulbLight.add(new THREE.Mesh( bulbGeometry, this.bulbMat ) );
    this.bulbLight.position.setY(200);
    this.bulbLight.castShadow = true;
    this.scene.add( this.bulbLight );
    this.hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
    this.scene.add( this.hemiLight );
  }

    // WATER GROUND
  addWater() {
    const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
    const flowMap = T.TEXTURES['flowMap'];
    this.water = new Water( waterGeometry, {
      scale: 2,
      textureWidth: 1024,
      textureHeight: 1024,
      flowMap: flowMap
    });
    this.water.position.y = 1;
    this.water.rotation.x = Math.PI * - 0.5;
    this.scene.add(this.water);
    const helperGeometry = new THREE.PlaneGeometry( 20, 20 );
    const helperMaterial = new THREE.MeshBasicMaterial( { map: flowMap } );
    const helper = new THREE.Mesh( helperGeometry, helperMaterial );
    helper.position.y = 1.01;
    helper.rotation.x = Math.PI * - 0.5;
  }

  //ADD EVENT LISTENER
  addEventListeners() {
    this.addCustomEventListenerT(window, "resize", (e)=>this.onResize(e));
  }

  // RESIZE
  onResize() {
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.composer.setSize(this.containerWidth, this.containerHeight);
    this.effectFocus.uniforms[ 'screenWidth' ].value = this.containerWidth * window.devicePixelRatio;
    this.effectFocus.uniforms[ 'screenHeight' ].value = this.containerWidth * window.devicePixelRatio;
  }

  //GUI SETTINGS
  addGUISettings() {
    this.setup = {
      toggleButton: () => {
        var button = document.getElementById('startButton');
        if (this.settings.sound.showButton) button.style.display = "block";
        if (!this.settings.sound.showButton) button.style.display = "none";
        //button.style.display = button.style.display === "none" ? "block" : "none";
      }
    };
  }

  // GUI
  addGUIPoint(gui) {
    /* Text Control */
    this.tex = gui.addFolder('Text Controls');
    this.tex.addColor(this.palette, 'color1').name('change color1').onChange((val) => {
      //var color = new THREE.Color(val);
      this.pointColor1 = val;
      this.onRefreshTextPoint();
    });
    this.tex.addColor(this.palette, 'color2').name('change color2').onChange((val) => {
      //var color = new THREE.Color(val);
      this.pointColor2 = val;
      this.onRefreshTextPoint();
    });
    this.tex.addColor(this.palette, 'color3').name('change color3').onChange((val) => {
      //var color = new THREE.Color(val);
      this.pointColor3 = val;
      this.onRefreshTextPoint();
    });
    this.tex.add(this.settings.text, 'size', 10, 80, 5).name('change size').onChange(() => {
      this.settings.text.size = val;
      this.onRefreshTextPoint();
    });
    this.tex.add(this.settings.text, 'pointSize', 10, 50, 5).name('pointSize').onChange(() => {
      this.settings.text.size = val;
      this.onRefreshTextPoint();
    });
    this.tex.open();

    /* Light Control */
    /*
    folder2_1_1.add( settings.params, 'hemiIrradiance', Object.keys( hemiLuminousIrradiances ) );
    folder2_1_1.add( settings.params, 'bulbPower', Object.keys( bulbLuminousPowers ) );
    folder2_1_1.add( settings.params, 'exposure', 0, 1 );
    folder2_1_1.add( settings.params, 'shadows' );
    folder2_1_1.hide();
    folder2_1_1.close();
    const folder3 = gui.addFolder( 'Ground' );
    folder3.add( params, 'showHelpers' ).name( 'show helpers' ).onChange( function ( value ) {
    params.showHelpers = value;
    if (value) {
      topText.style.display = "block";
    } else {
       topText.style.display = "none";
    }
    });
    folder3.open();*/
    /* Sound Control */
    this.sou = gui.addFolder('Sound Controls');
   this.sou.add(this.settings.sound, 'backgroundmusic', Object.keys(this.settings.sound.soundList)).onFinishChange((val) => {
      this.settings.sound.backgroundmusic = this.matchSoundtrack(val, this.settings.sound.soundList);
      this.onChangeAudio();
    }).setValue('soundtrack1');
    this.sou.add(this.settings.sound, 'enable').onChange((val)=> {
      this.settings.sound.enable = val;
      this.addEvent(this.source);
    });
    this.sou.add(this.settings.sound, 'fullscreen').onChange((val)=> {
      this.settings.sound.fullscreen = val;
      this.onToggleAudioScreen();
    });
    this.sou.add(this.settings.sound, 'showButton').name('toggle button').onChange((val)=> {
      this.settings.sound.showButton = val;
      this.setup.toggleButton();
    });
    this.sou.add(this.settings.sound.pitch, 'value', .5, 2, .01).name('pitch').onFinishChange(() => {
      this.generateAudio();
    });
    this.sou.add(this.settings.sound.delayVolume, 'value', 0, 1, .01).name('delayVolume').onFinishChange(() => {
      this.generateAudio();
    });
    this.sou.add(this.settings.sound.delayOffset, 'value', .1, 1, .01).name('delayOffset').onFinishChange(() => {
      this.generateAudio();
    });
    this.sou.open();
    return gui;
  }

  //LOAD FONT
  onLoadFont() {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('../../static/src/fonts/' + this.settings.text.fontName + '_' + this.settings.text.fontWeight + '.typeface.json', 
        (font) => {
          this.onFontLoaded();
          this.font = font;
          this.onRefreshTextPoint();
          resolve('Font loaded successfully'); // Resolve with a meaningful message
        },
        (xhr) => {
          this.onFontLoad();
          const loadingPercentage = (xhr.loaded / xhr.total) * 100;
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

  /*depreciated
  //LOAD FONT
    onLoadFont() {      
    //document.body.classList.add("loading");
    return new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load('fonts/' + this.settings.text1.fontName + '_' + this.settings.text1.fontWeight + '.typeface.json', (response) => {
        this.font = response;
        //if (this.font) document.body.classList.remove("loading");
        setTimeout(() => {
          if (this.isTextMesh) this.onRefreshTextMesh();
          if (this.isTextShader) this.onRefreshTextShader();
          if (this.isTextPoint) this.onRefreshTextPoint();
          resolve(pass any result or data here );
        }, 10000); // Simulate a 2-second delay
      });
    });
  }*/

  // CREATE TEXT POINT
  createTextPoint( config ) {
    this.textGeo = new TextGeometry(config.title, {
      font: this.font,
      size: config.size,
      height: config.height,
      curveSegments: config.curveSegments,
      bevelThickness: config.bevelThickness,
      bevelSize: config.bevelSize,
      bevelEnabled: config.bevelEnabled
    });
    const positions = this.textGeo.attributes.position;
    this.textGeo.computeBoundingBox();
    const centerOffset = - 0.5 * ( this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x );
    //this.point.scale.x = this.point.scale.y = this.point.scale.z = scale;
    this.createPoint( positions, centerOffset, 0.5, - 300, 35, 0, this.settings.text.pointColor1, Math.PI);
    this.createPoint( positions, centerOffset, 0.5, -200,  35, 0, this.settings.text.pointColor2, Math.PI/2);
    this.createPoint( positions, centerOffset, 0.5, -100, 35, 250, this.settings.text.pointColor3, -Math.PI/2);
  }

  // CREATE POINT
  createPoint( positions, centerOffset, scale, x, y, z, color, rotY) {
    /*const clones = [          
      [ 60, 0, - 40 ],
      [ 150, 0, 0 ],
      [ -150, 0, 50 ],
    ];*/
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positions.clone());
    geometry.setAttribute('initialPosition', positions.clone());
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    //const c = ( i < clones.length - 1 ) ? 0x252525 : color;
    this.point = new THREE.Points(geometry, new THREE.PointsMaterial({size: this.settings.text.pointSize, color: color}));
    //this.point.scale.x = this.point.scale.y = this.point.scale.z = scale;
    //this.point.position.x = centerOffset;
    this.point.position.x = x;
    this.point.rotation.x = 0;
    this.point.position.y = y ;
    this.point.rotation.y = rotY;
    this.point.position.z = z;
    this.group.add(this.point);
    this.clonepoints.push({point: this.point, speed: 0.5 + Math.random()});
    this.points.push({
      point: this.point, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor(200 + 200 * Math.random()),
      start: Math.floor(100 + 200 * Math.random()),
    });
  }

  // REFRESH TEXT POINT
  onRefreshTextPoint() {
    this.group.remove(this.point);
    if (!this.settings.text.title) return;
    this.createTextPoint(this.settings.text);
  }

  // RENDER TEXT POINT
  renderPoint(scene, camera, renderer) {
    let delta = 10 * this.clock.getDelta();
    //const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    //scene.add( light );
    //camera.fov = 20;
    //camera.far = 5000;
    //scene.background = new THREE.Color( 0x000104 );
    //this.camera.up = new THREE.Vector3(0,0,1);
    delta = delta < 2 ? delta : 2;
    this.group.rotation.y += - 0.02 * delta;
    for ( let j = 0; j < this.points.length; j ++ ) {
      const data = this.points[ j ];
      const positions = data.point.geometry.attributes.position;
      const initialPositions = data.point.geometry.attributes.initialPosition;
      const count = positions.count;
      if ( data.start > 0 ) {
         data.start -= 1;
      } else {
        if ( data.direction === 0 ) {
          data.direction = - 1;
        }
      }
      for ( let i = 0; i < count; i ++ ) {
        const px = positions.getX( i );
        const py = positions.getY( i );
        const pz = positions.getZ( i );
        // falling down
        if ( data.direction < 0 ) {
          if ( py > 0 ) {
            positions.setXYZ(
              i,
              px + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta,
              py + 3.0 * ( 0.25 - Math.random() ) * data.speed * delta,
              pz + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta
            );
          } else {
            data.verticesDown += 1;
          }
        }
        // rising up
        if ( data.direction > 0 ) {
          const ix = initialPositions.getX( i );
          const iy = initialPositions.getY( i );
          const iz = initialPositions.getZ( i );
          const dx = Math.abs( px - ix );
          const dy = Math.abs( py - iy );
          const dz = Math.abs( pz - iz );
          const d = dx + dy + dx;
          if ( d > 1 ) {
            positions.setXYZ(
              i,
              px - ( px - ix ) / dx * data.speed * delta * ( 0.85 - Math.random() ),
              py - ( py - iy ) / dy * data.speed * delta * ( 1 + Math.random() ),
              pz - ( pz - iz ) / dz * data.speed * delta * ( 0.85 - Math.random() )
            );
          } else {
            data.verticesUp += 1;
          }
        }
      }
      // all vertices down
      if ( data.verticesDown >= count ) {
        if ( data.delay <= 0 ) {
          data.direction = 1;
          data.speed = 5;
          data.verticesDown = 0;
          data.delay = 320;
        } else {
          data.delay -= 1;
        }
      }
      // all vertices up
      if ( data.verticesUp >= count ) {
        if ( data.delay <= 0 ) {
          data.direction = - 1;
          data.speed = 15;
          data.verticesUp = 0;
          data.delay = 120;
        } else {
          data.delay -= 1;
        }
      }
      positions.needsUpdate = true;
    }
    this.composer.render( 0.01 );
  }

  // RENDER LIGHT
  renderLight(scene, camera, renderer) {
    renderer.toneMappingExposure = Math.pow( 200. , 5.0 ); 
    this.bulbLight.castShadow = true;
    this.bulbLight.power = this.settings.light.bulbLuminousPowers['110000 lm (1000W)'];
    this.bulbMat.emissiveIntensity = this.bulbLight.intensity / Math.pow( 0.02, 2.0 );
    this.hemiLight.intensity = this.settings.light.hemiLuminousIrradiances['400 lx (Sunrise/Sunset)'];
    const time = Date.now() * 0.5;
    this.bulbLight.position.y += Math.cos( time ) * 0.75 + 1.25;
    renderer.render( scene, camera );
  }

  // RENDER NORMAL
  renderNormal (scene, camera, renderer) {
    renderer.clear();
    renderer.render(scene, camera);
  }

  // SWITCH ANIMATE
  onInitAnimate(){
    if(!this.isFullScreen) {this.animate();}
    else{return;}
  }

  // ANIMATE TEXT POINT
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderPoint(this.scene, this.camera, this.renderer);
    this.renderLight(this.scene, this.camera, this.renderer);
  }


  // ROTATE TEXT POINT
  rotateText() {
    if (this.isTrueT(this.isRotating)){
      this.targetRotation += Math.PI * 2; // Rotate 360 degrees (2 * Math.PI)
      this.group.rotation.y += ( this.targetRotation - this.group.rotation.y ) * 0.05;
    }
  }

  ///////////////////////////////
  //**      Audio Section    **//
  ///////////////////////////////
  /*
  // LOAD AUDIO
  onInitAudio() {
    this.removeAudioHtml();
    this.createAudioHtml();
    this.onLoadAudio();
  }

  // REMOVE HTML
  removeAudioHtml() {
    const audioElement = document.getElementById('audio-container');
    const startButton = document.getElementById('startButton');
    if (audioElement) this.container.removeChild(audioElement);
  }

  // CREATE HTML 
  createAudioHtml() {
    this.$audioEl = document.createElement('div');
    this.$audioEl.id = 'audio-container'; // Set the button's id attribute (if needed)
    this.$audioEl.style.width = '360px';
    this.$audioEl.style.height = '240px';
    this.$audioEl.style.left = '16rem'; // Center the container horizontally
    this.$audioEl.style.top = '15rem';  // Center the container vertically
    this.$audioEl.style.position = 'absolute';
    this.$audioEl.style.justifyContent = 'center';
    this.$audioEl.style.alignItem  = 'center';
    this.$audioEl.style.transform = 'translate(-50%, -50%)'; // Correct the position after centering
    this.$audioEl.style.display = 'flex';
    this.$audioEl.style.zIndex = '9999';
    this.container.appendChild(this.$audioEl); // Add the button to the body element
    this.auW = this.$audioEl.clientWidth;
    this.auH = this.$audioEl.clientHeight;
    // Create a button element
    this.$startButton = document.createElement('button');
    // Set button attributes (e.g., text content, id, class, etc.)
    this.$startButton.textContent = 'START'; // Set the button's text content
    this.$startButton.style.position = 'relative'; // Set the button's id attribute (if needed)
    this.$startButton.style.top = '40%'; // Set the button's id attribute (if needed)
    this.$startButton.style.left = '0px'; // Set the button's id attribute (if needed)
    this.$startButton.textContent = 'START';
    this.$startButton.style.width = '100px';
    this.$startButton.style.height = '50px';
    this.$startButton.style.zIndex = '9999';
    this.$startButton.id = 'startButton';
    // Add the button to the HTML document (e.g., to a specific container)
    this.$audioEl.appendChild(this.$startButton); // Add the button to the body element
  }

   // INIT AUDIO
  initAudio() {
    this.audioScene = new THREE.Scene();
    this.audioCamera = new THREE.Camera();
    this.onLoadAudio();
    this.audioRenderer = new WebGPURenderer();
    this.audioRenderer.setPixelRatio(window.devicePixelRatio);
    this.audioRenderer.setSize(this.auW, this.auH);
    this.audioRenderer.setAnimationLoop(this.renderAudio.bind(this));
    this.$audioEl.appendChild(this.audioRenderer.domElement);
    window.addEventListener('resize', this.onResize);
  }

  //AUDIO RESIZE
  onAudioResize() {
    if (this.renderer) this.container.removeChild(this.renderer.domElement);
    if (this.audioRenderer) this.audioRenderer = null;
    this.audioRenderer = new WebGPURenderer();
    this.audioRenderer.setPixelRatio(window.devicePixelRatio);
    this.audioRenderer.setSize(this.containerWidth, this.containerHeight);
    this.audioRenderer.setAnimationLoop(this.renderAudio.bind(this));
    this.container.appendChild(this.audioRenderer.domElement);
    window.addEventListener('resize', this.onWindowResize);
  }


  // PLAY AUDIO BUFFER
  async playAudioBuffer(value) {
    if (this.currentAudio) this.currentAudio.stop();
    this.audioRenderer.compute( this.computeNode );
    const waveArray = new Float32Array( await this.audioRenderer.getArrayBufferAsync(this.waveGPUBuffer));
    const audioOutputContext = new AudioContext({ sampleRate });
    const audioOutputBuffer = audioOutputContext.createBuffer(1, waveArray.length, this.sampleRate);
    audioOutputBuffer.copyToChannel( waveArray, 0 );
    this.source = audioOutputContext.createBufferSource();
    this.source.connect(audioOutputContext.destination);
    this.source.buffer = audioOutputBuffer;
    this.currentAudio = this.source;
    this.currentAnalyser = audioOutputContext.createAnalyser();
    this.currentAnalyser.fftSize = 2048;
    this.source.connect( this.currentAnalyser );
  }

  // GENERATE AUDIO
  async generateAudio() {
    this.waveBuffer = this.audioBuffer.getChannelData( 0 );
    this.waveBuffer = new Float32Array([ ...this.waveBuffer, ...new Float32Array( 200000 )]);
    this.sampleRate = this.audioBuffer.sampleRate / this.audioBuffer.numberOfChannels;
    this.waveGPUBuffer = new THREE.InstancedBufferAttribute(this.waveBuffer, 1);
    const waveStorageNode = storage(this.waveGPUBuffer, 'float', this.waveBuffer.length);
    const waveNode = storage(new THREE.InstancedBufferAttribute(this.waveBuffer, 1), 'float', this.waveBuffer.length);
    const computeShaderNode = new ShaderNode( ( stack ) => {
      const index = float( instanceIndex );
      const time = index.mul( this.settings.sound.pitch );
      let wave = waveNode.element( time );
      for ( let i = 1; i < 7; i ++ ) {
        const waveOffset = waveNode.element( index.sub( this.settings.sound.delayOffset.mul( this.sampleRate ).mul( i ) ).mul( this.settings.sound.pitch ) );
        const waveOffsetVolume = waveOffset.mul( this.settings.sound.delayVolume.div( i * i ) );
        wave = wave.add( waveOffsetVolume );
      }
      const waveStorageElementNode = waveStorageNode.element( instanceIndex );
      stack.assign( waveStorageElementNode, wave );
    });
    this.computeNode = computeShaderNode.compute( this.waveBuffer.length );
    this.analyserTexture = new THREE.DataTexture( this.analyserBuffer, this.analyserBuffer.length, 1, THREE.RedFormat );
    const spectrum = texture( this.analyserTexture, viewportTopLeft.x ).x.mul( viewportTopLeft.y );
    const backgroundNode = color( 0x0000FF ).mul( spectrum );
    if(!this.isFullScreen) {this.audioScene = backgroundNode;}
    else{this.scene = backgroundNode;}
  }

  //LOAD AUDIO
  onLoadAudio() {
    return new Promise(async (resolve, reject) => {
      try {
        this.onAudioLoad();
        const response = await fetch('../static/assets/376737_Skullbeatz___Bad_Cat_Maste.ogg');
        if (!response.ok) {
          throw new Error('Failed to fetch audio');
        }
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffer = await this.decodeAudioData(arrayBuffer);
        this.generateAudio();
        this.onAudioLoaded();
        this.addEvent(this.source);
        resolve(this.onAudioLoaded());
      } catch (error) {
        this.onAudioLoadError(error);
        reject(this.onAudioLoadError());
      }
    });
  }

  decodeAudioData(arrayBuffer) {
    return new Promise((resolve, reject) => {
      const audioContext = new (AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(arrayBuffer, resolve, reject);
      console.log("this arrayBuffer", arrayBuffer);
    });
  }

  //LOAD AUDIO alternative for load async
  /*async onLoadAudio() {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('https://ia802702.us.archive.org/18/items/LoveThemeFromTheGodfather/02LoveThemeFromTheGodfather.mp3');
            this.onAudioLoad();
            if (!response.ok) {
                throw new Error('Failed to fetch audio');
            }
            const soundBuffer = await response.arrayBuffer();
            const audioContext = new AudioContext();
            this.audioBuffer = await audioContext.decodeAudioData(soundBuffer);
            this.generateAudio(); // Assuming this function is defined elsewhere in your code
            this.onAudioLoaded();
            this.addEvent(this.source);
            resolve('Audio loaded successfully');
        } catch (error) {
            this.onAudioLoadError(error);
            reject('Error loading audio');
        }
    });
  }

  onAudioLoadError(error) {
    console.error('Error loading audio:', error);
    document.body.classList.remove('loading');
  }

  onAudioLoad() {
    document.body.classList.add('loading');
  }

  onAudioLoaded() {
    document.body.classList.remove('loading');
  }

  // ONCHANGE AUDIO
  onChangeAudio() {
    /*if (this.audioGroup.children.length > 0) {
      this.audioGroup.children.parent = null;
      this.audioGroup.remove(this.audioGroup.children);
    }
    if(this.source) this.source.stop();
    this.onLoadAudio();
  }

  //EVENT LISTENER
  addEvent(source) {
    const audioControl=(source, args)=> {
      if (source) {
        if (args===true){source.start();}
        else {source.stop();}
      }
    };
    audioControl(source, this.settings.sound.enable);
    document.getElementById('startButton').addEventListener('pointerdown', () => {
      this.settings.sound.enable = this.settings.sound.enable ? false : true;
      audioControl(source, this.settings.sound.enable);
    });
    //source.setLoop(this.settings.sound.loop); // Enable looping
    //source.setVolume(this.settings.sound.volume); // Set volume (adjust as needed)
  }

  // RENDER AUDIO
  renderAudio() {
    if (this.currentAnalyser) {
      this.currentAnalyser.getByteFrequencyData(this.analyserBuffer);
      this.analyserTexture.needsUpdate = true;
    }
    if(!this.isFullScreen){this.audioRenderer.render( this.audioScene, this.audioCamera );}
  }

  // RENDER AUDIO
  renderAudio1() {
    if (this.currentAnalyser) {
      this.currentAnalyser.getByteFrequencyData(this.analyserBuffer);
      this.analyserTexture.needsUpdate = true;
    }
    if(this.isFullScreen){this.audioRenderer.render( this.scene, this.camera );}
  }


  //EVENT LISTENER
  onRemoveElement() {
    if (this.point) this.group.remove(this.point);
    this.scene.remove(this.bulbLight);
    this.scene.remove(this.hemiLight);
    this.scene.remove(this.water)
  }

  // ON TOOGLE AUDIO VISUALIZER SCREEN
  onToggleAudioScreen() {
    if (this.isFullScreen) {
      console.log("this condition is met");
      var audioContainer = document.getElementById('audio-container');
      this.containter.removeChild(audioContainer);
      this.onRemoveElement();
      this.onAudioResize();
      this.generateAudio();
      this.renderAudio1();
    } else {
      this.removeAudioHtml();
      this.createAudioHtml();
      this.onRefreshTextPoint();
      this.addBulbLight();
      this.addWater();
    }
  }

  // RESIZE WINDOW
  onWindowResize() {
    this.audioCamera.aspect = window.innerWidth / window.innerHeight;
    this.audioCamera.updateProjectionMatrix();
    this.audioRenderer.setSize( window.innerWidth, window.innerHeight );
  }

  // MATCH SOUND
  matchSoundtrack(val, list) {
    for (const [key, value] of Object.entries(list)) {
        if (key === val) {
        return (value);
      }
    }
  }*/
}

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS TextTrail*******************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize TextTrail
 * @class TextTrail
 * @param options 
*/
class TextTrail {
  constructor(options) {
    this.options = options;
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.clock = new THREE.Clock();
    this.last = performance.now();
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    this.defaultOptions = { 
      camera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 ),
      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer({ antialias: true }),
      gui: new GUI(),
      index: 0
    };
    this.guiEl;
    this.MOBILE_BREAKPOINT = 800;
    this.baseVertex = T.shaders.vs.baseVertex;
    this.textFragment = T.shaders.fs.textFragment;
    this.persistenceFragment = T.shaders.fs.persistenceFragment;
    this.TYPEKIT_WEB_PROJECT_ID = 'fxj1otx';
    this.DEFAULT_FONT_FAMILY = 'droid-sans-mono';
    this.BORDER_PADDING = this.innerWidth > this.MOBILE_BREAKPOINT ? 40 : 30;
    this.START_COLOR = '#362cb7';
    this.startColorRGB = hexRgb(this.START_COLOR, { format: 'array' });
    this.BACKGROUND_COLOR = '#111';
    this.PERSIST_COLOR = [
      this.startColorRGB[0] / 255,
      this.startColorRGB[1] / 255,
      this.startColorRGB[2] / 255,
    ];
    this.TARGET_PERSIST_COLOR = [...this.PERSIST_COLOR];
    this.fontFamilies = [];
    this.mousePos = [0, 0];
    this.targetMousePos = [0, 0];
    this.clock = new THREE.Clock();
    this.fluidScene = new THREE.Scene();
    this.fullscreenQuadMaterial;
    this.fullscreenBorderMaterial;
    this.fullscreenBorderMesh; 
    this.orthoCamera; 
    this.fluidRenderTarget0;
    this.fluidRenderTarget1;
    this.textCanvas;
    this.textCtx;
    this.labelMaterial;
    this.settings();
    this.init();
  }

  settings () {
    let that = this;
    this.settings = {
      text: 'Surreal',
      noiseFactor: 1,
      noiseScale: 0.0032,
      rgbPersistFactor: 0.98,
      alphaPersistFactor: 0.97,
      color: '#fff',
      borderColor: this.MOBILE_BREAKPOINT > 800 ? '#111' : '#222',
      showBorder: true,
      animateColor: true,
      fontFamily: this.DEFAULT_FONT_FAMILY,  
    }
  }

  init() {
    this.onInitTrail();
    WebFont.load({
      typekit: {
        id: this.TYPEKIT_WEB_PROJECT_ID,
      },
      active: this.onFontActive.bind(this),
      fontactive: this.onFontLoaded.bind(this),
      fontinactive: this.onFontLoadError.bind(this),
    });
    this.onCreateTextTrail();
    this.renderSetup();
    //this.addGUITrail(this.gui);
  }

  onInitTrail() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({alpha: true,});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
    this.orthoCamera = new THREE.OrthographicCamera(
      -this.innerWidth / 2,
      this.innerWidth / 2,
      this.innerHeight / 2,
      -this.innerHeight / 2,
      0.1,
      10,
    );
    this.orthoCamera.position.set(0, 0, 1);
    this.orthoCamera.lookAt(new THREE.Vector3(0, 0, 0));
    this.textCanvas = document.createElement('canvas');
    this.textCtx = this.textCanvas.getContext('2d');
    this.fluidRenderTarget0 = new THREE.WebGLRenderTarget(
      this.renderer.domElement.clientWidth,
      this.renderer.domElement.clientHeight,
    );
    this.fluidRenderTarget1 = this.fluidRenderTarget0.clone();
    const fullscreenQuadGeometry = new THREE.PlaneGeometry(this.innerWidth, this.innerHeight);
    this.fullscreenQuadMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sampler: { value: null },
        time: { value: 0 },
        aspect: { value: this.innerWidth / this.innerHeight },
        mousePos: { value: new THREE.Vector2(-1, 1) },
        noiseFactor: { value: this.settings.noiseFactor },
        noiseScale: { value: this.settings.noiseScale },
        rgbPersistFactor: { value: this.settings.rgbPersistFactor },
        alphaPersistFactor: { value: this.settings.alphaPersistFactor },
      },
      vertexShader: this.baseVertex,
      fragmentShader: this.persistenceFragment,
      transparent: true,
    });
    const fullscreenQuad = new THREE.Mesh(fullscreenQuadGeometry, this.fullscreenQuadMaterial);
    this.fluidScene.add(fullscreenQuad);
    const fullscreenBorderVertices = new Float32Array(4 * 2);
    fullscreenBorderVertices[0] = -this.innerWidth / 2 + this.BORDER_PADDING;
    fullscreenBorderVertices[1] = this.innerHeight / 2 - this.BORDER_PADDING;
    fullscreenBorderVertices[2] = this.innerWidth / 2 - this.BORDER_PADDING;
    fullscreenBorderVertices[3] = this.innerHeight / 2 - this.BORDER_PADDING;
    fullscreenBorderVertices[4] = this.innerWidth / 2 - this.BORDER_PADDING;
    fullscreenBorderVertices[5] = -this.innerHeight / 2 + this.BORDER_PADDING;
    fullscreenBorderVertices[6] = -this.innerWidth / 2 + this.BORDER_PADDING;
    fullscreenBorderVertices[7] = -this.innerHeight / 2 + this.BORDER_PADDING;
    const fullscreenBorderGeometry = new THREE.BufferGeometry();
    const boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), /* radius */);
    fullscreenBorderGeometry.boundingSphere = boundingSphere;
    fullscreenBorderGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(fullscreenBorderVertices, 2),
    );
    this.fullscreenBorderMaterial = new THREE.LineBasicMaterial({
      color: this.settings.borderColor,
    });
    this.fullscreenBorderMesh = new THREE.LineLoop(
      fullscreenBorderGeometry,
      this.fullscreenBorderMaterial,
    );
    this.scene.add(this.fullscreenBorderMesh);
    const planeUnit = this.innerWidth > this.innerHeight ? this.innerHeight : this.innerWidth;
    const labelGeometry = new THREE.PlaneGeometry(planeUnit, planeUnit);
    this.labelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sampler: { value: null },
        color: { value: new THREE.Vector3(1, 1, 1) },
      },
      vertexShader: this.baseVertex,
      fragmentShader: this.textFragment,
      transparent: true,
    });
    this.labelMesh = new THREE.Mesh(labelGeometry, this.labelMaterial);
    this.scene.add(this.labelMesh);
  }

  // TRAIL GUI
  addGUITrail(gui) {
    gui.add(this.settings, 'text').onChange((text) => {
      this.settings.text = text;
      this.onCreateTextTrail({ text });
    });
    gui.add(this.settings, 'noiseFactor', 0.1, 50, 0.1).onChange((v) => {
      this.fullscreenQuadMaterial.uniforms.noiseFactor.value = v;
    });
    gui.add(this.settings, 'noiseScale', 0.002, 0.01, 0.001).onChange((v) => {
      this.fullscreenQuadMaterial.uniforms.noiseScale.value = v;
    });
    gui.add(this.settings, 'rgbPersistFactor', 0.01, 0.99, 0.01).onChange((v) => {
      this.fullscreenQuadMaterial.uniforms.rgbPersistFactor.value = v;
    });
    gui.add(this.settings, 'alphaPersistFactor', 0.01, 0.99, 0.01).onChange((v) => {
      this.fullscreenQuadMaterial.uniforms.alphaPersistFactor.value = v;
    });
    gui.add(this.settings, 'animateColor');
    gui.addColor(this.settings, 'color').onChange((v) => {
      const rgba = hexRgb(v, { format: 'array' });
      this.PERSIST_COLOR[0] = rgba[0] / 255;
      this.PERSIST_COLOR[1] = rgba[1] / 255;
      this.PERSIST_COLOR[2] = rgba[2] / 255;
    });
    gui.addColor(this.settings, 'borderColor').onChange((v) => {
      this.fullscreenBorderMaterial.color = new THREE.Color(v);
    });
    gui.add(this.settings, 'showBorder').onChange((v) => {
      this.fullscreenBorderMesh.visible = v;
    });
    return gui;
  }

  // FOR TRAIL RESIZE
  onTrailResize(resizeCamera = true, resizeFramebuffers = true) {
    this.renderer.setSize(this.innerWidth, this.innerHeight);
    this.renderer.setPixelRatio(devicePixelRatio || 1);
    const aspect = this.innerWidth / this.innerHeight;
    this.fullscreenQuadMaterial.uniforms.aspect.value = aspect;
    if (resizeCamera) {
      this.orthoCamera.left = -this.innerWidth / 2;
      this.orthoCamera.right = this.innerWidth / 2;
      this.orthoCamera.top = this.innerHeight / 2;
      this.orthoCamera.bottom = -this.innerHeight / 2;
      this.orthoCamera.aspect = aspect;
      this.orthoCamera.updateProjectionMatrix();
    }
    if (resizeFramebuffers) {
      this.fluidRenderTarget0.setSize(
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight,
      )
      this.fluidRenderTarget1.setSize(
        this.renderer.domElement.clientWidth,
        this.renderer.domElement.clientHeight,
      )
    }
  }

  onCreateTextTrail() {
    const text = this.settings.text;
    const fontFamily = this.settings.fontFamily;
    const horizontalPadding = 0.75;
    const idealCanvasSize = 2048;
    const maxTextureSize = Math.min(
      this.renderer.capabilities.maxTextureSize,
      idealCanvasSize,
    );
    this.textCanvas.width = maxTextureSize;
    this.textCanvas.height = maxTextureSize;
    this.textCtx.fillStyle = '#fff';
    this.textCtx.strokeStyle = '#fff';
    this.textCtx.lineWidth = 1;
    this.textCtx.textAlign = 'center';
    this.textCtx.textBaseline = 'middle';
    const referenceFontSize = 250;
    this.textCtx.font = `${referenceFontSize}px ${fontFamily}`;
    const textWidth = this.textCtx.measureText(text).width;
    const deltaWidth = (this.textCanvas.width * horizontalPadding) / textWidth;
    const fontSise = referenceFontSize * deltaWidth;
    this.textCtx.font = `${fontSise}px ${fontFamily}`;
    this.textCtx.fillText(text, this.textCanvas.width / 2, this.textCanvas.height / 2);
    this.labelMaterial.uniforms.sampler.value = new THREE.CanvasTexture(this.textCanvas);
  }

  onAnimLoop() {
    const dt = this.clock.getDelta();
    if (this.settings.animateColor) {
      this.PERSIST_COLOR[0] += (this.TARGET_PERSIST_COLOR[0] - this.PERSIST_COLOR[0]) * dt;
      this.PERSIST_COLOR[1] += (this.TARGET_PERSIST_COLOR[1] - this.PERSIST_COLOR[1]) * dt;
      this.PERSIST_COLOR[2] += (this.TARGET_PERSIST_COLOR[2] - this.PERSIST_COLOR[2]) * dt;
    }
    {
      const mouseSpeed = dt * 5;
      this.mousePos[0] += (this.targetMousePos[0] - this.mousePos[0]) * mouseSpeed;
      this.mousePos[1] += (this.targetMousePos[1] - this.mousePos[1]) * mouseSpeed;
      this.fullscreenQuadMaterial.uniforms.mousePos.value.x = this.mousePos[0];
      this.fullscreenQuadMaterial.uniforms.mousePos.value.y = this.mousePos[1];
    }
    this.fullscreenQuadMaterial.uniforms.sampler.value = this.fluidRenderTarget1.texture;
    this.fullscreenQuadMaterial.uniforms.time.value = this.clock.getElapsedTime();
    this.renderer.autoClearColor = false;
    this.renderer.setRenderTarget(this.fluidRenderTarget0);
    this.renderer.clearColor();
    this.renderer.render(this.fluidScene, this.orthoCamera);
    this.labelMesh.material.uniforms.color.value.set(...this.PERSIST_COLOR);
    this.renderer.render(this.scene, this.orthoCamera);
    this.renderer.setRenderTarget(null);
    this.labelMesh.material.uniforms.color.value.set(...this.PERSIST_COLOR);
    this.renderer.render(this.fluidScene, this.orthoCamera);
    this.renderer.render(this.scene, this.orthoCamera);
    const temp = this.fluidRenderTarget0;
    this.fluidRenderTarget0 = this.fluidRenderTarget1;
    this.fluidRenderTarget1 = temp;
  }

  onColorChange() {
    this.TARGET_PERSIST_COLOR[0] = Math.random();
    this.TARGET_PERSIST_COLOR[1] = Math.random();
    this.TARGET_PERSIST_COLOR[2] = Math.random();
  }

  renderSetup() {
    setInterval(this.onColorChange.bind(this), 3000)
    this.renderer.setAnimationLoop(this.onAnimLoop.bind(this));
    document.body.addEventListener('mousemove', (e)=>this.onTrailMouseMove(e));
    window.addEventListener('resize', (resizeCamera = true, resizeFramebuffers = true)=>this.onTrailResize(resizeCamera = true, resizeFramebuffers = true));
  }

  onFontActive() {
    document.body.classList.remove('loading');
      T.t
      .add(this.settings, 'fontFamily', this.fontFamilies)
      .onChange((fontFamily) => this.onCreateTextTrail({ fontFamily }));
  }

  onFontLoaded(familyName, fvd) {
    this.fontFamilies.push(familyName)
    console.log(`loaded: ${familyName} ${fvd}`)
    if (familyName === this.DEFAULT_FONT_FAMILY) {
      this.onCreateTextTrail();
    }
  }

  onFontLoadError(familyName, fvd) {
    console.error(`Could not load ${familyName} ${fvd}`)
  }

  onTrailMouseMove(e) {
    const x = (e.pageX / this.innerWidth) * 2 - 1;
    const y = (1 - e.pageY / this.innerHeight) * 2 - 1;
    this.targetMousePos[0] = x;
    this.targetMousePos[1] = y;
  }
}

///////////////////////////////////////////////////////////////////////////////
//*******************************CLASS TextKinetic***************************//                               
//////////////////////////////////////////////////////////////////////////////
class GLScene{
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.z = 1;
    this.scene = new THREE.Scene();
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);    
    this.clock = new THREE.Clock();
    this.init();
  }

  render() {
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    for (let i = 0; i < this.scene.children.length; i++) {
      const obj = this.scene.children[i];
      obj.updateTime(this.clock.getElapsedTime());
    }    
    this.render();
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  init() {
    this.addToDom();
    this.animate();
    this.addEvents();
  }

  addToDom() {
    const canvas = this.renderer.domElement;
    const container = document.querySelector('.container2');
    container.appendChild(canvas);
  }

  resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// CALL GLScene class
let GL = new GLScene();
//////////////////////

/**
 * call this class to initialize TextKinetic
 * @class TextKinetic
 * @param options 
*/
class TextKinetic {
  constructor(options) {
    this.options = options;
    this.container = options.container;
    this.scene = GL.scene;
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.clock = new THREE.Clock();
    this.last = performance.now();
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    //this.elems = [...document.querySelectorAll('.frame__demo')]
    //this.prev = 0;
    //this.current = 0;
    this.index = 0;
    this.shaders = T.shaders;
    this.defaultOptions = { 
      camera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 ),
      scene: new THREE.Scene(),
      renderer: new THREE.WebGLRenderer( { antialias: true } ),
      gui: new GUI(),
    };
    this.file = {
      kinetic1: '../../static/src/fonts/ttf/kenpixel.ttf',
      kinetic2: '../../static/src/fonts/ttf/kenpixel.ttf',
      kinetic3: '../../static/src/fonts/ttf/kenpixel.ttf',
      kinetic4: '../../static/src/fonts/ttf/kenpixel.ttf',
    };
    this.atlas = {
      kinetic1: '../../static/src/fonts/Orbitron-Black.png',
      kinetic2: '../../static/src/fonts/MontserratAlternates-Bold.png',
      kinetic3: '../../static/src/fonts/ArchivoBlack-Regular.png',
      kinetic4: '../../static/src/fonts/OpenSans-SemiBold.png',
    };      
    //this.checkCompatibility(); 
    this.AppOpts = {
      settings:
      [
        {
          word: 'ENDLESS',
          color: '#ffffff',
          fill: '#000000',
          bevelEnabled: true,
          fontWeight: 'bold',
          size: 70,
          height: 20,
          curveSegments:4,
          bevelThickness: 2,
          bevelSize: 1.5,
          geometry: new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3),
          position: {
            texture: [-0.965, -0.4, 0],
            mesh: [0, 0, 0]
          },
          scale: [0.008, 0.04, 1],
          shaders: {
            vertex: this.shaders.vs.kinetic_demo1,
            fragment: this.shaders.fs.kinetic_demo1
          },
          font: {
            file: this.file.kinetic1,
            atlas: this.atlas.kinetic1
          },
          class: 'demo-1'
        },
        {
          word: 'SWIRL',
          color: '#ffffff',
          fill: '#3e64ff',
          bevelEnabled: true,
          fontWeight: 'bold',
          size: 70,
          height: 20,
          curveSegments:4,
          bevelThickness: 2,
          bevelSize: 1.5,
          geometry: new THREE.SphereGeometry(12, 64, 64),
          position: {
            texture: [-0.9, -0.5, 0],
            mesh: [0, 0, 0]
          },
          scale: [0.0115, 0.04, 1],
          shaders: {
            vertex: this.shaders.vs.kinetic_demo2,
            fragment: this.shaders.fs.kinetic_demo2
          },
          font: {
            file: this.file.kinetic2,
            atlas: this.atlas.kinetic2
          },
          class: 'demo-2'
        },
        {
          word: 'TWISTED',
          color: '#ffffff',
          fill: '#d8345f',
          bevelEnabled: true,
          fontWeight: 'bold',
          size: 70,
          height: 20,
          curveSegments:4,
          bevelThickness: 2,
          bevelSize: 1.5,
          geometry: new THREE.BoxGeometry(100, 10, 10, 64, 64, 64),
          position: {
            texture: [-0.945, -0.5, 0],
            mesh: [0, 0, 0]
          },
          scale: [0.009, 0.04, 1],
          shaders: {
            vertex: this.shaders.vs.kinetic_demo3,
            fragment: this.shaders.fs.kinetic_demo3
          },
          font: {
            file: this.file.kinetic3,            
            atlas: this.atlas.kinetic3
          },
          class: 'demo-3'
        },

        {
          word: 'RELAX',
          color: '#fff',
          fill: '#e3e6e5',
          bevelEnabled: true,
          fontWeight: 'bold',
          size: 70,
          height: 20,
          curveSegments:4,
          bevelThickness: 2,
          bevelSize: 1.5,
          geometry: new THREE.PlaneGeometry(27, 27, 64, 64),
          position: {
            texture: [-0.9, -0.65, 0],
            mesh: [0, 0, 0]
          },
          scale: [0.014, 0.05, 1],
          shaders: {
            vertex: this.shaders.vs.kinetic_demo4,
            fragment: this.shaders.fs.kinetic_demo4
          },
          font: {
            file: this.file.kinetic4, 
            atlas: this.atlas.kinetic4
          },
          class: 'demo-4'
        }
      ]
    };
    this.elems = [...document.querySelectorAll('.frame__demo-kinetic')];
    this.prev = 0;
    this.current = 0;
    this.turn = 0;
    this.settings();
    this.init();
  }

  /*checkCompatibility() {
    if ( this.options.scene === undefined && this.isFalseT(this.options.scene instanceof THREE.Scene)) {
      this.scene = this.defaultOptions.scene;
    } else {this.scene = this.options.scene;}
     if (this.isFalseT(this.options.camera instanceof THREE.PerspectiveCamera)) {
      this.camera = this.defaultOptions.camera;
    }else {this.camera = this.options.camera;}
    if (this.isFalseT(this.options.renderer instanceof THREE.WebGLRenderer)) {
      this.renderer = this.defaultOptions.renderer;
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.container.appendChild( this.renderer.domElement);
    }else{this.renderer = this.options.renderer;}
    if (this.isFalseT(this.options.gui instanceof GUI)) {this.gui = this.defaultOptions.gui;}else{this.gui=this.options.gui}
    for (var opt in Object.keys(this.defaultOptions).filter(key => key !== 'renderer' && key !== 'camera' && key !== 'scene')) {
      if (this.defaultOptions.hasOwnProperty(opt)) {
          this.options[opt] = typeof this.options[opt] === "undefined" ? this.defaultOptions[opt] : this.options[opt];
      }
    }
  }*/

  settings () {
    let that = this;
    this.settings = {
      'demo1': ()=> {
        this.switchDemo(0);
      },
      'demo2': ()=> {  
        this.switchDemo(1);
      },
      'demo3': ()=> {
        this.switchDemo(2);
      },
      'demo4': ()=> {
        this.switchDemo(3);
      }
    }
  }

  init() {
    this.createGl();
  }

  // KINETIC GUI
  addGUIKinetic(gui) {
    //gui.add(OPTIONS, 'text').onChange((text) => {
      //drawText({ text })
    //});
    gui.add(this.settings, 'demo1');
    gui.add(this.settings, 'demo2');
    gui.add(this.settings, 'demo3');
    gui.add(this.settings, 'demo4');
    return gui;
  }

  createGl() {
    for (let i = 0; i < this.AppOpts.settings.length; i++) {
      // Position elements in a circle
      let angle = (i / this.AppOpts.settings.length) * (Math.PI * 2) + Math.PI * 1.5; // Offset the turn
      let radius = 50;
      let x = radius * Math.cos(angle);
      let z = radius * Math.sin(angle);  
      this.AppOpts.settings[i].position.mesh = [x, 0, z];
      let type = new Type();
      type.init(this.AppOpts.settings[i]);   
    } 
  }

  changeDemo() {
    this.elems.forEach((el, index) => el.addEventListener('click', this.onClick.bind(this, index)));    
  }

  switchDemo(index) {
    this.elems.forEach(el => el.classList.remove('frame__demo--current-kinetic'));
    this.elems[index].classList.add('frame__demo--current-kinetic');
    this.prev = this.current;
    this.current = index;
    if (this.prev === this.current) return;
    this.turn = (Math.PI / 2) * (this.current - this.prev);
    gsap.timeline({
      onStart: () => {
        document.body.classList.add(this.AppOpts.settings[index].class || ''); // Add a fallback for class
        document.body.classList.add(this.AppOpts.settings[index].class);
      }
    })
    .to(this.scene.rotation, {
      duration: 1.5,
      ease: "expo.inOut",
      y: `+=${this.turn}`,
    });
  }

  /*
  onClick(index,) {
    this.elems.forEach(el => el.classList.remove('frame__demo--current'));
    currentTarget.classList.add('frame__demo--current'); 
    this.prev = this.current;
    this.current = this.elems.indexOf(currentTarget);
    if (this.prev === this.current) return;
    guiurn = (Math.PI / 2) * (this.current - this.prev);
    guil = gsap.timeline({
      onStart: () => {
        document.body.classList = "";
        document.body.classList.add(this.opts[index].class);
      }
    });
    guil
      .to(this.scene.rotation, {
        duration: 1.5,
        ease: "expo.inOut",
        y: `+=${guiurn}`,
    });
  }*/
}


class Type extends THREE.Object3D {
  init(optionSettings) {
    this.options = optionSettings;
    this.MSDFShader = createMSDFShader.bind(this);
    this.fontFile = './fonts/Orbitron-Black.fnt';
    this.fontAtlas = './fonts/Orbitron-Black.png';
    this.opts = {
      word: this.options.word,
      color: this.options.color,
      fill: this.options.fill,
      bevelEnabled: this.options.bevelEnabled,
      fontWeight: this.options.fontWeight,
      size: this.options.size,
      height: this.options.height,
      curveSegments: this.options.curveSegments,
      bevelThickness: this.options.bevelThickness,
      bevelSize: this.options.bevelSize,
      wordPosition: this.options.position.texture,
      wordScale: this.options.scale,
      position: this.options.position.mesh,
      rotation: this.options.rotation || [0, 0, 0],
      geometry: this.options.geometry,
      vertex: this.options.shaders.vertex,
      fragment: this.options.shaders.fragment,
      fontFile: this.options.font.file || this.fontFile,
      fontAtlas: this.options.font.atlas || this.fontAtlas
    };
    /*const fontLoader = new FontLoader();
    fontLoader.load(this.opts.fontFile, (font) => {
      this.font = font;
      this.fontGeometry = new TextGeometry(this.opts.word, {
        font: this.font,
        size: this.opts.size,
        height: this.opts.height,
        curveSegments: this.opts.curveSegments,
        bevelThickness: this.opts.bevelThickness,
        bevelSize: this.opts.bevelSize,
        bevelEnabled: this.opts.bevelEnabled
      });
      // Load texture containing font glyphs
      this.loader = new THREE.TextureLoader();
       this.loader.load(this.opts.fontAtlas, (texture) => {
        this.fontMaterial = new THREE.RawShaderMaterial(
          this.MSDFShader({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            negate: false,
            color: this.opts.color
            })
          );
        });
      });*/  
      this.createRenderTarget();
      this.createMesh();
  }

  createRenderTarget() {
    // Render Target setup
    this.rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.rtCamera.position.z = 2.4;
    this.rtScene = new THREE.Scene();
    this.rtScene.background = new THREE.Color(this.opts.fill);
    this.text = this.createText(this.opts);
    this.text.position.set(...this.opts.wordPosition);
    this.text.rotation.set(Math.PI, 0, 0);
    this.text.scale.set(...this.opts.wordScale);
    this.rtScene.add(this.text);
  }

  clear(scene) {
    if (scene.children.length > 0) {
      /*const object = scene.children.pop();
      if (object.dispose) {
        object.dispose();
      }
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (object.material.map) {
          object.material.map.dispose();
        }
        object.material.dispose();
      }*/
      scene.remove(scene.children);
    }
    return scene;
  }


  createText(opts) {
    const myText = new Text();
    myText.text = opts.word;
    myText.fontSize = opts.size;
    myText.font = opts.fontFile;
    myText.color = opts.color;
    myText.fill = opts.fill;
    myText.sync();
    return myText;
  }

  createMesh() {
    this.geometry = this.opts.geometry;
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.opts.vertex,
      fragmentShader: this.opts.fragment,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.rt.texture }
      },
      defines: {
        PI: Math.PI
      },
      //wireframe: true,
      side: THREE.DoubleSide
    });

    //console.log("this.material", this.material);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(...this.opts.position);
    this.mesh.rotation.set(...this.opts.rotation);
    this.mesh.lookAt(new THREE.Vector3());
    this.mesh.onBeforeRender = (renderer) => {
      renderer.setRenderTarget(this.rt);
      renderer.render(this.rtScene, this.rtCamera);
      renderer.setRenderTarget(null);
    };
    this.add(this.mesh);
    GL.scene.add(this);
  }

  updateTime(time) {
    this.material.uniforms.uTime.value = time;
  }
}


TextKinetic.prototype.createHTMLElements = function () {
  const hrefNum = 4;
  this.$stage = document.createElement('div');
  this.$stage.className = "frame__demos-kinetic"; // Use 'className' instead of 'class'
  this.$linkHref = document.createElement('a');
  this.$linkHref.className = "frame__demo frame__demo--current-kinetic"; // Use 'className' instead of 'class'
  this.$stage.appendChild(this.$linkHref); // Use '$linkHref' instead of '$linkhref'
  this.$linkHrefs = []; // Initialize navLis array
  for (let i = 0; i < hrefNum; i++) {
    this.$linkHrefs[i] = document.createElement('a'); // Use 'i' as the index
    this.$linkHrefs[i].className = "frame__demo-kinetic"; // Use 'className' instead of 'class'
    this.$stage.appendChild(this.$linkHrefs[i]); // Use '$linkHrefs[i]' instead of '$linkHrefs'
  }
  this.$stage.style.display = "none";
  return this.$stage;
}

function simpleAssign(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}

function createMSDFShader (opt) {
  opt = opt || {};
  var opacity = typeof opt.opacity === 'number' ? opt.opacity : 1;
  var alphaTest = typeof opt.alphaTest === 'number' ? opt.alphaTest : 0.0001;
  var precision = opt.precision || 'highp';
  var color = opt.color;
  var map = opt.map;
  var negate = typeof opt.negate === 'boolean' ? opt.negate : true;

  // remove to satisfy r73
  delete opt.map;
  delete opt.color;
  delete opt.precision;
  delete opt.opacity;
  delete opt.negate;

  return simpleAssign({
    uniforms: {
      opacity: { type: 'f', value: opacity },
      map: { type: 't', value: map || new THREE.Texture() },
      color: { type: 'c', value: new THREE.Color(color) }
    },
    vertexShader: [
      'attribute vec2 uv;',
      'attribute vec4 position;',
      'uniform mat4 projectionMatrix;',
      'uniform mat4 modelViewMatrix;',
      'varying vec2 vUv;',
      'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * position;',
      '}'
    ].join('\n'),
    fragmentShader: [
      '#ifdef GL_OES_standard_derivatives',
      '#extension GL_OES_standard_derivatives : enable',
      '#endif',
      'precision ' + precision + ' float;',
      'uniform float opacity;',
      'uniform vec3 color;',
      'uniform sampler2D map;',
      'varying vec2 vUv;',

      'float median(float r, float g, float b) {',
      '  return max(min(r, g), min(max(r, g), b));',
      '}',

      'void main() {',
      '  vec3 sample = ' + (negate ? '1.0 - ' : '') + 'texture2D(map, vUv).rgb;',
      '  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;',
      '  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);',
      '  gl_FragColor = vec4(color.xyz, alpha * opacity);',
      alphaTest === 0
        ? ''
        : '  if (gl_FragColor.a < ' + alphaTest + ') discard;',
      '}'
    ].join('\n')
  }, opt);
}

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS TextPhysic*************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize TextPhysic
 * @class TextPhysic
 * @param options 
*/
class TextPhysic {
  constructor(options) {
    this.options = options;
    //this.renderer = options.renderer;
    this.opts = {
      text1:{
        force : 25,
        //distance: 15,
        fontURL: '../../static/src/fonts/helvetiker_bold.typeface.json',
        colors: [
          {
              from : new THREE.Color('#ff699f'),
              to   : new THREE.Color('#a769ff'),
          },
          {
              from : new THREE.Color('#683fee'),
              to   : new THREE.Color('#527ee1'),
          },
          {
              from : new THREE.Color('#ee663f'),
              to   : new THREE.Color('#f5678d'),
          },
          {
              from : new THREE.Color('#ee9ca7'),
              to   : new THREE.Color('#ffdde1'),
          },
          {
              from : new THREE.Color('#f7971e'),
              to   : new THREE.Color('#ffd200'),
          },
          {
              from : new THREE.Color('#56ccf2'),
              to   : new THREE.Color('#2f80ed'),
          },
          {
              from : new THREE.Color('#fc5c7d'),
              to   : new THREE.Color('#6a82fb'),
          },
          {
              from : new THREE.Color('#dce35b'),
              to   : new THREE.Color('#45b649'),
          },
        ]
      },
      text2:{
        force : 50,
        //distance: 15,
        fontURL: '../../static/src/fonts/helvetiker_bold.typeface.json',
        colors: [
          {
              from : new THREE.Color('#76B36F'),
              to   : new THREE.Color('#D8F285'),
          },
          {
              from : new THREE.Color('#86DE93'),
              to   : new THREE.Color('#4C7B69'),
          },
          {
              from : new THREE.Color('#67C473'),
              to   : new THREE.Color('#3D7D36'),
          },
        ]
      },
      text3:{
        force : 30,
        //distance: 15,
        fontURL: '../../static/src/fonts/helvetiker_bold.typeface.json',
        colors: [
          {
              from : new THREE.Color('#DF872D'),
              to   : new THREE.Color('#B35E07'),
          },
          {
              from : new THREE.Color('#e2ad76'),
              to   : new THREE.Color('#bb7d6e'),
          },
          {
              from : new THREE.Color('#5d3d42'),
              to   : new THREE.Color('#5d2d29'),
          },
        ]
      }
    };
    this.DropMenuOpts = {
      settings: this.opts.text1,
      renderer: this.renderer
    };
    this.HingeMenuOpts = {
      settings: this.opts.text2,
      renderer: this.renderer
    };
    this.StickyMenuOpts = {
      settings: this.opts.text3,
      renderer: this.renderer

    };
    this.isDemo1 = false;
    this.isDemo2 = false;
    this.isDemo3 = false;
    this.OPTIONS = {
      'demo1': () => {
        this.isDemo1 = true;
        this.isDemo2 = false;
        this.isDemo3 = false;
        this.switchDemo();
        this.onResize();
      },
      'demo2': () => {
        this.isDemo1 = false;
        this.isDemo2 = true;
        this.isDemo3 = false;
        this.switchDemo();
        this.onResize();
      },
      'demo3': () => {
        this.isDemo1 = false;
        this.isDemo2 = false;
        this.isDemo3 = true;
        this.switchDemo();
        this.onResize();
      },
    };
    //this.createHTMLElements();
    this.bindEvents();
  }

  bindEvents() {
      window.addEventListener('resize', () => { this.onResize() })
  }

  onResize() {
      this.mainScene.scene.scale.set(0.7, 0.7, 0.7);
  }

  switchDemo() {
    if(this.isDemo1) this.mainScene = new SceneDropMenu(this.DropMenuOpts);
    if(this.isDemo2) this.mainScene = new SceneHingeMenu(this.HingeMenuOpts);
    if(this.isDemo3) this.mainScene = new SceneMenuSticky(this.StickyMenuOpts);
  }

  // Physic GUI
  addGUIPhysic(gui) {
    //gui.add(this.OPTIONS, 'text')
    gui.add(this.OPTIONS, 'demo1');
    gui.add(this.OPTIONS, 'demo2');
    gui.add(this.OPTIONS, 'demo3');
    return gui;
  }
}

class SceneDropMenu {
  constructor(options) {
    this.$stage = T.container;
    this.options = options;
    //this.renderer = options.renderer;
    this.settings = options.settings;
    this.distance = 15;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.aspect = this.W / this.H;
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
      window.addEventListener('resize', () => { this.onResize() })
  }
  setup() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -50, 0);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x312929, -10, 100);
    this.setCamera();
    this.setLights();
    this.setRender();
    this.addObjects();
    // this.setupDebug()
  }
  onResize() {
      this.camera.aspect = this.aspect;
      this.camera.top    = this.distance;
      this.camera.right  = this.distance;
      this.camera.bottom = -this.distance;
      this.camera.left   = -this.distance;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.W, this.H);
  }

  setCamera() {
      this.camera = new THREE.OrthographicCamera(-this.distance * this.aspect, this.distance * this.aspect, this.distance, -this.distance, -10, 100);
      this.camera.position.set(-10, 10, 10)
      this.camera.lookAt(new THREE.Vector3())
  }

  setLights() {
      const ambient = new THREE.AmbientLight(0xcccccc);
      this.scene.add(ambient);
      const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
      foreLight.position.set(5, 5, 20);
      this.scene.add(foreLight);
      const backLight = new THREE.DirectionalLight(0xffffff, 1);
      backLight.position.set(-5, -5, -10);
      this.scene.add(backLight);
  }

  setRender() {
      this.renderer = new THREE.WebGLRenderer({
          antialias: true,
      });
      this.renderer.setClearColor(0x312929);
      this.renderer.setSize(this.W, this.H);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setAnimationLoop(() => { this.draw() });
      this.$stage.appendChild(this.renderer.domElement);    
  }

  addObjects() {
      this.menu = new MenuDrop(this.scene, this.world, this.camera, this.settings);
  }

  setupDebug() {
      //this.dbr = new CannonDebugRenderer(this.scene, this.world)
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableKeys = false;
      this.controls.update();
  }

  draw() {
      this.updatePhysics();
      this.renderer.render(this.scene, this.camera);
  }

  updatePhysics() {
      if (this.dbr) this.dbr.update();
      this.menu.update();
      this.world.step(1 / 60);
  }
}



class SceneHingeMenu {
  constructor(options) {
    this.$stage = T.container;
    this.options = options;
    this.renderer = options.renderer;
    this.settings = options.settings;
    this.distance = 15;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.aspect = this.W / this.H;
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
      window.addEventListener('resize', () => { this.onResize() })
  }
  setup() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -50, 0);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x312929, -10, 100);
    this.setCamera();
    this.setLights();
    this.setRender();
    this.addObjects();
    // this.setupDebug()
  }
  onResize() {
      this.camera.aspect = this.aspect;
      this.camera.top    = this.distance;
      this.camera.right  = this.distance * this.camera.aspect;
      this.camera.bottom = -this.distance;
      this.camera.left   = -this.distance * this.camera.aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.W, this.H);
  }

  setCamera() {
      this.camera = new THREE.OrthographicCamera(-this.distance * this.aspect, this.distance * this.aspect, this.distance, -this.distance, -10, 100);
      this.camera.position.set(-10, 10, 10)
      this.camera.lookAt(new THREE.Vector3())
  }

  setLights() {
      const ambient = new THREE.AmbientLight(0xcccccc)
      this.scene.add(ambient)
      const foreLight = new THREE.DirectionalLight(0xffffff, 0.5)
      foreLight.position.set(5, 5, 20)
      this.scene.add(foreLight)
      const backLight = new THREE.DirectionalLight(0xffffff, 1)
      backLight.position.set(-5, -5, -10)
      this.scene.add(backLight)
  }

  setRender() {
      this.renderer = new THREE.WebGLRenderer({
          antialias: true,
      });
      this.renderer.setClearColor(0x312929);
      this.renderer.setSize(this.W, this.H);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setAnimationLoop(() => { this.draw() });  
      this.$stage.appendChild(this.renderer.domElement);      
  }

  addObjects() {
      this.menu = new MenuHinge(this.scene, this.world, this.camera, this.settings);
  }

  setupDebug() {
      //this.dbr = new CannonDebugRenderer(this.scene, this.world)
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableKeys = false;
      this.controls.update();
  }

  draw() {
      this.updatePhysics();
      this.renderer.render(this.scene, this.camera);
  }

  updatePhysics() {
      if (this.dbr) this.dbr.update();
      this.menu.update();
      this.world.step(1 / 60);
  }
}

class SceneMenuSticky {
  constructor(options) {
    this.$stage = T.container;
    this.options = options;
    this.renderer = options.renderer;
    this.settings = options.settings;
    this.distance = 15;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.aspect = this.W / this.H;
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
      window.addEventListener('resize', () => { this.onResize() })
  }
  setup() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -50, 0);
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x312929, -10, 100);
    this.setCamera();
    this.setLights();
    this.setRender();
    this.addObjects();
    // this.setupDebug()
  }
  onResize() {
      this.camera.aspect = this.aspect;
      this.camera.top    = this.distance;
      this.camera.right  = this.distance * this.camera.aspect;
      this.camera.bottom = -this.distance;
      this.camera.left   = -this.distance * this.camera.aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.W, this.H);
  }

  setCamera() {
      this.camera = new THREE.OrthographicCamera(-this.distance * this.aspect, this.distance * this.aspect, this.distance, -this.distance, -10, 100);
      this.camera.position.set(-10, 10, 10)
      this.camera.lookAt(new THREE.Vector3())
  }

  setLights() {
      const ambient = new THREE.AmbientLight(0xcccccc);
      this.scene.add(ambient);
      const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
      foreLight.position.set(5, 5, 20);
      this.scene.add(foreLight);
      const backLight = new THREE.DirectionalLight(0xffffff, 1);
      backLight.position.set(-5, -5, -10);
      this.scene.add(backLight);
  }

  setRender() {
      this.renderer = new THREE.WebGLRenderer({
          antialias: true,
      });
      this.renderer.setClearColor(0x312929);
      this.renderer.setSize(this.W, this.H);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setAnimationLoop(() => { this.draw() });
      this.$stage.appendChild(this.renderer.domElement);    
  }

  addObjects() {
      this.menu = new MenuSticky(this.scene, this.world, this.camera, this.settings);
  }

  setupDebug() {
      //this.dbr = new CannonDebugRenderer(this.scene, this.world)
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableKeys = false;
      this.controls.update();
  }

  draw() {
      this.updatePhysics();
      this.renderer.render(this.scene, this.camera);
  }

  updatePhysics() {
      if (this.dbr) this.dbr.update();
      this.menu.update();
      this.world.step(1 / 60);
  }
}

TextPhysic.prototype.createHTMLElements = function () {
  const navNum = 3;
  this.$navbar = document.createElement('nav');
  this.$navbar.className = 'mainNav visually-hidden'; 
  this.$navUl = document.createElement('ul');
  this.$navbar.appendChild(this.$navUl);
  const navItems = ['Caramel', 'Icecream', 'Chocolate'];
  this.navLis = [];
  for (let i = 0; i < navNum; i++) {
    this.navLis[i] = document.createElement('li');
    this.navA = document.createElement('a');
    this.navA.href = '#'; // Set href property on this.navA
    this.navA.textContent = navItems[i]; // Set text content for the anchor elements
    this.navLis[i].appendChild(this.navA);
    this.$navUl.style.display = " none";
    this.$navUl.appendChild(this.navLis[i]);
  }
  const container = this.container;
  container.appendChild(this.$navbar);
  this.$navbar.style.display = " none";
};


//CLASS MENU DROP
class MenuDrop {
  constructor(scene, world, camera, options) {
      this.scene = scene;
      this.camera = camera;
      this.world = world;
      this.force = options.force;
      this.colors = options.colors;
      this.fontURL = options.fontURL;
      this.$navItems = document.querySelectorAll('.mainNav a');
      this.loader = new FontLoader();
      this.clock = new THREE.Clock();
      // Setups
      this.guiotalMass = 1;
      this.cMaterial = new CANNON.Material();
      this.worldMat = new CANNON.Material();
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      // Loader
      //this.refreshScene();
      //this.removeAllBodies(this.world);
      //this.scene.remove(this.words);
      //this.scene.remove.apply(this.scene, this.scene.children);
      this.loader.load(this.fontURL, (f) => { this.setup(f) });
      this.bindEvents();
  }

  bindEvents() {
      document.addEventListener('click', () => { this.onClick() });
      window.addEventListener('mousemove', (e) => { this.onMouseMove(e)});
  }

  setup(font) {
      this.words = [];
      this.margin = 6;
      this.offset = this.$navItems.length * this.margin * 0.5;
      const options = {
          font,
          size: 3,
          height: 0.4,
          curveSegments: 24,
          bevelEnabled: true,
          bevelThickness: 0.9,
          bevelSize: 0.3,
          bevelOffset: 0,
          bevelSegments: 10,
      };
      Array.from(this.$navItems).reverse().forEach(($item, i) => {
          const { innerText } = $item;
          const words = new THREE.Group();
          words.len = 0;
          words.ground = new CANNON.Body({
              mass: 0,
              shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.1)),
              quaternion: new CANNON.Quaternion().setFromEuler(Math.PI / -2, 0, 0),
              position: new CANNON.Vec3(0, i * this.margin - this.offset, 0),
              material: this.worldMat,
          });
          words.isGroundDisplayed = false;
          const randomColor = pick(this.colors);
          Array.from(innerText).forEach((letter, j) => {
              const progress = (j) / (innerText.length - 1);
              // Three.js
              const material = new THREE.MeshPhongMaterial({ color: randomColor.from.clone().lerp(randomColor.to, progress) });
              const geometry = new TextGeometry(letter, options);
              geometry.computeBoundingBox();
              geometry.computeBoundingSphere();
              const mesh = new THREE.Mesh(geometry, material);
              // Get size
              mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
              mesh.size.multiply(new THREE.Vector3(0.5, 0.5, 0.5));
              // Cannon.js
              mesh.initPosition = new CANNON.Vec3(words.len * 2, (this.$navItems.length - 1 - i) * this.margin - this.offset, 0);
              mesh.initPositionOffset = new CANNON.Vec3(mesh.initPosition.x, mesh.initPosition.y + (i + 1) * 30 + 30 + j * 0.01, mesh.initPosition.z);
              words.len += mesh.size.x;
              const box = new CANNON.Box(new CANNON.Vec3(mesh.size.x, mesh.size.y, mesh.size.z));
              mesh.body = new CANNON.Body({
                  mass: this.guiotalMass / innerText.length,
                  position: mesh.initPositionOffset,
                  material: this.cMaterial,
                  // linearDamping: 0.1,
                  angularDamping: 0.99,
              });
              mesh.body.addShape(box, new CANNON.Vec3(mesh.geometry.boundingSphere.center.x, mesh.geometry.boundingSphere.center.y, mesh.geometry.boundingSphere.center.z));
              this.world.add(mesh.body);
              words.add(mesh);
          });
          words.children.forEach((letter) => { letter.body.position.x -= words.len });
          this.words.push(words);
          this.scene.add(words);
      });
      const contactMat = new CANNON.ContactMaterial(this.cMaterial, this.worldMat, {
          friction: 0.002,
          frictionEquationStiffness: 1e6,
          frictionEquationRelaxation: 3,
          restitution: 0.2,
          contactEquationStiffness: 1e20,
          contactEquationRelaxation: 3,
      });
      this.world.addContactMaterial(contactMat);
      this.setConstraints();
  }
  /* Handlers
  --------------------------------------------------------- */
  onMouseMove(event) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      document.body.style.cursor = intersects.length > 0 ? 'pointer' : '';
  }
  onClick() {
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length > 0) {
          const obj = intersects[0];
          const { object, face } = obj;
          if (!object.isMesh) return;
          const impulse = new CANNON.Vec3().copy(face.normal).scale(-this.force);
        if (this.words && this.words.length > 0) {
          this.words.forEach((word, i) => {
              word.children.forEach((letter) => {
                  console.log("clicked word", letter);
                  const { body } = letter;
                  if (letter !== object) return;
                  body.applyLocalImpulse(impulse, new CANNON.Vec3());
              })
              setTimeout(() => {
                  this.world.removeBody(word.ground)
              }, 150 * (1 - this.clock.getDelta()) * (this.words.length + i))
          });
        }
      }
  }
  /* Actions
  --------------------------------------------------------- */
  update() {
      if (!this.words) return;
      this.words.forEach((word, j) => {
          for (let i = 0; i < word.children.length; i++) {
              const letter = word.children[i];
              letter.position.copy(letter.body.position);
              letter.quaternion.copy(letter.body.quaternion);
              if (j === this.words.length - 1 && letter.body.position.y <= -50) {
                  this.reset();
              }
              if (word.isGroundDisplayed) continue;
              if (letter.body.position.y + letter.initPosition.y <= 0) {
                  this.world.addBody(word.ground);
                  word.isGroundDisplayed = true;
              }
          }
      });
  }
  reset() {
      this.words.forEach((word) => {
          word.isGroundDisplayed = false;
          const randomColor = pick(this.colors);
          for (let i = 0; i < word.children.length; i++) {
              const progress = (i) / (word.children.length - 1);
              const letter = word.children[i];
              letter.body.sleep();
              const { x, y, z } = letter.initPositionOffset;
              letter.material.color = randomColor.from.clone().lerp(randomColor.to, progress);
              letter.material.needsUpdate = true;
              letter.body.position.set(x - word.len, y, z);
              letter.body.quaternion.set(0, 0, 0, 1);
              letter.body.angularVelocity.setZero();
              letter.body.torque.setZero();
              letter.body.force.setZero();
              letter.body.wakeUp();
          }
      });
  }
  /* Values
  --------------------------------------------------------- */
  setConstraints() {
      this.words.forEach((word) => {
          for (let i = 0; i < word.children.length; i++) {
              const letter = word.children[i];
              const nextLetter = i + 1 === word.children.length ? null : word.children[i + 1];
              if (!nextLetter) continue;
              const c = new CANNON.ConeTwistConstraint(letter.body, nextLetter.body, {
                  pivotA: new CANNON.Vec3(letter.size.x * 2, 0, 0),
                  pivotB: new CANNON.Vec3(0, 0, 0),
                  axisA: CANNON.Vec3.UNIT_X,
                  axisB: CANNON.Vec3.UNIT_X,
                  angle: 0,
                  twistAngle: 0,
                  maxForce: 1e30,
              });
              c.collideConnected = true;
              this.world.addConstraint(c);
          }
      });
  }
}

// CLASS MENU HINGE
class MenuHinge {
  constructor(scene, world, camera, options) {
      this.scene = scene;
      this.camera = camera;
      this.world = world;
      this.force = options.force;
      this.colors = options.colors;
      this.fontURL = options.fontURL;      
      this.$navItems = document.querySelectorAll('.mainNav a');
      this.loader = new FontLoader();
      // Setups
      this.guiotalMass = 3;
      this.cMaterial = new CANNON.Material({ friction: 0 });
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      // Loader
      this.loader.load(this.fontURL, (f) => { this.setup(f) });
      this.bindEvents();
  }

  bindEvents() {
      document.addEventListener('click', () => { this.onClick() });
      window.addEventListener('mousemove', (e) => { this.onMouseMove(e) });
  }

  setup(font) {
      this.words = [];
      this.margin = 6;
      this.offset = this.$navItems.length * this.margin * 0.5 - 1;
      const options = {
          font,
          size: 3,
          height: 0.4,
          curveSegments: 24,
          bevelEnabled: true,
          bevelThickness: 0.9,
          bevelSize: 0.3,
          bevelOffset: 0,
          bevelSegments: 10,
      };
      this.$navItems.forEach(($item, i) => {
          const { innerText } = $item;
          const words = new THREE.Group();
          words.len = 0;
          Array.from(innerText).forEach((letter, j) => {
              const progress = (j) / (innerText.length - 1);
              // Three.js
              const material = new THREE.MeshPhongMaterial({
                  color: this.colors[i].from.lerp(this.colors[i].to, progress),
                  shininess: 0,
              });
              const geometry = new TextGeometry(letter, options);
              geometry.computeBoundingBox();
              geometry.computeBoundingSphere();
              const mesh = new THREE.Mesh(geometry, material);
              // Get size
              mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
              mesh.size.multiply(new THREE.Vector3(0.5, 0.5, 0.5));
              // Cannon.js
              mesh.initPosition = new CANNON.Vec3(words.len * 2, (this.$navItems.length - 1 - i) * this.margin - this.offset, 0);
              words.len += mesh.size.x;
              const box = new CANNON.Box(new CANNON.Vec3(mesh.size.x, mesh.size.y, mesh.size.z));
              mesh.body = new CANNON.Body({
                  mass: this.guiotalMass / innerText.length,
                  position: mesh.initPosition,
                  material: this.cMaterial,
                  linearDamping: 0.5,
              });
              mesh.body.addShape(box, new CANNON.Vec3(mesh.geometry.boundingSphere.center.x, mesh.geometry.boundingSphere.center.y, mesh.geometry.boundingSphere.center.z));
              this.world.addBody(mesh.body);
              words.add(mesh);
              const pivotPos = mesh.initPosition.clone();
              pivotPos.y += 4;
              // Pivot
              mesh.pivot = new CANNON.Body({
                  mass: 0,
                  position: pivotPos,
                  shape: new CANNON.Sphere(0.1),
              });
              const hingePivot = new CANNON.HingeConstraint(mesh.body, mesh.pivot, {
                  pivotA: new CANNON.Vec3(0, 4, 0),
                  pivotB: new CANNON.Vec3(0, 0, 0),
                  axisA: CANNON.Vec3.UNIT_X,
                  axisB: CANNON.Vec3.UNIT_X,
                  maxForce: 1e3,
              });
              this.world.addConstraint(hingePivot);
              this.world.addBody(mesh.pivot);
          });
          words.children.forEach((letter) => {
              letter.body.position.x -= words.len
              letter.pivot.position.x = letter.body.position.x
          });
          this.words.push(words);
          this.scene.add(words);
      })
      this.setConstraints();
  }
  /* Handlers
  --------------------------------------------------------- */
  onMouseMove(event) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;        
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      document.body.style.cursor = intersects.length > 0 ? 'pointer' : '';
  }

  onClick() {
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length > 0) {
          const obj = intersects[0];
          const { object, face } = obj;
          if (!object.isMesh) return;
          const impulse = new CANNON.Vec3().copy(face.normal).scale(-this.force);
          if (this.words && this.words.length > 0) {
          this.words.forEach((word) => {
              word.children.forEach((letter) => {
                  const { body } = letter;
                  if (letter !== object) return;
                  body.applyLocalImpulse(impulse, new CANNON.Vec3());
              });
          });
        }
      }
  }
  /* Actions
  --------------------------------------------------------- */
  update() {
      if (!this.words) return;
      this.words.forEach((word) => {
          for (let i = 0; i < word.children.length; i++) {
              const letter = word.children[i];
              letter.position.copy(letter.body.position);
              letter.quaternion.copy(letter.body.quaternion);
          }
      });
  }

  /* Values
  --------------------------------------------------------- */
  setConstraints() {
    this.words.forEach((word) => {
        for (let i = 0; i < word.children.length; i++) {
            const letter = word.children[i];
            const nextLetter = i + 1 === word.children.length ? null : word.children[i + 1];
            if (!nextLetter) continue;
            const dist = letter.body.position.distanceTo(nextLetter.body.position);
            const c = new CANNON.DistanceConstraint(letter.body, nextLetter.body, dist, 1e3);
            c.collideConnected = true;
            this.world.addConstraint(c);
         }
     });
  }
}


// CLASS MENU STICKY
class MenuSticky {
  constructor(scene, world, camera, options) {
      this.scene = scene;
      this.camera = camera;
      this.world = world;
      this.force = options.force;
      this.colors = options.colors;
      this.fontURL = options.fontURL;    
      this.$navItems = document.querySelectorAll('.mainNav a');
      this.loader = new FontLoader();
      // Setups
      this.guiotalMass = 1;
      this.cMaterial = new CANNON.Material();
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      // Loader
      this.loader.load(this.fontURL, (f) => { this.setup(f) });
      this.bindEvents();
  }

  bindEvents() {
      document.addEventListener('click', () => { this.onClick() });
      window.addEventListener('mousemove', (e) => { this.onMouseMove(e) });
  }

  setup(font) {
      this.words = [];
      this.margin = 6;
      this.offset = this.$navItems.length * this.margin * 0.5 - 1;
      const options = {
          font,
          size: 3,
          height: 0.4,
          curveSegments: 24,
          bevelEnabled: true,
          bevelThickness: 0.9,
          bevelSize: 0.3,
          bevelOffset: 0,
          bevelSegments: 10,
      };
      console.log('from:', this.$navItems);
      this.$navItems.forEach(($item, i) => {
          const { innerText } = $item;
          const words = new THREE.Group();
          words.len = 0;
          Array.from(innerText).forEach((letter, j) => {
              const progress = (j) / (innerText.length - 1);
              const material = new THREE.MeshPhongMaterial({
                  color: this.colors[i].from.lerp(this.colors[i].to, progress),
                  shininess: 200,
              });

              const geometry = new TextGeometry(letter, options);
              geometry.computeBoundingBox();
              geometry.computeBoundingSphere();
              const mesh = new THREE.Mesh(geometry, material);
              // Get size
              mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
              mesh.size.multiply(new THREE.Vector3(0.5, 0.5, 0.5));
              // Cannon.js
              mesh.initPosition = new CANNON.Vec3(words.len * 2, (this.$navItems.length - 1 - i) * this.margin - this.offset, 0);
              words.len += mesh.size.x;
              const box = new CANNON.Box(new CANNON.Vec3(mesh.size.x, mesh.size.y, mesh.size.z));
              mesh.body = new CANNON.Body({
                  mass: this.guiotalMass / innerText.length,
                  position: mesh.initPosition,
                  material: this.cMaterial,
              });
              mesh.body.addShape(box, new CANNON.Vec3(mesh.geometry.boundingSphere.center.x, mesh.geometry.boundingSphere.center.y, mesh.geometry.boundingSphere.center.z));
              this.world.addBody(mesh.body);
              words.add(mesh);
          });
          words.children.forEach((letter) => { letter.body.position.x -= words.len });
          this.words.push(words);
          this.scene.add(words);
      });
      this.setConstraints();
      this.addPivots();
  }
  /* Handlers
  --------------------------------------------------------- */
  onMouseMove(event) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      document.body.style.cursor = intersects.length > 0 ? 'pointer' : '';
  }

  onClick() {
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length > 0) {
        const obj = intersects[0];
        const { object, face } = obj;
        if (!object.isMesh) return;
        const impulse = new CANNON.Vec3().copy(face.normal).scale(-this.force);
        if (this.words && this.words.length > 0) {
        this.words.forEach((word) => {
            word.children.forEach((letter) => {
                const { body } = letter;
                if (letter !== object) return;
                body.applyLocalImpulse(impulse, new CANNON.Vec3());
            })
          });
        }
      }
  }
  /* Actions
  --------------------------------------------------------- */
  update() {
      if (!this.words) return
      this.words.forEach((word) => {
          for (let i = 0; i < word.children.length; i++) {
              const letter = word.children[i];
              letter.position.copy(letter.body.position);
              letter.quaternion.copy(letter.body.quaternion);
          }
      })
  }
  /* Values
  --------------------------------------------------------- */
  setConstraints() {
      this.words.forEach((word) => {
          for (let i = 0; i < word.children.length; i++) {
              const letter = word.children[i];
              const nextLetter = i + 1 === word.children.length ? null : word.children[i + 1];
              if (!nextLetter) continue;
              const c = new CANNON.ConeTwistConstraint(letter.body, nextLetter.body, {
                  pivotA: new CANNON.Vec3(letter.size.x * 0.7, letter.size.y, 0),
                  pivotB: new CANNON.Vec3(-letter.size.x * 0.7, letter.size.y, 0),
                  axisA: CANNON.Vec3.UNIT_X,
                  axisB: CANNON.Vec3.UNIT_X,
                  // maxForce: 1e2,
                  angle: 0,
                  twistAngle: 0,
              });
              c.collideConnected = true;
              this.world.addConstraint(c);
          }
      });
  }

  addPivots() {
      this.words.forEach((word) => {
        const firstLetter = word.children[0];
        const lastLetter = word.children[word.children.length - 1];
          word.pA = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(
                firstLetter.body.position.x - 2,
                firstLetter.body.position.y + firstLetter.geometry.boundingSphere.center.y,
                firstLetter.geometry.boundingSphere.center.z,
            ),
            shape: new CANNON.Sphere(0.1),
          });
          word.pB = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(
                lastLetter.body.position.x + lastLetter.size.x + 2.5,
                lastLetter.body.position.y + lastLetter.geometry.boundingSphere.center.y,
                lastLetter.geometry.boundingSphere.center.z,
            ),
            shape: new CANNON.Sphere(0.1),
          });
        const cA = new CANNON.ConeTwistConstraint(word.pA, firstLetter.body, {
            pivotA: new CANNON.Vec3(2, 0.5, 0.5),
            pivotB: new CANNON.Vec3(
                0,
                firstLetter.geometry.boundingSphere.center.y,
                firstLetter.geometry.boundingSphere.center.z,
            ),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,
        });
        const cB = new CANNON.ConeTwistConstraint(word.pB, lastLetter.body, {
            pivotA: new CANNON.Vec3(-lastLetter.size.x - 2.5, 0.5, 0.5),
            pivotB: new CANNON.Vec3(
                0,
                lastLetter.geometry.boundingSphere.center.y,
                lastLetter.geometry.boundingSphere.center.z,
            ),
            axisA: CANNON.Vec3.UNIT_X,
            axisB: CANNON.Vec3.UNIT_X,
        });
        this.world.addConstraint(cA);
        this.world.addConstraint(cB);
        this.world.addBody(word.pA);
        this.world.addBody(word.pB);
    })
  }
}

/*-----------------------------------------------------------------------------------*/
/*  EXPORT CLASS
/*-----------------------------------------------------------------------------------*/
export { Text, TextMesh, TextLine, TextShader, TextTrail, TextPoint, TextKinetic, TextPhysic };

/*-----------------------------------------------------------------------------------*/
/*  INITILIALIZE APP
/*-----------------------------------------------------------------------------------*/
const opt = {
  container: document.querySelector('.container'),
  container1: document.querySelector('.container1'),
  container2: document.querySelector('.container2')
};

var T = new TEXT(opt);


