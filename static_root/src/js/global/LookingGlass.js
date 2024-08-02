
/**
 * LookingGlass versions-1.0.-2023
 *
 * @author OmniBusAdmin (http://www.OmniBus.com/)
 * @license MIT
*/

///////////////////////////////////////////////////////////////////////////////
//**********************IMPORTING PACKAGES/LIBRARIES************************//                               
//////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


///////////////////////////////////////////////////////////////////////////////
//**********************************SHADERS**********************************//                               
//////////////////////////////////////////////////////////////////////////////

var loadBarShader = {
  vs:`
    uniform mat4 iModelMat;
    attribute vec3 tangent;
    attribute float faceType;
    varying mat3 vINormMat;
    varying vec3 vNorm;
    varying vec3 vTang;
    varying vec3 vBino;
    varying vec2 vUv;

    varying vec3 vEye;
    varying vec3 vMPos;
    varying vec3 vPos;

    varying float vFaceType;

    mat3 matInverse( mat3 m ){
    
  
    vec3 a = vec3(
      
        m[1][1] * m[2][2] - m[2][1] * m[1][2],
        m[0][2] * m[2][1] - m[2][2] * m[0][1],
        m[0][1] * m[1][2] - m[1][1] * m[0][2]
        
    );
    
    vec3 b = vec3(
      
        m[1][2] * m[2][0] - m[2][2] * m[1][0],
        m[0][0] * m[2][2] - m[2][0] * m[0][2],
        m[0][2] * m[1][0] - m[1][2] * m[0][0]
        
    );
    
     vec3 c = vec3(
      
        m[1][0] * m[2][1] - m[2][0] * m[1][1],
        m[0][1] * m[2][0] - m[2][1] * m[0][0],
        m[0][0] * m[1][1] - m[1][0] * m[0][1]
        
    );
    
    
    return mat3( 
        
       a.x , a.y , a.z ,
       b.x , b.y , b.z ,
       c.x , c.y , c.z
        
    );  
    
}


    void main(){

      vFaceType = faceType;

      vec3 pos = position;
      vUv = uv;
      vNorm = normalMatrix * normal;
      
      vMPos = ( modelMatrix * vec4( pos , 1. ) ).xyz;
      //vMPos = pos.xyz;

      vNorm = normal;
      vTang = tangent;

      vBino = cross( vNorm , vTang );

      mat3 normMat = mat3(
        vNorm.x , vNorm.y , vNorm.z ,
        vTang.x , vTang.y , vTang.z ,
        vBino.x , vBino.y , vBino.z 
      );

      //normMat = normalMatrix * normMat;
      vINormMat = matInverse( normMat );

      vec3 iCamPos = ( iModelMat * vec4( cameraPosition , 1. ) ).xyz;
      vEye = iCamPos - pos;
      vPos = pos;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos , 1. );


    }

  `,

  fs:`

  vec3 hsv(float h, float s, float v){
  return mix( vec3( 1.0 ), clamp( ( abs( fract(
    h + vec3( 3.0, 2.0, 1.0 ) / 3.0 ) * 6.0 - 3.0 ) - 1.0 ), 0.0, 1.0 ), s ) * v;
  }


  // Taken from https://www.shadertoy.com/view/4ts3z2
  float tri(in float x){return abs(fract(x)-.5);}
  vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}
                                   

  // Taken from https://www.shadertoy.com/view/4ts3z2
  float triNoise3D(in vec3 p, in float spd , in float time){
    
    float z=1.4;
    float rz = 0.;
    vec3 bp = p;

    for (float i=0.; i<=3.; i++ ){
     
      vec3 dg = tri3(bp*2.);
      p += (dg+time*.1*spd);

      bp *= 1.8;
      z *= 1.5;
      p *= 1.2; 
        
      rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
      bp += 0.14;

    }

    return rz;

  }

uniform float stepDepth;
uniform float oscillationSize;
uniform float time;
uniform float brightness;
uniform float noiseSize;
uniform float transparency;
uniform vec3 lightPos;


varying float vFaceType;

varying vec3 vNorm;

varying vec2 vUv;

varying vec3 vEye;
varying vec3 vMPos;
varying vec3 vPos;

varying mat3 vINormMat;

#define STEPS 2
vec4 volumeColor( vec3 ro , vec3 rd  , mat3 iBasis){

  vec3 col = vec3( 0. );
  float lum = 0.;
  for( int i = 0; i < STEPS; i++ ){

    vec3 p = ro - rd * float( i ) * stepDepth*5.;
    
    lum += pow(triNoise3D( p * .002 * noiseSize , float( i ) / float( STEPS ), time * .01),.3);//lu / 5.;

    col += hsv( lum * 2. + sin( time * .1 ) , .4 , .4 );

  } 

  return vec4( col , lum ) / float( STEPS );


}

void main(){


  vec3 col =vec3(1.);// vTang * .5 + .5;
  float alpha = 1.;

  vec3 lightDir = normalize( lightPos - vMPos );
  vec3 reflDir = reflect( lightDir , vNorm );
  
  float lambMatch =  -dot(lightDir ,  vNorm );
  float reflMatch = max( 0. , -dot(normalize(reflDir) ,  normalize(vEye)) );

  reflMatch = pow( reflMatch , 2. );

  vec4 volCol = volumeColor( vPos , normalize(vEye) , vINormMat );

  vec3 lambCol = lambMatch * volCol.xyz;
  vec3 reflCol = reflMatch * (vec3(1.) - volCol.xyz);

  col = volCol.xyz;// * lambMatch  + vec3(1. ) * (1.-lambMatch ) ;

  float size = .04;
  if( vUv.y > 1. - size  ){
    col *= 2.;// lambCol * 3.;
  }

  gl_FragColor = vec4(  col *2. * brightness ,  transparency  );

}


  `,

  vsRing:`


    uniform mat4 iModelMat;

    attribute vec3 tangent;
    attribute float faceType;
    attribute float id;

    // TODO: can we compute this in cpu?
    varying mat3 vINormMat;

    varying vec3 vNorm;
    varying vec3 vTang;
    varying vec3 vBino;
    varying vec2 vUv;

    varying vec3 vEye;
    varying vec3 vMPos;
    varying vec3 vPos;

    varying float vType;
    varying float vID;

    mat3 matInverse( mat3 m ){
    
  
    vec3 a = vec3(
      
        m[1][1] * m[2][2] - m[2][1] * m[1][2],
        m[0][2] * m[2][1] - m[2][2] * m[0][1],
        m[0][1] * m[1][2] - m[1][1] * m[0][2]
        
    );
    
    vec3 b = vec3(
      
        m[1][2] * m[2][0] - m[2][2] * m[1][0],
        m[0][0] * m[2][2] - m[2][0] * m[0][2],
        m[0][2] * m[1][0] - m[1][2] * m[0][0]
        
    );
    
     vec3 c = vec3(
      
        m[1][0] * m[2][1] - m[2][0] * m[1][1],
        m[0][1] * m[2][0] - m[2][1] * m[0][0],
        m[0][0] * m[1][1] - m[1][0] * m[0][1]
        
    );
    
    
    return mat3( 
        
       a.x , a.y , a.z ,
       b.x , b.y , b.z ,
       c.x , c.y , c.z
        
    );
    
 
  
    
}


    void main(){
      vType = faceType;
      vec3 pos = position;
      vUv = uv;
      vNorm = normalMatrix * normal;
      
      vMPos = ( modelMatrix * vec4( pos , 1. ) ).xyz;
      //vMPos = pos.xyz;

      vNorm = normal;
      vTang = tangent;

      vBino = cross( vNorm , vTang );

      mat3 normMat = mat3(
        vNorm.x , vNorm.y , vNorm.z ,
        vTang.x , vTang.y , vTang.z ,
        vBino.x , vBino.y , vBino.z 
      );

      //normMat = normalMatrix * normMat;
      vINormMat = matInverse( normMat );
      vID = id;

      vec3 iCamPos = ( iModelMat * vec4( cameraPosition , 1. ) ).xyz;
      vEye = iCamPos - pos;
      vPos = pos;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos , 1. );


    }

  `,
  fsRing:`

   vec3 hsv(float h, float s, float v){
  return mix( vec3( 1.0 ), clamp( ( abs( fract(
    h + vec3( 3.0, 2.0, 1.0 ) / 3.0 ) * 6.0 - 3.0 ) - 1.0 ), 0.0, 1.0 ), s ) * v;
  }


  // Taken from https://www.shadertoy.com/view/4ts3z2
  float tri(in float x){return abs(fract(x)-.5);}
  vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}
                                   

  // Taken from https://www.shadertoy.com/view/4ts3z2
  float triNoise3D(in vec3 p, in float spd , in float time){
    
    float z=1.4;
    float rz = 0.;
    vec3 bp = p;

    for (float i=0.; i<=3.; i++ ){
     
      vec3 dg = tri3(bp*2.);
      p += (dg+time*.1*spd);

      bp *= 1.8;
      z *= 1.5;
      p *= 1.2; 
        
      rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
      bp += 0.14;

    }

    return rz;

  }

uniform float stepDepth;
uniform float oscillationSize;
uniform float time;
uniform float brightness;
uniform float noiseSize;
uniform vec3 lightPos;
uniform float percentLoaded;
uniform float transparency;

varying float vType;
varying float vID;

varying vec3 vNorm;

varying vec2 vUv;

varying vec3 vEye;
varying vec3 vMPos;
varying vec3 vPos;



varying mat3 vINormMat;

#define STEPS 2
vec4 volumeColor( vec3 ro , vec3 rd  , mat3 iBasis){

  vec3 col = vec3( 0. );
  float lum = 0.;
  for( int i = 0; i < STEPS; i++ ){

    vec3 p = ro - rd * float( i ) * stepDepth*5.;
    
    lum += pow(triNoise3D( p * .002 * noiseSize , float( i ) / float( STEPS ), time * .01),.3);//lu / 5.;

    col +=  hsv( lum * 2. + sin( time * .1 ) ,  .4  , .5 );

  } 

  return vec4( col , lum ) / float( STEPS );


}


void main(){


  vec3 col =vec3(1.);// vTang * .5 + .5;
  float alpha = 1.;

  vec3 lightDir = normalize( lightPos - vMPos );
  vec3 reflDir = reflect( lightDir , vNorm );
  
  float lambMatch =  -dot(lightDir ,  vNorm );
  float reflMatch = max( 0. , -dot(normalize(reflDir) ,  normalize(vEye)) );

  reflMatch = pow( reflMatch , 2. );

  vec4 volCol = volumeColor( vPos , normalize(vEye) , vINormMat );

  vec3 lambCol = lambMatch * volCol.xyz;
  vec3 reflCol = reflMatch * (vec3(1.) - volCol.xyz);

  col = volCol.xyz;// * lambMatch  + vec3(1. ) * (1.-lambMatch ) ;

  float size = .04;
  if( vUv.y > 1. - size  ){
    col *= 2.;// lambCol * 3.;
  }

  if( vType > 0.5){
    col *= sin( (( vID /80.) * 6. * 3.14195  )+ time * percentLoaded * 5.);
  }else{
    if( vUv.x < .1 || vUv.x > .9 || vUv.y < .2 || vUv.y > .8 ){
    }else{
      if( percentLoaded - .01 < vID / 40. ){
        col = vec3( 0. );
      }
    }
  }


  gl_FragColor = vec4(  col *2. * brightness , transparency  );

}
  `
}

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

///////////////////////////////////////////////////////////////////////////////
//*********************************CLASS LOOKING GLASS****************************//                               
//////////////////////////////////////////////////////////////////////////////
/**
 * call this class to initialize 
 * @class 
 * @param options 
*/
class LoadGlass{
  constructor(options) {
    this.options = options || {};
    this.isFalseT = isFalse.bind(this);
    this.isTrueT = isTrue.bind(this);
    this.target = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    this.checkifExistEventListenerT = checkifExistEventListener.bind(this);
    this.addCustomEventListenerT = addCustomEventListener.bind(this);
    this.removeAllEventListenersT = removeAllEventListeners.bind(this);
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.container = typeof options.container === "undefined" ? document.body : options.container;
    this.containerWidth = this.options.container ? this.options.container.clientWidth : window.innerWidth;
    this.containerHeight = this.options.container ? this.options.container.clientHeight : window.innerHeight;
    this.init();
    this.addGlass = ()=>{    
      var glass = new LoadBar(this.container, this.scene, this.camera);
       glass.start();
       return glass;
      //glass.update();
    };
    this.addObject = this.addGlass.bind(this);
    this.glass = this.addObject();
    this.animate();
  }

  // INIT APP
  init() {
    //SCENE
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color( 0x000000 );
    // CAMERA
    this.camera = new THREE.PerspectiveCamera( 45, this.containerWidth/ this.containerHeight, 1, 20000 );
    //DIR LIGHT
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    this.scene.add( dirLight );
    //POINT LIGHT
    //this.pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
    //this.pointLight.color.setHSL( Math.random(), 1, 0.5 );
    //this.pointLight.position.set( 0, 100, 90 );
    //this.scene.add( this.pointLight );
    // PLANE
    /*const plane = new THREE.Mesh(
      new THREE.PlaneGeometry( 10000, 10000 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
    );
    plane.position.y = 100;
    plane.rotation.x = - Math.PI / 2;
    this.scene.add(plane);*/
    //RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor(0x222222);
    this.renderer.setClearAlpha(0);
    this.renderer.setSize( this.containerWidth, this.containerHeight );
    this.container.appendChild( this.renderer.domElement );
    //this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    //controls.update() must be called after any manual changes to the camera's transform
    //this.controls.update();
    //EVENT LISTENER
    this.addEventListeners();
  }

  //ADD EVENT LISTENER
  addEventListeners() {
    this.addCustomEventListenerT(window, "resize", (e)=>this.onResize(e));
    this.addCustomEventListenerT(window, "mousemove", (e)=>this.onMouseMove(e));
  }

  // RESIZE
  onResize() {
    this.camera.aspect = this.containerWidth / this.containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.containerWidth, this.containerHeight);
  }

  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }


  // RENDER
  render() {
    this.target.x += ( this.mouseX - this.target.x ) * .02;
    this.target.y += ( - this.mouseY - this.target.y ) * .02;
    this.target.z = this.camera.position.z;
    this.glass.ring.lookAt( this.target );
    this.glass.center.lookAt( this.target );
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

  }

  // ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render(this.scene, this.camera, this.renderer);
  }

}


///////////////////////////////////////////////////////////////////////////////
//**********************FUNCTION CLASS GLASS************************//                               
//////////////////////////////////////////////////////////////////////////////

function LoadBar(el, scene, camera){
    //this.ring2 = new THREE.Mesh( this.createRingGeo(1) , ringMat );
  this.el = el;
  this.scene = scene;
  this.camera = camera;
  this.tmpV3   = new THREE.Vector3();
  this.v1      = this.tmpV3;
  this.v2      = this.v1.clone();         // for typing sake
  this.v3      = this.v1.clone();         // for typing sake
  this.v4      = this.v1.clone();         // for typing sake
  this.tmpV2   = new THREE.Vector2();
  this.time = { type:"f" , value: 0 }
  this.lightPos = { type:"v3" , value: new THREE.Vector3() }
  this.loadRing = [];
  this.lookPosition = new THREE.Vector3();
  this.ending = false;
  this.transparency = { type:"f" , value: 1 };
  var u = {
    time:this.time,
    stepDepth:{ type:"f" , value: 6. },
    brightness:{type:"f",value: 1 },
    oscillationSize:{ type:"f" , value: .0004 },
    noiseSize: { type:"f" , value: 3. },
    lightPos:{ type:"v3" , value:this.lookPosition },
    iModelMat:{ type:"m4" , value: new THREE.Matrix4() },
    transparency: this.transparency,
  }

  var a = {
    faceType: { type:"f" , value:null }
  }

  var ringMat = new THREE.ShaderMaterial({
    uniforms:u,
    attributes:{
      id:{type:"f", value:null},
      faceType:{type:"f", value:null},
    },
    vertexShader: loadBarShader.vsRing,
    fragmentShader: loadBarShader.fsRing,
    side: THREE.DoubleSide,
   // blending: THREE.AdditiveBlending,
    transparent: true,
  });
  this.ring = new THREE.Mesh( this.createRingGeo(150) , ringMat )
  var centerMat = new THREE.ShaderMaterial({
    vertexShader: loadBarShader.vs,
    fragmentShader: loadBarShader.fs,
    uniforms: u,
    attributes: a,
    side: THREE.DoubleSide,
    transparent: true,
   // blending: THREE.AdditiveBlending,
  });
  this.center = new THREE.Mesh( this.createCenterGeo(100), centerMat );
  this.percentMesh = this.createPercentMesh();
  //window.addEventListener( 'mousemove', this.onMouseMove.bind(this));
}

LoadBar.prototype.onMouseMove1 = function(e) {
    this.lookPosition.x = 2 * e.clientX - window.innerWidth/ 2;
    this.lookPosition.y = -2 * (e.clientY - (window.innerHeight / 2));
    this.lookPosition.z = 50;
    this.lookPosition.applyQuaternion(this.camera.quaternion);
}

LoadBar.prototype.start = function(){
  this.v1.set( 200 , 0 , -400 );
  this.v1.applyQuaternion( this.camera.quaternion );
  this.v1.add( this.camera.position );
  this.v2.set( -200 , 0 , 0 );
  this.v2.applyQuaternion( this.camera.quaternion )
  this.v1.add( this.v2 );
  this.ring.position.copy( this.v1 );
  //this.ring.lookAt( this.camera.position );
  this.center.position.copy( this.v1 );
  //this.center.lookAt( this.camera.position );
  //this.percentMesh.position.copy( this.v1 );
  //this.percentMesh.lookAt( this.camera.position );
  this.center.updateMatrixWorld();
  //this.center.material.uniforms.iModelMat.value.copy(this.center.matrixWorld).invert();
  //this.updatePercentMesh();
  this.lightPos.value.copy( this.camera.position )
  this.scene.add( this.ring );
  this.scene.add( this.center );
  //this.scene.add( this.percentMesh );
}

/*LoadBar.prototype.start = function() {
  this.camera.position.applyQuaternion( this.camera.quaternion );
  this.camera.position.add( this.camera.position );
  this.camera.lookAt(this.scene.position);
  //this.camera.lookAt(this.cameraTarget)
  this.ring.position.set( 0,0,0);
  this.ring.lookAt( this.camera.position );
  this.center.position.set( 0,0,0 );
  this.center.lookAt( this.camera.position );
  this.scene.add( this.ring );
  this.scene.add( this.center );
}*/

LoadBar.prototype.addText = function(){
  this.loadBarInfo = document.createElement('div');
  document.body.appendChild( this.loadBarInfo );
  this.loadBarInfo.id = 'loadBarInfo'
  this.loadInfoDiv = document.createElement('div');
  //var p = Math.floor( this.percentLoaded.value * 100 )
  this.loadInfoDiv.innerHTML += "Runtime : 20 - 30 min <br/>"
  this.loadInfoDiv.innerHTML += "Interaction : Click Logo to switch pages <br/>"
  this.loadInfoDiv.innerHTML += "Requirements : Headphones<br/><br/>"
  this.loadInfoDiv.id = 'experienceInfo'
  this.loadBarInfo.appendChild( this.loadInfoDiv );
  var dpr = window.devicePixelRatio || 1;
  this.loadInfoDiv.style.fontSize = ( window.innerWidths) / 80
  var offset = -this.loadBarInfo.clientHeight / 2 
  this.loadBarInfo.style.marginTop = offset + "px"
  //console.log( this.loadBarInfo.clientHeight )
  this.frenchButton = document.createElement('div')
  this.frenchButton.id = 'frenchButton'
  this.frenchButton.innerHTML = 'FRANÇAIS'
  this.frenchButton.addEventListener( 'click' , function(){ window.location = 'http://cabbi.bo/enough-francais/'} , false );
  this.loadBarInfo.appendChild( this.frenchButton )
  this.germanButton = document.createElement('div')
  this.germanButton.id = 'germanButton'
  this.germanButton.innerHTML = 'DEUTSCH'
  this.germanButton.addEventListener( 'click' , function(){ window.location = 'http://cabbi.bo/enough-deutsch/'} , false );
  this.loadBarInfo.appendChild( this.germanButton )
}

LoadBar.prototype.removeText = function(){
  document.body.removeChild( this.loadBarInfo )
}


LoadBar.prototype.update = function(){
  this.time.value += .1
  if( !this.ending ){
    this.v1.set( 0 , 0 , -600 );
    this.v1.applyQuaternion( this.camera.quaternion);
    this.v1.add( this.camera.position );
    this.v2.set(-200 , 0 , 0 );
    this.v2.applyQuaternion(this.canera.quaternion);
    this.v1.add(this.v2)
    //this.camera.position.add( G.v2 );
    //this.ring.position.copy( G.v1 );
    //this.center.position.copy( G.v1 );
    //this.copy( this.lookPosition );
    //this.add(this..camera.position )
    this.ring.position.copy( this.v1 );
    this.center.position.copy( this.v1 );
    this.v1.copy( this.lookPosition );
    this.v1.add( this.camera.position )
    this.ring.lookAt( this.v1 );
    this.center.lookAt( this.v1 );
    this.center.updateMatrixWorld();
    this.center.material.uniforms.iModelMat.value.copy(this.center.matrixWorld).invert();
    //this.updatePercentMesh();
  }
  this.lightPos.value.copy( this.camera.position )

}

/*LoadBar.prototype.updatePercentMesh = function(){
  G.v1.set( 0 , 0 , 50 );
  G.v1.applyQuaternion( this.center.quaternion );
  G.v1.add( this.center.position );
  this.percentMesh.position.copy( G.v1 );
  G.v1.copy( this.percentMesh.position );
  G.v2.copy(G.camera.position )
  G.v2.sub( G.v1 );
  G.v2.multiplyScalar( .1 );
  G.v1.add( G.v2 );
  this.percentMesh.rotation.setFromRotationMatrix( G.camera.matrixWorld )

}*/

LoadBar.prototype.createPercentMesh = function(){
    var canvas  = document.createElement('canvas');
    var fullSize = 30000;
    var margin = 40;
    var ctx     = canvas.getContext( '2d' ); 
    ctx.font      = fullSize / 100 + "pt GeoSans";
    var textWidth = ctx.measureText("100%").width;
    canvas.width  = textWidth + margin;
    canvas.height = fullSize / 100 + margin;
    // Creates a texture
    var texture = new THREE.Texture(canvas);
    //this.updatePercentTexture( '0', canvas , ctx , texture , textWidth )
    var mesh = new THREE.Mesh( 
      new THREE.PlaneGeometry( 100, 100 ), 
      new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthwrite: false

      })
    );
    mesh.scale.y = canvas.height;
    mesh.scale.x = canvas.width;
    mesh.scale.multiplyScalar( .1 );
    mesh.texture = texture;
    mesh.canvas = canvas;
    mesh.ctx = ctx;
    mesh.textWidth = textWidth;
    return mesh;
}


LoadBar.prototype.updatePercentTexture = function( percent , canvas , ctx , texture , textWidth ){
    var string = percent + "%"
    var fullSize = 30000;
    var margin = 10;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(
        canvas.width / 2 - textWidth / 2 - margin / 2, 
        canvas.height / 2 - fullSize / 2 - + margin / 2, 
        textWidth + margin, 
        fullSize + margin
    );
    // Makes sure our text is centered
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font      = fullSize / 100 + "pt GeoSans";
    ctx.fillText( string , canvas.width / 2, canvas.height / 2);
    texture.needsUpdate = true;
}


/*LoadBar.prototype.onLoad = function( percent ){


  //console.log( percent )
  this.percentLoaded.value = percent


  G.onResize();

  var p = Math.floor( Math.min( 1 , this.percentLoaded.value ) * 100 )

  this.updatePercentTexture( 
    p , 
    this.percentMesh.canvas , 
    this.percentMesh.ctx , 
    this.percentMesh.texture , 
    this.percentMesh.textWidth
  );
}*/

LoadBar.prototype.onFinishedLoad = function(){
  this.startButton = document.createElement('div')
  this.startButton.id = 'startButton'
  this.startButton.innerHTML = 'BEGIN'
  this.startButton.addEventListener( 'click' , this.onStartButtonClick.bind(this) , false );
  this.loadBarInfo.appendChild( this.startButton )
}

/*LoadBar.prototype.onStartButtonClick = function( ){

  var time = G.loadBarTransitionTime
  this.ending = true;
  window.removeEventListener( 'mousemove'   , this.onMouseMove  , false );

  //this.tweenToCamera(time * 10);

  this.loadBarInfo.style.display = "none"

  //console.log( this.loadBarInfo.style )
  document.body.style.cursor = "none"

  G.scene.remove( this.ring )
  G.scene.remove( this.center )
  G.scene.remove( this.percentMesh )
  $( this.loadBarInfo ).fadeOut(time,function(){
    document.body.style.cursor = "none"
  }.bind( this ));
   G.fullscreenIt();

  window.setTimeout( function(){
   
    if( !G.loaded ){ G.loaded = true }
    G.scene.add( G.cursor );
    //G.rHand.particles.resetRand( 1000 );
    G.rHand.particles.activate();
    G.onResize();
    G.onResize();


  },2000);


}

LoadBar.prototype.tweenToCamera = function( time ){

  var s = { x : 0 }
  var e = { x : 1 }
  var tween = new G.tween.Tween( s ).to( e , time  );
  this.posDif = G.camera.position.clone();
  G.v1.set( 0 , 0 , -200 );
  G.v1.applyQuaternion( G.camera.quaternion );
  this.posDif.add( G.v1 );

  this.endPos =  this.posDif.clone();

  this.secondTween = G.camera.position.clone();
  this.secondTween.sub( this.endPos )


  this.endLook=  this.posDif.clone();
  this.endLook.add( G.v1 );


  this.posDif.sub( this.center.position );


  this.startPos = this.center.position.clone();


  var tweenTime1 = .2
  tween.onUpdate( function( t ){

    if( t < tweenTime1 ){

      G.v1.copy( this.startPos )
      G.v2.copy( this.posDif );
      G.v2.multiplyScalar( t / tweenTime1 );
      G.v1.add( G.v2 );

      this.center.position.copy( G.v1 );
      this.ring.position.copy( G.v1 );
    //  this.percentMesh.position.copy( G.v1 );

      //console.log( this.endPos );
      this.center.lookAt( this.endLook );
      this.ring.lookAt( this.endLook );
     // this.percentMesh.lookAt( this.endLook );
    }else{


      var t =( t - tweenTime1 ) / ( 1 - tweenTime1 );
      var t = Math.sqrt( t );

    
      G.v1.copy(this.endPos);
      G.v2.copy( this.secondTween );
      G.v2.multiplyScalar( t );
      G.v1.add( G.v2 );1

     

      this.center.position.copy( G.v1 );
      this.ring.position.copy( G.v1 );
      //this.percentMesh.position.copy( G.v1 );

      this.center.lookAt( this.endLook );
      this.ring.lookAt( this.endLook );
      //this.percentMesh.lookAt( this.endLook );

      if( t > .8 ){
        if( !G.loaded ){ G.loaded = true }

        //console.log(( 1 - t ) * 5 )

        this.transparency.value = ( 1 - t ) * 5;
       // this.center.material.opacity = ( 1 - t ) * 5;
      }

    }

  }.bind( this ));

  tween.onComplete( function( t ){
    G.scene.remove( this.ring )
    G.scene.remove( this.center )
   
  }.bind( this ));

  G.scene.remove( this.percentMesh )
  tween.start();

}*/


LoadBar.prototype.createRingGeo = function( size ){

  var innerR = size * .8;
  var outerR = size;
  var faces = [];

  var segments = 40;

  for( var i  = 0; i < segments; i++ ){

    var t  =  2 * Math.PI * i  / segments;
    var tU =  2 * Math.PI * (i +.4) / segments;

    var xDoIn = Math.sin( t  ) * innerR;
    var xUpIn = Math.sin( tU ) * innerR;
    var yDoIn = Math.cos( t  ) * innerR;
    var yUpIn = Math.cos( tU ) * innerR;

    var xDoOu = Math.sin( t  ) * outerR;
    var xUpOu = Math.sin( tU ) * outerR;
    var yDoOu = Math.cos( t  ) * outerR;
    var yUpOu = Math.cos( tU ) * outerR;

    var f = [
      [ xUpIn , yUpIn , 0 ],
      [ xDoIn , yDoIn , 0 ],
      [ xDoOu , yDoOu , innerR - outerR ],
      [ xUpOu , yUpOu , innerR - outerR ]
    ]

    faces.push( f );

    //console.log( i );
    //console.log( f );
    //console.log( 'pysh' );

  }



  var s = size * .35;
  for( var i  = 0; i < segments * 2; i++ ){

    var t = 2 * Math.PI * i  / (segments * 2);
    var tU =  2 * Math.PI * (i+1) / (segments * 2);

    var xDoIn = Math.sin( t  ) * s * 2;
    var xUpIn = Math.sin( tU ) * s * 2;
    var yDoIn = Math.cos( t  ) * s * 2;
    var yUpIn = Math.cos( tU ) * s * 2;

    var xDoOu = Math.sin( t  ) * s * 2.1;
    var xUpOu = Math.sin( tU ) * s * 2.1;
    var yDoOu = Math.cos( t  ) * s * 2.1;
    var yUpOu = Math.cos( tU ) * s * 2.1;

    var f = [
      [ xUpIn , yUpIn , -s * .3 ],
      [ xDoIn , yDoIn , -s * .3 ],
      [ xDoOu , yDoOu , -s * .4 ],
      [ xUpOu , yUpOu , -s * .4 ]
    ]

    faces.push( f );

  }


  var positions  = new Float32Array( faces.length * 6 * 3 );
  var normals    = new Float32Array( faces.length * 6 * 3 );
  var tangents   = new Float32Array( faces.length * 6 * 3 );
  var types      = new Float32Array( faces.length * 6 * 1 );
  var ids        = new Float32Array( faces.length * 6 * 1 );
  var uvs        = new Float32Array( faces.length * 6 * 2 );


  var v1 = new THREE.Vector3();
  var v2 = new THREE.Vector3();
  var v3 = new THREE.Vector3();
  var v4 = new THREE.Vector3();

  var uv1 = new THREE.Vector2();
  var uv2 = new THREE.Vector2();
  var uv3 = new THREE.Vector2();
  var uv4 = new THREE.Vector2();

  
  var tmpV1 = new THREE.Vector3();
  var tmpV2 = new THREE.Vector3();

  var norm = new THREE.Vector3();
  var tang = new THREE.Vector3();
 
  for( var i = 0 ; i < faces.length; i++ ){

   // console.log('I : '+ i)

    var faceIndex = i * 6;
    var vertIndex = faceIndex * 3;
    var typeIndex = faceIndex * 1;
    var uvIndex   = faceIndex * 2;
    var face = faces[i];

    v1.set( face[0][0] , face[0][1] , face[0][2] );
    v2.set( face[1][0] , face[1][1] , face[1][2] );
    v3.set( face[2][0] , face[2][1] , face[2][2] );
    v4.set( face[3][0] , face[3][1] , face[3][2] );

   /* v1.multiplyScalar( size );
    v2.multiplyScalar( size );
    v3.multiplyScalar( size );
    v4.multiplyScalar( size );*/


    tmpV1.copy( v2 );
    tmpV2.copy( v2 );
    tmpV1.sub( v1 );
    tmpV2.sub( v3 );
  
    norm.crossVectors( tmpV1 , tmpV2 );
    norm.normalize(); 

    // any vec in the plane should do, as long as it is
    // shared across all attributes 
    tang.copy( v2 );
    tang.sub( v1 );
    tang.normalize();


    uv1.set( 0 , 0 );
    uv2.set( 0 , 1 );
    uv3.set( 1 , 1 );
    uv4.set( 1 , 0 );

    
    this.assignBufVec2( uvs , uvIndex + 0  , uv1 );
    this.assignBufVec2( uvs , uvIndex + 2  , uv3 );
    this.assignBufVec2( uvs , uvIndex + 4  , uv2 );
    this.assignBufVec2( uvs , uvIndex + 6  , uv4 );
    this.assignBufVec2( uvs , uvIndex + 8  , uv3 );
    this.assignBufVec2( uvs , uvIndex + 10 , uv1 );


    this.assignBufVec3( positions , vertIndex + 0  , v1 ); 
    this.assignBufVec3( positions , vertIndex + 3  , v3 ); 
    this.assignBufVec3( positions , vertIndex + 6  , v2 ); 
    this.assignBufVec3( positions , vertIndex + 9  , v4 ); 
    this.assignBufVec3( positions , vertIndex + 12 , v3 ); 
    this.assignBufVec3( positions , vertIndex + 15 , v1 );

    this.assignBufVec3( normals , vertIndex + 0  , norm ); 
    this.assignBufVec3( normals , vertIndex + 3  , norm ); 
    this.assignBufVec3( normals , vertIndex + 6  , norm ); 
    this.assignBufVec3( normals , vertIndex + 9  , norm );
    this.assignBufVec3( normals , vertIndex + 12 , norm );
    this.assignBufVec3( normals , vertIndex + 15 , norm );

    this.assignBufVec3( tangents , vertIndex + 0  , tang ); 
    this.assignBufVec3( tangents , vertIndex + 3  , tang ); 
    this.assignBufVec3( tangents , vertIndex + 6  , tang ); 
    this.assignBufVec3( tangents , vertIndex + 9  , tang ); 
    this.assignBufVec3( tangents , vertIndex + 12 , tang ); 
    this.assignBufVec3( tangents , vertIndex + 15 , tang ); 

    var type ;
    if( i < 40  ){
      //console.log('TYPE: 0');
      type = 0;
    }else{
      //console.log('TYPE: 1');
      type = 1;
    }

    this.assignBufFloat( types , typeIndex + 0, type ); 
    this.assignBufFloat( types , typeIndex + 1, type ); 
    this.assignBufFloat( types , typeIndex + 2, type ); 
    this.assignBufFloat( types , typeIndex + 3, type ); 
    this.assignBufFloat( types , typeIndex + 4, type ); 
    this.assignBufFloat( types , typeIndex + 5, type ); 

    this.assignBufFloat( ids , typeIndex + 0, i ); 
    this.assignBufFloat( ids , typeIndex + 1, i ); 
    this.assignBufFloat( ids , typeIndex + 2, i ); 
    this.assignBufFloat( ids , typeIndex + 3, i ); 
    this.assignBufFloat( ids , typeIndex + 4, i ); 
    this.assignBufFloat( ids , typeIndex + 5, i ); 


  } 

  var geo = new THREE.BufferGeometry();

  var posA  = new THREE.BufferAttribute( positions , 3 );
  var tangA = new THREE.BufferAttribute( tangents  , 3 );
  var normA = new THREE.BufferAttribute( normals   , 3 );
  var uvA   = new THREE.BufferAttribute( uvs       , 2 );
  var typeA = new THREE.BufferAttribute( types     , 1 );
  var idA   = new THREE.BufferAttribute( ids       , 1 );

  geo.setAttribute( 'position' , posA  );
  geo.setAttribute( 'tangent'  , tangA );
  geo.setAttribute( 'normal'   , normA );
  geo.setAttribute( 'uv'       , uvA   );
  geo.setAttribute( 'faceType' , typeA );
  geo.setAttribute( 'id'       , idA   );

  return geo;

}

LoadBar.prototype.createCenterGeo = function( size ){

  var circleR = 0 ;
  var polyR = size;
  var faces = [];

  var segments = 1;
  var poly = 6;

  for( var i  = 0; i < segments; i++ ){

    var t = 2 * Math.PI * (i-2)  / segments;

    var cX = Math.sin( t ) * circleR;
    var cY = Math.cos( t ) * circleR;
    var centerP = [ cX , cY , 0 ] 

    for( var j = 0; j < poly; j++ ){

      var t = 2 * Math.PI * j  / poly 
      var tU =  2 * Math.PI * (j+1) / poly

      var xCenter = cX;
      var yCenter = cY;
      var zCenter = 0;

      var xOutDo = cX + Math.sin( t  ) * polyR;
      var yOutDo = cY + Math.cos( t  ) * polyR;
      var xOutUp = cX + Math.sin( tU ) * polyR;
      var yOutUp = cY + Math.cos( tU ) * polyR;

      var f = [
        [ xCenter , yCenter , polyR /2],
        [ xOutDo , yOutDo  , -polyR /2],
        [ xOutUp , yOutUp  , -polyR /2],
      ]

      faces.push( f );

    }

  }


  var positions  = new Float32Array( faces.length * 3 * 3 );
  var normals    = new Float32Array( faces.length * 3 * 3 );
  var tangents   = new Float32Array( faces.length * 3 * 3 );
  var types      = new Float32Array( faces.length * 3 * 1 );
  var uvs        = new Float32Array( faces.length * 3 * 2 );


  var v1 = new THREE.Vector3();
  var v2 = new THREE.Vector3();
  var v3 = new THREE.Vector3();

  var uv1 = new THREE.Vector2();
  var uv2 = new THREE.Vector2();
  var uv3 = new THREE.Vector2();

  
  var tmpV1 = new THREE.Vector3();
  var tmpV2 = new THREE.Vector3();

  var norm = new THREE.Vector3();
  var tang = new THREE.Vector3();
 
  for( var i = 0 ; i < faces.length; i++ ){


    var faceIndex = i * 3;
    var vertIndex = faceIndex * 3;
    var typeIndex = faceIndex * 1;
    var uvIndex   = faceIndex * 2;
    var face = faces[i];

    v1.set( face[0][0] , face[0][1] , face[0][2] );
    v2.set( face[1][0] , face[1][1] , face[1][2] );
    v3.set( face[2][0] , face[2][1] , face[2][2] );

   /* v1.multiplyScalar( size );
    v2.multiplyScalar( size );
    v3.multiplyScalar( size );
    v4.multiplyScalar( size );*/


    tmpV1.copy( v2 );
    tmpV2.copy( v2 );
    tmpV1.sub( v1 );
    tmpV2.sub( v3 );
  
    norm.crossVectors( tmpV1 , tmpV2 );
    norm.normalize(); 

    // any vec in the plane should do, as long as it is
    // shared across all attributes 
    tang.copy( v2 );
    tang.sub( v1 );
    tang.normalize();


    uv1.set( 0 , 0 );
    uv2.set( 0 , 1 );
    uv3.set( 1 , 1 );

    
    this.assignBufVec2( uvs , uvIndex + 0  , uv1 );
    this.assignBufVec2( uvs , uvIndex + 2  , uv3 );
    this.assignBufVec2( uvs , uvIndex + 4  , uv2 );


    this.assignBufVec3( positions , vertIndex + 0  , v1 ); 
    this.assignBufVec3( positions , vertIndex + 3  , v3 ); 
    this.assignBufVec3( positions , vertIndex + 6  , v2 ); 

    this.assignBufVec3( normals , vertIndex + 0  , norm ); 
    this.assignBufVec3( normals , vertIndex + 3  , norm ); 
    this.assignBufVec3( normals , vertIndex + 6  , norm ); 

    this.assignBufVec3( tangents , vertIndex + 0  , tang ); 
    this.assignBufVec3( tangents , vertIndex + 3  , tang ); 
    this.assignBufVec3( tangents , vertIndex + 6  , tang ); 

    var type ;
    if( i < 6 ){
      //console.log('TYPE: 0');
      type = 0;
    }else if( i >= 6 && i < 12 ){
     // console.log('TYPE: 1');
      type = 1;
    }else{
      //console.log('TYPE: 2');
      type = 2;
    }

    this.assignBufFloat( types , typeIndex + 0, type ); 
    this.assignBufFloat( types , typeIndex + 1, type ); 
    this.assignBufFloat( types , typeIndex + 2, type ); 


  } 

  var geo = new THREE.BufferGeometry();

  var posA  = new THREE.BufferAttribute( positions , 3 );
  var tangA = new THREE.BufferAttribute( tangents  , 3 );
  var normA = new THREE.BufferAttribute( normals   , 3 );
  var uvA   = new THREE.BufferAttribute( uvs       , 2 );
  var typeA = new THREE.BufferAttribute( types     , 1 );

  geo.setAttribute( 'position' , posA  );
  geo.setAttribute( 'tangent'  , tangA );
  geo.setAttribute( 'normal'   , normA );
  geo.setAttribute( 'uv'       , uvA   );
  geo.setAttribute( 'faceType' , typeA );

  return geo;

}

LoadBar.prototype.assignBufVec3 = function( buf , index , vec ){

  buf[ index + 0 ] = vec.x;
  buf[ index + 1 ] = vec.y;
  buf[ index + 2 ] = vec.z;

}

LoadBar.prototype.assignBufVec2 = function( buf , index , vec ){

  buf[ index + 0 ] = vec.x;
  buf[ index + 1 ] = vec.y;

}

LoadBar.prototype.assignBufFloat = function( buf , index , f ){

  buf[ index ] = f;

}



var G = new LoadGlass({
  container: document.querySelector(".glass-block")
})