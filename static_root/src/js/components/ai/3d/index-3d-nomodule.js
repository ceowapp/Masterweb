import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';

let stats;
let camera, cameraTarget, renderer;
let model; // Reference to the loaded 3D model
let progressBarDiv;
const scene = new THREE.Scene();
const container = document.getElementById('generated3DView');
const parentContainer = document.querySelector('.content-generator');

init();
animate();

function init() {

    // Calculate the container's aspect ratio
    const containerWidth = parentContainer.clientWidth;
    const containerHeight = parentContainer.clientHeight;
    console.log("containerWidth");
    console.log("containerHeight");

    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 1, 10);
    
    camera.position.set(3, 0.15, 3);

    cameraTarget = new THREE.Vector3(0, -0.1, 0);

    scene.background = new THREE.Color(0x72645b);
    scene.fog = new THREE.Fog(0x72645b, 2, 15);

    // Ground
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, specular: 0x474747 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.8;
    scene.add(plane);

    const axesHelper = new THREE.AxesHelper(5); // Adjust the size as needed
    scene.add(axesHelper);

    plane.receiveShadow = true;

    // Show progress bar while loading
    showProgressBar();

     scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
    addShadowedLight(1, 1, 1, 0xffffff, 3.5);
    addShadowedLight(0.5, 1, -1, 0xffd500, 3);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerWidth, containerHeight);
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    // stats
    stats = new Stats();
    container.appendChild(stats.dom);

    // resize
    window.addEventListener('resize', onWindowResize);
}

function addShadowedLight(x, y, z, color, intensity) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.bias = -0.001;
}

function onWindowResize() {
    const containerWidth = parentContainer.clientWidth;
    const containerHeight = parentContainer.clientHeight;

    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(containerWidth, containerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {
    const timer = Date.now() * 0.0005;
    camera.position.x = Math.sin(timer) * 2.5;
    camera.position.z = Math.cos(timer) * 2.5;
    camera.lookAt(cameraTarget);
    renderer.render(scene, camera);
}

// Helper functions for progress bar
function showProgressBar() {
    progressBarDiv = document.createElement('div');
    progressBarDiv.innerText = 'Loading...';
    progressBarDiv.style.fontSize = '3em';
    progressBarDiv.style.color = '#888';
    progressBarDiv.style.display = 'block';
    progressBarDiv.style.position = 'absolute';
    progressBarDiv.style.top = '50%';
    progressBarDiv.style.width = '100%';
    progressBarDiv.style.textAlign = 'center';
    container.appendChild(progressBarDiv);
}

function hideProgressBar() {
    if (progressBarDiv) {
        container.removeChild(progressBarDiv);
        progressBarDiv = null;
    }
}

function updateProgressBar(fraction) {
    if (progressBarDiv) {
        progressBarDiv.innerText = 'Loading... ' + Math.round(fraction * 100, 2) + '%';
    }
}

 
// Function to load and render the 3D model
function loadAndRenderModel(data) {
    return new Promise((resolve, reject) => {
        const plyData = data.ply_data;

        if (!plyData) {
            reject(new Error("PLY data not found in the received data"));
        }

        // Assuming plyData is the base64-encoded PLY data received from the server
        const plyDataDecoded = atob(plyData);

        // Create a Uint8Array from the decoded PLY data
        const plyDataArray = new Uint8Array(plyDataDecoded.length);
        for (let i = 0; i < plyDataDecoded.length; i++) {
            plyDataArray[i] = plyDataDecoded.charCodeAt(i);
        }

            const loader = new PLYLoader();
            loader.load(URL.createObjectURL(new Blob([plyDataArray])),
                function (geometry) {
                    hideProgressBar();

                    const material = new THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true });

                    // Create a new model
                    model = new THREE.Mesh(geometry, material);
                    model.position.y = -0.2;
                    model.position.z = 0.3;
                    model.rotation.x = -Math.PI / 2;
                    model.scale.multiplyScalar(1);
                    model.castShadow = true;
                    model.receiveShadow = true;

                    // Add the new model to the scene
                    scene.add(model);

                    resolve(model);
                },
                function onProgress(xhr) {
                    if (xhr.lengthComputable) {
                        updateProgressBar(xhr.loaded / xhr.total);
                        console.log(Math.round(xhr.loaded / xhr.total * 100, 2) + '% downloaded');
                    }
                },
                function onError(error) {
                    hideProgressBar();
                    const message = 'Error loading model';
                    console.log(message);
                    console.error(error);
                    reject(error);
                }
            );


   });
}


// Listen for the custom event triggered after data is received
document.addEventListener("modelDataReceived", (event) => {
    const data = event.detail;
    container.style.display = "block";
    // Check if the old model exists in the scene
    if (model) {
        scene.remove(model);
    }
    // Load and render the new model
    loadAndRenderModel(data);
});
