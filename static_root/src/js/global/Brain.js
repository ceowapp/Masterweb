import * as THREE from 'three';
import { RepeatWrapping } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Text } from 'troika-three-text';
import { data } from './data.min.js';

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

const vertexParticle = `
    varying vec2 vUv; 
    uniform float time;
    attribute float randoms;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec4 myPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = randoms *2. * (1. / -mvPosition.z);
      // gl_PointSize = 50;
    }
`;

const fragmentParticle = `
    uniform float time;
    void main() {
      float disc = length(gl_PointCoord.xy - vec2(0.5));
      float opacity = 0.3*smoothstep(0.5, 0.4, disc);
      gl_FragColor =  vec4(vec3(opacity), 1.);
    }
`;

const vertexTube = `
    varying vec2 vUv;
    uniform float time;
    uniform vec3 mouse;
    varying float vProgress;
    void main() {
        vUv = uv;
        vProgress = smoothstep(-1., 1., sin(vUv.x * 8.0 + time * 3.0));
        vec3 p = position;
        float maxDist = 0.05;
        float dist = length(mouse - p);
        if(dist < maxDist) {
          vec3 dir = normalize(mouse - p);
          dir *= (1.0 - dist / maxDist);
          p -= dir * 0.03;
        }
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
`;

const fragmentTube = `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying float vProgress;
    void main() {
        vec3 finalColor = mix(color, color * 0.25, vProgress);
        float hideCorners = smoothstep(1.0, 0.9, vUv.x);
        float hideCorners1 = smoothstep(0.0, 0.1, vUv.x);
        gl_FragColor = vec4(finalColor, hideCorners * hideCorners1);
    }
`;
const PATHS = data.economics[0].paths;
let brainCurves = [];
PATHS.forEach((path) => {
  let points = [];
  for (let i = 0; i < path.length; i += 3) {
    points.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
  }
  let tempCurve = new THREE.CatmullRomCurve3(points); // Corrected the curve creation
  brainCurves.push(tempCurve);
});

export default class Brain {
    constructor(options) {
        this.scene = new THREE.Scene();
        this.container = options.container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer( { alpha: true } );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 0); 
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        this.renderer.preserveDrawingBuffer = true;
        this.container.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            1,
            100
        );
        this.group = new THREE.Group();
        this.scene.add( this.group);
        // var frustumSize = 10;
        this.aspect = this.width / this.height;
        // this.cameraFinal = new THREE.OrthographicCamera(frustumSize * this.aspect / - 2, frustumSize * this.aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000);
        this.camera.position.set(0, 0, -4);
        this.camera.lookAt(this.scene.position);
        //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.time = 0;
        this.isPlaying = true;
        this.group.scale.set(20,20,20);
        this.group.position.set(0, -0.5, 0);
        this.settings();
        this.addBrainParticle(brainCurves);
        this.addBrainTube(brainCurves);
        this.render();
        this.setupResize();
        this.bindEvents();
    }

    settings() {
        let that = this;
        this.settings = {
            progress: 0,
        };
        // this.gui = new dat.GUI();
        // this.gui.add(this.settings, "progress", 0, 1, 0.01);
    }

    addBrainParticle(curves) {
        curves.forEach((curve, index) => {
            let density = 10;
            let numberOfPoints = density * curve.points.length;
            this.myPoints = [];
            this.brainParticleGeo = new THREE.BufferGeometry();
            const positions = () => {
                let positions = [];
                for (let i = 0; i < numberOfPoints; i++) {
                    positions.push(
                        randomRange(-1, 1),
                        randomRange(-1, 1),
                        randomRange(-1, 1)
                    );
                }
                return new Float32Array(positions);
            };
            const randoms = () => {
                let randoms = [];
                for (let i = 0; i < numberOfPoints; i++) {
                    randoms.push(randomRange(0.3, 1.0));
                }
                return new Float32Array(randoms);
            };
            for (let i = 0; i < curves.length; i++) {
                for (let j = 0; j < density; j++) {
                    this.myPoints.push({
                        currentOffset: Math.random(),
                        speed: Math.random() * 0.01,
                        curve: curves[i],
                        curPosition: Math.random(),
                    });
                }
            }
            let geoPositions = positions();
            let geoRandoms = randoms();
            this.brainParticleGeo.setAttribute('position', new THREE.BufferAttribute(geoPositions, 3));
            this.brainParticleGeo.setAttribute('randoms', new THREE.BufferAttribute(geoRandoms, 1));
            this.particleMaterial = new THREE.ShaderMaterial({
                extensions: {
                    derivatives: '#extension GL_OES_standard_derivatives : enable',
                },
                transparent: true,
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(0.1, 0.3, 0.6) },
                    mouse: { value: new THREE.Vector3(0.5, 0.0, 0.0)},
                },
                depthTest: false,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexShader: vertexParticle,
                fragmentShader: fragmentParticle,
            });

            this.brainParticle = new THREE.Points(this.brainParticleGeo, this.particleMaterial);
            this.group.add(this.brainParticle);
            });
    }

    addBrainTube(curves) {
        this.tubeMaterial = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable',
            },
            transparent: true,
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0.1, 0.3, 0.6) },
                mouse: { value: new THREE.Vector3(0.5, 0.0, 0.0)},
            },
            depthTest: true,
            transparent: true,
            depthWrite: true,
            blending: THREE.AdditiveBlending,
            vertexShader: vertexTube,
            fragmentShader: fragmentTube,
        });
        curves.forEach((curve, index) => {
            let tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.0002, 2, false);
            const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            this.tube = new THREE.Mesh(tubeGeometry, this.tubeMaterial);
            this.group.add(this.tube);
        });
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onUpdate() {
        if(this.brainParticleGeo){
        let curPositions = this.brainParticleGeo.attributes.position.array;
            for (let i = 0; i < this.myPoints.length; i++) {
                this.myPoints[i].curPosition += this.myPoints[1].speed;
                this.myPoints[i].curPosition = this.myPoints[i].curPosition % 1;
                let curPoint = this.myPoints[i].curve.getPointAt(this.myPoints[1].curPosition);
                curPositions[i * 3] = curPoint.x;
                curPositions[i * 3 + 1] = curPoint.y;
                curPositions[i * 3 + 2] = curPoint.z;
            }
            this.brainParticleGeo.attributes.position.needsUpdate = true;
        }
        this.tubeMaterial.uniforms.time.value = this.clock.getDelta();
        this.tubeMaterial.uniforms.mouse.value = new THREE.Vector3(
            this.mouse.x * this.width / 2,
            this.mouse.y * this.height / 2,
            0
        );
    }

    bindEvents() {
        window.addEventListener("resize", this.resize.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
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
            this.render();
            this.isPlaying = true;
        }
    }

    render() {
        if (!this.isPlaying) return;
        this.onUpdate();
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }
}

// Load Brain
const B = new Brain({
    container: document.querySelector('.brain-container')
});
