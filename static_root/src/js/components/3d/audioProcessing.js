import * as THREE from 'three';
import { ShaderNode, uniform, storage, instanceIndex, float, texture, viewportTopLeft, color } from 'three/addons/nodes/Nodes.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

let camera, scene, renderer;
let computeNode;
let waveBuffer, sampleRate;
let waveGPUBuffer;
let opt;
let soundBuffer;
let url;
let isEnabled = false;
let currentAudio, currentAnalyser;

const analyserBuffer = new Uint8Array( 1024 );

let analyserTexture;

let containerWidth, containerHeight;

let audioContainerElement;

let startButton;
 
let source;

let audioPlaying = false;

let audioStartTime = 0;

let activateAudio = false;

let audioTriggered = false;

let resetTriggered = false;

let htmlGenerated = false;

// Function to handle audio generation
let previousOpt = {}; // Store the previous opt to track changes
let previousSoundBuffer = {};

const defaultOpt = {
    url: '../static/src/lib/THREEJS/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg',
    pitch: uniform(0.05),
    delayVolume: uniform(0.05),
    delayOffset: uniform(0.05),
};

// Function to load variables from localStorage
async function loadVariables() {
  return new Promise((resolve, reject) => {
    activateAudio = localStorage.getItem("activateAudio");
    audioTriggered = localStorage.getItem("audioTriggered");
    resetTriggered = localStorage.getItem("resetTriggered");
    
    console.log('activateAudio', activateAudio);
    console.log('audioTriggered', audioTriggered);
    console.log('resetTriggered', resetTriggered);


    if (activateAudio === "true" && (audioTriggered === "true" || resetTriggered === "true")) { // Check if values are strings "true"


      if (activateAudio === "true" && audioTriggered === "true" && resetTriggered === "true") {
           console.log("case1 is satisfied");
           opt = defaultOpt;
      } else if (activateAudio === "true" && audioTriggered === "true" && resetTriggered === "false") {
        console.log("case2 is satisfied");
        const url = localStorage.getItem("soundURL");
        const pitch = uniform(parseFloat(localStorage.getItem("pitch")));
        const delayVolume = uniform(parseFloat(localStorage.getItem("delayVolume")));
        const delayOffset = uniform(parseFloat(localStorage.getItem("delayOffset")));
        opt = {
          url: url,
          pitch: pitch,
          delayVolume: delayVolume,
          delayOffset: delayOffset
        };
        console.log("url", url);
        console.log("pitch", pitch);
        console.log("delayOffset", delayOffset);

        for (var o in defaultOpt) {
          if (defaultOpt.hasOwnProperty(o)) {
            opt[o] = typeof opt[o] === 'undefined' ? defaultOpt[o] : opt[o]; // Fixed variable name "defaultOpt"
          }
        }
      }
    
      resolve(opt);
    } else {
      // Resolve with null or an appropriate value if conditions are not met
      resolve(null);
    }
  });
};

// Function to handle HTML generation
function handleHTMLGeneration() {
console.log("this function handleHTMLGeneration is triggered");
  if (!htmlGenerated && activateAudio === "true" && (audioTriggered === "true" || resetTriggered === "true")) {
    createHTMLElements();
    htmlGenerated = true;
  }
}

// Function to handle audio generation
async function handleAudioGeneration(opt, soundBuffer) {
  if (opt !== null && activateAudio === "true" && audioTriggered === "true" && resetTriggered === "false") {
    if (!_.isEqual(opt.url, previousOpt.url)) {
      previousOpt = { ...opt }; // Update previousOpt
      soundBuffer = await fetch(opt.url).then((res) => res.arrayBuffer());
      generateAudio(opt, soundBuffer);
      console.log("this condition 11 is met", soundBuffer);
      audioTriggered = false;
    } else {
      console.log("this condition 22 is met", soundBuffer);
      return;
    }
  } else if (activateAudio === "true" && audioTriggered === "true" && resetTriggered === "true") {
    console.log("this condition 3 is met");
    soundBuffer = await fetch(defaultOpt.url).then((res) => res.arrayBuffer());
    generateAudio(defaultOpt, soundBuffer);
    audioTriggered = false;
    resetTriggered = false;
  } else if (activateAudio === "true" && audioTriggered === "false" && resetTriggered ==="false") {
    console.log("this condition 4 is met");
    if (source) {
      source.stop();
    }
  } else {
    if (source) {
      source.stop();
    }
  }
}

// Periodically check for changes in localStorage (e.g., every 5 seconds) only if conditions are met
const checkInterval = 2000; // 2 seconds

// Define a function to continuously check for updates
function continuouslyCheckVariables() {
  loadVariables().then((opt) => {
      handleHTMLGeneration();
    if (activateAudio === "true") {
      handleAudioGeneration(opt, soundBuffer);
    }
  });
}

// Call continuouslyCheckVariables initially and then set it to run at intervals
continuouslyCheckVariables(); // Call initially

if (activateAudio === "true") {
     setInterval(continuouslyCheckVariables, checkInterval); // Call at intervals
}


function createHTMLElements() {
  if (!audioContainerElement) {
  // Create a button element
  console.log("this is already triggered");
  audioContainerElement = document.createElement('div');
  audioContainerElement.id = 'audio-container'; // Set the button's id attribute (if needed)
  audioContainerElement.style.width = '256px';
  audioContainerElement.style.height = '128px';
  audioContainerElement.style.left = '0';
  audioContainerElement.style.top = '0';
  audioContainerElement.style.position = 'absolute';
  audioContainerElement.style.display = 'flex';
  document.body.appendChild(audioContainerElement); // Add the button to the body element

  containerWidth = audioContainerElement.clientWidth;
  containerHeight = audioContainerElement.clientHeight;


    // Create a button element
  startButton = document.createElement('button');

  // Set button attributes (e.g., text content, id, class, etc.)
  startButton.textContent = 'START'; // Set the button's text content
  startButton.id = 'startButton'; // Set the button's id attribute (if needed)
  // Add the button to the HTML document (e.g., to a specific container)
  audioContainerElement.appendChild(startButton); // Add the button to the body element

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 30 );

  renderer = new WebGPURenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( containerWidth, containerHeight );
  renderer.setAnimationLoop( render );
  audioContainerElement.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize );

}

}


async function playAudioBuffer(isEnabled) {

  if ( currentAudio ) currentAudio.stop();

  // compute audio

  renderer.compute( computeNode );

  const waveArray = new Float32Array( await renderer.getArrayBufferAsync( waveGPUBuffer ) );

  // play result

  const audioOutputContext = new AudioContext( { sampleRate } );
  const audioOutputBuffer = audioOutputContext.createBuffer( 1, waveArray.length, sampleRate );

  audioOutputBuffer.copyToChannel( waveArray, 0 );

  source = audioOutputContext.createBufferSource();
  source.connect( audioOutputContext.destination );
  source.buffer = audioOutputBuffer;

  if (source) {
      if (isEnabled) {
        source.start();
      } else {
        source.stop();
      }
  }
  
  currentAudio = source;

  // visual feedback

  currentAnalyser = audioOutputContext.createAnalyser();
  currentAnalyser.fftSize = 2048;

  source.connect( currentAnalyser );
}


async function generateAudio(opt, soundBuffer) {
  console.log('this generateAudio function is triggered');

  if (WebGPU.isAvailable() === false) {
    document.body.appendChild(WebGPU.getErrorMessage());
    throw new Error('No WebGPU support');
  }

  const audioContext = new AudioContext();

  if (opt.url && soundBuffer) {
    const audioBuffer = await audioContext.decodeAudioData(soundBuffer);
    waveBuffer = audioBuffer.getChannelData(0);
    // adding extra silence to delay and pitch
    waveBuffer = new Float32Array([...waveBuffer, ...new Float32Array(200000)]);
    sampleRate = audioBuffer.sampleRate / audioBuffer.numberOfChannels;

    // create webgpu buffers
    waveGPUBuffer = new THREE.InstancedBufferAttribute(waveBuffer, 1);
    const waveStorageNode = storage(waveGPUBuffer, 'float', waveBuffer.length);

    // read-only buffer
    const waveNode = storage(
      new THREE.InstancedBufferAttribute(waveBuffer, 1),
      'float',
      waveBuffer.length
    );

    // compute (shader-node)
    const computeShaderNode = new ShaderNode((stack) => {
      const index = float(instanceIndex);

      // pitch
      const time = index.mul(opt.pitch);

      let wave = waveNode.element(time);

      // delay
      for (let i = 1; i < 7; i++) {
        const waveOffset = waveNode.element(
          index
            .sub(opt.delayOffset.mul(sampleRate).mul(i))
            .mul(opt.pitch)
        );
        const waveOffsetVolume = waveOffset.mul(opt.delayVolume.div(i * i));

        wave = wave.add(waveOffsetVolume);
      }

      // store
      const waveStorageElementNode = waveStorageNode.element(instanceIndex);

      stack.assign(waveStorageElementNode, wave);
    });

    // compute
    computeNode = computeShaderNode.compute(waveBuffer.length);

    // Function to toggle audio playback
    if (startButton) {
      startButton.addEventListener('pointerdown', function () {
        isEnabled = isEnabled ? false : true;
        console.log('isEnabled', isEnabled);
        playAudioBuffer(isEnabled);
      });
    }

    // nodes
    analyserTexture = new THREE.DataTexture(
      analyserBuffer,
      analyserBuffer.length,
      1,
      THREE.RedFormat
    );

    const spectrum = texture(analyserTexture, viewportTopLeft.x).x.mul(
      viewportTopLeft.y
    );
    const backgroundNode = color(0x0000FF).mul(spectrum);

    // scene
    scene.backgroundNode = backgroundNode;
  } else {
    return;
    console.error('soundBuffer is not an ArrayBuffer:', soundBuffer);
  }
}



function render() {

  if ( currentAnalyser ) {

    currentAnalyser.getByteFrequencyData( analyserBuffer );

    analyserTexture.needsUpdate = true;

  }

  renderer.render( scene, camera );

}


function onWindowResize() {
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( containerWidth, clientHeight );
}


