import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { amazon_icon_svg_path } from './amazon.js';
import { google_icon_svg_path } from './google.js';
import { microsoft_icon_svg_path} from './microsoft.js';
const table = {
  'AMAZON': '../../static/src/assets/sounds/test.png',
  'GOOGLE': '../../static/src/assets/sounds/test.png',
  'MICROSOFT': '../../static/src/assets/sounds/test.png'
};

const iconSVGData = {
  'AMAZON':amazon_icon_svg_path,
  'GOOGLE': google_icon_svg_path,
  'MICROSOFT': microsoft_icon_svg_path
};

export default class Customer {
  constructor(options) {
    this.container = options.container;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    this.camera.position.z = 300;
    this.objects = [];
    this.targets = {table: []};
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 500;
    this.controls.maxDistance = 6000;
    this.time = 0;
    this.isPlaying = true;
    this.init();
    this.animate();
    this.setupResize();
  }

  init() {
    for (const key in table) {
      if (table.hasOwnProperty(key)) {
        const value = table[key];

        // Create the element div
        const element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

        // Create the SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute("width", "50px");
        svg.setAttribute("height", "50px");
        svg.setAttribute("viewBox", "0 0 512 512");

        // Add path elements to SVG
        iconSVGData[key].forEach((pathData) => {
          //const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          svg.setAttribute('d', pathData);
          //svg.setAttribute("path", path);
        });

        element.appendChild(svg);

        // Add label and tag elements
        const label = document.createElement('p');
        label.className = 'grid__item-label';
        label.textContent = 'We assisted ' + key + ' in creating a modern and scalable website, optimizing speed, integrating cloud-based hosting solutions.';
        element.appendChild(label);

        const tag = document.createElement('span');
        tag.className = 'grid__item-tag';
        tag.textContent = 'Explore';
        element.appendChild(tag);

        // Create CSS3DObject and set its position
        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;

        // Add the CSS3DObject to the scene and objects array
        this.scene.add(objectCSS);
        this.objects.push(objectCSS);

        // Create a 3D target object for table layout
        const object = new THREE.Object3D();
        object.position.x = (Math.random() * 140) - 70;
        object.position.y = (Math.random() * 180) - 90;

        // Add the target object to the targets table array
        this.targets.table.push(object);
        console.log("this targets table", this.targets.table)
      }
    }

    // Set up event listeners for layout transformation buttons
    const buttonTable = document.getElementById('table');
    buttonTable.addEventListener('click', () => this.transform(this.targets.table, 2000));
    /*
    const buttonSphere = document.getElementById('sphere');
    buttonSphere.addEventListener('click', () => this.transform(this.targets.sphere, 2000));

    const buttonHelix = document.getElementById('helix');
    buttonHelix.addEventListener('click', () => this.transform(this.targets.helix, 2000));

    const buttonGrid = document.getElementById('grid');
    buttonGrid.addEventListener('click', () => this.transform(this.targets.grid, 2000));*/

    // Set the initial layout (table)
    this.transform(this.targets.table, 2000);
  }

  transform(targets, duration) {
    console.log("this is actually triggerer")
    TWEEN.removeAll();
    for (let i = 0; i < this.objects.length; i++) {
      const object = this.objects[i];
      const target = targets[i];
      new TWEEN.Tween(object.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
      /*new TWEEN.Tween( object.rotation )
            .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();*/

    }

    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(this.render.bind(this))
      .start();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.animate();
      this.isPlaying = true;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    if (!this.isPlaying) return;
    this.render();
    TWEEN.update();
    this.controls.update();
    requestAnimationFrame(this.animate.bind(this));
  }
}

