import * as THREE from 'three';
import { RepeatWrapping } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Text } from 'troika-three-text';

const sphere360 = '../../static/src/assets/dataset/textures/360_office.jpg';
const earth = '../../static/src/assets/dataset/textures/earth.jpg';
const vertex = `
varying vec2 vUv;
float PI = 3.141592653589793238;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragment = `
uniform float time;
uniform float progress;
uniform sampler2D scene360;
uniform sampler2D scenePlanet;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

vec2 distort(vec2 olduv, float pr, float expol){
    vec2 p0 = 2.0 * olduv - 1.0;
    vec2 p1 = p0 / (1.0 - pr * length(p0) * expol);
    return (p1 + 1.0) * 0.5;
}

void main(){
    float progress1 = smoothstep(0.75, 1.0, progress);
    vec2 uv1 = distort(vUv, -10.0 * pow(0.5 + 0.5 * progress, 32.0), progress * 4.0);
    vec2 uv2 = distort(vUv, -10.0 * (1.0 - progress1), progress * 4.0);
    vec4 s360 = texture2D(scene360, uv1);
    vec4 sPlanet = texture2D(scenePlanet, uv2);
    float mixer = smoothstep(vUv.y, vUv.y, progress);
    gl_FragColor = vec4(vUv, 0.0, 1.0);
    gl_FragColor = s360;
    vec4 finalTexture = mix(s360, sPlanet, mixer);
    gl_FragColor = finalTexture;
}
`;


function calcPosFronLatLonRad(lat, lon) {
    var phi = (lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);
    var theta1 = (270 - lon) * (Math.PI / 180);
    let x = -(Math.cos(phi) + Math.cos(theta));
    let z = (Math.cos(phi) / Math.sin(theta));
    let y = (Math.sin(phi));
    let vector = { x, y, z };
    let euler = new THREE.Euler(phi, theta1, 0, 'XYZ');
    let quaternion = new THREE.Quaternion().setFromEuler(euler);
    return { vector, quaternion };
}


let points = [
    {
        title: 'Vietnam',
        flag: "../static/src/assets/global/logo/flag-3d-250-removebg-preview.png",
        index: 0,
        coords: {
            lat: 15.9030623,
            lng: 105.8066925
        },
        texture: sphere360
    }
];

export default class Earth {
    constructor(options) {
        this.container = options.container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.scene360 = new THREE.Scene();
        this.scenePlanet = new THREE.Scene();
        this.sceneFinal = new THREE.Scene();
        this.container.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            10000
        );
        this.camera1 = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            10000
        );
        var frustumSize = 10;
        this.aspect = this.width / this.height;
        this.cameraFinal = new THREE.OrthographicCamera(frustumSize * this.aspect / - 2, frustumSize * this.aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000);
        this.camera.position.set(0, 0, 4);
        this.camera.lookAt(this.scenePlanet.position);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls1 = new OrbitControls(this.camera1, this.renderer.domElement);
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.time = 0;
        this.isPlaying = true;
        this.settings();
        this.create360();
        this.createPlanet();
        this.createFinalScene();
        this.resize();
        this.render();
        this.setupResize();
    }

    settings() {
        let that = this;
        this._settings = {
            progress: 0,
        };
        //this.gui = new dat.GUI();
        //this.gui.add(this.settings, "progress", 0, 1, 0.01);
    }

    create360() {
        this.geometry = new THREE.SphereGeometry(10, 30, 30);
        let t = new THREE.TextureLoader().load(sphere360);
        t.wrapS = RepeatWrapping;
        t.repeat.x = -1;
        this.sphere = new THREE.Mesh(this.geometry,
            new THREE.MeshBasicMaterial({
                map: t,
                side: THREE.BackSide
            })
        );
        this.group360 = new THREE.Group();
        const myText = new Text();
        myText.text = 'HCM';
        myText.fontSize = 0.001;
        myText.position.z = -2;
        myText.anchorX = 'center';
        myText.color = 0xffffff;
        myText.sync();
        this.group360.add(myText);
        this.group360.add(this.sphere);
        this.scene360.add(this.group360);  
    }


    createPlanet() {
        this.group = new THREE.Group();
        this.earth = new THREE.Mesh(
            new THREE.SphereGeometry(1.6, 30, 30),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(earth)
            })
        );
        this.group.add(this.earth);
        this.scenePlanet.add(this.group);
        let list = document.getElementById('footer-list');
        let coords;
        let coordsArr = [];
        let el;
        let parent;
        let img;
        this.textList = [];
        points.forEach((p) => {
            coords = calcPosFronLatLonRad(p.coords.lat, p.coords.lng);
            parent = document.createElement("div");
            parent.clasName = "flag-container";
            el = document.createElement('li');
            el.style.paddingTop = "20px";
            //const el$tagA = document.createElement('a');
            el.innerText = p.title;
            el.className = 'country-name';
            el.id = p.index;
            parent.appendChild(el);
            img = document.createElement('img');
            img.className = "flag-icon";
            img.style.width = "30px";
            img.style.marginTop = "-20px";
            img.style.marginLeft = "75px";
            img.src = p.flag;
            el.appendChild(img);
            //el.appendChild(el$tagA);
            const myText = new Text();
            myText.text = p.title;
            myText.fontSize = 0.1;
            myText.position.z = 2;
            myText.anchorX = 'center';
            myText.color = 0xffffff;
            myText.sync();
            this.textList.push(myText);
            list.appendChild(el);
            let mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 20, 20),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            this.group.add(myText);
            myText.rotation.set(0,Math.PI,-Math.PI/2);
            this.group.position.set(0,0,1);
            this.group.add(mesh);
            coordsArr.push(coords);
            myText.position.copy(coords.vector);
            myText.translateY(0.2);
            mesh.position.copy(coords.vector);
        });
        let animatedQuaternion = new THREE.Quaternion();
        let currentQuaternion = new THREE.Quaternion();
        const els = [].slice.call( document.querySelectorAll('.country-name'));
        let clickCount = 0; // Initialize click count
        let progressTracker = 0;

        els.forEach((el) => {
            el.addEventListener('click', () => {
                clickCount++; // Increment click count on each click
                let o = { p: 0 };
                progressTracker = clickCount % 2 === 0 ? 1 : 0;
                currentQuaternion.copy(this.group.quaternion);
                gsap.to(o, {
                    p: 1,
                    duration: 1,
                    onUpdate: () => {
                        animatedQuaternion.slerpQuaternions(currentQuaternion, coordsArr[el.id].quaternion, o.p);
                        this.group.quaternion.copy(animatedQuaternion);
                    }
                });
                console.log("progressTracker", progressTracker);
                this.triggerEvent(progressTracker);
            });
        });
    }

    triggerEvent(dur){
        gsap.to(this._settings, {
            progress: dur,
            duration: 2,
            delay: 0.5,
            onUpdate: () => {
                this.material.uniforms.progress.value = this._settings.progress;
            },
            onComplete: () => {
                this._settings.progress = dur;
            }
        });
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.textList, true);
        if (intersects.length > 0) {
            gsap.to(this.settings, {
                duration: 2,
                delay: 0.5,
                progress: 0
            });
        }
    }

    createFinalScene() {
        this.texture360 = new THREE.WebGLRenderTarget(this.width, this.height);
        this.texturePlanet = new THREE.WebGLRenderTarget(this.width, this.height);
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                progress: { value: 0 },
                scene360: { value: null },
                scenePlanet: { value: null }
            },
            vertexShader: vertex, // vertex and fragment shaders need to be defined
            fragmentShader: fragment
        });

        const geo = new THREE.PlaneGeometry(25, 10);
        const mesh = new THREE.Mesh(geo, this.material);
        this.sceneFinal.add(mesh);
    }


    setupResize() {
        window.addEventListener('click', this.onClick.bind(this), false);
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
            this.render()
            this.isPlaying = true;
        }
    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.005;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.setRenderTarget(this.texture360);
        this.renderer.render(this.scene360, this.camera);
        this.renderer.setRenderTarget(this.texturePlanet);
        this.renderer.render(this.scenePlanet, this.camera);
        this.material.uniforms.scene360.value = this.texture360.texture;
        this.material.uniforms.scenePlanet.value = this.texturePlanet.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.sceneFinal, this.cameraFinal);
    }
}

//Load Earth 
const E = new Earth({
    container: document.getElementById('footer-anim')
});

