import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

THREE.Cache.enabled = true;

let txtContainer;

let cameraTxt, cameraTargetTxt, sceneTxt, rendererTxt;

let groupTxt, textMesh1, textMesh2, textGeo, materialsTxt;

let line, lineGeo;


let firstLetter = true;
let isRotating = false;

let text = 'Omnibus',


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

let uniforms = {

      amplitude: { value: 5.0 },
      opacity: { value: 0.3 },
      color: { value: new THREE.Color( 0xffffff ) }

  };


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
  rendererTxt.setClearColor(0x000000, 0); 
  rendererTxt.setSize( containerWidth, containerHeight );
  txtContainer.appendChild( rendererTxt.domElement );

  // EVENTS

  txtContainer.style.touchAction = 'none';
  txtContainer.addEventListener( 'pointerdown', onPointerDown );

  document.addEventListener( 'keypress', onDocumentKeyPress );
  document.addEventListener( 'keydown', onDocumentKeyDown );

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
  loader.load( '../static/src/lib/THREEJS/examples/fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {

    font = response;

    refreshText();

  });

}

function createText() {

    //groupTxt.add( textMesh2 );
    const shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true

    });


  textGeo = new TextGeometry( text, {

    font: font,

    size: size,
    height: height,
    curveSegments: curveSegments,

    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: bevelEnabled

  });

  textGeo.computeBoundingBox();

  const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

  //textMesh1 = new THREE.Mesh( textGeo, materialsTxt );

  //textMesh1.position.x = centerOffset;
  //textMesh1.position.y = hover;
  //textMesh1.position.z = 0;

  //textMesh1.rotation.x = 0;
  //textMesh1.rotation.y = Math.PI * 2;


    const count = textGeo.attributes.position.count;

    const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
    textGeo.setAttribute( 'displacement', displacement );

    const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
    textGeo.setAttribute( 'customColor', customColor );

    const color = new THREE.Color( 0xffffff );

    for ( let i = 0, l = customColor.count; i < l; i ++ ) {

        color.setHSL( i / l, 0.5, 0.5 );
        color.toArray( customColor.array, i * customColor.itemSize );

    }


    line = new THREE.Line( textGeo, shaderMaterial );
    lineGeo = line;
    line.position.x = centerOffset;
    line.position.y = hover;
    line.position.z = 0;

    line.rotation.x = 0;
    line.rotation.y = Math.PI * 2;

    //line.rotation.x = 0.2;
    //sceneTxt.add(line);
    groupTxt.add( line );

  if ( mirror ) {

    textMesh2 = new THREE.Mesh( textGeo, shaderMaterial );

    textMesh2.position.x = centerOffset;
    textMesh2.position.y = - hover;
    textMesh2.position.z = height;

    textMesh2.rotation.x = Math.PI;
    textMesh2.rotation.y = Math.PI * 2;
    groupTxt.add( textMesh2 );
  }


}


function renderShader (lineGeo) {
  if (lineGeo) {
    const time = Date.now() * 0.001;

    //lineGeo.rotation.y = 0.25 * time;

    uniforms.amplitude.value = Math.sin( 0.5 * time );
    uniforms.color.value.offsetHSL( 0.0005, 0, 0 );

    const attributes = lineGeo.geometry.attributes;
    const array = attributes.displacement.array;

    for ( let i = 0, l = array.length; i < l; i += 3 ) {

        array[ i ] += 0.3 * ( 0.5 - Math.random() );
        array[ i + 1 ] += 0.3 * ( 0.5 - Math.random() );
        array[ i + 2 ] += 0.3 * ( 0.5 - Math.random() );

    }

    attributes.displacement.needsUpdate = true;

  }

}
  

function refreshText() {

  groupTxt.remove( line );
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

function rotateText() {
  targetRotation += Math.PI * 2; // Rotate 360 degrees (2 * Math.PI)
}

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {
  if (!isRotating) {
    setTimeout(() => {
      rotateText();
      isRotating = true;
      setTimeout(() => {
        isRotating = false;
      }, 2000); // 2 seconds break
    }, 5000); // 5 seconds rotation
  }

  groupTxt.rotation.y += ( targetRotation - groupTxt.rotation.y ) * 0.05;

  cameraTxt.lookAt( cameraTargetTxt );

  renderShader(lineGeo);
  

  rendererTxt.clear();
  rendererTxt.render( sceneTxt, cameraTxt );

}





