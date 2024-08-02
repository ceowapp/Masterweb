/////////////////////////////////////
/// Add additional texture
/////////////////////////////////

import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

THREE.Cache.enabled = true;

let txtContainer;

let cameraTxt, cameraTargetTxt, sceneTxt, rendererTxt;

let groupTxt, textMesh1, textMesh2, textGeo, materialsTxt;

let firstLetter = true;

let text = 'AIGeniusX',

  bevelEnabled = true,

  font = undefined,

  fontName = 'optimer', // helvetiker, optimer, gentilis, droid sans, droid serif
  fontWeight = 'bold'; // normal bold

const height = 20,
  size = 70,
  hover = 30,

  curveSegments = 4,

  bevelThickness = 2,
  bevelSize = 1.5;

const mirror = true;

const fontMap = {

  'helvetiker': 0,
  'optimer': 1,
  'gentilis': 2,
  'droid/droid_sans': 3,
  'droid/droid_serif': 4

};

const weightMap = {

  'regular': 0,
  'bold': 1

};

const reverseFontMap = [];
const reverseWeightMap = [];

for ( const i in fontMap ) reverseFontMap[ fontMap[ i ] ] = i;
for ( const i in weightMap ) reverseWeightMap[ weightMap[ i ] ] = i;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

let fontIndex = 1;

init();
animate();

function init() {

  txtContainer = document.querySelector( '.name-entity' );
  // Calculate the container's aspect ratio
  const containerWidth = txtContainer.clientWidth;
  const containerHeight = txtContainer.clientHeight;

  // CAMERA

  cameraTxt = new THREE.PerspectiveCamera( 30, containerWidth / containerHeight, 1, 1500 );
  cameraTxt.position.set( 0, 400, 700 );

  cameraTargetTxt = new THREE.Vector3( 0, 150, 0 );

  // SCENE

  sceneTxt = new THREE.Scene();
  sceneTxt.background = new THREE.Color( 0x000000 );
  sceneTxt.fog = new THREE.Fog( 0x000000, 250, 1400 );

  // LIGHTS

  const dirLightTxt = new THREE.DirectionalLight( 0xffffff, 0.4 );
  dirLightTxt.position.set( 0, 0, 1 ).normalize();
  sceneTxt.add( dirLightTxt );

  const pointLightTxt = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
  pointLightTxt.color.setHSL( Math.random(), 1, 0.5 );
  pointLightTxt.position.set( 0, 100, 90 );
  sceneTxt.add( pointLightTxt );

  materialsTxt = [
    new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
    new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
  ];

  groupTxt = new THREE.Group();
  groupTxt.position.y = 100;

  sceneTxt.add( groupTxt );

  loadFont();

  const planeTxt = new THREE.Mesh(
    new THREE.PlaneGeometry( 10000, 10000 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
  );
  planeTxt.position.y = 100;
  planeTxt.rotation.x = - Math.PI / 2;
  sceneTxt.add( planeTxt );

  // RENDERER

  rendererTxt = new THREE.WebGLRenderer( { antialias: true } );
  rendererTxt.setPixelRatio( window.devicePixelRatio );
  rendererTxt.setSize( containerWidth, containerHeight );
  txtContainer.appendChild( renderer.domElement );

  // EVENTS

  txtContainer.style.touchAction = 'none';
  txtContainer.addEventListener( 'pointerdown', onPointerDown );

  document.addEventListener( 'keypress', onDocumentKeyPress );
  document.addEventListener( 'keydown', onDocumentKeyDown );

  //

  const params = {
    changeColor: function () {

      pointLight.color.setHSL( Math.random(), 1, 0.5 );

    },
    changeFont: function () {

      fontIndex ++;

      fontName = reverseFontMap[ fontIndex % reverseFontMap.length ];

      loadFont();

    },
    changeWeight: function () {

      if ( fontWeight === 'bold' ) {

        fontWeight = 'regular';

      } else {

        fontWeight = 'bold';

      }

      loadFont();

    },
    changeBevel: function () {

      bevelEnabled = ! bevelEnabled;

      refreshText();

    }
  };

  //

  const gui = new GUI();

  gui.add( params, 'changeColor' ).name( 'change color' );
  gui.add( params, 'changeFont' ).name( 'change font' );
  gui.add( params, 'changeWeight' ).name( 'change weight' );
  gui.add( params, 'changeBevel' ).name( 'change bevel' );
  gui.open();

  //

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  windowHalfX = containerWidth / 2;

  cameraTxt.aspect = containerWidth / containerHeight;
  cameraTxt.updateProjectionMatrix();

  rendererTxt.setSize( containerWidth, containerHeight );

}

//

function onDocumentKeyDown( event ) {

  if ( firstLetter ) {

    firstLetter = false;
    text = '';

  }

  const keyCode = event.keyCode;

  // backspace

  if ( keyCode == 8 ) {

    event.preventDefault();

    text = text.substring( 0, text.length - 1 );
    refreshText();

    return false;

  }

}

function onDocumentKeyPress( event ) {

  const keyCode = event.which;

  // backspace

  if ( keyCode == 8 ) {

    event.preventDefault();

  } else {

    const ch = String.fromCharCode( keyCode );
    text += ch;

    refreshText();

  }

}

function loadFont() {

  const loader = new FontLoader();
  loader.load( './examples/fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {

    font = response;

    refreshText();

  } );

}

function createText() {

  textGeo = new TextGeometry( text, {

    font: font,

    size: size,
    height: height,
    curveSegments: curveSegments,

    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: bevelEnabled

  } );

  textGeo.computeBoundingBox();

  const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

  textMesh1 = new THREE.Mesh( textGeo, materials );

  textMesh1.position.x = centerOffset;
  textMesh1.position.y = hover;
  textMesh1.position.z = 0;

  textMesh1.rotation.x = 0;
  textMesh1.rotation.y = Math.PI * 2;

  groupTxt.add( textMesh1 );

  if ( mirror ) {

    textMesh2 = new THREE.Mesh( textGeo, materials );

    textMesh2.position.x = centerOffset;
    textMesh2.position.y = - hover;
    textMesh2.position.z = height;

    textMesh2.rotation.x = Math.PI;
    textMesh2.rotation.y = Math.PI * 2;

    groupTxt.add( textMesh2 );

  }

}

function refreshText() {

  groupTxt.remove( textMesh1 );
  if ( mirror ) groupTxt.remove( textMesh2 );

  if ( ! text ) return;

  createText();

}

function onPointerDown( event ) {

  if ( event.isPrimary === false ) return;

  pointerXOnPointerDown = event.clientX - windowHalfX;
  targetRotationOnPointerDown = targetRotation;

  document.addEventListener( 'pointermove', onPointerMove );
  document.addEventListener( 'pointerup', onPointerUp );

}

function onPointerMove( event ) {

  if ( event.isPrimary === false ) return;

  pointerX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnPointerDown + ( pointerX - pointerXOnPointerDown ) * 0.02;

}

function onPointerUp() {

  if ( event.isPrimary === false ) return;

  document.removeEventListener( 'pointermove', onPointerMove );
  document.removeEventListener( 'pointerup', onPointerUp );

}

//

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {

  groupTxt.rotation.y += ( targetRotation - groupTxt.rotation.y ) * 0.05;

  cameraTxt.lookAt( cameraTargetTxt );

  rendererTxt.clear();
  rendererTxt.render( sceneTxt, cameraTxt );

}
