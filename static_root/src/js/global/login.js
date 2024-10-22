import * as THREE from 'three';
import { AnaglyphEffect } from 'three/addons/effects/AnaglyphEffect.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let container, camera, scene, renderer, effect;

const spheres = [];
const specialSpheres = [];
const numbersArray = [];
for (let i = 0; i < 500; i++) {
  numbersArray.push(i);
}

let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let gui;
let blueBallsControl;

// Number of blue balls controlled by the GUI
const guiParams = {
  numberOfBlueBalls: 5, // Set an initial value
};

document.addEventListener('mousemove', onDocumentMouseMove);
document.addEventListener('click', onDocumentClick);

init();
animate();

function init() {
  // Create GUI
  gui = new GUI();

  // Add a folder for controlling the number of blue balls
  const blueBallsFolder = gui.addFolder('Blue Balls');
  blueBallsControl = blueBallsFolder.add(guiParams, 'numberOfBlueBalls', 5, 500).step(1);
  blueBallsControl.onChange(() => {
    updateBlueBalls();
  });

  container = document.querySelector('.login-playground');

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.z = 3;

  const path = '../static/src/lib/THREEJS/examples/textures/cube/pisa/';
  const format = '.png';
  const urls = [
    path + 'px' + format, path + 'nx' + format,
    path + 'py' + format, path + 'ny' + format,
    path + 'pz' + format, path + 'nz' + format
  ];

  const textureCube = new THREE.CubeTextureLoader().load(urls);

  scene = new THREE.Scene();
  scene.background = textureCube;

  const geometry = new THREE.SphereGeometry(0.1, 32, 16);
   // Create balls
  for (let i = 0; i < 500; i++) {
    let material;
    if (i < guiParams.numberOfBlueBalls) {
      material = new THREE.MeshBasicMaterial({
        color: 0x0000ff, // Blue color for special spheres
        envMap: textureCube,
      });
      specialSpheres.push(i); // Store the indices of the first "numberOfBlueBalls" spheres
    } else {
      material = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Original color for other spheres
        envMap: textureCube,
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    // Create balls

    mesh.position.x = Math.random() * 10 - 5;
    mesh.position.y = Math.random() * 10 - 5;
    mesh.position.z = Math.random() * 10 - 5;

    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

    scene.add(mesh);

    spheres.push(mesh);
  }


  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const width = window.innerWidth || 2;
  const height = window.innerHeight || 2;

  effect = new AnaglyphEffect(renderer);
  effect.setSize(width, height);

  window.addEventListener('resize', onWindowResize);
}

function getMultipleRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, num);
  }

function updateBlueBalls() {
  const numberOfBlueBalls = guiParams.numberOfBlueBalls;
  console.log("numberOfBlueBalls", numberOfBlueBalls);

  // Reset the color of all spheres to white
  for (const index of specialSpheres) {
    const sphere = spheres[index];
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Original color for other spheres
      envMap: scene.background,
    });
    sphere.material = material;
  }

  // Clear the specialSpheres array to start fresh
  specialSpheres.length = 0;

  const indices = getMultipleRandom(numbersArray, numberOfBlueBalls);
  console.log("numberOfBlueBalls", indices);
  for (const index of indices) {
    const sphere = spheres[index];
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff, // Blue color for special spheres
      envMap: scene.background,
    });
    sphere.material = material;
    specialSpheres.push(index); // Store the indices of the special spheres
  }
}


function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
}

function onDocumentClick(event) {
  // Calculate click coordinates in normalized device coordinates (NDC)
  const clickX = (event.clientX / window.innerWidth) * 2 - 1;
  const clickY = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);

  // Check for intersections with the special spheres
  const intersects = raycaster.intersectObjects(specialSpheres.map(index => spheres[index]));

  if (intersects.length > 0) {
    document.querySelector('.login-playground').style.display = 'none';
    document.querySelector(".overlay-container").style.display = "block";
    document.querySelector(".container").style.display = "block";
    gui.domElement.style.display ='none';
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const timer = 0.0001 * Date.now();

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;

  camera.lookAt(scene.position);

  for (let i = 0, il = spheres.length; i < il; i++) {
    const sphere = spheres[i];

    sphere.position.x = 5 * Math.cos(timer + i);
    sphere.position.y = 5 * Math.sin(timer + i * 1.1);
  }

  effect.render(scene, camera);
}





















