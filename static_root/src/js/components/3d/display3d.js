  // header
  import * as THREE from 'three';
  import Stats from 'three/addons/libs/stats.module.js';
  import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { Water } from 'three/addons/objects/Water2.js';
  import { TransformControls } from 'three/addons/controls/TransformControls.js';
  import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
  import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

  import { ShadowMapViewer } from 'three/addons/utils/ShadowMapViewer.js';

  import { FlyControls } from 'three/addons/controls/FlyControls.js';


  import WebGPU from 'three/addons/capabilities/WebGPU.js';
  import WebGL from 'three/addons/capabilities/WebGL.js';

  import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

  import IESSpotLight from 'three/addons/lights/IESSpotLight.js';

  import { IESLoader } from 'three/addons/loaders/IESLoader.js';

  import { tslFn, uniform, texture, instanceIndex, float, vec3, storage, SpriteNodeMaterial } from 'three/addons/nodes/Nodes.js';

  import { NRRDLoader } from 'three/addons/loaders/NRRDLoader.js';
  import { VolumeRenderShader1 } from 'three/addons/shaders/VolumeShader.js';

  import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

  import { ShadowMesh } from 'three/addons/objects/ShadowMesh.js';

  import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
  import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
  import { FocusShader } from 'three/addons/shaders/FocusShader.js';
  import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';


  import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

  import { TAARenderPass } from 'three/addons/postprocessing/TAARenderPass.js';

  import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
  import { ToonShader1, ToonShader2, ToonShaderHatching, ToonShaderDotted } from 'three/addons/shaders/ToonShader.js';

  import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
  import { FontLoader } from 'three/addons/loaders/FontLoader.js';

  import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
  import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

  let cameraPersp, cameraOrtho, currentCamera;
  let scene, scene1, renderer, rendererGPU, control, orbit, water;
  let clock;
  let camera;
  let isLight1 = false;
  let isLight2 = false;
  let stats;
  let isPC = false;
  let isWater = false;
  let isDefault = false;
  let aspect;
  let ground;
  const spheres = [];
  let sphere;
  let pointclouds;
  let pcBuffer,pcIndexed, pcIndexedOffset;
  let bulbLight, bulbMat, hemiLight;
  let previousShadowMap = false;
  let orbitControls;
  let originalMaterial = null;
  let transformControls;
  // ref for lumens: http://www.power-sure.com/lumens.htm
  const bulbLuminousPowers = {
    '110000 lm (1000W)': 110000,
    '3500 lm (300W)': 3500,
    '1700 lm (100W)': 1700,
    '800 lm (60W)': 800,
    '400 lm (40W)': 400,
    '180 lm (25W)': 180,
    '20 lm (4W)': 20,
    'Off': 0
  };

  // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
  const hemiLuminousIrradiances = {
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
  };

  const params = {
    showHelpers: false
  };


  const container = document.getElementById('container');
  const topText = document.getElementById("topText");
  const infor = document.getElementById("info");
  const inforLight = document.getElementById("info-light");




  let initScene1 = false;
  let initScene2 = false;
  let initScene3 = false;
  let initScene4 = false;
  let initScene5 = false;
  let initScene6 = false;
  let initScene7 = false;
  let initScene8 = false;
  let initScene9 = false;
  let initScene10 = false;
  let initScene11 = false;
  let initScene12 = false;
  let initScene13 = false;
  let initScene14 = false;
  let initScene15 = false;
  let initScene16 = false;
  let initScene17 = false;
  let initScene18 = false;
  let initScene19 = false;
  let initScene20 = false;
  let initScene21 = false;
  let initScene22 = false;
  let initScene23 = false;
  let initScene24 = false;
  let initScene25 = false;



    init();
    animate();

    function init() {

    	clock = new THREE.Clock();

        // scene

      scene = new THREE.Scene();
      //scene.add(new THREE.AxesHelper(5));

      aspect = window.innerWidth / window.innerHeight;

      //Lightings

 	    const spotLight = new THREE.SpotLight( 0xffffff, 60 );
      spotLight.angle = Math.PI / 5;
      spotLight.penumbra = 0.2;
      spotLight.position.set( 2, 3, 3 );
      spotLight.castShadow = true;
      spotLight.shadow.camera.near = 3;
      spotLight.shadow.camera.far = 10;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      scene.add( spotLight );

      const dirLight = new THREE.DirectionalLight( 0x55505a, 3 );
      dirLight.position.set( 0, 3, 0 );
      dirLight.castShadow = true;
      dirLight.shadow.camera.near = 1;
      dirLight.shadow.camera.far = 10;

      dirLight.shadow.camera.right = 1;
      dirLight.shadow.camera.left = - 1;
      dirLight.shadow.camera.top  = 1;
      dirLight.shadow.camera.bottom = - 1;

      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add( dirLight );

        //Setup cameras

      cameraPersp = new THREE.PerspectiveCamera( 50, aspect, 0.01, 30000 );
      cameraOrtho = new THREE.OrthographicCamera( - 600 * aspect, 600 * aspect, 600, - 600, 0.01, 30000 );
      currentCamera = cameraPersp;

      currentCamera.position.set( 5, 2.5, 5 );

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
      );

      camera.position.set(0.8, 1.4, 1.0);

       
		// renderer

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

     orbitControls = new OrbitControls(camera, renderer.domElement);
     orbitControls.enableDamping = true;
     orbitControls.target.set(0, 1, 0);

     transformControls = new TransformControls(camera, renderer.domElement);
     scene.add(transformControls)
	

      transformControls.addEventListener('mouseDown', function () {
      orbitControls.enabled = false
      });

      transformControls.addEventListener('mouseUp', function () {
      orbitControls.enabled = true
      });

        window.addEventListener( 'keydown', function ( event ) {

          switch ( event.keyCode ) {

            case 81: // Q
              control.setSpace( control.space === 'local' ? 'world' : 'local' );
              break;

            case 16: // Shift
              control.setTranslationSnap( 100 );
              control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
              control.setScaleSnap( 0.25 );
              break;

            case 87: // W
              control.setMode( 'translate' );
              break;

            case 69: // E
              control.setMode( 'rotate' );
              break;

            case 82: // R
              control.setMode( 'scale' );
              break;

            case 67: // C
              const position = currentCamera.position.clone();

              currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
              currentCamera.position.copy( position );

              orbit.object = currentCamera;
              control.camera = currentCamera;

              currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
              onWindowResize();
              break;

            case 86: // V
              const randomFoV = Math.random() + 0.1;
              const randomZoom = Math.random() + 0.1;

              cameraPersp.fov = randomFoV * 160;
              cameraOrtho.bottom = - randomFoV * 500;
              cameraOrtho.top = randomFoV * 500;

              cameraPersp.zoom = randomZoom * 5;
              cameraOrtho.zoom = randomZoom * 5;
              onWindowResize();
              break;

            case 187:
            case 107: // +, =, num+
              control.setSize( control.size + 0.1 );
              break;

            case 189:
            case 109: // -, _, num-
              control.setSize( Math.max( control.size - 0.1, 0.1 ) );
              break;

            case 88: // X
              control.showX = ! control.showX;
              break;

            case 89: // Y
              control.showY = ! control.showY;
              break;

            case 90: // Z
              control.showZ = ! control.showZ;
              break;

            case 32: // Spacebar
              control.enabled = ! control.enabled;
              break;

            case 27: // Esc
              control.reset();
              break;

          }

        });

        window.addEventListener( 'keyup', function ( event ) {

          switch ( event.keyCode ) {

            case 16: // Shift
              control.setTranslationSnap( null );
              control.setRotationSnap( null );
              control.setScaleSnap( null );
              break;

          }

        });

      window.addEventListener('keydown', function (event) {
        switch (event.key) {
          case 'g':
            transformControls.setMode('translate');
            break;
          case 'r':
            transformControls.setMode('rotate');
            break;
          case 's':
            transformControls.setMode('scale');
            break;
        }
      });

      // ***** Clipping planes: *****
      const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);
      const globalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.1);


          // ***** Clipping setup (renderer): *****
      const globalPlanes = [ globalPlane ],
        Empty = Object.freeze( [] );
        renderer.clippingPlanes = Empty; // GUI sets it to globalPlanes
        renderer.localClippingEnabled = true;


      // Create the clipping material
      const clippingMaterial = new THREE.MeshPhongMaterial({
        color: "",
        shininess: 100,
        side: THREE.DoubleSide,

        // ***** Clipping setup (material): *****
        clippingPlanes: [localPlane],
        clipShadows: true
      });


      const planeGeometry = new THREE.PlaneGeometry(25, 25);
      const texture1 = new THREE.TextureLoader().load('../static/src/lib/THREEJS/src/assets/global/img/grid.jpg');
      const plane = new THREE.Mesh(
        planeGeometry,
        new THREE.MeshPhongMaterial({ map: texture1 })
      );
      plane.rotateX(-Math.PI / 2);
      plane.receiveShadow = true;
      //scene.add(plane);

      let object = null;
      let modelReady = false;
      const gltfLoader = new GLTFLoader();

      const progressBarDiv = document.createElement('div');
      progressBarDiv.innerText = 'Loading...';
      progressBarDiv.style.fontSize = '3em';
      progressBarDiv.style.color = '#888';
      progressBarDiv.style.display = 'block';
      progressBarDiv.style.position = 'absolute';
      progressBarDiv.style.top = '50%';
      progressBarDiv.style.width = '100%';
      progressBarDiv.style.textAlign = 'center';

      function showProgressBar() {
        document.body.appendChild(progressBarDiv);
      }

      function hideProgressBar() {
        document.body.removeChild(progressBarDiv);
      }

      function updateProgressBar(fraction) {
        progressBarDiv.innerText = 'Loading... ' + Math.round( fraction * 100, 2 ) + '%';
      }

     gltfLoader.load(
		  '../static/src/lib/THREEJS/src/assets/media/gltf/tracker/junk-yard-robot-boy/source/multiclip.gltf',
		  (gltf) => {
        let scale = 0.02;
		    object = gltf.scene;

		    object.traverse(function (child) {
		      if (child.isMesh) {
		        originalMaterial = child.material;
		        child.castShadow = true;
		        child.frustumCulled = false;
            child.geometry.scale(scale, scale, scale);
		        child.geometry.computeVertexNormals();
		      }
		    });

		    transformControls.attach(object);
		    transformControls.visible = false;


		    scene.add(object);

		    console.log("gltf object", object);

		    modelReady = true;

		    hideProgressBar(); // Hide the progress bar when the loading is complete
		  },
		  (xhr) => {
		    const fractionLoaded = xhr.loaded / xhr.total;
		    showProgressBar();
		    updateProgressBar(fractionLoaded);
		  },
		  (error) => {
		    console.error(error); // Use console.error for error messages
		  }
	);


//////////////////////////////////////////

//Ground section

////////////////////////////////////

        const groundGeometry = new THREE.PlaneGeometry( 20, 20, 10, 10 );
        const groundMaterial = new THREE.MeshBasicMaterial( { color: 0xe7e7e7 } );
        ground = new THREE.Mesh( groundGeometry, groundMaterial );
        ground.rotation.x = Math.PI * - 0.5;
        //scene.add( ground );

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load( '../static/src/lib/THREEJS/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg', function ( map ) {
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.anisotropy = 16;
          map.repeat.set( 4, 4 );
          map.colorSpace = THREE.SRGBColorSpace;
          groundMaterial.map = map;
          groundMaterial.needsUpdate = true;

        });

        // water

        const waterGeometry = new THREE.PlaneGeometry( 20, 20 );
        const flowMap = textureLoader.load( '../static/src/lib/THREEJS/examples/textures/water/Water_1_M_Flow.jpg' );

        water = new Water( waterGeometry, {
          scale: 2,
          textureWidth: 1024,
          textureHeight: 1024,
          flowMap: flowMap
        });

        water.position.y = 1;
        water.rotation.x = Math.PI * - 0.5;

        // flow map helper

      const helperGeometry = new THREE.PlaneGeometry( 20, 20 );
      const helperMaterial = new THREE.MeshBasicMaterial( { map: flowMap } );
      const helper = new THREE.Mesh( helperGeometry, helperMaterial );
      helper.position.y = 1.01;
      helper.rotation.x = Math.PI * - 0.5;
      helper.visible = false;

		  stats = new Stats();
    	document.body.appendChild(stats.dom);


		 // Add event listeners
	  	window.addEventListener('resize', onWindowResize);


 }


//////////////////////////////////////////

//Video section

////////////////////////////////////
    
function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }


	function render() {

	   renderer.render( scene, camera );

	}


function animate() {
  orbitControls.update();
  stats.update();
  requestAnimationFrame(animate);
  render();

}

function onWindowResize() {

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho.left = cameraOrtho.bottom * aspect;
  cameraOrtho.right = cameraOrtho.top * aspect;
  cameraOrtho.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}




/////
/* Settings for GUI*/
/////


function Settings() {
      var that = this;
      this['Enable Light1'] = isLight1;
      this['Enable Light2'] = isLight2;
      const params = {
        shadows: true,
        exposure: 0.68,
        bulbPower: Object.keys( bulbLuminousPowers )[ 4 ],
        hemiIrradiance: Object.keys( hemiLuminousIrradiances )[ 0 ]
      };

      this.params = params;

      this.groundSettings = {
      'water': function () {
          scene.remove( ground );

        // Remove the wall object from scene1


          scene.remove( pcBuffer );
          scene.remove( pcIndexed );
          scene.remove( pointclouds );        
          scene.remove( pcIndexedOffset );
          scene.remove( sphere );
    
          scene.remove(spheres);
          scene.remove(sphere);
          scene.add( water );
          scene.add( helper );
          isWater = true;
          isPC = false;
          isDefault = false;
          that.renderWater(renderer, camera);

      },

      'pointcloud': function () {
         scene.remove( ground );
         scene.remove( water );
         isPC = true;
         isWater = false;
         isDefault = false;
         that.addScenePC(renderer, camera);

      },

      'default': function () {
         scene.remove( pointclouds );
         scene.remove( water );
         scene.add( ground );
          isWater = false;
          isPC = false;
          isDefault = true;
          that.renderDefault(renderer, camera);

      }
    };

    
    this['Add Light1'] = function () {
      that.loadLightBull(renderer, camera);
    };

    this['Add Light2'] = function () {
      that.loadColorfulLight(renderer, camera);
    };


     this.addScenePC = function(renderer, camera) {
      let pointclouds;
      let raycaster;
      let intersection = null;
      let spheresIndex = 0;
      let clock;
      let toggle = 0;

      const pointer = new THREE.Vector2();

      const threshold = 0.1;
      const pointSize = 0.05;
      const width = 80;
      const length = 160;
      const rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

      init();
      animate();

      function generatePointCloudGeometry( color, width, length ) {

        const geometry = new THREE.BufferGeometry();
        const numPoints = width * length;

        const positions = new Float32Array( numPoints * 3 );
        const colors = new Float32Array( numPoints * 3 );

        let k = 0;

        for ( let i = 0; i < width; i ++ ) {

          for ( let j = 0; j < length; j ++ ) {

            const u = i / width;
            const v = j / length;
            const x = u - 0.5;
            const y = ( Math.cos( u * Math.PI * 4 ) + Math.sin( v * Math.PI * 8 ) ) / 20;
            const z = v - 0.5;

            positions[ 3 * k ] = x;
            positions[ 3 * k + 1 ] = y;
            positions[ 3 * k + 2 ] = z;

            const intensity = ( y + 0.1 ) * 5;
            colors[ 3 * k ] = color.r * intensity;
            colors[ 3 * k + 1 ] = color.g * intensity;
            colors[ 3 * k + 2 ] = color.b * intensity;

            k ++;

          }

        }

        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        geometry.computeBoundingBox();

        return geometry;

      }

      function generatePointcloud( color, width, length ) {

        const geometry = generatePointCloudGeometry( color, width, length );
        const material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );

        return new THREE.Points( geometry, material );

      }

      function generateIndexedPointcloud( color, width, length ) {

        const geometry = generatePointCloudGeometry( color, width, length );
        const numPoints = width * length;
        const indices = new Uint16Array( numPoints );

        let k = 0;

        for ( let i = 0; i < width; i ++ ) {

          for ( let j = 0; j < length; j ++ ) {

            indices[ k ] = k;
            k ++;

          }

        }

        geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );

        const material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );

        return new THREE.Points( geometry, material );

      }

      function generateIndexedWithOffsetPointcloud( color, width, length ) {

        const geometry = generatePointCloudGeometry( color, width, length );
        const numPoints = width * length;
        const indices = new Uint16Array( numPoints );

        let k = 0;

        for ( let i = 0; i < width; i ++ ) {

          for ( let j = 0; j < length; j ++ ) {

            indices[ k ] = k;
            k ++;

          }

        }

        geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        geometry.addGroup( 0, indices.length );

        const material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );

        return new THREE.Points( geometry, material );

      }

      function init() {

        clock = new THREE.Clock();

        //camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
        //camera.position.set( 10, 10, 10 );
        //camera.lookAt( scene.position );
        //camera.updateMatrix();

        //

        pcBuffer = generatePointcloud( new THREE.Color( 1, 0, 0 ), width, length );
        pcBuffer.scale.set( 5, 10, 10 );
        pcBuffer.position.set( - 5, 0, 0 );
        scene.add( pcBuffer );

        pcIndexed = generateIndexedPointcloud( new THREE.Color( 0, 1, 0 ), width, length );
        pcIndexed.scale.set( 5, 10, 10 );
        pcIndexed.position.set( 0, 0, 0 );
        scene.add( pcIndexed );

        pcIndexedOffset = generateIndexedWithOffsetPointcloud( new THREE.Color( 0, 1, 1 ), width, length );
        pcIndexedOffset.scale.set( 5, 10, 10 );
        pcIndexedOffset.position.set( 5, 0, 0 );
        scene.add( pcIndexedOffset );

        pointclouds = [ pcBuffer, pcIndexed, pcIndexedOffset ];

        //

        const sphereGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

        for ( let i = 0; i < 40; i ++ ) {

          sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
          scene.add( sphere );
          spheres.push( sphere );

        }

        //
        raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = threshold;

        document.addEventListener( 'pointermove', onPointerMove );

      }

      function onPointerMove( event ) {

        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      }

      function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

      }

      function render() {

        camera.applyMatrix4( rotateY );
        camera.updateMatrixWorld();

        raycaster.setFromCamera( pointer, camera );

        const intersections = raycaster.intersectObjects( pointclouds, false );
        intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

        if ( toggle > 0.02 && intersection !== null ) {

          spheres[ spheresIndex ].position.copy( intersection.point );
          spheres[ spheresIndex ].scale.set( 1, 1, 1 );
          spheresIndex = ( spheresIndex + 1 ) % spheres.length;

          toggle = 0;

        }

        for ( let i = 0; i < spheres.length; i ++ ) {

          const sphere = spheres[ i ];
          sphere.scale.multiplyScalar( 0.98 );
          sphere.scale.clampScalar( 0.01, 1 );

        }

        toggle += clock.getDelta();

        renderer.render( scene, camera );

      }

    };


    this.renderDefault = function(renderer, camera) {
      renderer.render( scene, camera );
    };


    this.renderWater = function(renderer, camera) {
      renderer.render( scene, camera );
    };




//////////////////////////////////////////

//Lighting section

////////////////////////////////////

    this.loadLightBull = function(renderer, camera) {

      let bulbLight, bulbMat, hemiLight;

      let previousShadowMap = false;
      init();
      animate();

      function init() {
        let scale = 10;

        const bulbGeometry = new THREE.SphereGeometry( 0.02, 16, 8 );
        bulbGeometry.scale(scale, scale, scale);
        bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );

        bulbMat = new THREE.MeshStandardMaterial( {
          emissive: 0xffffee,
          emissiveIntensity: 1,
          color: 0x000000
        });

        bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
        bulbLight.position.setY( 20 );
        console.log("bulbLight position", bulbLight.position);
        bulbLight.castShadow = true;
        scene.add( bulbLight );

        hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
        scene.add( hemiLight );
      }


      function animate() {

        requestAnimationFrame( animate );

        render();

      }

      function render() {

        renderer.toneMappingExposure = Math.pow( that.params.exposure, 5.0 ); // to allow for very bright scenes.
        renderer.shadowMap.enabled = that.params.shadows;
        bulbLight.castShadow = that.params.shadows;

        if ( that.params.shadows !== previousShadowMap ) {

        previousShadowMap = that.params.shadows;

        }

        bulbLight.power = bulbLuminousPowers[ that.params.bulbPower ];
        bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface

        hemiLight.intensity = hemiLuminousIrradiances[ that.params.hemiIrradiance ];
        const time = Date.now() * 0.0005;

        bulbLight.position.y = Math.cos( time ) * 0.75 + 1.25;

        renderer.render( scene, camera );

      }

  };


    this.loadColorfulLight = async function ( renderer, camera ) {

      let lights;

      async function init() {

        if ( WebGPU.isAvailable() === false ) {

          document.body.appendChild( WebGPU.getErrorMessage() );

          throw new Error( 'No WebGPU support' );

        }

        const iesLoader = new IESLoader().setPath( '../static/src/lib/THREEJS/examples/ies/' );
        //iesLoader.type = THREE.UnsignedByteType; // LDR

        const [ iesTexture1, iesTexture2, iesTexture3, iesTexture4 ] = await Promise.all( [
          iesLoader.loadAsync( '007cfb11e343e2f42e3b476be4ab684e.ies' ),
          iesLoader.loadAsync( '06b4cfdc8805709e767b5e2e904be8ad.ies' ),
          iesLoader.loadAsync( '02a7562c650498ebb301153dbbf59207.ies' ),
          iesLoader.loadAsync( '1a936937a49c63374e6d4fbed9252b29.ies' )
        ] );

        //

        const spotLight = new IESSpotLight( 0xff0000, 500 );
        spotLight.position.set( 6.5, 1.5, 6.5 );
        spotLight.angle = Math.PI / 8;
        spotLight.penumbra = 0.7;
        spotLight.distance = 20;
        spotLight.iesMap = iesTexture1;
        //scene.add( spotLight );

        //

        const spotLight2 = new IESSpotLight( 0x00ff00, 500 );
        spotLight2.position.set( 6.5, 1.5, - 6.5 );
        spotLight2.angle = Math.PI / 8;
        spotLight2.penumbra = 0.7;
        spotLight2.distance = 20;
        spotLight2.iesMap = iesTexture2;
        scene.add( spotLight2 );

        //

        const spotLight3 = new IESSpotLight( 0x0000ff, 500 );
        spotLight3.position.set( - 6.5, 1.5, - 6.5 );
        spotLight3.angle = Math.PI / 8;
        spotLight3.penumbra = 0.7;
        spotLight3.distance = 20;
        spotLight3.iesMap = iesTexture3;
        scene.add( spotLight3 );

        //

        const spotLight4 = new IESSpotLight( 0xffffff, 500 );
        spotLight4.position.set( - 6.5, 1.5, 6.5 );
        spotLight4.angle = Math.PI / 8;
        spotLight4.penumbra = 0.7;
        spotLight4.distance = 20;
        spotLight4.iesMap = iesTexture4;
        scene.add( spotLight4 );

        //

        lights = [ spotLight, spotLight2, spotLight3, spotLight4 ];

        const material = new THREE.MeshPhongMaterial( { color: 0x808080/*, dithering: true*/ } );

        const geometry = new THREE.PlaneGeometry( 200, 200 );

        const mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = - Math.PI * 0.5;
        scene.add( mesh );

        window.addEventListener( 'resize', onWindowResize );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }


      function render( time ) {

        time = ( time / 1000 ) * 2.0;

        for ( let i = 0; i < lights.length; i ++ ) {

          lights[ i ].position.y = Math.sin( time + i ) + 0.97;

        }

        renderer.render( scene, camera );

      }

      init();

    };


    this['LoadScene1'] = function () {
      //THIS IS USING RENDERGPU
        removeChildren1(scene1);
        initLoadScene1();
    };

    this['LoadScene2'] = function () {
        removeChildren(scene);
        initLoadScene2(scene, renderer);
    };

    this['LoadScene3'] = function () {
        removeChildren(scene);
        initLoadScene3(scene, renderer);
    };

    this['LoadScene4'] = function () {
        removeChildren(scene);
        initLoadScene4( scene, renderer);
    };

    this['LoadScene5'] = function () {
        removeChildren(scene);
        initLoadScene5( scene, renderer);
    };

    this['LoadScene6'] = function () {
        removeChildren(scene);
        initLoadScene6( scene, renderer);
    };

    this['LoadScene7'] = function () {
        removeChildren(scene);
        initLoadScene7( scene, renderer);
    };

    this['LoadScene8'] = function () {
        removeChildren(scene);
        initLoadScene8( scene, renderer);
    };

    this['LoadScene9'] = function () {
        removeChildren(scene);
        initLoadScene9( scene, renderer);
    };

    this['LoadScene10'] = function () {
        removeChildren(scene);
        initLoadScene10( scene, renderer);
    };

    this['LoadScene11'] = function () {
        removeChildren(scene);
        initLoadScene11( scene, renderer);
    };

    this['LoadScene12'] = function () {
        removeChildren(scene);
        initLoadScene12( scene, renderer);   
    };

    this['LoadScene13'] = function () {
        removeChildren(scene);
        initLoadScene13( scene, renderer);  
    };

    this['LoadScene14'] = function () {
        removeChildren(scene);
        initLoadScene14( scene, renderer);  
    };

    this['LoadScene15'] = function () {
        removeChildren(scene);
        initLoadScene15( scene, renderer);  
    };

    this['LoadScene16'] = function () {
        removeChildren(scene);
        initLoadScene16( scene, renderer);  
    };

    this['LoadScene17'] = function () {
        removeChildren(scene);
        initLoadScene17( scene, renderer);  
    };

    this['LoadScene18'] = function () {
        removeChildren(scene);
        initLoadScene18( scene, renderer);  
    };

    this['LoadScene19'] = function () {
        removeChildren(scene);
        initLoadScene19( scene, renderer);
    };

    this['LoadScene20'] = function () {
        removeChildren(scene);
        initLoadScene20( scene, renderer);
    };

    this['LoadScene21'] = function () {
        removeChildren(scene);
        initLoadScene21( scene, renderer);
    };

    this['LoadScene22'] = function () {
        removeChildren(scene);
        initLoadScene22( scene, renderer);
    };



  function removeChildren1(scene) {
    topText.style.display = "none";
    infor.style.display = "none";
    inforLight.style.display = "none";
    // Remove all objects from the scene
    if (scene) {
    while (scene.children.length > 0) {
        const obj = scene.children[0];
        // Remove the object from the scene
        scene.remove(obj);
    }
  }

}


function removeChildrenScene1(scene, container) {
  topText.style.display = "none";
  infor.style.display = "none";
  inforLight.style.display = "none";

  // Remove all objects from the scene
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    // Remove the object from the scene
    scene.remove(obj);
  }

  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}



// this is for other scenes except scene1

  function removeChildren(scene) {
    topText.style.display = "none";
    infor.style.display = "none";
    inforLight.style.display = "none";
    const container1 = document.getElementById("container1");
    if (container1) {
       removeChildrenScene1(scene1, container1); 
    }
    // Remove all objects from the scene
    while (scene.children.length > 0) {
        const obj = scene.children[0];
        // Remove the object from the scene
        console.log("object removed", obj);
        scene.remove(obj);
    }

}




////////////////////////////

// Compute Particles

//////////////////////////////////


function initLoadScene1 () {

      const particleCount = 100000;

      const gravity = uniform( - .0098 );
      const bounce = uniform( .8 );
      const friction = uniform( .99 );
      const size = uniform( .12 );

      const clickPosition = uniform( new THREE.Vector3() );

      let camera;
      let controls, stats;
      let computeParticles;

      init();

      function init() {

        if ( WebGPU.isAvailable() === false ) {

          document.body.appendChild( WebGPU.getErrorMessage() );

          throw new Error( 'No WebGPU support' );

        }

          // Create a container element reference
          const containerElement = document.createElement('div');
          containerElement.style.position = 'absolute';
          containerElement.style.top = '0';
          containerElement.style.width = '100%';
          containerElement.style.height = '100%';
          containerElement.style.left = '0';
          containerElement.id = 'container1';
          document.body.appendChild(containerElement);

        const { innerWidth, innerHeight } = window;

        camera = new THREE.PerspectiveCamera( 50, innerWidth / innerHeight, .1, 1000 );
        camera.position.set( 40, 15, 40 );

        scene1 = new THREE.Scene();
        //scene = scene1.clone();

        // textures

        const textureLoader = new THREE.TextureLoader();
        const map = textureLoader.load( '../static/src/lib/THREEJS/examples/textures/sprite1.png' );

        //

        const createBuffer = () => storage( new THREE.InstancedBufferAttribute( new Float32Array( particleCount * 4 ), 4 ), 'vec3', particleCount );

        const positionBuffer = createBuffer();
        const velocityBuffer = createBuffer();
        const colorBuffer = createBuffer();

        // compute

        const computeInit = tslFn( ( stack ) => {

          const position = positionBuffer.element( instanceIndex );
          const color = colorBuffer.element( instanceIndex );

          const randX = instanceIndex.hash();
          const randY = instanceIndex.add( 2 ).hash();
          const randZ = instanceIndex.add( 3 ).hash();

          stack.assign( position.x, randX.mul( 60 ).add( - 30 ) );
          stack.assign( position.y, randY.mul( 10 ) );
          stack.assign( position.z, randZ.mul( 60 ).add( - 30 ) );

          stack.assign( color, vec3( randX, randY, randZ ) );

        } )().compute( particleCount );

        //

        const computeUpdate = tslFn( ( stack ) => {

          const position = positionBuffer.element( instanceIndex );
          const velocity = velocityBuffer.element( instanceIndex );

          stack.assign( velocity, velocity.add( vec3( 0.00, gravity, 0.00 ) ) );
          stack.assign( position, position.add( velocity ) );

          stack.assign( velocity, velocity.mul( friction ) );

          // floor

          stack.if( position.y.lessThan( 0 ), ( stack ) => {

            stack.assign( position.y, 0 );
            stack.assign( velocity.y, velocity.y.negate().mul( bounce ) );

            // floor friction

            stack.assign( velocity.x, velocity.x.mul( .9 ) );
            stack.assign( velocity.z, velocity.z.mul( .9 ) );

          } );

        } );

        computeParticles = computeUpdate().compute( particleCount );

        // create nodes

        const textureNode = texture( map );

        // create particles

        const particleMaterial = new SpriteNodeMaterial();
        particleMaterial.colorNode = textureNode.mul( colorBuffer.element( instanceIndex ) );
        particleMaterial.positionNode = positionBuffer.toAttribute();
        particleMaterial.scaleNode = size;
        particleMaterial.depthWrite = false;
        particleMaterial.depthTest = true;
        particleMaterial.transparent = true;

        const particles = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), particleMaterial );
        particles.isInstancedMesh = true;
        particles.count = particleCount;
        scene1.add( particles );

        //

        const helper = new THREE.GridHelper( 60, 40, 0x303030, 0x303030 );
        scene1.add( helper );

        const geometry = new THREE.PlaneGeometry( 1000, 1000 );
        geometry.rotateX( - Math.PI / 2 );

        const plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
        scene1.add( plane );

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        //

        rendererGPU = new WebGPURenderer( { antialias: true } );
        rendererGPU.setPixelRatio( window.devicePixelRatio );
        rendererGPU.setSize( window.innerWidth, window.innerHeight );
        rendererGPU.setAnimationLoop( animate );
        containerElement.appendChild( rendererGPU.domElement );

        //

        rendererGPU.compute( computeInit );

        // click event

        const computeHit = tslFn( ( stack ) => {

          const position = positionBuffer.element( instanceIndex );
          const velocity = velocityBuffer.element( instanceIndex );

          const dist = position.distance( clickPosition );
          const direction = position.sub( clickPosition ).normalize();
          const distArea = float( 7 ).sub( dist ).max( 0 );

          const power = distArea.mul( .1 );
          const relativePower = power.mul( instanceIndex.hash().mul( .5 ).add( .5 ) );

          stack.assign( velocity, velocity.add( direction.mul( relativePower ) ) );

        } )().compute( particleCount );

        //

        function onHit( event ) {

          pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

          raycaster.setFromCamera( pointer, camera );

          const intersects = raycaster.intersectObjects( [ plane ], false );

          if ( intersects.length > 0 ) {

            const { point } = intersects[ 0 ];

            // move to uniform

            clickPosition.value.copy( point );
            clickPosition.value.y = - 1;

            // compute

            rendererGPU.compute( computeHit );

          }

        }

        // events

        window.addEventListener( 'pointerdown', onHit );

        //

        controls = new OrbitControls( camera, rendererGPU.domElement );
        controls.minDistance = 5;
        controls.maxDistance = 70;
        controls.target.set( 0, - 1, 0 );
        controls.update();

        //

        window.addEventListener( 'resize', onWindowResize );



      }

      function onWindowResize() {

        const { innerWidth, innerHeight } = window;

        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();

        rendererGPU.setSize( innerWidth, innerHeight );

      }

      function animate() {

        rendererGPU.compute( computeParticles );
        rendererGPU.render( scene1, camera );

      }
}

////////////////////////////

// Textures

//////////////////////////////////

function initLoadScene2 (scene, renderer) {

    if ( WebGL.isWebGL2Available() === false ) {

      document.body.appendChild( WebGL.getWebGL2ErrorMessage() );

    }

      let camera,
      new_controls,
      material,
      volconfig,
      cmtextures;


    init();

    function init() {

      //scene = new THREE.Scene();

      // Create camera (The volume renderer does not work very well with perspective yet)
      const h = 512; // frustum height
      const aspect = window.innerWidth / window.innerHeight;
      camera = new THREE.OrthographicCamera( - h * aspect / 2, h * aspect / 2, h / 2, - h / 2, 1, 1000 );
      camera.position.set( - 64, - 64, 128 );
      camera.up.set( 0, 0, 1 ); // In our data, z is up


      // Create controls
      new_controls = new OrbitControls( camera, renderer.domElement );
      new_controls.addEventListener( 'change', render );
      new_controls.target.set( 64, 64, 128 );
      new_controls.minZoom = 0.5;
      new_controls.maxZoom = 4;
      new_controls.enablePan = false;
      new_controls.update();

      //scene.add( new AxesHelper( 128 ) );

      // Lighting is baked into the shader a.t.m.

      //Lightings

        const spotLight = new THREE.SpotLight( 0xffffff, 60 );
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.2;
        spotLight.position.set( 2, 3, 3 );
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 3;
        spotLight.shadow.camera.far = 10;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        scene.add( spotLight );

        const dirLight = new THREE.DirectionalLight( 0x55505a, 3 );
        dirLight.position.set( 0, 3, 0 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;

        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = - 1;
        dirLight.shadow.camera.top  = 1;
        dirLight.shadow.camera.bottom = - 1;

        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add( dirLight );


      //let dirLight = new DirectionalLight( 0xffffff );

       scene.add(dirLight);


      // The gui for interaction
      volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };
      const gui = new GUI();
      gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
      gui.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );
      gui.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( updateUniforms );
      gui.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
      gui.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms );

      // Load the data ...
      new NRRDLoader().load( '../static/src/lib/THREEJS/examples/models/nrrd/stent.nrrd', function ( volume ) {

        // Texture to hold the volume. We have scalars, so we put our data in the red channel.
        // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
        // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
        // TODO: look the dtype up in the volume metadata
        const texture = new THREE.Data3DTexture( volume.data, volume.xLength, volume.yLength, volume.zLength );
        texture.format = THREE.RedFormat;
        texture.type = THREE.FloatType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // Colormap textures
        cmtextures = {
          viridis: new THREE.TextureLoader().load( '../static/src/lib/THREEJS/examples/textures/cm_viridis.png', render ),
          gray: new THREE.TextureLoader().load( '../static/src/lib/THREEJS/examples/textures/cm_gray.png', render )
        };

        // Material
        const shader = VolumeRenderShader1;

        const uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        uniforms[ 'u_data' ].value = texture;
        uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength );
        uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
        uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
        uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
        uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

        material = new THREE.ShaderMaterial( {
          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        } );

        // THREE.Mesh
        const geometry = new THREE.BoxGeometry( volume.xLength, volume.yLength, volume.zLength );
        geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 );

        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
        console.log("scene", scene.children);

        render();

      } );

      window.addEventListener( 'resize', onWindowResize );

    }

    function updateUniforms() {

      material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
      material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
      material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
      material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

      render();

    }

    function onWindowResize() {

      renderer.setSize( window.innerWidth, window.innerHeight );

      const aspect = window.innerWidth / window.innerHeight;

      const frustumHeight = camera.top - camera.bottom;

      camera.left = - frustumHeight * aspect / 2;
      camera.right = frustumHeight * aspect / 2;

      camera.updateProjectionMatrix();

      render();

    }

    function render() {

      renderer.render( scene, camera );

    }
  }

  ////////////////////////////

// Bird Scene

//////////////////////////////////


function initLoadScene3 ( scene, renderer ) {

      /* TEXTURE WIDTH FOR SIMULATION */
      const WIDTH = 64;
      const BIRDS = WIDTH * WIDTH;

      /* BAKE ANIMATION INTO TEXTURE and CREATE GEOMETRY FROM BASE MODEL */
      const BirdGeometry = new THREE.BufferGeometry();
      let textureAnimation, durationAnimation, birdMesh, materialShader, indicesPerBird;

      function nextPowerOf2( n ) {

        return Math.pow( 2, Math.ceil( Math.log( n ) / Math.log( 2 ) ) );

      }

      Math.lerp = function ( value1, value2, amount ) {

        amount = Math.max( Math.min( amount, 1 ), 0 );
        return value1 + ( value2 - value1 ) * amount;

      };

      const gltfs = [ '../static/src/lib/THREEJS/examples/models/gltf/Parrot.glb', '../static/src/lib/THREEJS/examples/models/gltf/Flamingo.glb' ];
      const colors = [ 0xccFFFF, 0xffdeff ];
      const sizes = [ 0.2, 0.1 ];
      const selectModel = Math.floor( Math.random() * gltfs.length );
      new GLTFLoader().load( gltfs[ selectModel ], function ( gltf ) {

        const animations = gltf.animations;
        durationAnimation = Math.round( animations[ 0 ].duration * 60 );
        const birdGeo = gltf.scene.children[ 0 ].geometry;
        const morphAttributes = birdGeo.morphAttributes.position;
        const tHeight = nextPowerOf2( durationAnimation );
        const tWidth = nextPowerOf2( birdGeo.getAttribute( 'position' ).count );
        indicesPerBird = birdGeo.index.count;
        const tData = new Float32Array( 4 * tWidth * tHeight );

        for ( let i = 0; i < tWidth; i ++ ) {

          for ( let j = 0; j < tHeight; j ++ ) {

            const offset = j * tWidth * 4;

            const curMorph = Math.floor( j / durationAnimation * morphAttributes.length );
            const nextMorph = ( Math.floor( j / durationAnimation * morphAttributes.length ) + 1 ) % morphAttributes.length;
            const lerpAmount = j / durationAnimation * morphAttributes.length % 1;

            if ( j < durationAnimation ) {

              let d0, d1;

              d0 = morphAttributes[ curMorph ].array[ i * 3 ];
              d1 = morphAttributes[ nextMorph ].array[ i * 3 ];

              if ( d0 !== undefined && d1 !== undefined ) tData[ offset + i * 4 ] = Math.lerp( d0, d1, lerpAmount );

              d0 = morphAttributes[ curMorph ].array[ i * 3 + 1 ];
              d1 = morphAttributes[ nextMorph ].array[ i * 3 + 1 ];

              if ( d0 !== undefined && d1 !== undefined ) tData[ offset + i * 4 + 1 ] = Math.lerp( d0, d1, lerpAmount );

              d0 = morphAttributes[ curMorph ].array[ i * 3 + 2 ];
              d1 = morphAttributes[ nextMorph ].array[ i * 3 + 2 ];

              if ( d0 !== undefined && d1 !== undefined ) tData[ offset + i * 4 + 2 ] = Math.lerp( d0, d1, lerpAmount );

              tData[ offset + i * 4 + 3 ] = 1;

            }

          }

        }

        textureAnimation = new THREE.DataTexture( tData, tWidth, tHeight, THREE.RGBAFormat, THREE.FloatType );
        textureAnimation.needsUpdate = true;

        const vertices = [], color = [], reference = [], seeds = [], indices = [];
        const totalVertices = birdGeo.getAttribute( 'position' ).count * 3 * BIRDS;
        for ( let i = 0; i < totalVertices; i ++ ) {

          const bIndex = i % ( birdGeo.getAttribute( 'position' ).count * 3 );
          vertices.push( birdGeo.getAttribute( 'position' ).array[ bIndex ] );
          color.push( birdGeo.getAttribute( 'color' ).array[ bIndex ] );

        }

        let r = Math.random();
        for ( let i = 0; i < birdGeo.getAttribute( 'position' ).count * BIRDS; i ++ ) {

          const bIndex = i % ( birdGeo.getAttribute( 'position' ).count );
          const bird = Math.floor( i / birdGeo.getAttribute( 'position' ).count );
          if ( bIndex == 0 ) r = Math.random();
          const j = ~ ~ bird;
          const x = ( j % WIDTH ) / WIDTH;
          const y = ~ ~ ( j / WIDTH ) / WIDTH;
          reference.push( x, y, bIndex / tWidth, durationAnimation / tHeight );
          seeds.push( bird, r, Math.random(), Math.random() );

        }

        for ( let i = 0; i < birdGeo.index.array.length * BIRDS; i ++ ) {

          const offset = Math.floor( i / birdGeo.index.array.length ) * ( birdGeo.getAttribute( 'position' ).count );
          indices.push( birdGeo.index.array[ i % birdGeo.index.array.length ] + offset );

        }

        BirdGeometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );
        BirdGeometry.setAttribute( 'birdColor', new THREE.BufferAttribute( new Float32Array( color ), 3 ) );
        BirdGeometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( color ), 3 ) );
        BirdGeometry.setAttribute( 'reference', new THREE.BufferAttribute( new Float32Array( reference ), 4 ) );
        BirdGeometry.setAttribute( 'seeds', new THREE.BufferAttribute( new Float32Array( seeds ), 4 ) );

        BirdGeometry.setIndex( indices );

        init();
        animate();

      } );

      let camera;
      let mouseX = 0, mouseY = 0;

      let windowHalfX = window.innerWidth / 2;
      let windowHalfY = window.innerHeight / 2;

      const BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;

      let last = performance.now();

      let gpuCompute;
      let velocityVariable;
      let positionVariable;
      let positionUniforms;
      let velocityUniforms;

      function init() {

        //container = document.createElement( 'div' );
        //document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
        camera.position.z = 350;

        //scene.background = new THREE.Color( colors[ selectModel ] );
        scene.fog = new THREE.Fog( colors[ selectModel ], 100, 1000 );

        // LIGHTS

        const hemiLight = new THREE.HemisphereLight( colors[ selectModel ], 0xffffff, 4.5 );
        hemiLight.color.setHSL( 0.6, 1, 0.6, THREE.SRGBColorSpace );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75, THREE.SRGBColorSpace );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );

        const dirLight = new THREE.DirectionalLight( 0x00CED1, 2.0 );
        dirLight.color.setHSL( 0.1, 1, 0.95, THREE.SRGBColorSpace );
        dirLight.position.set( - 1, 1.75, 1 );
        dirLight.position.multiplyScalar( 30 );
        scene.add( dirLight );

        initComputeRenderer();


        container.style.touchAction = 'none';
        container.addEventListener( 'pointermove', onPointerMove );

        window.addEventListener( 'resize', onWindowResize );

        const gui = new GUI();

        const effectController = {

          separation: 20.0,
          alignment: 20.0,
          cohesion: 20.0,
          freedom: 0.75,
          size: sizes[ selectModel ],
          count: Math.floor( BIRDS / 4 )

        };

        const valuesChanger = function () {

          velocityUniforms[ 'separationDistance' ].value = effectController.separation;
          velocityUniforms[ 'alignmentDistance' ].value = effectController.alignment;
          velocityUniforms[ 'cohesionDistance' ].value = effectController.cohesion;
          velocityUniforms[ 'freedomFactor' ].value = effectController.freedom;
          if ( materialShader ) materialShader.uniforms[ 'size' ].value = effectController.size;
          BirdGeometry.setDrawRange( 0, indicesPerBird * effectController.count );

        };

        valuesChanger();

        gui.add( effectController, 'separation', 0.0, 100.0, 1.0 ).onChange( valuesChanger );
        gui.add( effectController, 'alignment', 0.0, 100, 0.001 ).onChange( valuesChanger );
        gui.add( effectController, 'cohesion', 0.0, 100, 0.025 ).onChange( valuesChanger );
        gui.add( effectController, 'size', 0, 1, 0.01 ).onChange( valuesChanger );
        gui.add( effectController, 'count', 0, BIRDS, 1 ).onChange( valuesChanger );
        gui.close();

        initBirds( effectController );

      }

      function initComputeRenderer() {

        gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

        if ( renderer.capabilities.isWebGL2 === false ) {

          gpuCompute.setDataType( THREE.HalfFloatType );

        }

        const dtPosition = gpuCompute.createTexture();
        const dtVelocity = gpuCompute.createTexture();
        fillPositionTexture( dtPosition );
        fillVelocityTexture( dtVelocity );

        velocityVariable = gpuCompute.addVariable( 'textureVelocity', document.getElementById( 'fragmentShaderVelocity' ).textContent, dtVelocity );
        positionVariable = gpuCompute.addVariable( 'texturePosition', document.getElementById( 'fragmentShaderPosition' ).textContent, dtPosition );

        gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
        gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

        positionUniforms = positionVariable.material.uniforms;
        velocityUniforms = velocityVariable.material.uniforms;

        positionUniforms[ 'time' ] = { value: 0.0 };
        positionUniforms[ 'delta' ] = { value: 0.0 };
        velocityUniforms[ 'time' ] = { value: 1.0 };
        velocityUniforms[ 'delta' ] = { value: 0.0 };
        velocityUniforms[ 'testing' ] = { value: 1.0 };
        velocityUniforms[ 'separationDistance' ] = { value: 1.0 };
        velocityUniforms[ 'alignmentDistance' ] = { value: 1.0 };
        velocityUniforms[ 'cohesionDistance' ] = { value: 1.0 };
        velocityUniforms[ 'freedomFactor' ] = { value: 1.0 };
        velocityUniforms[ 'predator' ] = { value: new THREE.Vector3() };
        velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

        velocityVariable.wrapS = THREE.RepeatWrapping;
        velocityVariable.wrapT = THREE.RepeatWrapping;
        positionVariable.wrapS = THREE.RepeatWrapping;
        positionVariable.wrapT = THREE.RepeatWrapping;

        const error = gpuCompute.init();

        if ( error !== null ) {

          console.error( error );

        }

      }

      function initBirds( effectController ) {

        const geometry = BirdGeometry;

        const m = new THREE.MeshStandardMaterial( {
          vertexColors: true,
          flatShading: true,
          roughness: 1,
          metalness: 0
        } );

        m.onBeforeCompile = ( shader ) => {

          shader.uniforms.texturePosition = { value: null };
          shader.uniforms.textureVelocity = { value: null };
          shader.uniforms.textureAnimation = { value: textureAnimation };
          shader.uniforms.time = { value: 1.0 };
          shader.uniforms.size = { value: effectController.size };
          shader.uniforms.delta = { value: 0.0 };

          let token = '#define STANDARD';

          let insert = /* glsl */`
            attribute vec4 reference;
            attribute vec4 seeds;
            attribute vec3 birdColor;
            uniform sampler2D texturePosition;
            uniform sampler2D textureVelocity;
            uniform sampler2D textureAnimation;
            uniform float size;
            uniform float time;
          `;

          shader.vertexShader = shader.vertexShader.replace( token, token + insert );

          token = '#include <begin_vertex>';

          insert = /* glsl */`
            vec4 tmpPos = texture2D( texturePosition, reference.xy );

            vec3 pos = tmpPos.xyz;
            vec3 velocity = normalize(texture2D( textureVelocity, reference.xy ).xyz);
            vec3 aniPos = texture2D( textureAnimation, vec2( reference.z, mod( time + ( seeds.x ) * ( ( 0.0004 + seeds.y / 10000.0) + normalize( velocity ) / 20000.0 ), reference.w ) ) ).xyz;
            vec3 newPosition = position;

            newPosition = mat3( modelMatrix ) * ( newPosition + aniPos );
            newPosition *= size + seeds.y * size * 0.2;

            velocity.z *= -1.;
            float xz = length( velocity.xz );
            float xyz = 1.;
            float x = sqrt( 1. - velocity.y * velocity.y );

            float cosry = velocity.x / xz;
            float sinry = velocity.z / xz;

            float cosrz = x / xyz;
            float sinrz = velocity.y / xyz;

            mat3 maty =  mat3( cosry, 0, -sinry, 0    , 1, 0     , sinry, 0, cosry );
            mat3 matz =  mat3( cosrz , sinrz, 0, -sinrz, cosrz, 0, 0     , 0    , 1 );

            newPosition =  maty * matz * newPosition;
            newPosition += pos;

            vec3 transformed = vec3( newPosition );
          `;

          shader.vertexShader = shader.vertexShader.replace( token, insert );

          materialShader = shader;

        };

        birdMesh = new THREE.Mesh( geometry, m );
        birdMesh.rotation.y = Math.PI / 2;

        birdMesh.castShadow = true;
        birdMesh.receiveShadow = true;

        scene.add( birdMesh );

      }

      function fillPositionTexture( texture ) {

        const theArray = texture.image.data;

        for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

          const x = Math.random() * BOUNDS - BOUNDS_HALF;
          const y = Math.random() * BOUNDS - BOUNDS_HALF;
          const z = Math.random() * BOUNDS - BOUNDS_HALF;

          theArray[ k + 0 ] = x;
          theArray[ k + 1 ] = y;
          theArray[ k + 2 ] = z;
          theArray[ k + 3 ] = 1;

        }

      }

      function fillVelocityTexture( texture ) {

        const theArray = texture.image.data;

        for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

          const x = Math.random() - 0.5;
          const y = Math.random() - 0.5;
          const z = Math.random() - 0.5;

          theArray[ k + 0 ] = x * 10;
          theArray[ k + 1 ] = y * 10;
          theArray[ k + 2 ] = z * 10;
          theArray[ k + 3 ] = 1;

        }

      }

      function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function onPointerMove( event ) {

        if ( event.isPrimary === false ) return;

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();

      }

      function render() {

        const now = performance.now();
        let delta = ( now - last ) / 1000;

        if ( delta > 1 ) delta = 1; // safety cap on large deltas
        last = now;

        positionUniforms[ 'time' ].value = now;
        positionUniforms[ 'delta' ].value = delta;
        velocityUniforms[ 'time' ].value = now;
        velocityUniforms[ 'delta' ].value = delta;
        if ( materialShader ) materialShader.uniforms[ 'time' ].value = now / 1000;
        if ( materialShader ) materialShader.uniforms[ 'delta' ].value = delta;

        velocityUniforms[ 'predator' ].value.set( 0.5 * mouseX / windowHalfX, - 0.5 * mouseY / windowHalfY, 0 );

        mouseX = 10000;
        mouseY = 10000;

        gpuCompute.compute();

        if ( materialShader ) materialShader.uniforms[ 'texturePosition' ].value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
        if ( materialShader ) materialShader.uniforms[ 'textureVelocity' ].value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;

        renderer.render( scene, camera );

      }

}



////////////////////////////

// Buffer Line

//////////////////////////////////

function initLoadScene4 ( scene, renderer ) {

      let camera;

      let line;

      const segments = 10000;
      const r = 800;
      let t = 0;

      init();
      animate();

      function init() {

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 4000 );
        camera.position.z = 2750;

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial( { vertexColors: true } );

        const positions = [];
        const colors = [];

        for ( let i = 0; i < segments; i ++ ) {

          const x = Math.random() * r - r / 2;
          const y = Math.random() * r - r / 2;
          const z = Math.random() * r - r / 2;

          // positions

          positions.push( x, y, z );

          // colors

          colors.push( ( x / r ) + 0.5 );
          colors.push( ( y / r ) + 0.5 );
          colors.push( ( z / r ) + 0.5 );

        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        generateMorphTargets( geometry );

        geometry.computeBoundingSphere();

        line = new THREE.Line( geometry, material );
        scene.add( line );

  
        //

        window.addEventListener( 'resize', onWindowResize );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();
      }

      function render() {

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        line.rotation.x = time * 0.25;
        line.rotation.y = time * 0.5;

        t += delta * 0.5;
        line.morphTargetInfluences[ 0 ] = Math.abs( Math.sin( t ) );

        renderer.render( scene, camera );

      }

      function generateMorphTargets( geometry ) {

        const data = [];

        for ( let i = 0; i < segments; i ++ ) {

          const x = Math.random() * r - r / 2;
          const y = Math.random() * r - r / 2;
          const z = Math.random() * r - r / 2;

          data.push( x, y, z );

        }

        const morphTarget = new THREE.Float32BufferAttribute( data, 3 );
        morphTarget.name = 'target1';

        geometry.morphAttributes.position = [ morphTarget ];

      }

}



////////////////////////////

// Buffer Shader

//////////////////////////////////

function initLoadScene5 (scene, renderer) {
    
      let camera;

      init();
      animate();

      function init() {


        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10 );
        camera.position.z = 2;

        //scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x101010 );

        // geometry
        // nr of triangles with 3 vertices per triangle
        const vertexCount = 200 * 3;

        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const colors = [];

        for ( let i = 0; i < vertexCount; i ++ ) {

          // adding x,y,z
          positions.push( Math.random() - 0.5 );
          positions.push( Math.random() - 0.5 );
          positions.push( Math.random() - 0.5 );

          // adding r,g,b,a
          colors.push( Math.random() * 255 );
          colors.push( Math.random() * 255 );
          colors.push( Math.random() * 255 );
          colors.push( Math.random() * 255 );

        }

        const positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
        const colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );

        colorAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader

        geometry.setAttribute( 'position', positionAttribute );
        geometry.setAttribute( 'color', colorAttribute );

        // material

        const material = new THREE.RawShaderMaterial( {

          uniforms: {
            time: { value: 1.0 }
          },
          vertexShader: document.getElementById( 'vertexShader' ).textContent,
          fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
          side: THREE.DoubleSide,
          transparent: true

        } );

        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        window.addEventListener( 'resize', onWindowResize );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();

      }

      function render() {

        const time = performance.now();

        const object = scene.children[ 0 ];

        object.rotation.y = time * 0.0005;
        object.material.uniforms.time.value = time * 0.005;

        renderer.render( scene, camera );

      }

}



////////////////////////////

// Buffer Selective

//////////////////////////////////


function initLoadScene6 (scene, renderer) {

      let camera;
      let geometry, mesh;
      const numLat = 100;
      const numLng = 200;
      let numLinesCulled = 0;

      init();
      animate();

      function init() {

        //scene = new THREE.Scene();
        infor.style.display = "block";

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.position.z = 3.5;

        window.addEventListener( 'resize', onWindowResize );

        addLines( 1.0 );

        const hideLinesButton = document.getElementById( 'hideLines' );
        hideLinesButton.addEventListener( 'click', hideLines );

        const showAllLinesButton = document.getElementById( 'showAllLines' );
        showAllLinesButton.addEventListener( 'click', showAllLines );

      }

      function addLines( radius ) {

        geometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array( numLat * numLng * 3 * 2 );
        const lineColors = new Float32Array( numLat * numLng * 3 * 2 );
        const visible = new Float32Array( numLat * numLng * 2 );

        for ( let i = 0; i < numLat; ++ i ) {

          for ( let j = 0; j < numLng; ++ j ) {

            const lat = ( Math.random() * Math.PI ) / 50.0 + i / numLat * Math.PI;
            const lng = ( Math.random() * Math.PI ) / 50.0 + j / numLng * 2 * Math.PI;

            const index = i * numLng + j;

            linePositions[ index * 6 + 0 ] = 0;
            linePositions[ index * 6 + 1 ] = 0;
            linePositions[ index * 6 + 2 ] = 0;
            linePositions[ index * 6 + 3 ] = radius * Math.sin( lat ) * Math.cos( lng );
            linePositions[ index * 6 + 4 ] = radius * Math.cos( lat );
            linePositions[ index * 6 + 5 ] = radius * Math.sin( lat ) * Math.sin( lng );

            const color = new THREE.Color( 0xffffff );

            color.setHSL( lat / Math.PI, 1.0, 0.2 );
            lineColors[ index * 6 + 0 ] = color.r;
            lineColors[ index * 6 + 1 ] = color.g;
            lineColors[ index * 6 + 2 ] = color.b;

            color.setHSL( lat / Math.PI, 1.0, 0.7 );
            lineColors[ index * 6 + 3 ] = color.r;
            lineColors[ index * 6 + 4 ] = color.g;
            lineColors[ index * 6 + 5 ] = color.b;

            // non-0 is visible
            visible[ index * 2 + 0 ] = 1.0;
            visible[ index * 2 + 1 ] = 1.0;

          }

        }

        geometry.setAttribute( 'position', new THREE.BufferAttribute( linePositions, 3 ) );
        geometry.setAttribute( 'vertColor', new THREE.BufferAttribute( lineColors, 3 ) );
        geometry.setAttribute( 'visible', new THREE.BufferAttribute( visible, 1 ) );

        geometry.computeBoundingSphere();

        const shaderMaterial = new THREE.ShaderMaterial( {

          vertexShader: document.getElementById( 'vertexshader1' ).textContent,
          fragmentShader: document.getElementById( 'fragmentshader1' ).textContent
        } );

        mesh = new THREE.LineSegments( geometry, shaderMaterial );
        scene.add( mesh );

        updateCount();

      }

      function updateCount() {

        const str = '1 draw call, ' + numLat * numLng + ' lines, ' + numLinesCulled + ' culled (<a target="_blank" href="http://callum.com">author</a>)';

      }

      function hideLines() {

        for ( let i = 0; i < geometry.attributes.visible.array.length; i += 2 ) {

          if ( Math.random() > 0.75 ) {

            if ( geometry.attributes.visible.array[ i + 0 ] ) {

              ++ numLinesCulled;

            }

            geometry.attributes.visible.array[ i + 0 ] = 0;
            geometry.attributes.visible.array[ i + 1 ] = 0;

          }

        }

        geometry.attributes.visible.needsUpdate = true;

        updateCount();

      }

      function showAllLines() {

        numLinesCulled = 0;

        for ( let i = 0; i < geometry.attributes.visible.array.length; i += 2 ) {

          geometry.attributes.visible.array[ i + 0 ] = 1;
          geometry.attributes.visible.array[ i + 1 ] = 1;

        }

        geometry.attributes.visible.needsUpdate = true;

        updateCount();

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function animate() {

        requestAnimationFrame( animate );

        const time = Date.now() * 0.001;

        mesh.rotation.x = time * 0.25;
        mesh.rotation.y = time * 0.5;

        renderer.render( scene, camera );

      }

}




////////////////////////////

// Buffer Instance

//////////////////////////////////


function initLoadScene7 (scene, renderer) {

    let camera;
    let geometry, material, mesh;

    function init() {

    
      camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
      camera.position.z = 1400;

      //scene = new THREE.Scene();

      const circleGeometry = new THREE.CircleGeometry( 1, 6 );

      geometry = new THREE.InstancedBufferGeometry();
      geometry.index = circleGeometry.index;
      geometry.attributes = circleGeometry.attributes;

      const particleCount = 75000;

      const translateArray = new Float32Array( particleCount * 3 );

      for ( let i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3 ) {

        translateArray[ i3 + 0 ] = Math.random() * 2 - 1;
        translateArray[ i3 + 1 ] = Math.random() * 2 - 1;
        translateArray[ i3 + 2 ] = Math.random() * 2 - 1;

      }

      geometry.setAttribute( 'translate', new THREE.InstancedBufferAttribute( translateArray, 3 ) );

      material = new THREE.RawShaderMaterial( {
        uniforms: {
          'map': { value: new THREE.TextureLoader().load( '../static/src/lib/THREEJS/examples/textures/sprites/circle.png' ) },
          'time': { value: 0.0 }
        },
        vertexShader: document.getElementById( 'vshader' ).textContent,
        fragmentShader: document.getElementById( 'fshader' ).textContent,
        depthTest: true,
        depthWrite: true
      } );

      mesh = new THREE.Mesh( geometry, material );
      mesh.scale.set( 500, 500, 500 );
      scene.add( mesh );


      window.addEventListener( 'resize', onWindowResize );

      return true;

    }

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

      requestAnimationFrame( animate );

      render();

    }

    function render() {

      const time = performance.now() * 0.0005;

      material.uniforms[ 'time' ].value = time;

      mesh.rotation.x = time * 0.2;
      mesh.rotation.y = time * 0.4;

      renderer.render( scene, camera );

    }

    if ( init() ) {

      animate();

    }
}




////////////////////////////

// Buffer Instance

//////////////////////////////////


function initLoadScene8(scene, renderer) {

      let camera;

      init();
      animate();

      function init() {

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 200;

        //scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xffffff );
      }

      function createImage() {

        const canvas = document.createElement( 'canvas' );
        canvas.width = 256;
        canvas.height = 256;

        const context = canvas.getContext( '2d' );
        context.fillStyle = 'rgb(' + Math.floor( Math.random() * 256 ) + ',' + Math.floor( Math.random() * 256 ) + ',' + Math.floor( Math.random() * 256 ) + ')';
        context.fillRect( 0, 0, 256, 256 );

        return canvas;

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();

      }

      function render() {

        const geometry = new THREE.SphereGeometry( 50, Math.random() * 64, Math.random() * 32 );

        const texture = new THREE.CanvasTexture( createImage() );

        const material = new THREE.MeshBasicMaterial( { map: texture, wireframe: true } );

        const mesh = new THREE.Mesh( geometry, material );

        scene.add( mesh );

        renderer.render( scene, camera );

        scene.remove( mesh );

        // clean up

        geometry.dispose();
        material.dispose();
        texture.dispose();

      }
}




////////////////////////////

// Buffer Instance

//////////////////////////////////


function initLoadScene9(scene, renderer) {
  
      let camera;

      let points;

      const particles = 300000;
      let drawCount = 10000;

      init();
      animate();

      function init() {
        //

        camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
        camera.position.z = 2750;

        //scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x050505 );
        scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

        //

        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const positions2 = [];
        const colors = [];

        const color = new THREE.Color();

        const n = 1000, n2 = n / 2; // particles spread in the cube

        for ( let i = 0; i < particles; i ++ ) {

          // positions

          const x = Math.random() * n - n2;
          const y = Math.random() * n - n2;
          const z = Math.random() * n - n2;

          positions.push( x, y, z );
          positions2.push( z * 0.3, x * 0.3, y * 0.3 );

          // colors

          const vx = ( x / n ) + 0.5;
          const vy = ( y / n ) + 0.5;
          const vz = ( z / n ) + 0.5;

          color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );

          colors.push( color.r, color.g, color.b );

        }

        const gl = renderer.getContext();

        const pos = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, pos );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );

        const pos2 = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, pos2 );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions2 ), gl.STATIC_DRAW );

        const rgb = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, rgb );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

        const posAttr1 = new THREE.GLBufferAttribute( pos, gl.FLOAT, 3, 4, particles );
        const posAttr2 = new THREE.GLBufferAttribute( pos2, gl.FLOAT, 3, 4, particles );
        geometry.setAttribute( 'position', posAttr1 );

        setInterval( function () {

          const attr = geometry.getAttribute( 'position' );

          geometry.setAttribute( 'position', ( attr === posAttr1 ) ? posAttr2 : posAttr1 );

        }, 2000 );

        geometry.setAttribute( 'color', new THREE.GLBufferAttribute( rgb, gl.FLOAT, 3, 4, particles ) );

        //

        const material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );

        points = new THREE.Points( geometry, material );

        // Choose one:
        // geometry.boundingSphere = ( new THREE.Sphere() ).set( new THREE.Vector3(), Infinity );
        points.frustumCulled = false;

        scene.add( points );
        //

        window.addEventListener( 'resize', onWindowResize );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();
      }

      function render() {

        drawCount = ( Math.max( 5000, drawCount ) + Math.floor( 500 * Math.random() ) ) % particles;
        points.geometry.setDrawRange( 0, drawCount );

        const time = Date.now() * 0.001;

        points.rotation.x = time * 0.1;
        points.rotation.y = time * 0.2;

        renderer.render( scene, camera );

      }

}



////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene10(scene, renderer) {
            inforLight.style.display = "block";

            let SCREEN_WIDTH = window.innerWidth;
            let SCREEN_HEIGHT = window.innerHeight;

            const camera = new THREE.PerspectiveCamera( 55, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 3000 );
            const clock = new THREE.Clock();

            const sunLight = new THREE.DirectionalLight( 'rgb(255,255,255)', 3 );
            let useDirectionalLight = true;
            let arrowHelper1, arrowHelper2, arrowHelper3;
            const arrowDirection = new THREE.Vector3();
            const arrowPosition1 = new THREE.Vector3();
            const arrowPosition2 = new THREE.Vector3();
            const arrowPosition3 = new THREE.Vector3();
            let groundMesh;
            let lightSphere, lightHolder;
            let pyramid, pyramidShadow;
            let sphere, sphereShadow;
            let cube, cubeShadow;
            let cylinder, cylinderShadow;
            let torus, torusShadow;
            const normalVector = new THREE.Vector3( 0, 1, 0 );
            const planeConstant = 0.01; // this value must be slightly higher than the groundMesh's y position of 0.0
            const groundPlane = new THREE.Plane( normalVector, planeConstant );
            const lightPosition4D = new THREE.Vector4();
            let verticalAngle = 0;
            let horizontalAngle = 0;
            let frameTime = 0;
            const TWO_PI = Math.PI * 2;

            init();
            animate();

            function init() {

                scene.background = new THREE.Color( 0x0096ff );

                camera.position.set( 0, 2.5, 10 );
                scene.add( camera );
                onWindowResize();

                sunLight.position.set( 5, 7, - 1 );
                sunLight.lookAt( scene.position );
                scene.add( sunLight );

                lightPosition4D.x = sunLight.position.x;
                lightPosition4D.y = sunLight.position.y;
                lightPosition4D.z = sunLight.position.z;
                // amount of light-ray divergence. Ranging from:
                // 0.001 = sunlight(min divergence) to 1.0 = pointlight(max divergence)
                lightPosition4D.w = 0.001; // must be slightly greater than 0, due to 0 causing matrixInverse errors

                // YELLOW ARROW HELPERS
                arrowDirection.subVectors( scene.position, sunLight.position ).normalize();

                arrowPosition1.copy( sunLight.position );
                arrowHelper1 = new THREE.ArrowHelper( arrowDirection, arrowPosition1, 0.9, 0xffff00, 0.25, 0.08 );
                scene.add( arrowHelper1 );

                arrowPosition2.copy( sunLight.position ).add( new THREE.Vector3( 0, 0.2, 0 ) );
                arrowHelper2 = new THREE.ArrowHelper( arrowDirection, arrowPosition2, 0.9, 0xffff00, 0.25, 0.08 );
                scene.add( arrowHelper2 );

                arrowPosition3.copy( sunLight.position ).add( new THREE.Vector3( 0, - 0.2, 0 ) );
                arrowHelper3 = new THREE.ArrowHelper( arrowDirection, arrowPosition3, 0.9, 0xffff00, 0.25, 0.08 );
                scene.add( arrowHelper3 );

                // LIGHTBULB
                const lightSphereGeometry = new THREE.SphereGeometry( 0.09 );
                const lightSphereMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)' } );
                lightSphere = new THREE.Mesh( lightSphereGeometry, lightSphereMaterial );
                scene.add( lightSphere );
                lightSphere.visible = false;

                const lightHolderGeometry = new THREE.CylinderGeometry( 0.05, 0.05, 0.13 );
                const lightHolderMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(75,75,75)' } );
                lightHolder = new THREE.Mesh( lightHolderGeometry, lightHolderMaterial );
                scene.add( lightHolder );
                lightHolder.visible = false;

                // GROUND
                const groundGeometry = new THREE.BoxGeometry( 30, 0.01, 40 );
                const groundMaterial = new THREE.MeshLambertMaterial( { color: 'rgb(0,130,0)' } );
                groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
                groundMesh.position.y = 0.0; //this value must be slightly lower than the planeConstant (0.01) parameter above
                scene.add( groundMesh );

                // RED CUBE and CUBE's SHADOW
                const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
                const cubeMaterial = new THREE.MeshLambertMaterial( { color: 'rgb(255,0,0)', emissive: 0x200000 } );
                cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
                cube.position.z = - 1;
                scene.add( cube );

                cubeShadow = new ShadowMesh( cube );
                scene.add( cubeShadow );

                // BLUE CYLINDER and CYLINDER's SHADOW
                const cylinderGeometry = new THREE.CylinderGeometry( 0.3, 0.3, 2 );
                const cylinderMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(0,0,255)', emissive: 0x000020 } );
                cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
                cylinder.position.z = - 2.5;
                scene.add( cylinder );

                cylinderShadow = new ShadowMesh( cylinder );
                scene.add( cylinderShadow );

                // MAGENTA TORUS and TORUS' SHADOW
                const torusGeometry = new THREE.TorusGeometry( 1, 0.2, 10, 16, TWO_PI );
                const torusMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(255,0,255)', emissive: 0x200020 } );
                torus = new THREE.Mesh( torusGeometry, torusMaterial );
                torus.position.z = - 6;
                scene.add( torus );

                torusShadow = new ShadowMesh( torus );
                scene.add( torusShadow );

                // WHITE SPHERE and SPHERE'S SHADOW
                const sphereGeometry = new THREE.SphereGeometry( 0.5, 20, 10 );
                const sphereMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(255,255,255)', emissive: 0x222222 } );
                sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
                sphere.position.set( 4, 0.5, 2 );
                scene.add( sphere );

                sphereShadow = new ShadowMesh( sphere );
                scene.add( sphereShadow );

                // YELLOW PYRAMID and PYRAMID'S SHADOW
                const pyramidGeometry = new THREE.CylinderGeometry( 0, 0.5, 2, 4 );
                const pyramidMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(255,255,0)', emissive: 0x440000, flatShading: true, shininess: 0 } );
                pyramid = new THREE.Mesh( pyramidGeometry, pyramidMaterial );
                pyramid.position.set( - 4, 1, 2 );
                scene.add( pyramid );

                pyramidShadow = new ShadowMesh( pyramid );
                scene.add( pyramidShadow );

                document.getElementById( 'lightButton' ).addEventListener( 'click', lightButtonHandler );

            }

            function animate() {

                requestAnimationFrame( animate );

                frameTime = clock.getDelta();

                cube.rotation.x += 1.0 * frameTime;
                cube.rotation.y += 1.0 * frameTime;

                cylinder.rotation.y += 1.0 * frameTime;
                cylinder.rotation.z -= 1.0 * frameTime;

                torus.rotation.x -= 1.0 * frameTime;
                torus.rotation.y -= 1.0 * frameTime;

                pyramid.rotation.y += 0.5 * frameTime;

                horizontalAngle += 0.5 * frameTime;
                if ( horizontalAngle > TWO_PI )
                    horizontalAngle -= TWO_PI;
                cube.position.x = Math.sin( horizontalAngle ) * 4;
                cylinder.position.x = Math.sin( horizontalAngle ) * - 4;
                torus.position.x = Math.cos( horizontalAngle ) * 4;

                verticalAngle += 1.5 * frameTime;
                if ( verticalAngle > TWO_PI )
                    verticalAngle -= TWO_PI;
                cube.position.y = Math.sin( verticalAngle ) * 2 + 2.9;
                cylinder.position.y = Math.sin( verticalAngle ) * 2 + 3.1;
                torus.position.y = Math.cos( verticalAngle ) * 2 + 3.3;

                // update the ShadowMeshes to follow their shadow-casting objects
                cubeShadow.update( groundPlane, lightPosition4D );
                cylinderShadow.update( groundPlane, lightPosition4D );
                torusShadow.update( groundPlane, lightPosition4D );
                sphereShadow.update( groundPlane, lightPosition4D );
                pyramidShadow.update( groundPlane, lightPosition4D );


                renderer.render( scene, camera );

            }

            function onWindowResize() {

                SCREEN_WIDTH = window.innerWidth;
                SCREEN_HEIGHT = window.innerHeight;

                renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

                camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
                camera.updateProjectionMatrix();

            }

            function lightButtonHandler() {

                useDirectionalLight = ! useDirectionalLight;

                if ( useDirectionalLight ) {

                    scene.background.setHex( 0x0096ff );

                    groundMesh.material.color.setHex( 0x008200 );
                    sunLight.position.set( 5, 7, - 1 );
                    sunLight.lookAt( scene.position );

                    lightPosition4D.x = sunLight.position.x;
                    lightPosition4D.y = sunLight.position.y;
                    lightPosition4D.z = sunLight.position.z;
                    lightPosition4D.w = 0.001; // more of a directional Light value

                    arrowHelper1.visible = true;
                    arrowHelper2.visible = true;
                    arrowHelper3.visible = true;

                    lightSphere.visible = false;
                    lightHolder.visible = false;

                    document.getElementById( 'lightButton' ).value = 'Switch to PointLight';

                } else {

                    scene.background.setHex( 0x000000 );

                    groundMesh.material.color.setHex( 0x969696 );

                    sunLight.position.set( 0, 6, - 2 );
                    sunLight.lookAt( scene.position );
                    lightSphere.position.copy( sunLight.position );
                    lightHolder.position.copy( lightSphere.position );
                    lightHolder.position.y += 0.12;

                    lightPosition4D.x = sunLight.position.x;
                    lightPosition4D.y = sunLight.position.y;
                    lightPosition4D.z = sunLight.position.z;
                    lightPosition4D.w = 0.9; // more of a point Light value

                    arrowHelper1.visible = false;
                    arrowHelper2.visible = false;
                    arrowHelper3.visible = false;

                    lightSphere.visible = true;
                    lightHolder.visible = true;

                    document.getElementById( 'lightButton' ).value = 'Switch to THREE.DirectionalLight';

                }

            }

}


////////////////////////////

// Buffer Instance

//////////////////////////////////
 
 function initLoadScene11(scene, renderer) {

            let camera;
            let dirLight, spotLight;
            let torusKnot, dirGroup;

            init();
            animate();

            function init() {

                initScene();
                initMisc();

                // Init gui
                const gui = new GUI();

                const config = {
                    spotlightRadius: 4,
                    spotlightSamples: 8,
                    dirlightRadius: 4,
                    dirlightSamples: 8
                };

                const spotlightFolder = gui.addFolder( 'Spotlight' );
                spotlightFolder.add( config, 'spotlightRadius' ).name( 'radius' ).min( 0 ).max( 25 ).onChange( function ( value ) {

                    spotLight.shadow.radius = value;

                } );

                spotlightFolder.add( config, 'spotlightSamples', 1, 25, 1 ).name( 'samples' ).onChange( function ( value ) {

                    spotLight.shadow.blurSamples = value;

                } );
                spotlightFolder.open();

                const dirlightFolder = gui.addFolder( 'Directional Light' );
                dirlightFolder.add( config, 'dirlightRadius' ).name( 'radius' ).min( 0 ).max( 25 ).onChange( function ( value ) {

                    dirLight.shadow.radius = value;

                } );

                dirlightFolder.add( config, 'dirlightSamples', 1, 25, 1 ).name( 'samples' ).onChange( function ( value ) {

                    dirLight.shadow.blurSamples = value;

                } );
                dirlightFolder.open();

                document.body.appendChild( renderer.domElement );
                window.addEventListener( 'resize', onWindowResize );

            }

            function initScene() {

                camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
                camera.position.set( 0, 10, 30 );

                //scene = new THREE.Scene();
                scene.background = new THREE.Color( 0x222244 );
                scene.fog = new THREE.Fog( 0x222244, 50, 100 );

                // Lights

                scene.add( new THREE.AmbientLight( 0x444444 ) );

                spotLight = new THREE.SpotLight( 0xff8888, 400 );
                spotLight.angle = Math.PI / 5;
                spotLight.penumbra = 0.3;
                spotLight.position.set( 8, 10, 5 );
                spotLight.castShadow = true;
                spotLight.shadow.camera.near = 8;
                spotLight.shadow.camera.far = 200;
                spotLight.shadow.mapSize.width = 256;
                spotLight.shadow.mapSize.height = 256;
                spotLight.shadow.bias = - 0.002;
                spotLight.shadow.radius = 4;
                scene.add( spotLight );


                dirLight = new THREE.DirectionalLight( 0x8888ff, 3 );
                dirLight.position.set( 3, 12, 17 );
                dirLight.castShadow = true;
                dirLight.shadow.camera.near = 0.1;
                dirLight.shadow.camera.far = 500;
                dirLight.shadow.camera.right = 17;
                dirLight.shadow.camera.left = - 17;
                dirLight.shadow.camera.top  = 17;
                dirLight.shadow.camera.bottom = - 17;
                dirLight.shadow.mapSize.width = 512;
                dirLight.shadow.mapSize.height = 512;
                dirLight.shadow.radius = 4;
                dirLight.shadow.bias = - 0.0005;

                dirGroup = new THREE.Group();
                dirGroup.add( dirLight );
                scene.add( dirGroup );

                // Geometry

                const geometry = new THREE.TorusKnotGeometry( 25, 8, 75, 20 );
                const material = new THREE.MeshPhongMaterial( {
                    color: 0x999999,
                    shininess: 0,
                    specular: 0x222222
                } );

                torusKnot = new THREE.Mesh( geometry, material );
                torusKnot.scale.multiplyScalar( 1 / 18 );
                torusKnot.position.y = 3;
                torusKnot.castShadow = true;
                torusKnot.receiveShadow = true;
                scene.add( torusKnot );

                const cylinderGeometry = new THREE.CylinderGeometry( 0.75, 0.75, 7, 32 );

                const pillar1 = new THREE.Mesh( cylinderGeometry, material );
                pillar1.position.set( 8, 3.5, 8 );
                pillar1.castShadow = true;
                pillar1.receiveShadow = true;

                const pillar2 = pillar1.clone();
                pillar2.position.set( 8, 3.5, - 8 );
                const pillar3 = pillar1.clone();
                pillar3.position.set( - 8, 3.5, 8 );
                const pillar4 = pillar1.clone();
                pillar4.position.set( - 8, 3.5, - 8 );

                scene.add( pillar1 );
                scene.add( pillar2 );
                scene.add( pillar3 );
                scene.add( pillar4 );

                const planeGeometry = new THREE.PlaneGeometry( 200, 200 );
                const planeMaterial = new THREE.MeshPhongMaterial( {
                    color: 0x999999,
                    shininess: 0,
                    specular: 0x111111
                } );

                const ground = new THREE.Mesh( planeGeometry, planeMaterial );
                ground.rotation.x = - Math.PI / 2;
                ground.scale.multiplyScalar( 3 );
                ground.castShadow = true;
                ground.receiveShadow = true;
                scene.add( ground );

            }

            function initMisc() {

                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.VSMShadowMap;

                // Mouse control
                //const controls = new OrbitControls( camera, renderer.domElement );
                //controls.target.set( 0, 2, 0 );
                //controls.update();


            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            function animate( time ) {

                requestAnimationFrame( animate );

                const delta = clock.getDelta();

                torusKnot.rotation.x += 0.25 * delta;
                torusKnot.rotation.y += 0.5 * delta;
                torusKnot.rotation.z += 1 * delta;

                dirGroup.rotation.y += 0.7 * delta;
                dirLight.position.z = 17 + Math.sin( time * 0.001 ) * 5;

                renderer.render( scene, camera );


            }

 }



////////////////////////////

// Buffer Instance

//////////////////////////////////


 function initLoadScene12 (scene, renderer) {

            let camera;
            let dirLight, spotLight;
            let torusKnot, cube;
            let dirLightShadowMapViewer, spotLightShadowMapViewer;

            init();
            animate();


            function init() {

                initScene();
                initShadowMapViewers();
                initMisc();

                window.addEventListener( 'resize', onWindowResize );

            }

            function initScene() {

                camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
                camera.position.set( 0, 15, 35 );

                //scene = new THREE.Scene();

                // Lights

                scene.add( new THREE.AmbientLight( 0x404040, 3 ) );

                spotLight = new THREE.SpotLight( 0xffffff, 500 );
                spotLight.name = 'Spot Light';
                spotLight.angle = Math.PI / 5;
                spotLight.penumbra = 0.3;
                spotLight.position.set( 10, 10, 5 );
                spotLight.castShadow = true;
                spotLight.shadow.camera.near = 8;
                spotLight.shadow.camera.far = 30;
                spotLight.shadow.mapSize.width = 1024;
                spotLight.shadow.mapSize.height = 1024;
                scene.add( spotLight );

                scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );

                dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
                dirLight.name = 'Dir. Light';
                dirLight.position.set( 0, 10, 0 );
                dirLight.castShadow = true;
                dirLight.shadow.camera.near = 1;
                dirLight.shadow.camera.far = 10;
                dirLight.shadow.camera.right = 15;
                dirLight.shadow.camera.left = - 15;
                dirLight.shadow.camera.top  = 15;
                dirLight.shadow.camera.bottom = - 15;
                dirLight.shadow.mapSize.width = 1024;
                dirLight.shadow.mapSize.height = 1024;
                scene.add( dirLight );

                scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

                // Geometry
                let geometry = new THREE.TorusKnotGeometry( 25, 8, 75, 20 );
                let material = new THREE.MeshPhongMaterial( {
                    color: 0xff0000,
                    shininess: 150,
                    specular: 0x222222
                } );

                torusKnot = new THREE.Mesh( geometry, material );
                torusKnot.scale.multiplyScalar( 1 / 18 );
                torusKnot.position.y = 3;
                torusKnot.castShadow = true;
                torusKnot.receiveShadow = true;
                scene.add( torusKnot );

                geometry = new THREE.BoxGeometry( 3, 3, 3 );
                cube = new THREE.Mesh( geometry, material );
                cube.position.set( 8, 3, 8 );
                cube.castShadow = true;
                cube.receiveShadow = true;
                scene.add( cube );

                geometry = new THREE.BoxGeometry( 10, 0.15, 10 );
                material = new THREE.MeshPhongMaterial( {
                    color: 0xa0adaf,
                    shininess: 150,
                    specular: 0x111111
                } );

                const ground = new THREE.Mesh( geometry, material );
                ground.scale.multiplyScalar( 3 );
                ground.castShadow = false;
                ground.receiveShadow = true;
                scene.add( ground );

            }

            function initShadowMapViewers() {

                dirLightShadowMapViewer = new ShadowMapViewer( dirLight );
                spotLightShadowMapViewer = new ShadowMapViewer( spotLight );
                resizeShadowMapViewers();

            }

            function initMisc() {


                // Mouse control
                const controls = new OrbitControls( camera, renderer.domElement );
                controls.target.set( 0, 2, 0 );
                controls.update();

                clock = new THREE.Clock();

            }

            function resizeShadowMapViewers() {

                const size = window.innerWidth * 0.15;

                dirLightShadowMapViewer.position.x = 10;
                dirLightShadowMapViewer.position.y = 10;
                dirLightShadowMapViewer.size.width = size;
                dirLightShadowMapViewer.size.height = size;
                dirLightShadowMapViewer.update(); //Required when setting position or size directly

                spotLightShadowMapViewer.size.set( size, size );
                spotLightShadowMapViewer.position.set( size + 20, 10 );
                // spotLightShadowMapViewer.update();   //NOT required because .set updates automatically

            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

                resizeShadowMapViewers();
                dirLightShadowMapViewer.updateForWindowResize();
                spotLightShadowMapViewer.updateForWindowResize();

            }

            function animate() {

                requestAnimationFrame( animate );
                render();

                stats.update();

            }

            function renderScene() {

                renderer.render( scene, camera );

            }

            function renderShadowMapViewers() {

                dirLightShadowMapViewer.render( renderer );
                spotLightShadowMapViewer.render( renderer );

            }

            function render() {

                const delta = clock.getDelta();

                renderScene();
                renderShadowMapViewers();

                torusKnot.rotation.x += 0.25 * delta;
                torusKnot.rotation.y += 2 * delta;
                torusKnot.rotation.z += 1 * delta;

                cube.rotation.x += 0.25 * delta;
                cube.rotation.y += 2 * delta;
                cube.rotation.z += 1 * delta;

            }

 }




 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene13(scene, renderer) {

            const SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;

            let SCREEN_WIDTH = window.innerWidth;
            let SCREEN_HEIGHT = window.innerHeight;
            const FLOOR = - 250;

            const ANIMATION_GROUPS = 25;

            let camera, new_controls_1;

            const NEAR = 5, FAR = 3000;

            let morph, mixer;

            const morphs = [], animGroups = [];

            const clock = new THREE.Clock();

            init();
            animate();


            function init() {

                camera = new THREE.PerspectiveCamera( 23, SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR );
                camera.position.set( 700, 50, 1900 );

                // SCENE

                //scene = new THREE.Scene();
                scene.background = new THREE.Color( 0x59472b );
                scene.fog = new THREE.Fog( 0x59472b, 1000, FAR );

                // LIGHTS

                const ambient = new THREE.AmbientLight( 0xffffff );
                scene.add( ambient );

                const light = new THREE.DirectionalLight( 0xffffff, 3 );
                light.position.set( 0, 1500, 1000 );
                light.castShadow = true;
                light.shadow.camera.top = 2000;
                light.shadow.camera.bottom = - 2000;
                light.shadow.camera.left = - 2000;
                light.shadow.camera.right = 2000;
                light.shadow.camera.near = 1200;
                light.shadow.camera.far = 2500;
                light.shadow.bias = 0.0001;

                light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
                light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

                scene.add( light );

                createScene();


                renderer.autoClear = false;

                //

                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;

                // CONTROLS

                new_controls_1 = new FirstPersonControls( camera, renderer.domElement );

                new_controls_1.lookSpeed = 0.0125;
                new_controls_1.movementSpeed = 500;
                new_controls_1.lookVertical = true;

                new_controls_1.lookAt( scene.position );

      
                //

                window.addEventListener( 'resize', onWindowResize );

            }

            function onWindowResize() {

                SCREEN_WIDTH = window.innerWidth;
                SCREEN_HEIGHT = window.innerHeight;

                camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
                camera.updateProjectionMatrix();

                renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

                new_controls_1.handleResize();

            }

            function createScene( ) {

                // GROUND

                const geometry = new THREE.PlaneGeometry( 100, 100 );
                const planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffdd99 } );

                const ground = new THREE.Mesh( geometry, planeMaterial );

                ground.position.set( 0, FLOOR, 0 );
                ground.rotation.x = - Math.PI / 2;
                ground.scale.set( 100, 100, 100 );

                ground.castShadow = false;
                ground.receiveShadow = true;

                scene.add( ground );

                // TEXT

                const loader = new FontLoader();
                loader.load( '../static/src/lib/THREEJS/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {

                    const textGeo = new TextGeometry( 'THREE.JS', {

                        font: font,

                        size: 200,
                        height: 50,
                        curveSegments: 12,

                        bevelThickness: 2,
                        bevelSize: 5,
                        bevelEnabled: true

                    } );

                    textGeo.computeBoundingBox();
                    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

                    const textMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000, specular: 0xffffff } );

                    const mesh = new THREE.Mesh( textGeo, textMaterial );
                    mesh.position.x = centerOffset;
                    mesh.position.y = FLOOR + 67;

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    scene.add( mesh );

                } );

                // CUBES

                const cubes1 = new THREE.Mesh( new THREE.BoxGeometry( 1500, 220, 150 ), planeMaterial );

                cubes1.position.y = FLOOR - 50;
                cubes1.position.z = 20;

                cubes1.castShadow = true;
                cubes1.receiveShadow = true;

                scene.add( cubes1 );

                const cubes2 = new THREE.Mesh( new THREE.BoxGeometry( 1600, 170, 250 ), planeMaterial );

                cubes2.position.y = FLOOR - 50;
                cubes2.position.z = 20;

                cubes2.castShadow = true;
                cubes2.receiveShadow = true;

                scene.add( cubes2 );

                mixer = new THREE.AnimationMixer( scene );

                for ( let i = 0; i !== ANIMATION_GROUPS; ++ i ) {

                    const group = new THREE.AnimationObjectGroup();
                    animGroups.push( group );

                }

                // MORPHS

                function addMorph( mesh, clip, speed, duration, x, y, z, fudgeColor, massOptimization ) {

                    mesh = mesh.clone();
                    mesh.material = mesh.material.clone();

                    if ( fudgeColor ) {

                        mesh.material.color.offsetHSL( 0, Math.random() * 0.5 - 0.25, Math.random() * 0.5 - 0.25 );

                    }

                    mesh.speed = speed;

                    if ( massOptimization ) {

                        const index = Math.floor( Math.random() * ANIMATION_GROUPS ),
                            animGroup = animGroups[ index ];

                        animGroup.add( mesh );

                        if ( ! mixer.existingAction( clip, animGroup ) ) {

                            const randomness = 0.6 * Math.random() - 0.3;
                            const phase = ( index + randomness ) / ANIMATION_GROUPS;

                            mixer.clipAction( clip, animGroup ).
                                setDuration( duration ).
                                startAt( - duration * phase ).
                                play();

                        }

                    } else {

                        mixer.clipAction( clip, mesh ).
                            setDuration( duration ).
                            startAt( - duration * Math.random() ).
                            play();

                    }

                    mesh.position.set( x, y, z );
                    mesh.rotation.y = Math.PI / 2;

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    scene.add( mesh );

                    morphs.push( mesh );

                }

                const gltfLoader = new GLTFLoader();
                gltfLoader.load( '../static/src/lib/THREEJS/examples/models/gltf/Horse.glb', function ( gltf ) {

                    const mesh = gltf.scene.children[ 0 ];
                    const clip = gltf.animations[ 0 ];

                    for ( let i = - 600; i < 601; i += 2 ) {

                        addMorph( mesh, clip, 550, 1, 100 - Math.random() * 3000, FLOOR, i, true, true );

                    }

                } );

            }

            //

            function animate() {

                requestAnimationFrame( animate );

                render();

            }

            function render() {

                const delta = clock.getDelta();

                if ( mixer ) mixer.update( delta );

                for ( let i = 0; i < morphs.length; i ++ ) {

                    morph = morphs[ i ];

                    morph.position.x += morph.speed * delta;

                    if ( morph.position.x > 2000 ) {

                        morph.position.x = - 1000 - Math.random() * 500;

                    }

                }

                new_controls_1.update( delta );

                renderer.clear();
                renderer.render( scene, camera );

            }
}


 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function  initLoadScene14(scene, renderer) {

            let camera, mesh;

            let parent;

            const meshes = [], clonemeshes = [];

            let composer, effectFocus;

            const clock = new THREE.Clock();


            init();
            animate();

            function init() {

                camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 50000 );
                camera.position.set( 0, 700, 7000 );

                //scene = new THREE.Scene();
                scene.background = new THREE.Color( 0x000104 );
                scene.fog = new THREE.FogExp2( 0x000104, 0.0000675 );

                camera.lookAt( scene.position );

                const loader = new OBJLoader();

                loader.load( '../static/src/lib/THREEJS/examples/models/obj/male02/male02.obj', function ( object ) {

                    const positions = combineBuffer( object, 'position' );

                    createMesh( positions, scene, 4.05, - 500, - 350, 600, 0xff7744 );
                    createMesh( positions, scene, 4.05, 500, - 350, 0, 0xff5522 );
                    createMesh( positions, scene, 4.05, - 250, - 350, 1500, 0xff9922 );
                    createMesh( positions, scene, 4.05, - 250, - 350, - 1500, 0xff99ff );

                } );

                loader.load( '../static/src/lib/THREEJS/examples/models/obj/female02/female02.obj', function ( object ) {

                    const positions = combineBuffer( object, 'position' );

                    createMesh( positions, scene, 4.05, - 1000, - 350, 0, 0xffdd44 );
                    createMesh( positions, scene, 4.05, 0, - 350, 0, 0xffffff );
                    createMesh( positions, scene, 4.05, 1000, - 350, 400, 0xff4422 );
                    createMesh( positions, scene, 4.05, 250, - 350, 1500, 0xff9955 );
                    createMesh( positions, scene, 4.05, 250, - 350, 2500, 0xff77dd );

                } );

                parent = new THREE.Object3D();
                scene.add( parent );

                const grid = new THREE.Points( new THREE.PlaneGeometry( 15000, 15000, 64, 64 ), new THREE.PointsMaterial( { color: 0xff0000, size: 10 } ) );
                grid.position.y = - 400;
                grid.rotation.x = - Math.PI / 2;
                parent.add( grid );

                // postprocessing

                const renderModel = new RenderPass( scene, camera );
                const effectBloom = new BloomPass( 0.75 );
                const effectFilm = new FilmPass();

                effectFocus = new ShaderPass( FocusShader );

                effectFocus.uniforms[ 'screenWidth' ].value = window.innerWidth * window.devicePixelRatio;
                effectFocus.uniforms[ 'screenHeight' ].value = window.innerHeight * window.devicePixelRatio;

                const outputPass = new OutputPass();

                composer = new EffectComposer( renderer );

                composer.addPass( renderModel );
                composer.addPass( effectBloom );
                composer.addPass( effectFilm );
                composer.addPass( effectFocus );
                composer.addPass( outputPass );

             
                window.addEventListener( 'resize', onWindowResize );

            }


            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                camera.lookAt( scene.position );

                renderer.setSize( window.innerWidth, window.innerHeight );
                composer.setSize( window.innerWidth, window.innerHeight );

                effectFocus.uniforms[ 'screenWidth' ].value = window.innerWidth * window.devicePixelRatio;
                effectFocus.uniforms[ 'screenHeight' ].value = window.innerHeight * window.devicePixelRatio;

            }

            function combineBuffer( model, bufferName ) {

                let count = 0;

                model.traverse( function ( child ) {

                    if ( child.isMesh ) {

                        const buffer = child.geometry.attributes[ bufferName ];

                        count += buffer.array.length;

                    }

                } );

                const combined = new Float32Array( count );

                let offset = 0;

                model.traverse( function ( child ) {

                    if ( child.isMesh ) {

                        const buffer = child.geometry.attributes[ bufferName ];

                        combined.set( buffer.array, offset );
                        offset += buffer.array.length;

                    }

                } );

                return new THREE.BufferAttribute( combined, 3 );

            }

            function createMesh( positions, scene, scale, x, y, z, color ) {

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute( 'position', positions.clone() );
                geometry.setAttribute( 'initialPosition', positions.clone() );

                geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

                const clones = [

                    [ 6000, 0, - 4000 ],
                    [ 5000, 0, 0 ],
                    [ 1000, 0, 5000 ],
                    [ 1000, 0, - 5000 ],
                    [ 4000, 0, 2000 ],
                    [ - 4000, 0, 1000 ],
                    [ - 5000, 0, - 5000 ],

                    [ 0, 0, 0 ]

                ];

                for ( let i = 0; i < clones.length; i ++ ) {

                    const c = ( i < clones.length - 1 ) ? 0x252525 : color;

                    mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 30, color: c } ) );
                    mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

                    mesh.position.x = x + clones[ i ][ 0 ];
                    mesh.position.y = y + clones[ i ][ 1 ];
                    mesh.position.z = z + clones[ i ][ 2 ];

                    parent.add( mesh );

                    clonemeshes.push( { mesh: mesh, speed: 0.5 + Math.random() } );

                }

                meshes.push( {
                    mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor( 200 + 200 * Math.random() ),
                    start: Math.floor( 100 + 200 * Math.random() ),
                } );

            }

            function animate() {

                requestAnimationFrame( animate );
                render();

            }

            function render() {

                let delta = 10 * clock.getDelta();

                delta = delta < 2 ? delta : 2;

                parent.rotation.y += - 0.02 * delta;

                for ( let j = 0; j < clonemeshes.length; j ++ ) {

                    const cm = clonemeshes[ j ];
                    cm.mesh.rotation.y += - 0.1 * delta * cm.speed;

                }

                for ( let j = 0; j < meshes.length; j ++ ) {

                    const data = meshes[ j ];
                    const positions = data.mesh.geometry.attributes.position;
                    const initialPositions = data.mesh.geometry.attributes.initialPosition;

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

                composer.render( 0.01 );

            }


}



 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene15 (scene, renderer) {

            let camera, new_controls_2;

            const clock = new THREE.Clock();

            init();
            animate();

            function init() {

             
                camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 15000 );
                camera.position.z = 1000;

                //scene = new THREE.Scene();
                scene.fog = new THREE.Fog( 0x000000, 1, 15000 );

                const pointLight = new THREE.PointLight( 0xff2200, 3, 0, 0 );
                pointLight.position.set( 0, 0, 0 );
                scene.add( pointLight );

                const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
                dirLight.position.set( 0, 0, 1 ).normalize();
                scene.add( dirLight );

                const geometry = [

                    [ new THREE.IcosahedronGeometry( 100, 16 ), 50 ],
                    [ new THREE.IcosahedronGeometry( 100, 8 ), 300 ],
                    [ new THREE.IcosahedronGeometry( 100, 4 ), 1000 ],
                    [ new THREE.IcosahedronGeometry( 100, 2 ), 2000 ],
                    [ new THREE.IcosahedronGeometry( 100, 1 ), 8000 ]

                ];

                const material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: true } );

                for ( let j = 0; j < 1000; j ++ ) {

                    const lod = new THREE.LOD();

                    for ( let i = 0; i < geometry.length; i ++ ) {

                        const mesh = new THREE.Mesh( geometry[ i ][ 0 ], material );
                        mesh.scale.set( 1.5, 1.5, 1.5 );
                        mesh.updateMatrix();
                        mesh.matrixAutoUpdate = false;
                        lod.addLevel( mesh, geometry[ i ][ 1 ] );

                    }

                    lod.position.x = 10000 * ( 0.5 - Math.random() );
                    lod.position.y = 7500 * ( 0.5 - Math.random() );
                    lod.position.z = 10000 * ( 0.5 - Math.random() );
                    lod.updateMatrix();
                    lod.matrixAutoUpdate = false;
                    scene.add( lod );

                }


                new_controls_2 = new FlyControls( camera, renderer.domElement );
                new_controls_2.movementSpeed = 1000;
                new_controls_2.rollSpeed = Math.PI / 10;

                //

                window.addEventListener( 'resize', onWindowResize );

            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            function animate() {

                requestAnimationFrame( animate );
                render();

            }

            function render() {

                new_controls_2.update( clock.getDelta() );

                renderer.render( scene, camera );

            }

}



 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene16 (scene, renderer) {

        let camera;

        let materials, current_material;

        let light, pointLight, ambientLight;

        let effect, resolution;

        let effectController;

        let time = 0;

        const clock = new THREE.Clock();

        init();
        animate();

        function init() {


            camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
            camera.position.set( - 500, 500, 1500 );

            // SCENE

            //scene = new THREE.Scene();
            scene.background = new THREE.Color( 0x050505 );

            // LIGHTS

            light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 0.5, 0.5, 1 );
            scene.add( light );

            pointLight = new THREE.PointLight( 0xff7c00, 3, 0, 0 );
            pointLight.position.set( 0, 0, 100 );
            scene.add( pointLight );

            ambientLight = new THREE.AmbientLight( 0x323232, 3 );
            scene.add( ambientLight );

            // MATERIALS

            materials = generateMaterials();
            current_material = 'shiny';

            // MARCHING CUBES

            resolution = 28;

            effect = new MarchingCubes( resolution, materials[ current_material ], true, true, 100000 );
            effect.position.set( 0, 0, 0 );
            effect.scale.set( 700, 700, 700 );

            effect.enableUvs = false;
            effect.enableColors = false;

            scene.add( effect );

            // CONTROLS

            const controls = new OrbitControls( camera, renderer.domElement );
            controls.minDistance = 500;
            controls.maxDistance = 5000;

          
            // GUI

            setupGui();

            // EVENTS

            window.addEventListener( 'resize', onWindowResize );

        }

        //

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

        }

        function generateMaterials() {

            // environment map

            const path = '../static/src/lib/THREEJS/examples/textures/cube/SwedishRoyalCastle/';
            const format = '.jpg';
            const urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];

            const cubeTextureLoader = new THREE.CubeTextureLoader();

            const reflectionCube = cubeTextureLoader.load( urls );
            const refractionCube = cubeTextureLoader.load( urls );
            refractionCube.mapping = THREE.CubeRefractionMapping;

            // toons

            const toonMaterial1 = createShaderMaterial( ToonShader1, light, ambientLight );
            const toonMaterial2 = createShaderMaterial( ToonShader2, light, ambientLight );
            const hatchingMaterial = createShaderMaterial( ToonShaderHatching, light, ambientLight );
            const dottedMaterial = createShaderMaterial( ToonShaderDotted, light, ambientLight );

            const texture = new THREE.TextureLoader().load( '../static/src/lib/THREEJS/examples/textures/uv_grid_opengl.jpg' );
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.colorSpace = THREE.SRGBColorSpace;

            const materials = {
                'shiny': new THREE.MeshStandardMaterial( { color: 0x9c0000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 } ),
                'chrome': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } ),
                'liquid': new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 } ),
                'matte': new THREE.MeshPhongMaterial( { specular: 0x494949, shininess: 1 } ),
                'flat': new THREE.MeshLambertMaterial( { /*TODO flatShading: true */ } ),
                'textured': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 1, map: texture } ),
                'colors': new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: true } ),
                'multiColors': new THREE.MeshPhongMaterial( { shininess: 2, vertexColors: true } ),
                'plastic': new THREE.MeshPhongMaterial( { specular: 0xc1c1c1, shininess: 250 } ),
                'toon1': toonMaterial1,
                'toon2': toonMaterial2,
                'hatching': hatchingMaterial,
                'dotted': dottedMaterial
            };

            return materials;

        }

        function createShaderMaterial( shader, light, ambientLight ) {

            const u = THREE.UniformsUtils.clone( shader.uniforms );

            const vs = shader.vertexShader;
            const fs = shader.fragmentShader;

            const material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );

            material.uniforms[ 'uDirLightPos' ].value = light.position;
            material.uniforms[ 'uDirLightColor' ].value = light.color;

            material.uniforms[ 'uAmbientLightColor' ].value = ambientLight.color;

            return material;

        }

        //

        function setupGui() {

            const createHandler = function ( id ) {

                return function () {

                    current_material = id;

                    effect.material = materials[ id ];
                    effect.enableUvs = ( current_material === 'textured' ) ? true : false;
                    effect.enableColors = ( current_material === 'colors' || current_material === 'multiColors' ) ? true : false;

                };

            };

            effectController = {

                material: 'shiny',

                speed: 1.0,
                numBlobs: 10,
                resolution: 28,
                isolation: 80,

                floor: true,
                wallx: false,
                wallz: false,

                dummy: function () {}

            };

            let h;

            const gui = new GUI();

            // material (type)

            h = gui.addFolder( 'Materials' );

            for ( const m in materials ) {

                effectController[ m ] = createHandler( m );
                h.add( effectController, m ).name( m );

            }

            // simulation

            h = gui.addFolder( 'Simulation' );

            h.add( effectController, 'speed', 0.1, 8.0, 0.05 );
            h.add( effectController, 'numBlobs', 1, 50, 1 );
            h.add( effectController, 'resolution', 14, 100, 1 );
            h.add( effectController, 'isolation', 10, 300, 1 );

            h.add( effectController, 'floor' );
            h.add( effectController, 'wallx' );
            h.add( effectController, 'wallz' );

        }

        // this controls content of marching cubes voxel field

        function updateCubes( object, time, numblobs, floor, wallx, wallz ) {

            object.reset();

            // fill the field with some metaballs

            const rainbow = [
                new THREE.Color( 0xff0000 ),
                new THREE.Color( 0xffbb00 ),
                new THREE.Color( 0xffff00 ),
                new THREE.Color( 0x00ff00 ),
                new THREE.Color( 0x0000ff ),
                new THREE.Color( 0x9400bd ),
                new THREE.Color( 0xc800eb )
            ];
            const subtract = 12;
            const strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

            for ( let i = 0; i < numblobs; i ++ ) {

                const ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
                const bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
                const ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;

                if ( current_material === 'multiColors' ) {

                    object.addBall( ballx, bally, ballz, strength, subtract, rainbow[ i % 7 ] );

                } else {

                    object.addBall( ballx, bally, ballz, strength, subtract );

                }

            }

            if ( floor ) object.addPlaneY( 2, 12 );
            if ( wallz ) object.addPlaneZ( 2, 12 );
            if ( wallx ) object.addPlaneX( 2, 12 );

            object.update();

        }

        //

        function animate() {

            requestAnimationFrame( animate );

            render();
        }

        function render() {

            const delta = clock.getDelta();

            time += delta * effectController.speed * 0.5;

            // marching cubes

            if ( effectController.resolution !== resolution ) {

                resolution = effectController.resolution;
                effect.init( Math.floor( resolution ) );

            }

            if ( effectController.isolation !== effect.isolation ) {

                effect.isolation = effectController.isolation;

            }

            updateCubes( effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz );

            // render

            renderer.render( scene, camera );

        }


}


 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene17(scene, renderer) {

            let camera, new_controls_3, mesh, material;

            let composer, renderPass, taaRenderPass, outputPass;

            let needsUpdate = false;

            const amount = parseInt( window.location.search.slice( 1 ) ) || 3;
            const count = Math.pow( amount, 3 );

            const color = new THREE.Color();

            const params = {
                alpha: 0.5,
                alphaHash: true,
                taa: true,
                sampleLevel: 2,
            };

            init();
            animate();

            function init() {

                camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
                camera.position.set( amount, amount, amount );
                camera.lookAt( 0, 0, 0 );

                //scene = new THREE.Scene();

                const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );

                material = new THREE.MeshStandardMaterial( {
                    color: 0xffffff,
                    alphaHash: params.alphaHash,
                    opacity: params.alpha
                } );

                mesh = new THREE.InstancedMesh( geometry, material, count );

                let i = 0;
                const offset = ( amount - 1 ) / 2;

                const matrix = new THREE.Matrix4();

                for ( let x = 0; x < amount; x ++ ) {

                    for ( let y = 0; y < amount; y ++ ) {

                        for ( let z = 0; z < amount; z ++ ) {

                            matrix.setPosition( offset - x, offset - y, offset - z );

                            mesh.setMatrixAt( i, matrix );
                            mesh.setColorAt( i, color.setHex( Math.random() * 0xffffff ) );

                            i ++;

                        }

                    }

                }

                scene.add( mesh );

                //

                const environment = new RoomEnvironment( renderer );
                const pmremGenerator = new THREE.PMREMGenerator( renderer );

                scene.environment = pmremGenerator.fromScene( environment ).texture;
                environment.dispose();

                //

                composer = new EffectComposer( renderer );

                renderPass = new RenderPass( scene, camera );
                renderPass.enabled = false;

                taaRenderPass = new TAARenderPass( scene, camera );

                outputPass = new OutputPass();

                composer.addPass( renderPass );
                composer.addPass( taaRenderPass );
                composer.addPass( outputPass );

                //

                new_controls_3 = new OrbitControls( camera, renderer.domElement );
                new_controls_3.enableZoom = false;
                new_controls_3.enablePan = false;

                new_controls_3.addEventListener( 'change', () => ( needsUpdate = true ) );

                //

                const gui = new GUI();

                gui.add( params, 'alpha', 0, 1 ).onChange( onMaterialUpdate );
                gui.add( params, 'alphaHash' ).onChange( onMaterialUpdate );

                const taaFolder = gui.addFolder( 'Temporal Anti-Aliasing' );

                taaFolder.add( params, 'taa' ).name( 'enabled' ).onChange( () => {

                    renderPass.enabled = ! params.taa;
                    taaRenderPass.enabled = params.taa;

                    sampleLevelCtrl.enable( params.taa );

                    needsUpdate = true;

                } );

                const sampleLevelCtrl = taaFolder.add( params, 'sampleLevel', 0, 6, 1 ).onChange( () => ( needsUpdate = true ) );

                //

                stats = new Stats();
                document.body.appendChild( stats.dom );

                window.addEventListener( 'resize', onWindowResize );

            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );
                composer.setSize( window.innerWidth, window.innerHeight );

                needsUpdate = true;

            }

            function onMaterialUpdate() {

                material.opacity = params.alpha;
                material.alphaHash = params.alphaHash;
                material.transparent = ! params.alphaHash;
                material.depthWrite = params.alphaHash;

                material.needsUpdate = true;
                needsUpdate = true;

            }

            function animate() {

                requestAnimationFrame( animate );

                render();
            }

            function render() {

                if ( needsUpdate ) {

                    taaRenderPass.accumulate = false;
                    taaRenderPass.sampleLevel = 0;

                    needsUpdate = false;

                } else {

                    taaRenderPass.accumulate = true;
                    taaRenderPass.sampleLevel = params.sampleLevel;

                }

                composer.render();

            }

}


 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene18(scene, renderer) {

            let camera;
            let meshKnot;

            init();

            function init() {

                renderer.setAnimationLoop( animation );

                camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
                camera.position.set( 0, 5, - 15 );

                //scene = new THREE.Scene();

                RectAreaLightUniformsLib.init();

                const rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );
                rectLight1.position.set( - 5, 5, 5 );
                scene.add( rectLight1 );

                const rectLight2 = new THREE.RectAreaLight( 0x00ff00, 5, 4, 10 );
                rectLight2.position.set( 0, 5, 5 );
                scene.add( rectLight2 );

                const rectLight3 = new THREE.RectAreaLight( 0x0000ff, 5, 4, 10 );
                rectLight3.position.set( 5, 5, 5 );
                scene.add( rectLight3 );

                scene.add( new RectAreaLightHelper( rectLight1 ) );
                scene.add( new RectAreaLightHelper( rectLight2 ) );
                scene.add( new RectAreaLightHelper( rectLight3 ) );

                const geoFloor = new THREE.BoxGeometry( 2000, 0.1, 2000 );
                const matStdFloor = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, roughness: 0.1, metalness: 0 } );
                const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
                scene.add( mshStdFloor );

                const geoKnot = new THREE.TorusKnotGeometry( 1.5, 0.5, 200, 16 );
                const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0 } );
                meshKnot = new THREE.Mesh( geoKnot, matKnot );
                meshKnot.position.set( 0, 5, 0 );
                scene.add( meshKnot );

                const newcontrols = new OrbitControls( camera, renderer.domElement );
                newcontrols.target.copy( meshKnot.position );
                newcontrols.update();

                //

                window.addEventListener( 'resize', onWindowResize );

            }

            function onWindowResize() {

                renderer.setSize( window.innerWidth, window.innerHeight );
                camera.aspect = ( window.innerWidth / window.innerHeight );
                camera.updateProjectionMatrix();

            }

            function animation( time ) {

                meshKnot.rotation.y = time / 1000;

                renderer.render( scene, camera );

            }


}



 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene19 (scene, renderer) {

            let camera;
            const mixers = [];
            const clock = new THREE.Clock();

            init();
            animate();

            function init() {

                camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
                camera.position.set( 0, 0, 250 );

                //scene = new THREE.Scene();
                scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
                scene.fog = new THREE.Fog( scene.background, 1, 5000 );

                // LIGHTS

                const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
                hemiLight.color.setHSL( 0.6, 1, 0.6 );
                hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
                hemiLight.position.set( 0, 50, 0 );
                scene.add( hemiLight );

                const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
                scene.add( hemiLightHelper );

                //

                const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
                dirLight.color.setHSL( 0.1, 1, 0.95 );
                dirLight.position.set( - 1, 1.75, 1 );
                dirLight.position.multiplyScalar( 30 );
                scene.add( dirLight );

                dirLight.castShadow = true;

                dirLight.shadow.mapSize.width = 2048;
                dirLight.shadow.mapSize.height = 2048;

                const d = 50;

                dirLight.shadow.camera.left = - d;
                dirLight.shadow.camera.right = d;
                dirLight.shadow.camera.top = d;
                dirLight.shadow.camera.bottom = - d;

                dirLight.shadow.camera.far = 3500;
                dirLight.shadow.bias = - 0.0001;

                const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
                scene.add( dirLightHelper );

                // GROUND

                const groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
                const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
                groundMat.color.setHSL( 0.095, 1, 0.75 );

                const ground = new THREE.Mesh( groundGeo, groundMat );
                ground.position.y = - 33;
                ground.rotation.x = - Math.PI / 2;
                ground.receiveShadow = true;
                scene.add( ground );

                // SKYDOME

                const vertexShader = document.getElementById( 'vertexShader2' ).textContent;
                const fragmentShader = document.getElementById( 'fragmentShader2' ).textContent;
                const uniforms = {
                    'topColor': { value: new THREE.Color( 0x0077ff ) },
                    'bottomColor': { value: new THREE.Color( 0xffffff ) },
                    'offset': { value: 33 },
                    'exponent': { value: 0.6 }
                };
                uniforms[ 'topColor' ].value.copy( hemiLight.color );

                scene.fog.color.copy( uniforms[ 'bottomColor' ].value );

                const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
                const skyMat = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    side: THREE.BackSide
                } );

                const sky = new THREE.Mesh( skyGeo, skyMat );
                scene.add( sky );

                // MODEL

                const loader = new GLTFLoader();

                loader.load( '../static/src/lib/THREEJS/examples/models/gltf/Flamingo.glb', function ( gltf ) {

                    const mesh = gltf.scene.children[ 0 ];

                    const s = 0.35;
                    mesh.scale.set( s, s, s );
                    mesh.position.y = 15;
                    mesh.rotation.y = - 1;

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    scene.add( mesh );

                    const mixer = new THREE.AnimationMixer( mesh );
                    mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
                    mixers.push( mixer );

                } );

      
                //

                const params = {
                    toggleHemisphereLight: function () {

                        hemiLight.visible = ! hemiLight.visible;
                        hemiLightHelper.visible = ! hemiLightHelper.visible;

                    },
                    toggleDirectionalLight: function () {

                        dirLight.visible = ! dirLight.visible;
                        dirLightHelper.visible = ! dirLightHelper.visible;

                    }
                };

                const gui = new GUI();

                gui.add( params, 'toggleHemisphereLight' ).name( 'toggle hemisphere light' );
                gui.add( params, 'toggleDirectionalLight' ).name( 'toggle directional light' );
                gui.open();

                //

                window.addEventListener( 'resize', onWindowResize );

            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            //

            function animate() {

                requestAnimationFrame( animate );

                render();

            }

            function render() {

                const delta = clock.getDelta();

                for ( let i = 0; i < mixers.length; i ++ ) {

                    mixers[ i ].update( delta );

                }

                renderer.render( scene, camera );

            }

}


 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene19 (scene, renderer) {
            let camera, newcontrols2;

            let mesh;
            const amount = parseInt( window.location.search.slice( 1 ) ) || 10;
            const count = Math.pow( amount, 3 );

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2( 1, 1 );

            const color = new THREE.Color();
            const white = new THREE.Color().setHex( 0xffffff );

            init();
            animate();

            function init() {

                camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
                camera.position.set( amount, amount, amount );
                camera.lookAt( 0, 0, 0 ); 

                const light = new THREE.HemisphereLight( 0xffffff, 0x888888, 3 );
                light.position.set( 0, 1, 0 );
                scene.add( light );

                const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );
                const material = new THREE.MeshPhongMaterial( { color: 0xffffff } );

                mesh = new THREE.InstancedMesh( geometry, material, count );

                let i = 0;
                const offset = ( amount - 1 ) / 2;

                const matrix = new THREE.Matrix4();

                for ( let x = 0; x < amount; x ++ ) {

                    for ( let y = 0; y < amount; y ++ ) {

                        for ( let z = 0; z < amount; z ++ ) {

                            matrix.setPosition( offset - x, offset - y, offset - z );

                            mesh.setMatrixAt( i, matrix );
                            mesh.setColorAt( i, color );

                            i ++;

                        }

                    }

                }

                scene.add( mesh );

                //

                const gui = new GUI();
                gui.add( mesh, 'count', 0, count );

              
                newcontrols2 = new OrbitControls( camera, renderer.domElement );
                newcontrols2.enableDamping = true;
                newcontrols2.enableZoom = false;
                newcontrols2.enablePan = false;

                window.addEventListener( 'resize', onWindowResize );
                document.addEventListener( 'mousemove', onMouseMove );

            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            function onMouseMove( event ) {

                event.preventDefault();

                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            }

            function animate() {

                requestAnimationFrame( animate );

                newcontrols2.update();

                raycaster.setFromCamera( mouse, camera );

                const intersection = raycaster.intersectObject( mesh );

                if ( intersection.length > 0 ) {

                    const instanceId = intersection[ 0 ].instanceId;

                    mesh.getColorAt( instanceId, color );

                    if ( color.equals( white ) ) {

                        mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) );

                        mesh.instanceColor.needsUpdate = true;

                    }

                }

                render();

            }

            function render() {

                renderer.render( scene, camera );

            }

}


 ////////////////////////////

// Buffer Instance

//////////////////////////////////

function initLoadScene20 (scene, renderer) {

      let SCREEN_WIDTH = window.innerWidth;
      let SCREEN_HEIGHT = window.innerHeight;
      let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

      let camera, mesh;
      let cameraRig, activeCamera, activeHelper;
      let cameraPerspective, cameraOrtho;
      let cameraPerspectiveHelper, cameraOrthoHelper;
      const frustumSize = 600;

      init();
      animate();

      function init() {

        camera = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
        camera.position.z = 2500;

        cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );

        cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
        scene.add( cameraPerspectiveHelper );

        //
        cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );

        cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
        scene.add( cameraOrthoHelper );

        //

        activeCamera = cameraPerspective;
        activeHelper = cameraPerspectiveHelper;


        // counteract different front orientation of cameras vs rig

        cameraOrtho.rotation.y = Math.PI;
        cameraPerspective.rotation.y = Math.PI;

        cameraRig = new THREE.Group();

        cameraRig.add( cameraPerspective );
        cameraRig.add( cameraOrtho );

        scene.add( cameraRig );

        //

        mesh = new THREE.Mesh(
          new THREE.SphereGeometry( 100, 16, 8 ),
          new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
        );
        scene.add( mesh );

        const mesh2 = new THREE.Mesh(
          new THREE.SphereGeometry( 50, 16, 8 ),
          new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
        );
        mesh2.position.y = 150;
        mesh.add( mesh2 );

        const mesh3 = new THREE.Mesh(
          new THREE.SphereGeometry( 5, 16, 8 ),
          new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
        );
        mesh3.position.z = 150;
        cameraRig.add( mesh3 );

        //

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for ( let i = 0; i < 10000; i ++ ) {

          vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
          vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
          vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
        scene.add( particles );

        //

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        container.appendChild( renderer.domElement );

        renderer.autoClear = false;
        //

        window.addEventListener( 'resize', onWindowResize );
        document.addEventListener( 'keydown', onKeyDown );

      }

      //

      function onKeyDown( event ) {

        switch ( event.keyCode ) {

          case 79: /*O*/

            activeCamera = cameraOrtho;
            activeHelper = cameraOrthoHelper;

            break;

          case 80: /*P*/

            activeCamera = cameraPerspective;
            activeHelper = cameraPerspectiveHelper;

            break;

        }

      }

      //

      function onWindowResize() {

        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;
        aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        camera.aspect = 0.5 * aspect;
        camera.updateProjectionMatrix();

        cameraPerspective.aspect = 0.5 * aspect;
        cameraPerspective.updateProjectionMatrix();

        cameraOrtho.left = - 0.5 * frustumSize * aspect / 2;
        cameraOrtho.right = 0.5 * frustumSize * aspect / 2;
        cameraOrtho.top = frustumSize / 2;
        cameraOrtho.bottom = - frustumSize / 2;
        cameraOrtho.updateProjectionMatrix();

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();
      }


      function render() {

        const r = Date.now() * 0.0005;

        mesh.position.x = 700 * Math.cos( r );
        mesh.position.z = 700 * Math.sin( r );
        mesh.position.y = 700 * Math.sin( r );

        mesh.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
        mesh.children[ 0 ].position.z = 70 * Math.sin( r );

        if ( activeCamera === cameraPerspective ) {

          cameraPerspective.fov = 35 + 30 * Math.sin( 0.5 * r );
          cameraPerspective.far = mesh.position.length();
          cameraPerspective.updateProjectionMatrix();

          cameraPerspectiveHelper.update();
          cameraPerspectiveHelper.visible = true;

          cameraOrthoHelper.visible = false;

        } else {

          cameraOrtho.far = mesh.position.length();
          cameraOrtho.updateProjectionMatrix();

          cameraOrthoHelper.update();
          cameraOrthoHelper.visible = true;

          cameraPerspectiveHelper.visible = false;

        }

        cameraRig.lookAt( mesh.position );

        renderer.clear();

        activeHelper.visible = false;

        renderer.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
        renderer.render( scene, activeCamera );

        activeHelper.visible = true;

        renderer.setViewport( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
        renderer.render( scene, camera );

      }
}



function initLoadScene21(scene,renderer) {

      let camera, object;
      let planes, planeObjects, planeHelpers;
      let clock;

      const params = {

        animate: true,
        planeX: {

          constant: 0,
          negated: false,
          displayHelper: false

        },
        planeY: {

          constant: 0,
          negated: false,
          displayHelper: false

        },
        planeZ: {

          constant: 0,
          negated: false,
          displayHelper: false

        }


      };

      init();
      animate();

      function createPlaneStencilGroup( geometry, plane, renderOrder ) {

        const group = new THREE.Group();
        const baseMat = new THREE.MeshBasicMaterial();
        baseMat.depthWrite = false;
        baseMat.depthTest = false;
        baseMat.colorWrite = false;
        baseMat.stencilWrite = true;
        baseMat.stencilFunc = THREE.AlwaysStencilFunc;

        // back faces
        const mat0 = baseMat.clone();
        mat0.side = THREE.BackSide;
        mat0.clippingPlanes = [ plane ];
        mat0.stencilFail = THREE.IncrementWrapStencilOp;
        mat0.stencilZFail = THREE.IncrementWrapStencilOp;
        mat0.stencilZPass = THREE.IncrementWrapStencilOp;

        const mesh0 = new THREE.Mesh( geometry, mat0 );
        mesh0.renderOrder = renderOrder;
        group.add( mesh0 );

        // front faces
        const mat1 = baseMat.clone();
        mat1.side = THREE.FrontSide;
        mat1.clippingPlanes = [ plane ];
        mat1.stencilFail = THREE.DecrementWrapStencilOp;
        mat1.stencilZFail = THREE.DecrementWrapStencilOp;
        mat1.stencilZPass = THREE.DecrementWrapStencilOp;

        const mesh1 = new THREE.Mesh( geometry, mat1 );
        mesh1.renderOrder = renderOrder;

        group.add( mesh1 );

        return group;

      }

      function init() {

        clock = new THREE.Clock();

        camera = new THREE.PerspectiveCamera( 36, window.innerWidth / window.innerHeight, 1, 100 );
        camera.position.set( 2, 2, 2 );

        scene.add( new THREE.AmbientLight( 0xffffff, 1.5 ) );

        const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
        dirLight.position.set( 5, 10, 7.5 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.top  = 2;
        dirLight.shadow.camera.bottom = - 2;

        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add( dirLight );

        planes = [
          new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0 ),
          new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0 ),
          new THREE.Plane( new THREE.Vector3( 0, 0, - 1 ), 0 )
        ];

        planeHelpers = planes.map( p => new THREE.PlaneHelper( p, 2, 0xffffff ) );
        planeHelpers.forEach( ph => {

          ph.visible = false;
          scene.add( ph );

        } );

        const geometry = new THREE.TorusKnotGeometry( 0.4, 0.15, 220, 60 );
        object = new THREE.Group();
        scene.add( object );

        // Set up clip plane rendering
        planeObjects = [];
        const planeGeom = new THREE.PlaneGeometry( 4, 4 );

        for ( let i = 0; i < 3; i ++ ) {

          const poGroup = new THREE.Group();
          const plane = planes[ i ];
          const stencilGroup = createPlaneStencilGroup( geometry, plane, i + 1 );

          // plane is clipped by the other clipping planes
          const planeMat =
            new THREE.MeshStandardMaterial( {

              color: 0xE91E63,
              metalness: 0.1,
              roughness: 0.75,
              clippingPlanes: planes.filter( p => p !== plane ),

              stencilWrite: true,
              stencilRef: 0,
              stencilFunc: THREE.NotEqualStencilFunc,
              stencilFail: THREE.ReplaceStencilOp,
              stencilZFail: THREE.ReplaceStencilOp,
              stencilZPass: THREE.ReplaceStencilOp,

            } );
          const po = new THREE.Mesh( planeGeom, planeMat );
          po.onAfterRender = function ( renderer ) {

            renderer.clearStencil();

          };

          po.renderOrder = i + 1.1;

          object.add( stencilGroup );
          poGroup.add( po );
          planeObjects.push( po );
          scene.add( poGroup );

        }

        const material = new THREE.MeshStandardMaterial( {

          color: 0xFFC107,
          metalness: 0.1,
          roughness: 0.75,
          clippingPlanes: planes,
          clipShadows: true,
          shadowSide: THREE.DoubleSide,

        } );

        // add the color
        const clippedColorFront = new THREE.Mesh( geometry, material );
        clippedColorFront.castShadow = true;
        clippedColorFront.renderOrder = 6;
        object.add( clippedColorFront );


        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry( 9, 9, 1, 1 ),
          new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.25, side: THREE.DoubleSide } )
        );

        ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
        ground.position.y = - 1;
        ground.receiveShadow = true;
        scene.add( ground );


        // Renderer
        renderer.setClearColor( 0x263238 );
        window.addEventListener( 'resize', onWindowResize );
        document.body.appendChild( renderer.domElement );

        renderer.localClippingEnabled = true;

        // Controls
        const newcontrols3 = new OrbitControls( camera, renderer.domElement );
        newcontrols3.minDistance = 2;
        newcontrols3.maxDistance = 20;
        newcontrols3.update();

        // GUI
        const gui = new GUI();
        gui.add( params, 'animate' );

        const planeX = gui.addFolder( 'planeX' );
        planeX.add( params.planeX, 'displayHelper' ).onChange( v => planeHelpers[ 0 ].visible = v );
        planeX.add( params.planeX, 'constant' ).min( - 1 ).max( 1 ).onChange( d => planes[ 0 ].constant = d );
        planeX.add( params.planeX, 'negated' ).onChange( () => {

          planes[ 0 ].negate();
          params.planeX.constant = planes[ 0 ].constant;

        } );
        planeX.open();

        const planeY = gui.addFolder( 'planeY' );
        planeY.add( params.planeY, 'displayHelper' ).onChange( v => planeHelpers[ 1 ].visible = v );
        planeY.add( params.planeY, 'constant' ).min( - 1 ).max( 1 ).onChange( d => planes[ 1 ].constant = d );
        planeY.add( params.planeY, 'negated' ).onChange( () => {

          planes[ 1 ].negate();
          params.planeY.constant = planes[ 1 ].constant;

        } );
        planeY.open();

        const planeZ = gui.addFolder( 'planeZ' );
        planeZ.add( params.planeZ, 'displayHelper' ).onChange( v => planeHelpers[ 2 ].visible = v );
        planeZ.add( params.planeZ, 'constant' ).min( - 1 ).max( 1 ).onChange( d => planes[ 2 ].constant = d );
        planeZ.add( params.planeZ, 'negated' ).onChange( () => {

          planes[ 2 ].negate();
          params.planeZ.constant = planes[ 2 ].constant;

        } );
        planeZ.open();

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function animate() {

        const delta = clock.getDelta();

        requestAnimationFrame( animate );

        if ( params.animate ) {

          object.rotation.x += delta * 0.5;
          object.rotation.y += delta * 0.2;

        }

        for ( let i = 0; i < planeObjects.length; i ++ ) {
          const plane = planes[ i ];
          const po = planeObjects[ i ];
          plane.coplanarPoint( po.position );
          po.lookAt(
            po.position.x - plane.normal.x,
            po.position.y - plane.normal.y,
            po.position.z - plane.normal.z,
          );

        }
        renderer.render( scene, camera );

      }


  }



function initLoadScene22(scene, renderer) {

      function planesFromMesh( vertices, indices ) {

        // creates a clipping volume from a convex triangular mesh
        // specified by the arrays 'vertices' and 'indices'

        const n = indices.length / 3,
          result = new Array( n );

        for ( let i = 0, j = 0; i < n; ++ i, j += 3 ) {

          const a = vertices[ indices[ j ] ],
            b = vertices[ indices[ j + 1 ] ],
            c = vertices[ indices[ j + 2 ] ];

          result[ i ] = new THREE.Plane().
            setFromCoplanarPoints( a, b, c );

        }

        return result;

      }

      function createPlanes( n ) {

        // creates an array of n uninitialized plane objects

        const result = new Array( n );

        for ( let i = 0; i !== n; ++ i )
          result[ i ] = new THREE.Plane();

        return result;

      }

      function assignTransformedPlanes( planesOut, planesIn, matrix ) {

        // sets an array of existing planes to transformed 'planesIn'

        for ( let i = 0, n = planesIn.length; i !== n; ++ i )
          planesOut[ i ].copy( planesIn[ i ] ).applyMatrix4( matrix );

      }

      function cylindricalPlanes( n, innerRadius ) {

        const result = createPlanes( n );

        for ( let i = 0; i !== n; ++ i ) {

          const plane = result[ i ],
            angle = i * Math.PI * 2 / n;

          plane.normal.set(
            Math.cos( angle ), 0, Math.sin( angle ) );

          plane.constant = innerRadius;

        }

        return result;

      }

      const planeToMatrix = ( function () {

        // creates a matrix that aligns X/Y to a given plane

        // temporaries:
        const xAxis = new THREE.Vector3(),
          yAxis = new THREE.Vector3(),
          trans = new THREE.Vector3();

        return function planeToMatrix( plane ) {

          const zAxis = plane.normal,
            matrix = new THREE.Matrix4();

          // Hughes & Moeller '99
          // "Building an Orthonormal Basis from a Unit Vector."

          if ( Math.abs( zAxis.x ) > Math.abs( zAxis.z ) ) {

            yAxis.set( - zAxis.y, zAxis.x, 0 );

          } else {

            yAxis.set( 0, - zAxis.z, zAxis.y );

          }

          xAxis.crossVectors( yAxis.normalize(), zAxis );

          plane.coplanarPoint( trans );
          return matrix.set(
            xAxis.x, yAxis.x, zAxis.x, trans.x,
            xAxis.y, yAxis.y, zAxis.y, trans.y,
            xAxis.z, yAxis.z, zAxis.z, trans.z,
            0,   0, 0, 1 );

        };

      } )();


      // A regular tetrahedron for the clipping volume:

      const Vertices = [
          new THREE.Vector3( + 1, 0, + Math.SQRT1_2 ),
          new THREE.Vector3( - 1, 0, + Math.SQRT1_2 ),
          new THREE.Vector3( 0, + 1, - Math.SQRT1_2 ),
          new THREE.Vector3( 0, - 1, - Math.SQRT1_2 )
        ],

        Indices = [
          0, 1, 2,  0, 2, 3,  0, 3, 1,  1, 3, 2
        ],

        Planes = planesFromMesh( Vertices, Indices ),
        PlaneMatrices = Planes.map( planeToMatrix ),

        GlobalClippingPlanes = cylindricalPlanes( 5, 2.5 ),

        Empty = Object.freeze( [] );


      let camera, startTime,

        object, clipMaterial,
        volumeVisualization,
        globalClippingPlanes;

      function init() {

        camera = new THREE.PerspectiveCamera(
          36, window.innerWidth / window.innerHeight, 0.25, 16 );

        camera.position.set( 0, 1.5, 3 );

        // Lights

        scene.add( new THREE.AmbientLight( 0xffffff ) );

        const spotLight = new THREE.SpotLight( 0xffffff, 60 );
        spotLight.angle = Math.PI / 5;
        spotLight.penumbra = 0.2;
        spotLight.position.set( 2, 3, 3 );
        spotLight.castShadow = true;
        spotLight.shadow.camera.near = 3;
        spotLight.shadow.camera.far = 10;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        scene.add( spotLight );

        const dirLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
        dirLight.position.set( 0, 2, 0 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 10;

        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = - 1;
        dirLight.shadow.camera.top  = 1;
        dirLight.shadow.camera.bottom = - 1;

        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add( dirLight );

        // Geometry

        clipMaterial = new THREE.MeshPhongMaterial( {
          color: 0xee0a10,
          shininess: 100,
          side: THREE.DoubleSide,
          // Clipping setup:
          clippingPlanes: createPlanes( Planes.length ),
          clipShadows: true
        } );

        object = new THREE.Group();

        const geometry = new THREE.BoxGeometry( 0.18, 0.18, 0.18 );

        for ( let z = - 2; z <= 2; ++ z )
          for ( let y = - 2; y <= 2; ++ y )
            for ( let x = - 2; x <= 2; ++ x ) {

              const mesh = new THREE.Mesh( geometry, clipMaterial );
              mesh.position.set( x / 5, y / 5, z / 5 );
              mesh.castShadow = true;
              object.add( mesh );

            }

        scene.add( object );


        const planeGeometry = new THREE.PlaneGeometry( 3, 3, 1, 1 ),

          color = new THREE.Color();

        volumeVisualization = new THREE.Group();
        volumeVisualization.visible = false;

        for ( let i = 0, n = Planes.length; i !== n; ++ i ) {

          const material = new THREE.MeshBasicMaterial( {
            color: color.setHSL( i / n, 0.5, 0.5 ).getHex(),
            side: THREE.DoubleSide,

            opacity: 0.2,
            transparent: true,

            // clip to the others to show the volume (wildly
            // intersecting transparent planes look bad)
            clippingPlanes: clipMaterial.clippingPlanes.
              filter( function ( _, j ) {

                return j !== i;

              } )

            // no need to enable shadow clipping - the plane
            // visualization does not cast shadows

          } );

          const mesh = new THREE.Mesh( planeGeometry, material );
          mesh.matrixAutoUpdate = false;

          volumeVisualization.add( mesh );

        }

        scene.add( volumeVisualization );


        const ground = new THREE.Mesh( planeGeometry,
          new THREE.MeshPhongMaterial( {
            color: 0xa0adaf, shininess: 10 } ) );
        ground.rotation.x = - Math.PI / 2;
        ground.scale.multiplyScalar( 3 );
        ground.receiveShadow = true;
        scene.add( ground );

        // Clipping setup:
        globalClippingPlanes = createPlanes( GlobalClippingPlanes.length );
        renderer.clippingPlanes = Empty;
        renderer.localClippingEnabled = true;

     
        // Controls

        const newcontrols4 = new OrbitControls( camera, renderer.domElement );
        newcontrols4.minDistance = 1;
        newcontrols4.maxDistance = 8;
        newcontrols4.target.set( 0, 1, 0 );
        newcontrols4.update();

        // GUI

        const gui = new GUI(),
          folder = gui.addFolder( 'Local Clipping' ),
          props = {
            get 'Enabled'() {

              return renderer.localClippingEnabled;

            },
            set 'Enabled'( v ) {

              renderer.localClippingEnabled = v;
              if ( ! v ) volumeVisualization.visible = false;

            },

            get 'Shadows'() {

              return clipMaterial.clipShadows;

            },
            set 'Shadows'( v ) {

              clipMaterial.clipShadows = v;

            },

            get 'Visualize'() {

              return volumeVisualization.visible;

            },
            set 'Visualize'( v ) {

              if ( renderer.localClippingEnabled )
                volumeVisualization.visible = v;

            }
          };

        folder.add( props, 'Enabled' );
        folder.add( props, 'Shadows' );
        folder.add( props, 'Visualize' ).listen();

        gui.addFolder( 'Global Clipping' ).
          add( {
            get 'Enabled'() {

              return renderer.clippingPlanes !== Empty;

            },
            set 'Enabled'( v ) {

              renderer.clippingPlanes = v ?
                globalClippingPlanes : Empty;

            }
          }, 'Enabled' );


        // Start

        startTime = Date.now();

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function setObjectWorldMatrix( object, matrix ) {

        // set the orientation of an object based on a world matrix

        const parent = object.parent;
        scene.updateMatrixWorld();
        object.matrix.copy( parent.matrixWorld ).invert();
        object.applyMatrix4( matrix );

      }

      const transform = new THREE.Matrix4(),
        tmpMatrix = new THREE.Matrix4();

      function animate() {

        const currentTime = Date.now(),
          time = ( currentTime - startTime ) / 1000;

        requestAnimationFrame( animate );

        object.position.y = 1;
        object.rotation.x = time * 0.5;
        object.rotation.y = time * 0.2;

        object.updateMatrix();
        transform.copy( object.matrix );

        const bouncy = Math.cos( time * .5 ) * 0.5 + 0.7;
        transform.multiply(
          tmpMatrix.makeScale( bouncy, bouncy, bouncy ) );

        assignTransformedPlanes(
          clipMaterial.clippingPlanes, Planes, transform );

        const planeMeshes = volumeVisualization.children;

        for ( let i = 0, n = planeMeshes.length; i !== n; ++ i ) {

          tmpMatrix.multiplyMatrices( transform, PlaneMatrices[ i ] );
          setObjectWorldMatrix( planeMeshes[ i ], tmpMatrix );

        }

        transform.makeRotationY( time * 0.1 );

        assignTransformedPlanes( globalClippingPlanes, GlobalClippingPlanes, transform );

        renderer.render( scene, camera );

      }

      init();
      animate();

  }



}







  //////////////////////////////////////////////////////////////////////////////////
  ///*****GUISECTION*******///
  //////////////////////////////////////////////////////////////////////////////////
    var gui = new GUI();
    //gui.domElement.id = 'mainpanel';
    var settings = new Settings();
    const folder1 = gui.addFolder( 'Ground' );
    folder1.add(settings.groundSettings, 'default');
    folder1.add(settings.groundSettings, 'pointcloud');
    folder1.add(settings.groundSettings, 'water');
    folder1.open();
    const folder2 = gui.addFolder( 'Lighting' );
    const folder2_1 = folder2.addFolder( 'Light Bulb' );
    const folder2_2 = folder2.addFolder( 'Colorful Light' );
    const folder2_1_1 = folder2_1.addFolder( 'Configures' );
    folder2_1.add(settings, 'Enable Light1').onChange(function (val) {
      isLight1 = val;
      if (isLight1) {
        settings['Add Light1']();
        folder2_1_1.show();
        folder2_1_1.open();
      } else {
        folder2_1_1.hide();
        folder2_1_1.close();
      }
    });

    folder2_2.add(settings, 'Enable Light2').onChange(function (val) {
      isLight2 = val;
      if (isLight2) {
        settings['Add Light2']();
      } else {
        return;
      }
    });

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
  folder3.open();

    ////////
    for (let i = 1; i <= 22; i++) {
        const folder = gui.addFolder('Scene' + i);
        folder.add(settings, 'LoadScene' + i).onChange(function (val) {
            window['initScene' + i] = val;
            if (window['initScene' + i]) {
                settings['LoadScene' + i]();
            } else {
                return;
            }
        });
    }






