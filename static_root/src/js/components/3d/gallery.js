  let stats;

  let isMoved = false;

  let renderer;

  let rendererCSS3D;

  let isEcho = false;

  let guiModel;

  let listener;

  let generatedModels = [];

  let audioStore = [];

  let isInteractiveWall = false;

  let is3DWall = false;

  let isInteractiveShape = false;

  let audioElement;

  let displaysettings;

  let audio1, audio2, audio3; 

  let sound1, sound2; 

  // Define a state variable to keep track of the active function
  var activeFunction = null;

  let isDisplay = false;

  let activateAudio  = false;

  let startAudio = false;
   
  let audioTriggered = false;

  let panel1, panel2, panel3;

  let resetTriggered = false;

  let isAudioFinder = false;

  let isAudioIsolator = false;

  let toggleSlider = false;
    
  let isVertical = true;

  let audioBackGroundLoader = [];

  let mouseX = 0, mouseY = 0;

  let windowWidth, windowHeight;

  let camera, camera1, camera2, camera3, controls1;

  let scene1, scene2;

  let modelList = [];

  const threshold = 0.1;

  const pointSize = 0.05;

  const defaultSettings = {
    audioURL: 'Soundtrack1',
    pitch: 0.05,
    delayVolume: 0.05,
    delayOffset: 0.05,
  };


  const defaultWallSettings = {
    width: 10,
    depth: 10,
    height: 10,
    radius: 1,
    mode: 'random',
    length: 100,
    segments: 5
  };
  
  let sliderVerticalPos = window.innerWidth / 2;

  let sliderHorizontalPos = window.innerHeight / 2;

  const sliderVerticalElement = document.getElementById("slider-vertical");

  const sliderHorizontalElement = document.getElementById("slider-horizontal");

  var clock, player, terrainScene, clonedTerrainScene, clonedGeo, cloneddecoScene, decoScene, lastOptions, controls = {}, fpsCamera, skyDome, skyLight, sand, water; // jscs:ignore requireLineBreakAfterVariableAssignment
  var INV_MAX_FPS = 1 / 100,
      frameDelta = 0,
      paused = true,
      useFPS = false;

  const views = [
  {
    background: new THREE.Color().setRGB( 0.7, 0.5, 0.5, THREE.SRGBColorSpace ),
    eye: [ 0, 1800, 0 ],
    up: [ 0, 0, 1 ],
    fov: 45,
    updateCamera: function ( camera, scene, mouseX ) {
      camera.position.x -= mouseX * 0.05;
      camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), - 2000 );
      camera.lookAt( scene2.position );

    }
  },
  {
    background: new THREE.Color().setRGB( 0.5, 0.7, 0.7, THREE.SRGBColorSpace ),
    eye: [ 1400, 800, 1400 ],
    up: [ 0, 1, 0 ],
    fov: 60,
    updateCamera: function ( camera, scene, mouseX ) {
      camera.position.y -= mouseX * 0.05;
      camera.position.y = Math.max( Math.min( camera.position.y, 1600 ), -1600 );
      camera.lookAt( camera.position.clone().setY( 0 ) );
    }
  }
  ];


  init();

  function init() {

  const container = document.getElementById( 'container' );
  const light = new THREE.DirectionalLight( 0xffffff, 3 );
  light.position.set( 0, 0, 1 );

  // Define scene
  scene1 = new THREE.Scene();
  scene1.background = new THREE.Color().setRGB( 0.5, 0.5, 0.7, THREE.SRGBColorSpace );
  camera1 = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 10000 );
  camera1.position.z = 6;

  //controls1 = new THREE.OrbitControls( camera1, container );
  scene2 = new THREE.Scene();

  // scene2.fog = new THREE.FogExp2(0x868293, 0.0007);
  scene2.background = views[0].background

  scene3 = new THREE.Scene();
  scene3.background = views[1].background;

  scene1.add( light.clone() );
  scene2.add( light.clone() );
  scene3.add( light.clone() );

  clock = new THREE.Clock(false);

  for ( let ii = 0; ii < views.length ; ++ ii ) {
    const view = views[ ii ];
    const camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.fromArray( view.eye );
    camera.up.fromArray( view.up );
    view.camera = camera;
  }

  camera2 = views[ 0 ].camera;
  camera3 = views[ 1 ].camera;


  controls2 = new THREE.OrbitControls( camera3, container );

  document.addEventListener('mousemove', function (event) {
    if(!isMoved){
      onDocumentMouseMove(event);
    }
  });

  clock = new THREE.Clock();

  window.removeEventListener('pointermove', onHover);

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  }


  // Define the onClick function
  function onHover(event) {
    // Create a raycaster to detect mouse clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Calculate the mouse coordinates in normalized device space (-1 to 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the raycaster's origin at the camera's position
    raycaster.setFromCamera(mouse, camera);

    // Find intersected objects
    const intersectsLine1 = raycaster.intersectObject(lineVertical);
    const intersectsLine2 = raycaster.intersectObject(lineHorizontal);

    // Check if mouse is close to the boundary lines
    const distanceThreshold = 0.05; // Adjust as needed
    const nearLine1 = intersectsLine1.length > 0 && intersectsLine1[0].distance < distanceThreshold;
    const nearLine2 = intersectsLine2.length > 0 && intersectsLine2[0].distance < distanceThreshold;

    // Update the display of sliders based on mouse position
    sliderVerticalElement.style.display = nearLine1 ? "block" : "none";
    sliderHorizontalElement.style.display = nearLine2 ? "block" : "none";
    if (nearLine1 || nearLine2) {
      console.log("got it");
      // Adjust the horizontal slider position if it's displayed
      initSlider();
    }
  }



  function initSlider() {
    // Function to handle pointer events for both sliders


    function onPointerDown() {
      if (event.isPrimary === false) return;
      //controls1.enabled = false;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerUp() {
      //controls1.enabled = false;
      isMoved = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      e.preventDefault();
      if (event.isPrimary === false) return;
      if (isVertical) {
        sliderVerticalPos = Math.max(0, Math.min(window.innerWidth, e.pageX));
        sliderVerticalElement.style.left = sliderVerticalPos - sliderVerticalElement.offsetWidth / 2 + 'px';
      } else {
        sliderHorizontalPos = Math.max(0, Math.min(window.innerHeight, e.pageY));
        sliderHorizontalElement.style.top = sliderHorizontalPos - sliderHorizontalElement.offsetHeight / 2 + 'px';
      }
    }

    // Attach pointer event listeners to both sliders
    sliderVerticalElement.addEventListener('pointerdown', function (event) {
      isVertical = true;
      isMoved = true;
      onPointerDown();
    });

    sliderHorizontalElement.addEventListener('pointerdown', function (event) {
      isVertical = false;
      isMoved = true;
      onPointerDown();
    });
  }


  function updateSize() {

      if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        renderer.setSize( windowWidth, windowHeight );

      }

  }

  //////////////////////////////////
  //Add tracking the model show on page
  //////////////////////

  function onDocumentMouseMove(event) {
    // Update mouseX and mouseY based on mouse coordinates
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  }

  //////////////////////////////////////

  function initRender() {
    views[ 0 ].updateCamera( camera2, scene2, mouseX, mouseY );

    renderer.setViewport( 0, 0, sliderVerticalPos, window.innerHeight );
    renderer.setScissor( 0, 0, sliderVerticalPos, window.innerHeight );
    renderer.render( scene1, camera1 );

    renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.render(scene3, camera3);

    renderer.setViewport( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
    renderer.setScissor( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight);
    renderer.render(scene2, useFPS ? fpsCamera : camera2);

    renderer.setScissorTest( true );

    camera1.aspect = window.innerWidth/ window.innerHeight;
    camera1.updateProjectionMatrix();

    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();

    camera3.aspect = window.innerWidth / window.innerHeight;
    camera3.updateProjectionMatrix();
  }


  function animate() {
    render();
    stats.begin();

    frameDelta += clock.getDelta();
    while (frameDelta >= INV_MAX_FPS) {
      update(INV_MAX_FPS);
      frameDelta -= INV_MAX_FPS;
    }

    stats.end();
    if (!paused) {
      requestAnimationFrame(animate);
    }
  }


  function render() {
  updateSize();
  initSlider();
  initRender();
  }


  // This is to set up map

  function startAnimating() {
    if (paused) {
      paused = false;
      controls.enabled = true;
      clock.start();
      requestAnimationFrame(animate);
    }
  }

  function stopAnimating() {
    paused = true;
    controls.enabled = false;
    clock.stop();
  }

  function setup() {
    setupControls();
    setupWorld();
    watchFocus();
    setupDatGui();
    startAnimating();
  }


  function setupControls() {
    fpsCamera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    scene2.add(fpsCamera);
    controls = new THREE.FirstPersonControls(fpsCamera, container);
    controls.enabled = false;
    controls.movementSpeed = 100;
    controls.lookSpeed = 0.075;
  }


  function setupWorld() {
    new THREE.TextureLoader().load('../static/src/lib/THREE.Terrain/demo/img/sky1.jpg', function(t1) {
      t1.minFilter = THREE.LinearFilter; // Texture is not a power-of-two size; use smoother interpolation.
      skyDome = new THREE.Mesh(
        new THREE.SphereGeometry(8192, 16, 16, 0, Math.PI*2, 0, Math.PI*0.5),
        new THREE.MeshBasicMaterial({map: t1, side: THREE.BackSide, fog: false})
      );
      skyDome.position.y = -99;
      scene2.add(skyDome);
      const skyDomeClone = skyDome.clone();
      scene3.add(skyDomeClone);
    });

    water = new THREE.Mesh(
      new THREE.PlaneGeometry(16384+1024, 16384+1024, 16, 16),
      new THREE.MeshLambertMaterial({color: 0x006ba0, transparent: true, opacity: 0.6})
    );
    water.position.y = -99;
    water.rotation.x = -0.5 * Math.PI;
    scene2.add(water);
    const waterClone = water.clone();
    scene3.add(waterClone);

    skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
    skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
    scene2.add(skyLight);
    const skyLightClone = skyLight.clone();
    scene3.add(skyLightClone);
    var light = new THREE.DirectionalLight(0xc3eaff, 0.75);
    light.position.set(-1, -0.5, -1);
    scene2.add(light);
    const lightClone = light.clone();
    scene3.add(lightClone);
  }

  function setupDatGui() {
    var heightmapImage = new Image();
    heightmapImage.src = '../static/src/lib/THREE.Terrain/demo/img/heightmap.png';
    function Settings() {
      var that = this;
      var mat = new THREE.MeshBasicMaterial({color: 0x5566aa, wireframe: true});
      var gray = new THREE.MeshPhongMaterial({ color: 0x88aaaa, specular: 0x444455, shininess: 10 });
      var blend;
      var elevationGraph = document.getElementById('elevation-graph'),
          slopeGraph = document.getElementById('slope-graph'),
          analyticsValues = document.getElementsByClassName('value');
      var loader = new THREE.TextureLoader();
      loader.load('../static/src/lib/THREE.Terrain/demo/img/sand1.jpg', function(t1) {
        t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
        sand = new THREE.Mesh(
          new THREE.PlaneGeometry(16384+1024, 16384+1024, 64, 64),
          new THREE.MeshLambertMaterial({map: t1})
        );
        sand.position.y = -101;
        sand.rotation.x = -0.5 * Math.PI;
        scene2.add(sand);
        const sandClone = sand.clone();
        scene3.add(sandClone);
        loader.load('../static/src/lib/THREE.Terrain/demo/img/grass1.jpg', function(t2) {
          loader.load('../static/src/lib/THREE.Terrain/demo/img/stone1.jpg', function(t3) {
            loader.load('../static/src/lib/THREE.Terrain/demo/img/snow1.jpg', function(t4) {
              // t2.repeat.x = t2.repeat.y = 2;
              blend = THREE.Terrain.generateBlendedMaterial([
                {texture: t1},
                {texture: t2, levels: [-80, -35, 20, 50]},
                {texture: t3, levels: [20, 50, 60, 85]},
                {texture: t4, glsl: '1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)'},
                {texture: t3, glsl: 'slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2'}, // between 27 and 45 degrees
              ]);
              that.Regenerate();
            });
          });
        });
      });
      this.easing = 'Linear';
      this.heightmap = 'PerlinDiamond';
      this.smoothing = 'None';
      this.maxHeight = 200;
      this.segments = 63;
      this.steps = 1;
      this.turbulent = false;
      this.size = 1024;
      this.sky = true;
      this.texture = 'Blended';
      this.edgeDirection = 'Normal';
      this.edgeType = 'Box';
      this.edgeDistance = 256;
      this.edgeCurve = 'EaseInOut';
      this['width:length ratio'] = 1.0;
      this['Flight mode'] = useFPS;
      this['Light color'] = '#' + skyLight.color.getHexString();
      this.spread = 60;
      this.scattering = 'PerlinAltitude';
      this["Enable SubAudio"] = isAudioFinder;
      this["Sound Activate"] = function () {
        that.soundActivate();
      };
      this.after = function(vertices, options) {
        if (that.edgeDirection !== 'Normal') {
          (that.edgeType === 'Box' ? THREE.Terrain.Edges : THREE.Terrain.RadialEdges)(
            vertices,
            options,
            that.edgeDirection === 'Up' ? true : false,
            that.edgeType === 'Box' ? that.edgeDistance : Math.min(options.xSize, options.ySize) * 0.5 - that.edgeDistance,
            THREE.Terrain[that.edgeCurve]
          );
        }
      };
      window.rebuild = this.Regenerate = function() {
        var s = parseInt(that.segments, 10),
            h = that.heightmap === 'heightmap.png';
        var o = {
          after: that.after,
          easing: THREE.Terrain[that.easing],
          heightmap: h ? heightmapImage : (that.heightmap === 'influences' ? customInfluences : THREE.Terrain[that.heightmap]),
          material: that.texture == 'Wireframe' ? mat : (that.texture == 'Blended' ? blend : gray),
          maxHeight: that.maxHeight - 100,
          minHeight: -100,
          steps: that.steps,
          stretch: true,
          turbulent: that.turbulent,
          xSize: that.size,
          ySize: Math.round(that.size * that['width:length ratio']),
          xSegments: s,
          ySegments: Math.round(s * that['width:length ratio']),
        };
        scene2.remove(terrainScene);
        scene3.remove(clonedTerrainScene);
        terrainScene = THREE.Terrain(o);
        clonedTerrainScene = terrainScene.clone();
        camera3.lookAt(clonedTerrainScene.position);
        applySmoothing(that.smoothing, o);
        scene2.add(terrainScene);
        scene3.add(clonedTerrainScene);
        skyDome.visible = sand.visible = water.visible = that.texture != 'Wireframe';
        var he = document.getElementById('heightmap');
        if (he) {
          o.heightmap = he;
          THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.attributes.position.array, o);
        }
        that['Scatter meshes']();
        lastOptions = o;   
      };
      function altitudeProbability(z) {
        if (z > -80 && z < -50) return THREE.Terrain.EaseInOut((z + 80) / (-50 + 80)) * that.spread * 0.002;
        else if (z > -50 && z < 20) return that.spread * 0.002;
        else if (z > 20 && z < 50) return THREE.Terrain.EaseInOut((z - 20) / (50 - 20)) * that.spread * 0.002;
        return 0;
      }
      this.altitudeSpread = function(v, k) {
        return k % 4 === 0 && Math.random() < altitudeProbability(v.z);
      };



      /////////////////////////////////////////////

      //AudioSettings
      ////////////////////////////////////////////////
       
      // Function display settings constructor
        this.Soundsettings = function() {
          var that = this;
          this.listener = new THREE.AudioListener();
          this.oscillator = that.listener.context.createOscillator();
          
          if (useFPS) {
            fpsCamera.add( that.listener );
          }

          sound1 = new THREE.PositionalAudio( that.listener );
          sound2 = new THREE.PositionalAudio( that.listener );
          that.oscillator.type = 'sine';
          that.oscillator.frequency.setValueAtTime( 144, sound2.context.currentTime );
          that.oscillator.start( 0 );
          sound2.setNodeSource( that.oscillator );
          sound2.setRefDistance( 20 );
          sound2.setVolume( 0.5 );
      
          
          analyser1 = new THREE.AudioAnalyser( sound1, 32 );
          analyser2 = new THREE.AudioAnalyser( sound2, 32 );

          const SoundControls = function () {
              this.master = that.listener.getMasterVolume();
              this.msound1 = sound1.getVolume();
              this.msound2 = sound2.getVolume();
          };
          const GeneratorControls = function () {
              this.frequency = that.oscillator.frequency.value;
              this.wavetype = that.oscillator.type;
          };
          this.soundControls = new SoundControls();
          this.generatorControls = new GeneratorControls(); 
          this.removeAudioFinder = function () {
          console.log("this function addAudioFinder is triggered");
          // load a sound and set it as the PositionalAudio object's buffer

          // Fix deactivate the audio source
            if (sound1 && !isAudioFinder) {
              sound1.pause();
              sound1.currentTime = 0;
            }
            
            if (sound2 && that.oscillator && !isAudioFinder) {
              sound2.context.currentTime = 0;
              that.oscillator.stop();
              sound2.pause();
              sound2.disconnect();
              sound2.setVolume( 0 );
            }
        };  
        this.addAudioFinder = function (songElement, model) {
          console.log("this function addAudioFinder is triggered");
        // load a sound and set it as the PositionalAudio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( songElement, function( buffer ) {
          sound1.setBuffer( buffer );
          sound1.setRefDistance( 20 );
          if (isAudioFinder) {
              sound1.play();
              console.log("this condition audioFinder is met");
          }
        });

        // finally add the sound to the mesh
          model.add( sound1 );
          model.add( sound2 );

          animate();

          // analysers

          function animate() {

            requestAnimationFrame( animate );
            render();

          }

        function render() {

          const delta = clock.getDelta();

          controls.update( delta );

          model.material.emissive.b = analyser1.getAverageFrequency() / 256;
          model.material.emissive.b = analyser2.getAverageFrequency() / 256;

          renderer.setViewport( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
          renderer.setScissor( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight);
          renderer.render(scene2, fpsCamera);

          renderer.setScissorTest( true );

         }

      }
  };
      this['Scatter meshes'] = function() {
        var s = parseInt(that.segments, 10),
            spread,
            randomness;
        var o = {
          xSegments: s,
          ySegments: Math.round(s * that['width:length ratio']),
        };
        if (that.scattering === 'Linear') {
          spread = that.spread * 0.0005;
          randomness = Math.random;
        }
        else if (that.scattering === 'Altitude') {
          spread = that.altitudeSpread;
        }
        else if (that.scattering === 'PerlinAltitude') {
          spread = (function() {
            var h = THREE.Terrain.ScatterHelper(THREE.Terrain.Perlin, o, 2, 0.125)(),
                hs = THREE.Terrain.InEaseOut(that.spread * 0.01);
            return function(v, k) {
              var rv = h[k],
                  place = false;
              if (rv < hs) {
                place = true;
              }
              else if (rv < hs + 0.2) {
                place = THREE.Terrain.EaseInOut((rv - hs) * 5) * hs < Math.random();
              }
              return Math.random() < altitudeProbability(v.z) * 5 && place;
            };
          })();
        }
        else {
          spread = THREE.Terrain.InEaseOut(that.spread*0.01) * (that.scattering === 'Worley' ? 1 : 0.5);
          randomness = THREE.Terrain.ScatterHelper(THREE.Terrain[that.scattering], o, 2, 0.125);
        }
        var sceneArr = [];  
        var sceneList = [
           viewDisplay1,
           viewDisplay2
           
        ];
        var geo = terrainScene.children[0].geometry;
        clonedGeo = geo.clone();
        terrainScene.remove(decoScene);
        clonedTerrainScene.remove(cloneddecoScene);
        // Call the loadObject function to load the object and handle it asynchronously

         new THREE.GLTFLoader().load('../static/src/assets/dataset/models/gallery/scene.gltf', function (gltf) {
              let scale = 0.1;
              gltf.scene.traverse(function (child) {
                  if (child.isMesh) {
                      child.castShadow = true;
                      child.frustumCulled = false;

                      // Apply the scale and position adjustments to the geometry vertices
                      child.scale.set(scale, scale, scale);
                      child.geometry.computeVertexNormals();
                  }
              });
                      // Call ScatterGLTFModels here after symbol is assigned
                 var meshList = [
                    {
                        mesh: buildTreeType1(), // Assign your single mesh to the 'mesh' property

                    },
                      {
                        mesh: buildTreeType2(), // Assign your single mesh to the 'mesh' property
                    },
                    {
                        mesh: gltf.scene, // Assign your single mesh to the 'mesh' property
                        numObjects: 2 // Specify the number of 'mesh' objects to scatter
                    },
                  ];

                  decoScene = THREE.Terrain.ScatterMeshes(geo, {
                  mesh: meshList,
                  w: s,
                  h: Math.round(s * that['width:length ratio']),
                  spread: spread,
                  smoothSpread: that.scattering === 'Linear' ? 0 : 0.2,
                  randomness: randomness,
                  maxSlope: 0.6283185307179586, // 36deg or 36 / 180 * Math.PI, about the angle of repose of earth
                  maxTilt: 0.15707963267948966, //  9deg or  9 / 180 * Math.PI. Trees grow up regardless of slope but we can allow a small variation
                   });

                 var decoSceneAdded = false; // Initialize a flag to false

                if (decoScene && !decoSceneAdded) {
                    cloneddecoScene = decoScene.clone();
                    terrainScene.add(decoScene);
                    cloneddecoScene.position.y = decoScene.position.y - 20;
                    clonedTerrainScene.add(cloneddecoScene);
                    decoSceneAdded = true; // Set the flag to true to indicate that it has been added
                    // Iterate through the children of decoScene
                    decoScene.children.forEach(function (child) {
                      if (child.name === "Sketchfab_Scene") {
                          sceneArr.push(child.uuid); // Add the UUID to the array if the name matches
                      }
                    });
                  }

                  // Create a copy of sceneArr and shuffle it to get a random order
                  const shuffledSceneArr = shuffle(sceneArr);

                  // Create an array to store pairs of models and scenes
                  const modelScenePairs = [];

                  // Iterate through the shuffledSceneArr and sceneList simultaneously
                  for (let i = 0; i < shuffledSceneArr.length && i < sceneList.length; i++) {

                      const modelID = shuffledSceneArr[i]; // Get a random model ID
                      const sceneView = sceneList[i]; // Get a scene from sceneList

                      // Create a pair of model ID and sceneView
                      modelScenePairs.push({ modelID, sceneView });
                  }

                decoScene.children.forEach(function (child) {
                    const childUUID = child.uuid;

                    // Check if the childUUID matches any modelID in modelScenePairs
                    const matchingPair = modelScenePairs.find(pair => pair.modelID === childUUID);

                    if (matchingPair) {
                      if (child.uuid === matchingPair.modelID && matchingPair.sceneView){
                        console.log("child", child);
                        console.log("sceneView", matchingPair.sceneView);
                        generatedModels.push(child);
                        document.addEventListener('mousedown', function(event) {
                           onClick(event, child, decoScene, camera2, matchingPair.sceneView);
                        });
                      }
                      return; // Exit the loop when a match is found
                    }

                });

        },undefined, function (error) {
              console.error('Error loading the GLTF model:', error);
          });

        };
         
        this.soundActivate = function () {
              const songElement = '../static/src/lib/THREEJS/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3';
              // Assign new material for the child
              var materialTreasure = new THREE.MeshPhongMaterial( { color: 0xffaa00, flatShading: true, shininess: 0 } );
              if (generatedModels.length > 0) {
               generatedModels.forEach(function (model) {
                  model.material = materialTreasure; // Assign the new material to the child
                  const soundsettings = new that.Soundsettings();
                  soundsettings.addAudioFinder(songElement, model);
            });
        }
      };
    
    }

  /////////////////////////////////////////////////////////////////////////////////

  //section4

  /////////////////////////////////////
  function customSettings() {
      var that = this;
      this.backgroundmusic = defaultSettings.audioURL;
      this.foundURL = null;
      this.audioURL = null;
      this['Wall Type'] = 'Line';
      this.width = 1;
      this.depth = 1;
      this.height = 1;
      this.mode = 'random';
      this.radius = 1;
      this.length = 1;
      this.segments = 20;
      this['Model Options'] = 'Soldier';
      this["Enable Audio"] = activateAudio;
      this.pitch = defaultSettings.pitch;
      this.delayVolume = defaultSettings.delayVolume;
      this.delayOffset = defaultSettings.delayOffset;
      this.after = function() {
      for (const [key, value] of Object.entries(soundtrackList)) {
          if (key === that.backgroundmusic) {
            console.log(that.backgroundmusic);
              console.log('Matching pair:', key, value);
              that.foundURL = value;
              return (that.foundURL);
          }
      }
    };
      this.RegenerateAudio = function() {
        that['Replay Audio']();
      };
       this['Start Audio'] = function() {
        audioTriggered =false;
        resetTriggered =false;
        localStorage.setItem("audioTriggered", audioTriggered);
        localStorage.setItem("resetTriggered", resetTriggered);
        var o = {
        after: that.after
        };
        that.initAudio(o);
     };
       this['Replay Audio'] = function() {
        console.log("this Replay Audio is triggered");
        if (audioElement || audioStore.length>0) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        audioTriggered = true;
        const audioFoundURL = that.after();
        localStorage.setItem("audioTriggered", audioTriggered);
        localStorage.setItem("soundURL", audioFoundURL);
        localStorage.setItem("pitch", that.pitch);
        localStorage.setItem("delayVolume", that.delayVolume);
        localStorage.setItem("delayOffset", that.delayOffset);
     };
      this['Reset Audio'] = function() {
        if (audioElement || audioStore.length>0) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioStore.length = 0;       
        }
        audioTriggered = true;
        localStorage.setItem("audioTriggered", audioTriggered);
      };
      this['Toggle Display'] = function() {
          toggleDisplay();
      };
     this['Regenerate Wall'] = function() {  
      console.log('function Regenerate Wall is executed');  
      that['Setup Wall']()
        .then((options) => {
          console.log("options", options);
          const geometry = THREE.Terrain.generateWall(clonedGeo, options);
          geometry.name = 'Wall Object';
          console.log("wallGeometry", geometry);
          let scale = 10;
          if (geometry && decoScene) {
             that.removeWallObjects(decoScene, scene3);
             geometry.matrix.identity();
             geometry.position.set(0, 0, 0);
             decoScene.add(geometry);
             console.log("wallGeometry", geometry);
             console.log("decoScene", decoScene);
          }
        })
      .catch((error) => {
        console.error("Error loading object:", error);
      });
      };
      this['Interactive Wall'] = function() {  
        that.removeWallObjects(decoScene, scene3);
        that.initWallGenerator(renderer, scene3, camera3);
      };
      this['Create3D Wall'] = function() { 
        that.removeWallObjects(decoScene, scene3);
        that.initWallGenerator(renderer, scene3, camera3);
      };
      this['InteractiveShape Wall'] = function() {  
        that.removeWallObjects(decoScene, scene3);
        that.initWallGenerator(renderer, scene3, camera3);
      };
      this['Remove Wall'] = function() {  
        that.removeWallObjects(decoScene, scene3); 
        isInteractiveWall = false;
        is3DWall = false;
        isInteractiveShape = false;
        console.log("isInteractiveWall",isInteractiveWall);
        console.log("is3DWall",is3DWall);
        console.log("isInteractiveShape",isInteractiveShape);
      };
      this['Setup Wall'] = function() {
          return new Promise((resolve, reject) => {
              var o = {
                  wallType: that['Wall Type'],
                  width: that.width,
                  depth: that.depth,
                  height: that.height,
                  radius: that.radius,
                  mode: 'random',
                  length: that.length,
                  segments: that.segments
              };
              resolve(o);
          });
      };
      this['IsolatorAudio'] = function () {
          that['Add IsolatorAudio']();            
      };
      this['trackModelPosition'] = function () {
           that.trackModelPosition ();            
      };
      this.initAudio = function (options) {      
        let audioURL;
        if (options === 'undefined') {
          audioURL = '../static/src/lib/THREEJS/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3';
          localStorage.setItem("soundURL", audioURL);
        }

       // Call the "after" callback
        if (typeof options.after === 'function') {
            audioURL = options.after();
            console.log('audioURL', audioURL);
        }

        console.log("the selected background", audioURL);

        initAudioScene(audioURL);
        };

        function loadAudioInitial() {
          audioTriggered = false;
          activateAudio = true;
          resetTriggered = false;
          localStorage.setItem("audioTriggered", audioTriggered);
          localStorage.setItem("resetTriggered", resetTriggered);
          var o = 'undefined';
          that.initAudio(o);
        }

        loadAudioInitial();    

    this.initWallGenerator = function (renderer, scene, camera) {
          console.log("isInteractiveWall",isInteractiveWall);
          console.log("is3DWall",is3DWall);
          console.log("isInteractiveShape",isInteractiveShape);
      // Enable event listeners for the active function
        if ( isInteractiveWall) {
          createInteractiveWall(renderer, scene, camera);
        } else if ( is3DWall ) {
          create3DWall(renderer, scene, camera);
        } else if ( isInteractiveShape ) {
          createInteractiveShape(renderer, scene, camera);
        } else {
          return;
        }
    };

  
  ///////////////////////////////////////////////////////
  //remove wall objects
  /////////////////////////////////

    var objectIDArr = [];

    function generateID(obj) {
        const randomId = function(length = 6) {
            return Math.random().toString(36).substring(2, length + 2);
        };

        const id = randomId();
        obj.name = id;
        objectIDArr.push(id);
        return id;
    }

    function addScene(obj) {
            generateID(obj);
            scene3.add(obj);

    }

    function addDecoScene(obj) {
        if (decoScene) {
            generateID(obj);
            decoScene.add(obj);
        }
    }

    this.addObjScene = function (obj) {
      if (obj) {
        var clonedObj = obj.clone();
        addScene(obj);
        addDecoScene(clonedObj);
      }
    };

    this.removeWallObjects = function(scene1, scene2) {
        const create3DBtnElement = document.getElementById('create3DBtn');

        if (create3DBtnElement) {
            document.body.removeChild(create3DBtnElement); // Remove the button element
        }

        // Remove the wall object from scene1
        const wall = scene1.getObjectByName('Wall Object');
        if (scene1 && wall) {
            scene1.remove(wall);
        }

        //window.removeEventListener("mousedown", eventOnMouseDown, false);
        //window.removeEventListener("mouseup", onMouseUp, false);
        
        removeObjScene(scene1);
        removeObjScene(scene2);

    };

    function removeObjScene (scene) {
      // Remove objects from scene2 using their custom IDs
      for (let i = 0; i < scene.children.length; i++) {
          const child = scene.children[i];
          if (objectIDArr.includes(child.name)) {
              scene.remove(child);
              i--; // Decrement i to account for the removed object
          }
      }
    }


  ///////////////////////////////////////////////////////
  //createInteractivewall
  /////////////////////////////////

  function createInteractiveWall(renderer, scene, camera) {

    console.log("this func createInteractiveWall is triggered");

      var line;
      var count = 0;
      var mouse = new THREE.Vector3();
      var mesh3D;
      var maxPoint = 6;
      var height = window.innerHeight;

      var plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); // facing us for mouse intersection
      var raycaster = new THREE.Raycaster();

      var point3ds = [];

      var usePerspectiveCamera = false; // toggles back and forth

      var perspOrbit;

      var orthoOrbit;
      var orthoCam;

      init();
      animate();

      function init() {

        camera.rotateX(-Math.PI / 2);
        camera.position.set(-100, 1000, 0);
        
        // camera ortho
        //var width = window.innerWidth;
        //var height = window.innerHeight;
        //orthoCam = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 1200);


        // assign cam
                
        someMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity:0.3});
        
        // grid
        //var grid = new THREE.GridHelper(1024, 56);
        //grid.rotateX(Math.PI / 2);
        //scene.add(grid);

        // geometry
        var geometry = new THREE.BufferGeometry();
        var MAX_POINTS = 2;
        positions = new Float32Array(MAX_POINTS * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // material
        var material = new THREE.LineBasicMaterial({
          color: 0xff0000,
          linewidth: 2
        });

        // line
        line = new THREE.Line(geometry, material);
        line.position.z = 0;
        that.addObjScene(line);

        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);

        createUI();
      }

      // update line
      function updateLine() {
        positions[count * 3 - 3] = mouse.x;
        positions[count * 3 - 2] = mouse.y;
        positions[count * 3 - 1] = mouse.z;
        line.geometry.attributes.position.needsUpdate = true;
      }

   
      // mouse move handler
       function onMouseMove(event) {
        if (isInteractiveWall === true) {
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) / (rect.right - rect.left) * 2 - 1;
        mouse.y = - ((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        mouse = raycaster.ray.intersectPlane(plane, mouse);
        
        if( count !== 0 && count < maxPoint){
          updateLine();
          }
        } else {
          return;
        }
      }

      // add point
      function addPoint(event){
        if(count < maxPoint){
          console.log("point nr " + count + ": " + mouse.x + " " + mouse.y + " " + mouse.z);
          positions[count * 3 + 0] = mouse.x;
          positions[count * 3 + 1] = mouse.y;
          positions[count * 3 + 2] = mouse.z
          count++;
          line.geometry.setDrawRange(0, count);
          updateLine();
          point3ds.push(new THREE.Vector3(mouse.x, mouse.y, mouse.z));
        } else {
          console.log('max points reached: ' + maxPoint);
        }
        
      }

      // mouse down handler
       function onMouseDown(evt) {
        if (isInteractiveWall === true) {
        // force add an extra point on first click so buffer line can display
        // buffer geometry requires two points to display, so first click should add two points
        if(count === 0){
          addPoint(); 
        }
        
        if(count < maxPoint){
          addPoint();
        }

        } else {
           return;
        }
    }

      // render
      function render() {
        // camera perspective
        renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
        renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
        renderer.render(scene, camera);
    
        renderer.setScissorTest( true );
      }

      // animate
      function animate() {
        requestAnimationFrame(animate);
        render();
      }

      // loop through all the segments and create their 3D
      function create3D(){
        if(!mesh3D && point3ds && point3ds.length){
          mesh3D = new THREE.Mesh();  // metpy mesh but is the root mesh for all 3D
          that.addObjScene(mesh3D);
          // prepare create segments from point3ds - every two points create a segement
          var index = 1;
          var segmentHeight = 200;
          point3ds.forEach( point3d => {
            if(index < point3ds.length){
              var seg = new Segment(point3d, point3ds[index], someMaterial, segmentHeight);
              mesh3D.add(seg.mesh3D);
              index++;
            }
          }); 
          
        }
      }

      function createUI(){

        // create3D
        var btn = document.createElement('button');
        btn.id = "create3DBtn";
        document.body.appendChild(btn);
        btn.innerHTML = 'Create3D';
        btn.id = 'create3DBtn';
        btn.addEventListener('pointerdown', () => {
          create3D();
       
        });

      }

      function reset(){
        scene.remove(mesh3D);
        mesh3D = null;
        for(var i=0; i<3*8; i++){
          positions[i] = 0;
        }
        count = 0;
        line.geometry.setDrawRange(0, count);
        updateLine();
        point3ds = [];
        
      }

      // each segment knows how to create its 3D
      class Segment{
        constructor(start, end, material, height){
          this.start = start;
          this.end = end;
          this.height = height; // height of the segment's 3D
          this.material = material;
          this.mesh3D = null;
          this.create3D();
        }
        create3D(){
          if(this.start && this.end){
            //create the shape geometry
            var distStartToEnd = this.start.distanceTo(this.end);
            
            var vec2s = [
              new THREE.Vector2(),
              new THREE.Vector2(0, this.height),
              new THREE.Vector2(distStartToEnd, this.height),
              new THREE.Vector2(distStartToEnd, 0)
            ];
            var shape = new THREE.Shape(vec2s);
            var geo = new THREE.ShapeGeometry(shape);
            geo.applyMatrix4(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(0)));
            this.mesh3D = new THREE.Mesh(geo, this.material);
            this.alignRotation();
            this.alignPosition();
            // the mesh3D should be added to the scene outside of this class
            
          }
        }
        alignRotation(){
          var p1 = this.start.clone();
          var p2 = this.end.clone();
          var direction = new THREE.Vector3();
          direction.subVectors(p2, p1);
          direction.normalize();
         
          this.mesh3D.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
        }
        alignPosition(){
          if(this.mesh3D){
            this.mesh3D.position.copy(this.start);
          }else {
            throw new Error('mesh3D null');
          }
        }
        
      }

  }



  ///////////////////////////////////////////////////////
  //create3Dwall
  /////////////////////////////////
  function create3DWall(renderer, scene, camera) {
      
      camera.rotateX(-Math.PI / 2);
      camera.position.set(-1000, 2000, 0);
      document.addEventListener("mousedown", onMouseDown, false);

      var objects = [];

      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      var intersects;
      var controlPoints = [];
      var pos = new THREE.Vector3();
      var clickCount = 0;
      var maxPoint = 2; // Change the maximum number of control points to 2

      
      var planeGeom = new THREE.PlaneGeometry(2000, 2000);
      planeGeom.rotateX(-Math.PI / 2);
      var plane = new THREE.Mesh(planeGeom, new THREE.MeshStandardMaterial({
        color: "green"
      }));
      plane.visible = false;
      that.addObjScene(plane);
      objects.push(plane);

        function onMouseDown(event) {
        if (is3DWall === true) {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          intersects = raycaster.intersectObjects(objects);
          
          if (intersects.length > 0) {
            if (clickCount < maxPoint) { // Check if we have fewer than 2 control points
              controlPoints[clickCount] = intersects[0].point.clone();
              var cp = new THREE.Mesh(new THREE.SphereGeometry(10, 100, 100), new THREE.MeshBasicMaterial({ color: "red" }));
              cp.position.copy(intersects[0].point);
              that.addObjScene(cp);         
              clickCount++;
            }

            if (clickCount === maxPoint) { // If we have 2 control points, create the wall
              shape = new THREE.Shape();
              shape = new THREE.Shape();
              // Adjust the X-coordinates to control the width of the wall
              shape.moveTo(controlPoints[0].x, -controlPoints[0].z);
              shape.lineTo(controlPoints[1].x, -controlPoints[0].z);
              shape.lineTo(controlPoints[1].x, -controlPoints[1].z);
              shape.lineTo(controlPoints[0].x, -controlPoints[1].z);
              shape.lineTo(controlPoints[0].x, -controlPoints[0].z);

              const extrudeSettings = {
                steps: 20,
                depth: 200, // Set the depth to control thickness along the Z-axis
                amount: 20, // Set the amount to control the height along the Y-axis (if Y is vertical)
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 10,
                bevelOffset: 0,
                bevelSegments: 1
              };

              var extrudeGeom = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
              extrudeGeom.rotateX(-Math.PI / 2);
              wall = new THREE.Mesh(extrudeGeom, new THREE.MeshStandardMaterial({ color: "gray" }));
              that.addObjScene(wall);       
              controlPoints = [];
              clickCount = 0;
            }
          }
          render();
    } else {
      return;
    }

  }

  function render() {
    requestAnimationFrame(render);
    // camera perspective
    renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.render(scene, camera);
    renderer.setScissorTest( true );
    }

}


  ///////////////////////////////////////////////////////
  //createInteractiveShape
  /////////////////////////////////
  function createInteractiveShape(renderer, scene, camera) {

      var plane = new THREE.Plane();
      plane.setFromCoplanarPoints(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1));

      var controlPoints = [];
      controlPoints.push(createPoint(new THREE.Vector3(-200, 0,  0), "white"));
      controlPoints.push(createPoint(new THREE.Vector3( 200, 0, -200), "white"));
      controlPoints.push(createPoint(new THREE.Vector3( 0, 0,  200), "white"));
      controlPoints.push(createPoint(new THREE.Vector3( 0, 0,  0), "white"));

      function createPoint(position, color){
        var viewGeometry = new THREE.BoxGeometry(.5, 1.55, .5, 1, 3, 1);
        viewGeometry.translate(0, .75, 0);
        viewGeometry.scale(20, 20, 20);

        var viewMaterial = new THREE.MeshBasicMaterial({color: color, wireframe: false, transparent: true, opacity: .5});
        var view = new THREE.Mesh(viewGeometry, viewMaterial);
        view.position.copy(position);
        that.addObjScene(view);       
        return view;
      }


  function createCurveGeometry(){
    var pts = [];
    controlPoints.forEach(pt => {
      pts.push(pt.position);
    });
    var curve = new THREE.CatmullRomCurve3( pts );
    curve.closed = true;
    var curveGeometry = new THREE.BufferGeometry();
    curveGeometry.vertices = curve.getPoints(75);
    curveGeometry.translate(0, 1, 0);
    return curveGeometry;
    }
    var curveMaterial = new THREE.LineBasicMaterial({color: "white"});
    var curveLine = new THREE.Line(createCurveGeometry(), curveMaterial);
    that.addObjScene(curveLine);       

    var extrudeSettings = { amount: 1, bevelEnabled: false};
    var points = [];
    var shape = null;
    var shapeGeometry;
    var shapeMaterial = [
      new THREE.MeshLambertMaterial({color:0xb5b5b5}),
      new THREE.MeshLambertMaterial({color:"aqua"})
    ]
    var shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    that.addObjScene(shapeMesh);       
    curveLine.geometry.vertices.forEach((vertex, index)=>{
      points.push(new THREE.Vector2(vertex.x, vertex.z)); // fill the array of points with THREE.Vector2() for re-use
    });
    function extrudeMesh(){
      curveLine.geometry.vertices.forEach((vertex, index)=>{
        points[index].set(vertex.x, vertex.z); // re-use the array
      });
      shape = new THREE.Shape(points);
      shapeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      shapeGeometry.rotateX(Math.PI * .5);
      shapeGeometry.translate(0, 1, 0);
      shapeMesh.geometry.dispose();
      shapeMesh.geometry = shapeGeometry;
    }
    extrudeMesh();

    window.addEventListener("mousedown", onMouseDown, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("mousemove", onMouseMove, false);

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var intersects;
    var dragging = false;
    var dragObject;
    var pointOfIntersection = new THREE.Vector3();
    var planeNormal = new THREE.Vector3(0, 1, 0);
    var shift = new THREE.Vector3();

    function onMouseDown(event){
      if (isInteractiveShape) {
      intersects = raycaster.intersectObjects(controlPoints);
      console.log("intersects", intersects);
      if (intersects.length > 0){
        controls.enableRotate = false;
        dragObject = intersects[0].object;
        plane.setFromNormalAndCoplanarPoint(planeNormal, intersects[0].point);
        shift.subVectors(dragObject.position, intersects[0].point);
        dragging = true;
      }
    }
  }


    function onMouseUp(event){
      if (isInteractiveShape) {
      controls.enableRotate = true;
      dragObject = null;
      dragging = false;
    }
  }

    function onMouseMove(event) {
    if (isInteractiveShape) {
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      if (intersects.length == 0 || !dragging) return;
      raycaster.ray.intersectPlane(plane, pointOfIntersection);
      dragObject.position.copy(pointOfIntersection).add(shift);
      curveLine.geometry.dispose();
      curveLine.geometry = createCurveGeometry();
      extrudeMesh();
    }
  }

      var time = 0;
      var curShift = 0;
      render();
      function render(){
        time = Date.now() * 0.001;
        requestAnimationFrame(render);
        raycaster.setFromCamera(mouse, camera);
        controlPoints.forEach((cp, idx) => {
          curShift = (Math.PI / 2) * idx;
          cp.material.opacity = 0.6 + Math.sin(time - curShift) * .2;
        });

        // camera perspective
        renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
        renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
        renderer.render(scene, camera);
        renderer.setScissorTest( true );
      }

  }



///////////////////////////

  //Audio Section

////////////////////////////


  function initAudioScene(audioURL) {
    console.log("this funtion initAudioScene is triggered");
    let audioPlaying = false;
    let audioStartTime = 0;

    const fftSize = 128;
    // Create a button element
    const audioContainerElement = document.createElement('div');
    audioContainerElement.id = 'audio-container'; // Set the button's id attribute (if needed)
    audioContainerElement.style.width = '256px';
    audioContainerElement.style.height = '128px';
    audioContainerElement.style.left = '0';
    audioContainerElement.style.top = '0';
    audioContainerElement.style.position = 'absolute';
    audioContainerElement.style.display = 'flex';
    document.body.appendChild(audioContainerElement); // Add the button to the body element


    const containerWidth = audioContainerElement.clientWidth;
    const containerHeight = audioContainerElement.clientHeight;


    // Create a button element
    const startButton = document.createElement('button');

    // Set button attributes (e.g., text content, id, class, etc.)
    startButton.textContent = 'START'; // Set the button's text content
    startButton.id = 'startButton'; // Set the button's id attribute (if needed)
    // Add the button to the HTML document (e.g., to a specific container)
    audioContainerElement.appendChild(startButton); // Add the button to the body element

    // Create the scene, camera, and renderer
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerWidth, containerHeight);
    audioContainerElement.appendChild(renderer.domElement);

    const camera = new THREE.Camera();

    // Create an audio listener and element
    const listener = new THREE.AudioListener();
    audioElement = new THREE.Audio(listener);

    const loader = new THREE.AudioLoader();

    // Load the audio file
    console.log('audioURLtest3', audioURL);
    loader.load(audioURL, function (buffer) {
      console.log('Audio loaded successfully');
      audioElement.setBuffer(buffer);
      audioElement.setLoop(true); // Enable looping
      audioElement.setVolume(1); // Set volume (adjust as needed)
      audioStore.push(audioElement);
    });

    // Create an analyser
    const analyser = new THREE.AudioAnalyser(audioElement, fftSize);

    // Create uniforms for the audio visualization shader
    const format = renderer.capabilities.isWebGL2 ? THREE.RedFormat : THREE.LuminanceFormat;
    const uniforms = {
      tAudioData: { value: new THREE.DataTexture(analyser.data, fftSize / 2, 1, format) },
    };

    // Create the audio visualization material and mesh
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Function to toggle audio playback
    startButton.addEventListener('pointerdown', function() {
    console.log('button clicked');
      if (audioPlaying && audioElement) {
        // Calculate the remaining time in the loop
        const currentTime = audioElement.context.currentTime;
        // Pause the audio at the current position
        audioElement.pause();
        audioPlaying = false;
      } else {
        // Start audio playback
        audioElement.play();
        audioPlaying = true;
        audioStartTime = audioElement.context.currentTime;
      }
    });

    // Animation loop
    animate();

    function onWindowResize() {
      renderer.setSize(containerWidth, containerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      analyser.getFrequencyData();
      uniforms.tAudioData.value.needsUpdate = true;
      renderer.render(scene, camera);
    }
  }



  ////////////////////////////
    function toggleDisplay() {
       // Create a button element
      const audioContainerElement = document.getElementById('audio-container');
      if (audioContainerElement) {
          audioContainerElement.style.display =
          audioContainerElement.style.display === "block" ? "none" : "block";
      }
  }

  ////////////////////////////////////////////////////////////////////////////////

  //Add footstep sound effects

  //////////////////////////////////////////////////
    const loader = new THREE.GLTFLoader();

    function audioModelLoader (model, soundModelURL) {
        // create an AudioListener and add it to the camera
      const listener = new THREE.AudioListener();

      // create the PositionalAudio object (passing in the listener)
      const sound = new THREE.PositionalAudio( listener );

      // load a sound and set it as the PositionalAudio object's buffer
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load( soundModelURL, function( buffer ) {
        sound.setBuffer( buffer );
        sound.setRefDistance( 20 );
      });

      // finally add the sound to the mesh
      model.add( sound );

      return sound;
    }

  ////////////////////////////////////////////////////////////////////
  // Model1 Variables
  ////////////////////////////////////////
    let skeleton, mixer;

    const crossFadeControls = [];

    let idleAction, walkAction, runAction;
    let idleWeight, walkWeight, runWeight;
    let actions, md1Settings;

    let singleStepMode = false;
    let sizeOfNextStep = 0;

  ////////////////////////////////////////////////////////////////////
  // Model2 Variables
  ////////////////////////////////////////
    const crossFadeControlsModel2 = [];
    let panelSettings, numAnimations;

    let currentBaseAction = 'idle';
    const allActions = [];
    const baseActions = {
      idle: { weight: 1 },
      walk: { weight: 0 },
      run: { weight: 0 }
    };
    const additiveActions = {
      sneak_pose: { weight: 0 },
      sad_pose: { weight: 0 },
      agree: { weight: 0 },
      headShake: { weight: 0 }
    };

  ////////////////////////////////////////////////////////////////////
  // Model3 Variables
  ////////////////////////////////////////
    let activeAction, previousAction;

    const api = { state: 'Walking' };

  ////////////////////////////////////////////////////////////////////
  //Settings for GLTF models
  ////////////////////////////////////////

  function addLightModels(renderer, scene, camera) {

        let spotLight, lightHelper;

        init();

        function init() {

          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;


          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1;

          renderer.setAnimationLoop( render );

          const controls = new THREE.OrbitControls( camera, renderer.domElement );
          controls.minDistance = 2;
          controls.maxDistance = 10;
          controls.maxPolarAngle = Math.PI / 2;
          controls.target.set( 0, 1, 0 );
          controls.update();

          const ambient = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 0.15 );
          scene.add( ambient );

          const loader = new THREE.TextureLoader().setPath( '../static/src/lib/THREEJS/examples/textures/' );
          const filenames = [ 'disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg' ];

          const textures = { none: null };

          for ( let i = 0; i < filenames.length; i ++ ) {

            const filename = filenames[ i ];

            const texture = loader.load( filename );
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.colorSpace = THREE.SRGBColorSpace;

            textures[ filename ] = texture;

          }

          spotLight = new THREE.SpotLight( 0xffffff, 100 );
          spotLight.position.set( 2.5, 5, 2.5 );
          spotLight.angle = Math.PI / 6;
          spotLight.penumbra = 1;
          spotLight.decay = 2;
          spotLight.distance = 0;
          spotLight.map = textures[ '../static/src/lib/THREEJS/examples/textures/disturb.jpg' ];

          spotLight.castShadow = true;
          spotLight.shadow.mapSize.width = 1024;
          spotLight.shadow.mapSize.height = 1024;
          spotLight.shadow.camera.near = 1;
          spotLight.shadow.camera.far = 10;
          spotLight.shadow.focus = 1;
          scene.add( spotLight );

          lightHelper = new THREE.SpotLightHelper( spotLight );
          scene.add( lightHelper );

        const gui = new dat.GUI( { id: 'lightPanel' } );
        //panel1.domElement.id = 'panel1';

        const params = {
          map: textures[ 'disturb.jpg' ],
          color: spotLight.color.getHex(),
          intensity: spotLight.intensity,
          distance: spotLight.distance,
          angle: spotLight.angle,
          penumbra: spotLight.penumbra,
          decay: spotLight.decay,
          focus: spotLight.shadow.focus,
          shadows: true
        };

        gui.add( params, 'map', textures ).onChange( function ( val ) {

          spotLight.map = val;

        } );

        gui.addColor( params, 'color' ).onChange( function ( val ) {

          spotLight.color.setHex( val );

        } );

        gui.add( params, 'intensity', 0, 500 ).onChange( function ( val ) {

          spotLight.intensity = val;

        } );


        gui.add( params, 'distance', 50, 200 ).onChange( function ( val ) {

          spotLight.distance = val;

        } );

        gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {

          spotLight.angle = val;

        } );

        gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {

          spotLight.penumbra = val;

        } );

        gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {

          spotLight.decay = val;

        } );

        gui.add( params, 'focus', 0, 1 ).onChange( function ( val ) {

          spotLight.shadow.focus = val;

        } );


        gui.add( params, 'shadows' ).onChange( function ( val ) {

          renderer.shadowMap.enabled = val;

          scene.traverse( function ( child ) {

            if ( child.material ) {

              child.material.needsUpdate = true;

            }

          } );

        } );

        gui.open();

      }

}

  function addSettingsModel1(gltf) {
      
        console.log('this addSettingsModel1 func is triggered');
        console.log('this gltf.scene', gltf.scene);
          const skeleton = new THREE.SkeletonHelper(gltf.scene);
          gltf.scene.position.setY(-0.8);
          skeleton.visible = false;
          scene1.add(gltf.scene);
          gltf.scene.rotateY(Math.PI);
          scene1.add(skeleton);
          const animations = gltf.animations;
          mixer = new THREE.AnimationMixer(gltf.scene);

          this.showModel = function ( visibility ) {

              gltf.scene.visible = visibility;

          };

          
          this.showSkeleton = function ( visibility ) {

            skeleton.visible = visibility;

          };


          this.modifyTimeScale = function ( speed ) {
            mixer.timeScale = speed;
          };

        createPanel1();

        idleAction = mixer.clipAction(animations[0]);
        walkAction = mixer.clipAction(animations[3]);
        runAction = mixer.clipAction(animations[1]);
        actions = [idleAction, walkAction, runAction];

        animateModel1(gltf.scene);
        addLightModels(renderer, scene1, camera1);
        const soundModelURL = '../static/src/lib/THREEJS/examples/sounds/concrete-footsteps-6752.mp3';
        audio1 = audioModelLoader (gltf.scene, soundModelURL);
        audio1.autoplay = false;
        audio1.pause();
  }



  function addSettingsModel2(gltf) {
     const skeleton = new THREE.SkeletonHelper(gltf.scene);
      scene1.add(gltf.scene);
      gltf.scene.rotateY(Math.PI);
      skeleton.visible = false;
      const animations = gltf.animations;
      const mixer = new THREE.AnimationMixer(gltf.scene);
      scene1.add(skeleton);

      const numAnimations = animations.length;

      for (let i = 0; i !== numAnimations; ++i) {
        let clip = animations[i];
        const name = clip.name;

        if (baseActions[name]) {
          const action = mixer.clipAction(clip);
          activateActionModel2(action);
          baseActions[name].action = action;
          allActions.push(action);
        } else if (additiveActions[name]) {
          THREE.AnimationUtils.makeClipAdditive(clip);
          if (clip.name.endsWith('_pose')) {
            clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
          }
          const action = mixer.clipAction(clip);
          activateActionModel2(action);
          additiveActions[name].action = action;
          allActions.push(action);
        }
      }
      createPanel2();
      animateModel2();
      addLightModels(renderer, scene1, camera1);
      const soundModelURL = '../static/src/lib/THREEJS/examples/sounds/concrete-footsteps-6752.mp3';
      audio2 = audioModelLoader (gltf.scene, soundModelURL);
      audio2.autoplay = false;
      audio2.pause();
  }


  function addSettingsModel3(gltf) {
      resetAudio();
      createGUI( gltf.scene, gltf.animations );
      scene1.add(gltf.scene);
      gltf.scene.rotateY(Math.PI);
      animateModel3();
      addLightModels(renderer, scene1, camera1);
      const soundModelURL = '../static/src/lib/THREEJS/examples/sounds/concrete-footsteps-6752.mp3';
      audio3 = audioModelLoader (gltf.scene, soundModelURL);
      audio3.autoplay = false;
      audio3.pause();
  }


  function addModeltoDecoScene(gltf, scale, layer) {
    console.log('this function addModeltoDecoScene is triggered');
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.frustumCulled = false;

        // Apply the scale adjustment to the geometry vertices
        child.geometry.scale(scale, scale, scale);

        // Compute vertex normals after scaling
        child.geometry.computeVertexNormals();
        //child.geometry.attributes.position.needsUpdate = true;
        child.layers.set( la=yer );
        }
      });


      console.log(gltf.scene);

      scene3.add(gltf.scene); 
}


function audioIsolator (wallgeometry, gltf, scene, camera, soundURL) {
      console.log('This func audioIsolator is triggered');
         const reflectionCube = new THREE.CubeTextureLoader()
        .setPath( '../static/src/lib/THREEJS/examples/textures/cube/SwedishRoyalCastle/' )
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
        const boomBox = gltf.scene;

      boomBox.position.x = wallgeometry.position.x;
      boomBox.position.y = wallgeometry.position.y + 30;
      boomBox.position.z = wallgeometry.position.y - 50;
      //boomBox.rotation.copy(wall.rotation);

      //object.rotation.x = transform.rotation.x;
      //object.rotation.y = transform.rotation.z;
      //object.rotation.z = - transform.rotation.y;

        boomBox.scale.set( 1, 1, 1 );

        boomBox.traverse( function ( object ) {

          if ( object.isMesh ) {

            object.material.envMap = reflectionCube;
            object.geometry.rotateY( - Math.PI );
            object.castShadow = true;

          }

        });

        const listener = new THREE.AudioListener();
        camera.add( listener );

        // load a sound and set it as the PositionalAudio object's buffer
        const positionalAudio = new THREE.PositionalAudio( listener );
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( soundURL, function( buffer ) {
          positionalAudio.setBuffer( buffer );
          positionalAudio.setRefDistance( 20 );
          positionalAudio.setDirectionalCone( 180, 230, 0.1 );
          positionalAudio.play();
        });

        const helper = new THREE.PositionalAudioHelper( positionalAudio, 0.1 );
        positionalAudio.add( helper );
        boomBox.add( positionalAudio );
        scene.add( boomBox );
}




  ////////////////////////////////////////////////////////////////////
  //Loading GLTF models
  ////////////////////////////////////////

    Promise.all([
      // Model 1
      new Promise((resolve) => {
        loader.load('../static/src/lib/THREEJS/examples/models/gltf/Soldier.glb', function (gltf) {
        let scale = 100;
        let layer = 8;
        addSettingsModel1(gltf);
        //addModeltoDecoScene(gltf, scale, layer);
        resolve(gltf);
        });
      }),

      // Model 2
      new Promise((resolve) => {
        loader.load('../static/src/lib/THREEJS/examples/models/gltf/Xbot.glb', function (gltf) { 
        let scale = 100;
        let layer = 9;
        //addModeltoDecoScene(gltf, scale, layer);   
        resolve(gltf);
        });
      }),

      // Model 3
      new Promise((resolve, reject) => {
        loader.load('../static/src/lib/THREEJS/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {
          resolve(gltf);
        }, undefined, function (e) {
          reject(e);
        });
      }),


      // Model 4
      new Promise((resolve, reject) => {
        loader.load('../static/src/assets/media/gltf/tracker/junk-yard-robot-boy/source/multiclip.gltf', function (gltf) {
        let scale = 1;
        let layer = 10;
        //addModeltoDecoScene(gltf, scale, layer);  
          resolve(gltf);
        }, undefined, function (e) {
          reject(e);
        });       
      }),

       // Model 5
      new Promise((resolve, reject) => {
        loader.load('../static/src/lib/THREEJS/examples/models/gltf/BoomBox.glb', function (gltf) {
          resolve(gltf);
        }, undefined, function (e) {
          reject(e);
        });       
      }),
    ]).then((results) => {
      const [Soldier, SkinningRobot, AnimatedRobot, RobotBoy, BoomBox] = results;
      console.log("boomBox", results.boomBox);
      this['Add IsolatorAudio'] = function () {
         if (decoScene) {
            const wall = decoScene.getObjectByName('Wall Object');
            console.log('wall', wall);
            if (wall) {
              const audioURL = '../static/src/lib/THREEJS/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3';
              audioIsolator(wall, results[4], scene2, fpsCamera, audioURL);
              console.log("scene 2 is added audioIsolator");
            }
          }
      };
      this.trackModelPosition = function () {

          function trackFPSCameraPosition (results, offsetX, renderer) {
            if (results.length > 0) {
              const firstModel = results[0].scene;
              
            // Copy the camera's position (x and y) to the model in another scene
              firstModel.position.x = Math.round(fpsCamera.position.x);
              firstModel.position.y = Math.round(fpsCamera.position.y);
              firstModel.updateMatrixWorld(); // Update world matrix

              results[1].scene.position.x = firstModel.position.x + offsetX;
              results[1].scene.position.y = firstModel.position.y;
              results[1].scene.updateMatrixWorld(); // Update world matrix

              results[3].scene.position.x = results[1].scene.position.x + offsetX;
              results[3].scene.position.y = results[1].scene.position.y;
              results[3].scene.updateMatrixWorld(); // Update world matrix

              }
           }

           function animate() {
              // Update your scene here, such as moving objects, updating animations, etc.

              // Call the trackModelPosition function to update model positions
              let offsetX = 100;
              trackFPSCameraPosition(results, offsetX, renderer);


              // Render the current frame
              renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
              renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
              renderer.render(scene3, camera3);

              // Request the next frame
              requestAnimationFrame(animate);
          }
              // Start the animation loop
              animate();
    };
      // You need to replace 'i' with the appropriate index for each condition.
      // Ensure that 'audioIsolator', 'resetDefault', 'addSettingsModelX', and 'activateSoundtrack'
      // functions are defined and working correctly.
      this['Model Select'] = function () {
        console.log("this function Model Select is triggered");
        console.log('Model Selected', that['Model Options']);
        // First, remove all children from the scene
        while (scene1.children.length > 0) {
          const child = scene1.children[0];
          scene1.remove(child);
        }

        if (that['Model Options'] === 'Soldier') {
          resetDefault();
          addSettingsModel1(results[0]);
        } else if (that['Model Options'] === 'SkinningRobot') {
          resetDefault();
          addSettingsModel2(results[1]);
        } else if (that['Model Options'] === 'AnimatedRobot') {
          resetDefault();
          addSettingsModel3(results[2]);
        }
      }
    }).catch((err) => {
      console.error(err);
    });


  const resetDefault = () => {
    if (typeof panel1 !== 'undefined' && panel1 !== null) {
      panel1.hide();
    }

    if (typeof panel2 !== 'undefined' && panel2 !== null) {
      panel2.hide();
    }

    if (typeof panel3 !== 'undefined' && panel3 !== null) {
      panel3.hide();
    }
  }

  ////////////////////////////////////////
  
  //Model1  

  ///////////////////////////////////////////////////////////////////
    function createPanel1() { 
        panel1 = new dat.GUI( { width: 310 } );
        panel1.domElement.id = 'panel1';

        const folder1 = panel1.addFolder( 'Visibility' );
        const folder2 = panel1.addFolder( 'Activation/Deactivation' );
        const folder3 = panel1.addFolder( 'Pausing/Stepping' );
        const folder4 = panel1.addFolder( 'Crossfading' );
        const folder5 = panel1.addFolder( 'Blend Weights' );
        const folder6 = panel1.addFolder( 'General Speed' );
        md1Settings = {
          'show model': true,
          'show skeleton': false,
          'deactivate all': deactivateAllActions,
          'activate all': activateAllActions,
          'pause/continue': pauseContinue,
          'make single step': toSingleStepMode,
          'modify step size': 0.05,
          'from walk to idle': function () {

            prepareCrossFade( walkAction, idleAction, 1.0 );

          },
          'from idle to walk': function () {

            prepareCrossFade( idleAction, walkAction, 0.5 );

          },
          'from walk to run': function () {

            prepareCrossFade( walkAction, runAction, 2.5 );

          },
          'from run to walk': function () {

            prepareCrossFade( runAction, walkAction, 5.0 );

          },
          'use default duration': true,
          'set custom duration': 3.5,
          'modify idle weight': 0.0,
          'modify walk weight': 1.0,
          'modify run weight': 0.0,
          'modify time scale': 1.0
        };

        folder1.add( md1Settings, 'show model' ).onChange( showModel );
        folder1.add( md1Settings, 'show skeleton' ).onChange( showSkeleton );
        folder2.add( md1Settings, 'deactivate all' );
        folder2.add( md1Settings, 'activate all' );
        folder3.add( md1Settings, 'pause/continue' );
        folder3.add( md1Settings, 'make single step' );
        folder3.add( md1Settings, 'modify step size', 0.01, 0.1, 0.001 );
        crossFadeControls.push( folder4.add( md1Settings, 'from walk to idle' ) );
        crossFadeControls.push( folder4.add( md1Settings, 'from idle to walk' ) );
        crossFadeControls.push( folder4.add( md1Settings, 'from walk to run' ) );
        crossFadeControls.push( folder4.add( md1Settings, 'from run to walk' ) );
        folder4.add( md1Settings, 'use default duration' );
        folder4.add( md1Settings, 'set custom duration', 0, 10, 0.01 );
        folder5.add( md1Settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeight( idleAction, weight );

        } );
        folder5.add( md1Settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeight( walkAction, weight );

        } );
        folder5.add( md1Settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeight( runAction, weight );

        } );
        folder6.add( md1Settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

        folder1.open();
        folder2.open();
        folder3.open();
        folder4.open();
        folder5.open();
        folder6.open();

      }



      function deactivateAllActions() {

        actions.forEach( function ( action ) {

          action.stop();

        });

        audio1.stop();
      }

      function activateAllActions() {

        setWeight( idleAction, md1Settings[ 'modify idle weight' ] );
        setWeight( walkAction, md1Settings[ 'modify walk weight' ] );
        setWeight( runAction, md1Settings[ 'modify run weight' ] );

        actions.forEach( function ( action ) {

          action.play();

        } );

        audio1.play();
      }


      function pauseContinue() {

        if ( singleStepMode ) {

          singleStepMode = false;
          unPauseAllActions();

        } else {

          if ( idleAction.paused ) {

            unPauseAllActions();

          } else {

            pauseAllActions();

          }

        }

      }

      function pauseAllActions() {

        actions.forEach( function ( action ) {

          action.paused = true;
          audio1.pause();
        });


      }

      function unPauseAllActions() {

        actions.forEach( function ( action ) {
          action.paused = false;
          audio1.pause();
        });

      }

      function toSingleStepMode() {

        unPauseAllActions();

        singleStepMode = true;
        sizeOfNextStep = md1Settings[ 'modify step size' ];

      }

      function prepareCrossFade( startAction, endAction, defaultDuration ) {

        // Switch default / custom crossfade duration (according to the user's choice)

        const duration = setCrossFadeDuration( defaultDuration );

        // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

        singleStepMode = false;
        unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop

        if ( startAction === idleAction ) {

          executeCrossFade( startAction, endAction, duration );

        } else {

          synchronizeCrossFade( startAction, endAction, duration );

        }

      }

      function setCrossFadeDuration( defaultDuration ) {

        // Switch default crossfade duration <-> custom crossfade duration

        if ( md1Settings[ 'use default duration' ] ) {

          return defaultDuration;

        } else {

          return md1Settings[ 'set custom duration' ];

        }

      }

      function synchronizeCrossFade( startAction, endAction, duration ) {

        mixer.addEventListener( 'loop', onLoopFinished );

        function onLoopFinished( event ) {

          if ( event.action === startAction ) {

            mixer.removeEventListener( 'loop', onLoopFinished )

            executeCrossFade( startAction, endAction, duration );
            audio1.pause();
            audioStartTime = audio1.context.currentTime;
            audio1.start(audioStartTime, 3, duration);
          }

        }

      }

      function executeCrossFade( startAction, endAction, duration ) {

        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)

        setWeight( endAction, 1 );
        endAction.time = 0;

        // Crossfade with warping - you can also try without warping by setting the third parameter to false

        startAction.crossFadeTo( endAction, duration, true );

      }

      // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
      // the start action's timeScale to ((start animation's duration) / (end animation's duration))
      function setWeight( action, weight ) {
        action.enabled = true;
        action.setEffectiveTimeScale( 1 );
        action.setEffectiveWeight( weight );

      }

      // Called by the render loop
      function updateWeightSliders() {
        md1Settings[ 'modify idle weight' ] = idleWeight;
        md1Settings[ 'modify walk weight' ] = walkWeight;
        md1Settings[ 'modify run weight' ] = runWeight;
      }

      // Called by the render loop

      function updateCrossFadeControls() {

        if ( idleWeight === 1 && walkWeight === 0 && runWeight === 0 ) {

          crossFadeControls[ 0 ].disable();
          crossFadeControls[ 1 ].enable();
          crossFadeControls[ 2 ].disable();
          crossFadeControls[ 3 ].disable();
        }

        if ( idleWeight === 0 && walkWeight === 1 && runWeight === 0 ) {

          crossFadeControls[ 0 ].enable();
          crossFadeControls[ 1 ].disable();
          crossFadeControls[ 2 ].enable();
          crossFadeControls[ 3 ].disable();
        }

        if ( idleWeight === 0 && walkWeight === 0 && runWeight === 1 ) {

          crossFadeControls[ 0 ].disable();
          crossFadeControls[ 1 ].disable();
          crossFadeControls[ 2 ].disable();
          crossFadeControls[ 3 ].enable();

        }

      }
     

     function animateModel1 (model) {

        // Render loop
        requestAnimationFrame( animateModel1 );

        idleWeight = idleAction.getEffectiveWeight();
        //audio1.setPlaybackRate (idleWeight);
        
        walkWeight = walkAction.getEffectiveWeight();
        runWeight = runAction.getEffectiveWeight();
        
        // Update the panel values if weights are modified from "outside" (by crossfadings)

        updateWeightSliders();


        // Enable/disable crossfade controls according to current weight values

        updateCrossFadeControls();

        // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

        let mixerUpdateDelta = clock.getDelta();

        // If in single step mode, make one step and then do nothing (until the user clicks again)

        if ( singleStepMode ) {

          mixerUpdateDelta = sizeOfNextStep;
          sizeOfNextStep = 0;

        }

        // Update the animation mixer, the stats panel, and render this frame

        mixer.update( mixerUpdateDelta );
        renderer.shadowMap.enabled = true;


  }

  ///////////////////////////////////////////////////////

  //Model2

  /////////////////////////////////////////////////////
    function createPanel2() {

      panel2 = new dat.GUI( { width: 310 } );
      panel2.domElement.id = 'panel2';


      const folder1 = panel2.addFolder( 'Base Actions' );
      const folder2 = panel2.addFolder( 'Additive Action Weights' );
      const folder3 = panel2.addFolder( 'General Speed' );

      panelSettings = {
        'modify time scale': 1.0
      };

      const baseNames = [ 'None', ...Object.keys( baseActions ) ];

      for ( let i = 0, l = baseNames.length; i !== l; ++ i ) {

        const name = baseNames[ i ];
        const settings = baseActions[ name ];
        panelSettings[ name ] = function () {

          const currentSettings = baseActions[ currentBaseAction ];
          const currentAction = currentSettings ? currentSettings.action : null;
          const action = settings ? settings.action : null;

          if ( currentAction !== action ) {

            prepareCrossFade( currentAction, action, 0.35 );

          }

        };

        crossFadeControls.push( folder1.add( panelSettings, name ) );

      }

      for ( const name of Object.keys( additiveActions ) ) {

        const settings = additiveActions[ name ];

        panelSettings[ name ] = settings.weight;
        folder2.add( panelSettings, name, 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeightModel2( settings.action, weight );
          settings.weight = weight;

        } );

      }

      folder3.add( panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScaleModel2 );

      folder1.open();
      folder2.open();
      folder3.open();

      crossFadeControls.forEach( function ( control ) {

        control.setInactive = function () {

          control.domElement.classList.add( 'control-inactive' );

        };

        control.setActive = function () {

          control.domElement.classList.remove( 'control-inactive' );

        };

        const settings = baseActions[ control.property ];

        if ( ! settings || ! settings.weight ) {

          control.setInactive();

        }

      } );

    }

    function activateActionModel2( action ) {

      const clip = action.getClip();
      const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
      setWeightModel2( action, settings.weight );
      action.play();

    }

    function modifyTimeScaleModel2( speed ) {

      mixer.timeScale = speed;

    }

    function prepareCrossFadeModel2( startAction, endAction, duration ) {

      // If the current action is 'idle', execute the crossfade immediately;
      // else wait until the current action has finished its current loop

      if ( currentBaseAction === 'idle' || ! startAction || ! endAction ) {

        executeCrossFadeModel2( startAction, endAction, duration );

      } else {

        synchronizeCrossFadeModel2( startAction, endAction, duration );

      }

      // Update control colors

      if ( endAction ) {

        const clip = endAction.getClip();
        currentBaseAction = clip.name;

      } else {

        currentBaseAction = 'None';

      }

      crossFadeControls.forEach( function ( control ) {

        const name = control.property;

        if ( name === currentBaseAction ) {

          control.setActive();

        } else {

          control.setInactive();

        }

      } );

    }

    function synchronizeCrossFadeModel2( startAction, endAction, duration ) {

      mixer.addEventListener( 'loop', onLoopFinished );

      function onLoopFinished( event ) {

        if ( event.action === startAction ) {

          mixer.removeEventListener( 'loop', onLoopFinished );

          executeCrossFadeModel2( startAction, endAction, duration );

        }

      }

    }

    function executeCrossFadeModel2( startAction, endAction, duration ) {

      // Not only the start action, but also the end action must get a weight of 1 before fading
      // (concerning the start action this is already guaranteed in this place)

      if ( endAction ) {

        setWeightModel2( endAction, 1 );
        endAction.time = 0;

        if ( startAction ) {

          // Crossfade with warping

          startAction.crossFadeTo( endAction, duration, true );
        } else {

          // Fade in

          endAction.fadeIn( duration );

        }

      } else {

        // Fade out

        startAction.fadeOut( duration );

      }

    }

    // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
    // the start action's timeScale to ((start animation's duration) / (end animation's duration))

    function setWeightModel2( action, weight ) {
      action.enabled = true;
      action.setEffectiveTimeScale( 1 );
      action.setEffectiveWeight( weight );

    }


    function animateModel2() {

      // Render loop

      requestAnimationFrame( animate );

      for ( let i = 0; i !== numAnimations; ++ i ) {

        const action = allActions[ i ];
        const clip = action.getClip();
        const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
        settings.weight = action.getEffectiveWeight();
      }

      // Get the time elapsed since the last frame, used for mixer update

      const mixerUpdateDelta = clock.getDelta();

      // Update the animation mixer, the stats panel, and render this frame

      mixer.update( mixerUpdateDelta );

      stats.update();

      renderer.render( scene, camera );

    }


  ///////////////////////////////////////////////////////

  //Model3

  /////////////////////////////////////////////////////

    function createGUI( model, animations ) {

          const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
          const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];


          panel3 = new dat.GUI();

          panel3.domElement.id = 'panel3';
          mixer = new THREE.AnimationMixer( model );

          const actions = {};

          for ( let i = 0; i < animations.length; i ++ ) {

            const clip = animations[ i ];
            const action = mixer.clipAction( clip );
            actions[ clip.name ] = action;

            if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {

              action.clampWhenFinished = true;
              action.loop = THREE.LoopOnce;

            }

          }


          const statesFolder = panel3.addFolder( 'States' );

          const clipCtrl = statesFolder.add( api, 'state' ).options( states );

          clipCtrl.onChange( function () {

            fadeToAction( api.state, 0.5 );

          });


          // emotes

          const emoteFolder = panel3.addFolder( 'Emotes' );

          function createEmoteCallback( name ) {

            api[ name ] = function () {

              fadeToAction( name, 0.2 );

              mixer.addEventListener( 'finished', restoreState );

            };

            emoteFolder.add( api, name );

          }

          function restoreState() {

            mixer.removeEventListener( 'finished', restoreState );

            fadeToAction( api.state, 0.2 );

          }

          for ( let i = 0; i < emotes.length; i ++ ) {

            createEmoteCallback( emotes[ i ] );

          }


          // expressions

          const face = model.getObjectByName( 'Head_4' );

          const expressions = Object.keys( face.morphTargetDictionary );
          const expressionFolder = panel3.addFolder( 'Expressions' );

          for ( let i = 0; i < expressions.length; i ++ ) {

            expressionFolder.add( face.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );

          }

          activeAction = actions[ 'Walking' ];
          activeAction.play();
          panel3.open();

        }



        function fadeToAction( name, duration ) {

          previousAction = activeAction;
          activeAction = actions[ name ];

          if ( previousAction !== activeAction ) {

            previousAction.fadeOut( duration );

          }

          activeAction
            .reset()
            .setEffectiveTimeScale( 1 )
            .setEffectiveWeight( 1 )
            .fadeIn( duration )
            .play();

        }

        function animateModel3() {

          const dt = clock.getDelta();

          if ( mixer ) mixer.update( dt );

          requestAnimationFrame( animate );
        }

  }



  //////////////////////////////////////////////////////////////////////////////////
    var gui = new dat.GUI();
    gui.domElement.id = 'mainpanel';
    var settings = new Settings();
    var heightmapFolder = gui.addFolder('Heightmap');
    heightmapFolder.add(settings, 'heightmap', ['Brownian', 'Cosine', 'CosineLayers', 'DiamondSquare', 'Fault', 'heightmap.png', 'Hill', 'HillIsland', 'influences', 'Particles', 'Perlin', 'PerlinDiamond', 'PerlinLayers', 'Simplex', 'SimplexLayers', 'Value', 'Weierstrass', 'Worley']).onFinishChange(settings.Regenerate);
    heightmapFolder.add(settings, 'easing', ['Linear', 'EaseIn', 'EaseInWeak', 'EaseOut', 'EaseInOut', 'InEaseOut']).onFinishChange(settings.Regenerate);
    heightmapFolder.add(settings, 'smoothing', ['Conservative (0.5)', 'Conservative (1)', 'Conservative (10)', 'Gaussian (0.5, 7)', 'Gaussian (1.0, 7)', 'Gaussian (1.5, 7)', 'Gaussian (1.0, 5)', 'Gaussian (1.0, 11)', 'GaussianBox', 'Mean (0)', 'Mean (1)', 'Mean (8)', 'Median', 'None']).onChange(function (val) {
      applySmoothing(val, lastOptions);
      settings['Scatter meshes']();
      if (lastOptions.heightmap) {
        THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.attributes.position.array, lastOptions);
      }
    });
    heightmapFolder.add(settings, 'segments', 7, 127).step(1).onFinishChange(settings.Regenerate);
    heightmapFolder.add(settings, 'steps', 1, 8).step(1).onFinishChange(settings.Regenerate);
    heightmapFolder.add(settings, 'turbulent').onFinishChange(settings.Regenerate);
    heightmapFolder.open();
    var decoFolder = gui.addFolder('Decoration');
    decoFolder.add(settings, 'texture', ['Blended', 'Grayscale', 'Wireframe']).onFinishChange(settings.Regenerate);
    decoFolder.add(settings, 'scattering', ['Altitude', 'Linear', 'Cosine', 'CosineLayers', 'DiamondSquare', 'Particles', 'Perlin', 'PerlinAltitude', 'Simplex', 'Value', 'Weierstrass', 'Worley']).onFinishChange(settings['Scatter meshes']);
    decoFolder.add(settings, 'spread', 0, 100).step(1).onFinishChange(settings['Scatter meshes']);
    decoFolder.addColor(settings, 'Light color').onChange(function(val) {
      skyLight.color.set(val);
    });
    var sizeFolder = gui.addFolder('Size');
    sizeFolder.add(settings, 'size', 1024, 3072).step(256).onFinishChange(settings.Regenerate);
    sizeFolder.add(settings, 'maxHeight', 2, 300).step(2).onFinishChange(settings.Regenerate);
    sizeFolder.add(settings, 'width:length ratio', 0.2, 2).step(0.05).onFinishChange(settings.Regenerate);
    var edgesFolder = gui.addFolder('Edges');
    edgesFolder.add(settings, 'edgeType', ['Box', 'Radial']).onFinishChange(settings.Regenerate);
    edgesFolder.add(settings, 'edgeDirection', ['Normal', 'Up', 'Down']).onFinishChange(settings.Regenerate);
    edgesFolder.add(settings, 'edgeCurve', ['Linear', 'EaseIn', 'EaseOut', 'EaseInOut']).onFinishChange(settings.Regenerate);
    edgesFolder.add(settings, 'edgeDistance', 0, 512).step(32).onFinishChange(settings.Regenerate);
    gui.add(settings, 'Flight mode').onChange(function(val) {
      useFPS = val;
      fpsCamera.position.x = 449;
      fpsCamera.position.y = 311;
      fpsCamera.position.z = 376;
      controls.lookAt(terrainScene.children[0].position);
      controls.update(0);
      controls.enabled = false;
      if (useFPS) {
        document.getElementById('fpscontrols').className = 'visible';
        setTimeout(function() {
          controls.enabled = true;
          customsettings['trackModelPosition']();
        }, 1000);
      }
      else {
        document.getElementById('fpscontrols').className = '';
      }
    });
    gui.add(settings, 'Scatter meshes');
    gui.add(settings, 'Regenerate');
    const pointerControls = new THREE.PointerLockControls(fpsCamera, document.body);
    var pointerLock = gui.addFolder('Pointer Control');
    const pointer_controls = {
      get 'Enabled'() {
        return pointerControls.isLocked;
      },
      set 'Enabled'(v) {
          if (v) {
              pointerControls.lock();
          } else {
              pointerControls.unlock();
          }
      },
    };
    pointerLock.add(pointer_controls, 'Enabled').name('Enabled');
    pointerLock.open();
    var sliderLock = gui.addFolder('Slider Control');
    const slider_controls = {
      get 'Enabled'() {
        return toggleSlider;
      },
      set 'Enabled'(v) {
          if (v) {
            toggleSlider = true;
            resetDisplaySettings();
            sliderVerticalElement.style.display = "block";
            sliderHorizontalElement.style.display = "block";
         } else {
              toggleSlider = false;
              sliderHorizontalElement.style.display = "none";
              sliderVerticalElement.style.display = "none";
          }
      },
    };
    sliderLock.add(slider_controls, 'Enabled').name('Enabled');
    sliderLock.open();

    // Function display settings constructor
     function displaySettings() {
        var that = this;
        this['Display Options'] = 'Default';
        this.displaySet = function () {
          if (that['Display Options'] === 'Default') {
            that.setDisplayDefault();
          } else if (that['Display Options'] === 'FullScreen1') {
            that.setDisplayScreen1();
          } else if (that['Display Options'] === 'FullScreen2') {
            that.setDisplayScreen2();
          } else if (that['Display Options'] === 'FullScreen3') {
            that.setDisplayScreen3();
          }
        }; 

          this.setDisplayDefault = function () {
          hideSliderElements();
          views[ 0 ].updateCamera( camera2, scene2, mouseX, mouseY );

          sliderVerticalPos = window.innerWidth / 2;
          sliderHorizontalPos = window.innerHeight / 2;

          renderer.setViewport( 0, 0, sliderVerticalPos, window.innerHeight );
          renderer.setScissor( 0, 0, sliderVerticalPos, window.innerHeight );
          renderer.render( scene1, camera1 );

          renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
          renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
          renderer.render(scene3, camera3);

          renderer.setViewport( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
          renderer.setScissor( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight);
          renderer.render(scene2, useFPS ? fpsCamera : camera2);

          renderer.setScissorTest( true );

          camera1.aspect = window.innerWidth/ window.innerHeight;
          camera1.updateProjectionMatrix();

          camera2.aspect = window.innerWidth / window.innerHeight;
          camera2.updateProjectionMatrix();

          camera3.aspect = window.innerWidth / window.innerHeight;
          camera3.updateProjectionMatrix(); 
        };

        this.setDisplayScreen1 = function () {
          hideSliderElements();
          sliderVerticalPos = window.innerWidth;
          renderer.setViewport( 0, 0, sliderVerticalPos, window.innerHeight );
          renderer.setScissor( 0, 0, sliderVerticalPos, window.innerHeight );
          renderer.render( scene1, camera1 );

          renderer.setViewport( 0, 0, 0, 0);
          renderer.setScissor( 0, 0, 0, 0 );
          renderer.render(scene3, camera3);

          renderer.setViewport( 0, 0, 0, 0 );
          renderer.setScissor( 0, 0, 0, 0);
          renderer.render(scene2, useFPS ? fpsCamera : camera2);

          renderer.setScissorTest( true );

          camera1.aspect = window.innerWidth/ window.innerHeight;
          camera1.updateProjectionMatrix();

          camera2.aspect = window.innerWidth / window.innerHeight;
          camera2.updateProjectionMatrix();

          camera3.aspect = window.innerWidth / window.innerHeight;
          camera3.updateProjectionMatrix();
         
        };

        this.setDisplayScreen2 = function () {
          hideSliderElements();
          sliderVerticalPos = 0;
          sliderHorizontalPos = window.innerHeight;

          renderer.setViewport( 0, 0, 0, 0 );
          renderer.setScissor( 0, 0, 0, 0 );
          renderer.render( scene1, camera1 );

          renderer.setViewport( 0, 0, 0, 0 );
          renderer.setScissor( 0, 0, 0, 0 );
          renderer.render(scene3, camera3);

          renderer.setViewport( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
          renderer.setScissor( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
          renderer.render(scene2, useFPS ? fpsCamera : camera2);

          renderer.setScissorTest( true );

          camera1.aspect = window.innerWidth/ window.innerHeight;
          camera1.updateProjectionMatrix();

          camera2.aspect = window.innerWidth / window.innerHeight;
          camera2.updateProjectionMatrix();

          camera3.aspect = window.innerWidth / window.innerHeight;
          camera3.updateProjectionMatrix();

         
        };

        this.setDisplayScreen3 = function () {
          hideSliderElements();
          sliderVerticalPos = window.innerWidth;
          sliderHorizontalPos = window.innerWidth;
          renderer.setViewport( 0, 0, 0, 0 );
          renderer.setScissor( 0, 0, 0, 0 );
          renderer.render( scene1, camera1 );

          renderer.setViewport( 0, 0, 0, 0);
          renderer.setScissor( 0, 0, 0, 0 );
          renderer.render(scene3, camera3);

          renderer.setViewport( 0, 0, sliderVerticalPos, sliderHorizontalPos );
          renderer.setScissor( 0, 0, sliderVerticalPos, sliderHorizontalPos);
          renderer.render(scene2, useFPS ? fpsCamera : camera2);

          renderer.setScissorTest( true );

          camera1.aspect = window.innerWidth/ window.innerHeight;
          camera1.updateProjectionMatrix();

          camera2.aspect = window.innerWidth / window.innerHeight;
          camera2.updateProjectionMatrix();

          camera3.aspect = window.innerWidth / window.innerHeight;
          camera3.updateProjectionMatrix();       
        };

    }

function resetDisplaySettings() {
    sliderVerticalPos = window.innerWidth / 2;
    sliderHorizontalPos = window.innerHeight / 2;
}


function hideSliderElements() {
    sliderHorizontalElement.style.display = "none";
    sliderVerticalElement.style.display = "none";
}


   


    var displaysettings = new displaySettings();
    var screenLock = gui.addFolder('Screen Control');
    screenLock.add(displaysettings, 'Display Options', ['Default', 'FullScreen1', 'FullScreen2', 'FullScreen3']).onChange(function() {
          displaysettings.displaySet();
    });
    screenLock.open();

  ////////////////////////////////////////////////////////////////////////////////////
  //section5
    var soundtrackList = { 
         Soundtrack1: '../static/src/lib/THREEJS/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3',
         Soundtrack2: '../static/src/lib/THREEJS/examples/sounds/358232_j_s_song.mp3'
      };
    var customsettings = new customSettings();
    var modelFolder = gui.addFolder('Model Control');
    modelFolder.add(customsettings, 'Model Options', ['Soldier', 'SkinningRobot', 'AnimatedRobot']).onFinishChange(function() {
          customsettings['Model Select']();
    });

    // This is for background music control
    var audioEnabler = gui.addFolder('Enable Audio');
    audioEnabler.add(customsettings, 'Enable Audio').onChange(function(val) {
    activateAudio = val;
    resetAudioSetup();
    console.log('activateAudio', activateAudio);
    localStorage.setItem("activateAudio", val);
  if (activateAudio) {
      audioFolder.open();
      audioFolder.show();
      customsettings['Start Audio']();
    } else {
      audioFolder.close();
      audioFolder.hide();
      audioTriggered = false;
      localStorage.setItem("audioTriggered", audioTriggered);
    } 
   });


  // This is for adding audio to characters
  var subaudioEnabler = gui.addFolder('Enable SubAudio');
  subaudioEnabler.add(settings, 'Enable SubAudio').onChange(function (val) {
    isAudioFinder = val;
    if (isAudioFinder) {
      settings['Sound Activate'](); // Activate audio when enabled
      volumeFolder.show();
      volumeFolder.open();
      generatorFolder.open();
      generatorFolder.show();
    } else {
      soundsettings.removeAudioFinder();
      volumeFolder.hide();
      volumeFolder.close();
      generatorFolder.hide();
      generatorFolder.close();
    }
  });

///////////////////////////////////////////////
//settings for audio finder
//////////////////////////////////////////////////

// Create an instance of Soundsettings
var soundsettings = new settings.Soundsettings();

// Create dat.gui folders
const volumeFolder = subaudioEnabler.addFolder('Sound volume');
const generatorFolder = subaudioEnabler.addFolder('Sound generator');

// Define a function to update audio settings
function updateAudioSettings() {
  soundsettings.listener.setMasterVolume(soundsettings.soundControls.master);
  sound1.setVolume(soundsettings.soundControls.msound1);
  sound2.setVolume(soundsettings.soundControls.msound2);
  soundsettings.oscillator.frequency.setValueAtTime(soundsettings.generatorControls.frequency, soundsettings.listener.context.currentTime);
  soundsettings.oscillator.type = soundsettings.generatorControls.wavetype;
}

// Add dat.gui controls
volumeFolder.add(soundsettings.soundControls, 'master').min(0.0).max(1.0).step(0.01).onFinishChange(updateAudioSettings);
volumeFolder.add(soundsettings.soundControls, 'msound1').min(0.0).max(1.0).step(0.01).onFinishChange(updateAudioSettings);
volumeFolder.add(soundsettings.soundControls, 'msound2').min(0.0).max(1.0).step(0.01).onFinishChange(updateAudioSettings);

generatorFolder.add(soundsettings.generatorControls, 'frequency').min(50.0).max(5000.0).step(1.0).onFinishChange(updateAudioSettings);
generatorFolder.add(soundsettings.generatorControls, 'wavetype', ['sine', 'square', 'sawtooth', 'triangle']).onFinishChange(updateAudioSettings);

// Hide and close folders by default
volumeFolder.hide();
volumeFolder.close();
generatorFolder.hide();
generatorFolder.close();

/////////////////////////

    var audioFolder = audioEnabler.addFolder('Audio Control');
    var backgroundmusicValue = audioFolder.add(customsettings, 'backgroundmusic',Object.keys(soundtrackList)).onFinishChange(function() {
      if (activateAudio) {
      resetAudioSetup();
      resetAudioSwitchSettings();
      customsettings['Start Audio']();
    }
    });
    var pitchValue = audioFolder.add(customsettings, 'pitch', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
    var delayVolumeValue = audioFolder.add(customsettings, 'delayVolume', 0, 1).step(.01).onFinishChange(customsettings.RegenerateAudio);
    var delayOffsetValue = audioFolder.add(customsettings, 'delayOffset', 0.1, 1).step(.01).onFinishChange(customsettings.RegenerateAudio);
    audioFolder.add(customsettings, 'Reset Audio').onChange(function(val) {
      if (activateAudio) {
      resetAudioInitialSettings();
      resetTriggered = val;
      localStorage.setItem("resetTriggered", resetTriggered);
      resetAudioSettings();
    }
    });
    audioFolder.add(customsettings, 'Toggle Display');
    audioFolder.hide();

    function resetAudioSettings() {
      backgroundmusicValue.setValue(defaultSettings.audioURL);
      pitchValue.setValue(defaultSettings.pitch);
      delayVolumeValue.setValue(defaultSettings.delayVolume);
      delayOffsetValue.setValue(defaultSettings.delayOffset);
    }

    function resetAudioSwitchSettings() {
      pitchValue.setValue(defaultSettings.pitch);
      delayVolumeValue.setValue(defaultSettings.delayVolume);
      delayOffsetValue.setValue(defaultSettings.delayOffset);
    }

    camera3.layers.enable( 8 ); // enabled by default
    camera3.layers.enable( 9 );
    camera3.layers.enable( 10 );

       const layers = {

        'toggle model1': function () {

          camera3.layers.toggle( 8 );

        },

        'toggle model2': function () {

          camera3.layers.toggle( 9 );

        },
        'toggle model3': function () {

         camera3.layers.toggle( 10 );

        },

        'enable all': function () {
          camera3.layers.enableAll();
        },

        'disable all': function () {
          camera3.layers.disable( 8 );
          camera3.layers.disable( 9 );
          camera3.layers.disable( 10 );
        }

      };

      var characterLock = gui.addFolder('Character Control');
      characterLock.add( layers, 'toggle model1' );
      characterLock.add( layers, 'toggle model2' );
      characterLock.add( layers, 'toggle model3' );
      characterLock.add( layers, 'enable all' );
      characterLock.add( layers, 'disable all' )
      characterLock.close();

     var wallFolder = gui.addFolder('Wall Control');
     var wallType = wallFolder.add(customsettings, 'Wall Type', ['Line', 'Rectangle', 'Circle', 'Wireframe','Spline']).onFinishChange(function(val) {
          resetWallSettings();
          is3DWall = false;
          isInteractiveWall = false;
          isInteractiveShape = false;

          // Disable/enable other controls based on wallType
          if (val === "Line") {
            widthControl.domElement.style.display = 'none';
            depthControl.domElement.style.display = 'none';
            heightControl.domElement.style.display = 'none';
            radiusControl.domElement.style.display = 'none';
            segmentsControl.domElement.style.display = 'none';
          } else if (val === "Rectangle") {
            widthControl.domElement.style.display = 'block';
            depthControl.domElement.style.display = 'none';
            heightControl.domElement.style.display = 'block';
            radiusControl.domElement.style.display = 'none';
            segmentsControl.domElement.style.display = 'none';
          } else if (val === "Circle") {
            widthControl.domElement.style.display = 'none';
            depthControl.domElement.style.display = 'none';
            heightControl.domElement.style.display = 'none';
            radiusControl.domElement.style.display = 'block';
            segmentsControl.domElement.style.display = 'none';
          } else if (val === "Wireframe") {
            widthControl.domElement.style.display = 'block';
            depthControl.domElement.style.display = 'none';
            heightControl.domElement.style.display = 'block';
            radiusControl.domElement.style.display = 'none';
            segmentsControl.domElement.style.display = 'none';
          } else if (val === "Spline") {
            widthControl.domElement.style.display = 'none';
            depthControl.domElement.style.display = 'none';
            heightControl.domElement.style.display = 'none';
            radiusControl.domElement.style.display = 'none';
            segmentsControl.domElement.style.display = 'block';
          }
      });
      var widthControl = wallFolder.add(customsettings, 'width', 0.5, 20).step(.5).onFinishChange(function() {
          customsettings['Setup Wall']();
      });
      var depthControl = wallFolder.add(customsettings, 'depth', 0.5, 20).step(.5).onFinishChange(function() {
          customsettings['Setup Wall']();
      });
      var heightControl = wallFolder.add(customsettings, 'height', 0.5, 200).step(10).onFinishChange(function() {
          customsettings['Setup Wall']();
      });    
      var radiusControl = wallFolder.add(customsettings, 'radius', 0.5, 20).step(.5).onFinishChange(function() {
          customsettings['Setup Wall']();
      });
      var lengthControl = wallFolder.add(customsettings, 'length', 0.5, 200).step(10).onFinishChange(function() {
          customsettings['Setup Wall']();
      });
      var segmentsControl = wallFolder.add(customsettings, 'segments', 10, 50).step(10).onFinishChange(function() {
          customsettings['Setup Wall']();
      });
      widthControl.domElement.style.display = 'none';
      depthControl.domElement.style.display = 'none';
      heightControl.domElement.style.display = 'none';
      radiusControl.domElement.style.display = 'none';
      segmentsControl.domElement.style.display = 'none';

      wallFolder.add(customsettings, 'Regenerate Wall');

      wallFolder.add(customsettings, 'Interactive Wall').onFinishChange(function() {
        isInteractiveWall = true;
        is3DWall = false;
        isInteractiveShape = false;
        customsettings['Interactive Wall']();
       });

      wallFolder.add(customsettings, 'Create3D Wall').onFinishChange(function() {
        is3DWall = true;
        isInteractiveWall = false;
        isInteractiveShape = false;
        customsettings['Create3D Wall']();
      });
      wallFolder.add(customsettings, 'InteractiveShape Wall').onFinishChange(function() {
        is3DWall = false;
        isInteractiveWall = false;
        isInteractiveShape = true;
        customsettings['InteractiveShape Wall']();
      });
      wallFolder.add(customsettings, 'Remove Wall');
      wallFolder.add(customsettings, 'IsolatorAudio');
      wallFolder.close();


      function resetWallSettings() {
      widthControl.setValue(defaultWallSettings.width);
      depthControl.setValue(defaultWallSettings.depth);
      heightControl.setValue(defaultWallSettings.height);
      radiusControl.setValue(defaultWallSettings.radius);
      lengthControl.setValue(defaultWallSettings.length);
      segmentsControl.setValue(defaultWallSettings.segments);
    }
 

    function resetAudioSetup() {
       // Create a button element
      const audioContainerElement = document.getElementById('audio-container');
      if (audioContainerElement) {
       document.body.removeChild(audioContainerElement); // Add the button to the body element
      }

      if (audioElement || audioStore.length>0) {
          audioElement.pause();
          audioElement.currentTime = 0;     
          audioStore.length = 0;
       }
  }


    function resetAudioInitialSettings() {
      if (audioElement || audioStore.length>0) {
          audioElement.pause();
          audioElement.currentTime = 0;     
          audioStore.length = 0;
       }
  }



  //////////////////////////////////////////////////////////////////////////////////


  if (typeof window.Stats !== 'undefined' && /[?&]stats=1\b/g.test(location.search)) {
      stats = new Stats();
      stats.setMode(0);
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.left = '20px';
      stats.domElement.style.bottom = '0px';
      document.body.appendChild(stats.domElement);
      document.getElementById('code').style.left = '120px';
    }
    else {
      stats = {begin: function() {}, end: function() {}};
    }

  }


  function update(delta) {
    if (terrainScene) terrainScene.rotation.z = Date.now() * 0.00001;
    if (controls.update) controls.update(delta);
  }

  document.addEventListener('keyup', function(event) {
    if (event.key === 'q' && useFPS) {
      controls.enabled = !controls.enabled;
    }
  });

  document.addEventListener('mousemove', function(event) {
    if (!paused) {
      mouseX = event.pageX;
      mouseY = event.pageY;
    }
  }, false);

  // Stop animating if the window is out of focus
  function watchFocus() {
    var _blurred = false;
    window.addEventListener('focus', function() {
      if (_blurred) {
        _blurred = false;
        startAnimating();
        controls.enabled = true;
      }
    });
    window.addEventListener('blur', function() {
      stopAnimating();
      _blurred = true;
      controls.enabled = false;
    });
  }


  function __printCameraData() {
    var s = '';
    s += 'camera.position.x = ' + Math.round(fpsCamera.position.x) + ';\n';
    s += 'camera.position.y = ' + Math.round(fpsCamera.position.y) + ';\n';
    s += 'camera.position.z = ' + Math.round(fpsCamera.position.z) + ';\n';
    s += 'camera.rotation.x = ' + Math.round(fpsCamera.rotation.x * 180 / Math.PI) + ' * Math.PI / 180;\n';
    s += 'camera.rotation.y = ' + Math.round(fpsCamera.rotation.y * 180 / Math.PI) + ' * Math.PI / 180;\n';
    s += 'camera.rotation.z = ' + Math.round(fpsCamera.rotation.z * 180 / Math.PI) + ' * Math.PI / 180;\n';
    console.log(s);
  }

  function applySmoothing(smoothing, o) {
    var m = terrainScene.children[0];
    var g = THREE.Terrain.toArray1D(m.geometry.attributes.position.array);
    if (smoothing === 'Conservative (0.5)') THREE.Terrain.SmoothConservative(g, o, 0.5);
    if (smoothing === 'Conservative (1)') THREE.Terrain.SmoothConservative(g, o, 1);
    if (smoothing === 'Conservative (10)') THREE.Terrain.SmoothConservative(g, o, 10);
    else if (smoothing === 'Gaussian (0.5, 7)') THREE.Terrain.Gaussian(g, o, 0.5, 7);
    else if (smoothing === 'Gaussian (1.0, 7)') THREE.Terrain.Gaussian(g, o, 1, 7);
    else if (smoothing === 'Gaussian (1.5, 7)') THREE.Terrain.Gaussian(g, o, 1.5, 7);
    else if (smoothing === 'Gaussian (1.0, 5)') THREE.Terrain.Gaussian(g, o, 1, 5);
    else if (smoothing === 'Gaussian (1.0, 11)') THREE.Terrain.Gaussian(g, o, 1, 11);
    else if (smoothing === 'GaussianBox') THREE.Terrain.GaussianBoxBlur(g, o, 1, 3);
    else if (smoothing === 'Mean (0)') THREE.Terrain.Smooth(g, o, 0);
    else if (smoothing === 'Mean (1)') THREE.Terrain.Smooth(g, o, 1);
    else if (smoothing === 'Mean (8)') THREE.Terrain.Smooth(g, o, 8);
    else if (smoothing === 'Median') THREE.Terrain.SmoothMedian(g, o);
    THREE.Terrain.fromArray1D(m.geometry.attributes.position.array, g);
    THREE.Terrain.Normalize(m, o);
  }

  function buildTreeType1() {
    var green = new THREE.MeshLambertMaterial({ color: 0x2d4c1e });

    var c0 = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 12, 6, 1, true),
      new THREE.MeshLambertMaterial({ color: 0x3d2817 }) // brown
    );
    c0.position.setY(6);

    var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8), green);
    c1.position.setY(18);
    var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8), green);
    c2.position.setY(25);
    var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8), green);
    c3.position.setY(32);

    var s = new THREE.Object3D();
    s.add(c0);
    s.add(c1);
    s.add(c2);
    s.add(c3);
    s.scale.set(5, 1.25, 5);

    return s;
  }

  function customInfluences(g, options) {
    var clonedOptions = {};
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            clonedOptions[opt] = options[opt];
        }
    }
    clonedOptions.maxHeight = options.maxHeight * 0.67;
    clonedOptions.minHeight = options.minHeight * 0.67;
    THREE.Terrain.DiamondSquare(g, clonedOptions);

    var radius = Math.min(options.xSize, options.ySize) * 0.21,
        height = options.maxHeight * 0.8;
    THREE.Terrain.Influence(
      g, options,
      THREE.Terrain.Influences.Hill,
      0.25, 0.25,
      radius, height,
      THREE.AdditiveBlending,
      THREE.Terrain.Linear
    );
    THREE.Terrain.Influence(
      g, options,
      THREE.Terrain.Influences.Mesa,
      0.75, 0.75,
      radius, height,
      THREE.SubtractiveBlending,
      THREE.Terrain.EaseInStrong
    );
    THREE.Terrain.Influence(
      g, options,
      THREE.Terrain.Influences.Flat,
      0.75, 0.25,
      radius, options.maxHeight,
      THREE.NormalBlending,
      THREE.Terrain.EaseIn
    );
    THREE.Terrain.Influence(
      g, options,
      THREE.Terrain.Influences.Volcano,
      0.25, 0.75,
      radius, options.maxHeight,
      THREE.NormalBlending,
      THREE.Terrain.EaseInStrong
    );
  }

  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  function buildTreeType2() {
      // Define colors and materials
      const bodyColor = 0x3d2817; // Green color 0x2d4c1e
      const borderColor = 0x3d2817; // Brown color 0x3d2817
      

      // Create the main body of the symbol
      const bodyGeometry = new THREE.CylinderGeometry(2, 2, 12, 6, 1, true);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: borderColor });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      bodyMesh.position.setY(6);

      // Create the top part of the symbol
      const topGeometry = new THREE.CylinderGeometry(0, 10, 14, 8);
      const topMaterial = new THREE.MeshLambertMaterial({ color: bodyColor });
      const topMesh = new THREE.Mesh(topGeometry, topMaterial);
      topMesh.position.setY(18);

      // Create the middle part of the symbol
      const middleGeometry = new THREE.CylinderGeometry(0, 9, 13, 8);
      const middleMesh = new THREE.Mesh(middleGeometry, topMaterial);
      middleMesh.position.setY(25);

      // Create the bottom part of the symbol
      const bottomGeometry = new THREE.CylinderGeometry(0, 8, 12, 8);
      const bottomMesh = new THREE.Mesh(bottomGeometry, topMaterial);
      bottomMesh.position.setY(32);

      // Create a group to hold all parts of the symbol
      const symbolGroup = new THREE.Object3D();
      symbolGroup.add(bodyMesh);
      symbolGroup.add(topMesh);
      symbolGroup.add(middleMesh);
      symbolGroup.add(bottomMesh);
      symbolGroup.scale.set(5, 1.25, 5);

      return symbolGroup;
  }

  // Define the onClick function
  function onClick(event, model,scene, camera, item) {
      // Create a raycaster to detect mouse clicks
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      // Calculate the mouse coordinates in normalized device space (-1 to 1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Set the raycaster's origin at the camera's position
      raycaster.setFromCamera(mouse, camera);


        // Find intersected objects in the scene
        const childMeshes = [];

        // Traverse the child objects of the model and collect meshes
        model.traverse((child) => {
            if (child.isMesh) {
                childMeshes.push(child);
            }
        });

      const intersects = raycaster.intersectObjects(childMeshes, true);

      console.log("click now");

      if (intersects.length > 0) {
          console.log("got it now");
          // Replace scene1 with window.myScene
          item(); // Execute the scene's action      
    }
  }

///////////////////////////////////////////////

// Functions to render scene

//////////////////////////////////



 function renderSceneSetup(scene, camera) {
    views[ 0 ].updateCamera( camera2, scene2, mouseX, mouseY );

    renderer.setViewport( 0, 0, sliderVerticalPos, window.innerHeight );
    renderer.setScissor( 0, 0, sliderVerticalPos, window.innerHeight );
    renderer.render( scene, camera );

    renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.render(scene3, camera3);

    renderer.setViewport( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
    renderer.setScissor( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight);
    renderer.render(scene2, useFPS ? fpsCamera : camera2);

    renderer.setScissorTest( true );

    camera1.aspect = window.innerWidth/ window.innerHeight;
    camera1.updateProjectionMatrix();

    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();

    camera3.aspect = window.innerWidth / window.innerHeight;
    camera3.updateProjectionMatrix();
}


 function renderSceneSetupScene3(scene, camera) {
    views[ 0 ].updateCamera( camera2, scene2, mouseX, mouseY );

    console.log("sliderVerticalPos renderSceneSetupScene3", sliderVerticalPos);

    rendererCSS3D.setSize( sliderVerticalPos, window.innerHeight );
    rendererCSS3D.render( scene, camera );

    renderer.setViewport( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.setScissor( sliderVerticalPos, 0, window.innerWidth, window.innerHeight-sliderHorizontalPos );
    renderer.render(scene3, camera3);

    renderer.setViewport( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight );
    renderer.setScissor( sliderVerticalPos, window.innerHeight-sliderHorizontalPos, window.innerWidth, window.innerHeight);
    renderer.render(scene2, useFPS ? fpsCamera : camera2);

    renderer.setScissorTest( true );

    camera.aspect = window.innerWidth/ window.innerHeight;
    camera.updateProjectionMatrix();

    camera2.aspect = window.innerWidth / window.innerHeight;
    camera2.updateProjectionMatrix();

    camera3.aspect = window.innerWidth / window.innerHeight;
    camera3.updateProjectionMatrix();
}


//initLoadScene9(renderer);

  ///////////////////////////////////////
  //Scene1
  ///////////////////////////////////////////////////////////

  function initLoadScene1(renderer) {
    let camera, scene,
    light1, light2, light3, light4,
    object, stats;

    const clock = new THREE.Clock();

        init();
        animate();

        function init() {

          camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 100 );
          camera.position.z = 100;

          scene = new THREE.Scene();
          scene1 = scene.clone();

          //model

        new THREE.OBJLoader().load( '../static/src/lib/THREEJS/examples/models/obj/walt/WaltHead.obj', function ( obj ) {
                object = obj;
                object.scale.multiplyScalar( 0.8 );
                object.position.y = - 30;
                scene.add( object );
          });

          const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

          //lights

          light1 = new THREE.PointLight( 0xff0040, 400 );
          light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
          scene.add( light1 );

          light2 = new THREE.PointLight( 0x0040ff, 400 );
          light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
          scene.add( light2 );

          light3 = new THREE.PointLight( 0x80ff80, 400 );
          light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
          scene.add( light3 );

          light4 = new THREE.PointLight( 0xffaa00, 400 );
          light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
          scene.add( light4 );
        }


        function animate() {

          requestAnimationFrame( animate );

          render();
        }

        function render() {

          const time = Date.now() * 0.0005;
          const delta = clock.getDelta();

          if ( object ) object.rotation.y -= 0.5 * delta;

          light1.position.x = Math.sin( time * 0.7 ) * 30;
          light1.position.y = Math.cos( time * 0.5 ) * 40;
          light1.position.z = Math.cos( time * 0.3 ) * 30;

          light2.position.x = Math.cos( time * 0.3 ) * 30;
          light2.position.y = Math.sin( time * 0.5 ) * 40;
          light2.position.z = Math.sin( time * 0.7 ) * 30;

          light3.position.x = Math.sin( time * 0.7 ) * 30;
          light3.position.y = Math.cos( time * 0.3 ) * 40;
          light3.position.z = Math.sin( time * 0.5 ) * 30;

          light4.position.x = Math.sin( time * 0.3 ) * 30;
          light4.position.y = Math.cos( time * 0.7 ) * 40;
          light4.position.z = Math.sin( time * 0.5 ) * 30;

          renderSceneSetup(scene, camera);

        }
  }


  ///////////////////////////////////////
  //Scene2
  ///////////////////////////////////////////////////////////


  function initLoadScene2(renderer) {
      console.log("execute scene2");
        let camera, scene;

        init();

        function init() {

          camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 200 );
          camera.position.set( - 0.7, 14.6, 43.2 );

          scene = new THREE.Scene();
          scene.background = new THREE.Color( 0xa0a0a0 );
          scene1 = scene.clone();

          const ambientLight = new THREE.AmbientLight( 0xbbbbbb );
          scene.add( ambientLight );

          const light1 = new THREE.DirectionalLight( 0xc1c1c1, 3 );
          light1.position.set( 0, 200, 100 );
          scene.add( light1 );

          const grid = new THREE.GridHelper( 200, 20, 0x000000, 0x000000 );
          grid.material.opacity = 0.3;
          grid.material.transparent = true;
          scene.add( grid );

          new THREE.LWOLoader().load( '../static/src/lib/THREEJS/examples/models/lwo/Objects/LWO3/Demo.lwo', function ( object ) {

            const phong = object.meshes[ 0 ];
            phong.position.set( - 2, 12, 0 );

            const standard = object.meshes[ 1 ];
            standard.position.set( 2, 12, 0 );

            const rocket = object.meshes[ 2 ];
            rocket.position.set( 0, 10.5, - 1 );

            scene.add( phong, standard, rocket );

          });
          renderer.setAnimationLoop( animation );
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
        }


        function animation() {
           renderSceneSetup(scene, camera);
        }

  }


//initLoadScene3(renderer);

function removeScene3() {
  const containerCSS3D = document.getElementById('container1');
  if (containerCSS3D) {
    document.body.removeChild(containerCSS3D);
  }
}


  ///////////////////////////////////////
  //Scene3
  ///////////////////////////////////////////////////////////

  function initLoadScene3(renderer) {

      console.log("sliderVerticalPos outside", sliderVerticalPos);

        let camera, scene;
        let controls;

        const table = [
          'H', 'Hydrogen', '1.00794', 1, 1,
          'He', 'Helium', '4.002602', 18, 1,
          'Li', 'Lithium', '6.941', 1, 2,
          'Be', 'Beryllium', '9.012182', 2, 2,
          'B', 'Boron', '10.811', 13, 2,
          'C', 'Carbon', '12.0107', 14, 2,
          'N', 'Nitrogen', '14.0067', 15, 2,
          'O', 'Oxygen', '15.9994', 16, 2,
          'F', 'Fluorine', '18.9984032', 17, 2,
          'Ne', 'Neon', '20.1797', 18, 2,
          'Na', 'Sodium', '22.98976...', 1, 3,
          'Mg', 'Magnesium', '24.305', 2, 3,
          'Al', 'Aluminium', '26.9815386', 13, 3,
          'Si', 'Silicon', '28.0855', 14, 3,
          'P', 'Phosphorus', '30.973762', 15, 3,
          'S', 'Sulfur', '32.065', 16, 3,
          'Cl', 'Chlorine', '35.453', 17, 3,
          'Ar', 'Argon', '39.948', 18, 3,
          'K', 'Potassium', '39.948', 1, 4,
          'Ca', 'Calcium', '40.078', 2, 4,
          'Sc', 'Scandium', '44.955912', 3, 4,
          'Ti', 'Titanium', '47.867', 4, 4,
          'V', 'Vanadium', '50.9415', 5, 4,
          'Cr', 'Chromium', '51.9961', 6, 4,
          'Mn', 'Manganese', '54.938045', 7, 4,
          'Fe', 'Iron', '55.845', 8, 4,
          'Co', 'Cobalt', '58.933195', 9, 4,
          'Ni', 'Nickel', '58.6934', 10, 4,
          'Cu', 'Copper', '63.546', 11, 4,
          'Zn', 'Zinc', '65.38', 12, 4,
          'Ga', 'Gallium', '69.723', 13, 4,
          'Ge', 'Germanium', '72.63', 14, 4,
          'As', 'Arsenic', '74.9216', 15, 4,
          'Se', 'Selenium', '78.96', 16, 4,
          'Br', 'Bromine', '79.904', 17, 4,
          'Kr', 'Krypton', '83.798', 18, 4,
          'Rb', 'Rubidium', '85.4678', 1, 5,
          'Sr', 'Strontium', '87.62', 2, 5,
          'Y', 'Yttrium', '88.90585', 3, 5,
          'Zr', 'Zirconium', '91.224', 4, 5,
          'Nb', 'Niobium', '92.90628', 5, 5,
          'Mo', 'Molybdenum', '95.96', 6, 5,
          'Tc', 'Technetium', '(98)', 7, 5,
          'Ru', 'Ruthenium', '101.07', 8, 5,
          'Rh', 'Rhodium', '102.9055', 9, 5,
          'Pd', 'Palladium', '106.42', 10, 5,
          'Ag', 'Silver', '107.8682', 11, 5,
          'Cd', 'Cadmium', '112.411', 12, 5,
          'In', 'Indium', '114.818', 13, 5,
          'Sn', 'Tin', '118.71', 14, 5,
          'Sb', 'Antimony', '121.76', 15, 5,
          'Te', 'Tellurium', '127.6', 16, 5,
          'I', 'Iodine', '126.90447', 17, 5,
          'Xe', 'Xenon', '131.293', 18, 5,
          'Cs', 'Caesium', '132.9054', 1, 6,
          'Ba', 'Barium', '132.9054', 2, 6,
          'La', 'Lanthanum', '138.90547', 4, 9,
          'Ce', 'Cerium', '140.116', 5, 9,
          'Pr', 'Praseodymium', '140.90765', 6, 9,
          'Nd', 'Neodymium', '144.242', 7, 9,
          'Pm', 'Promethium', '(145)', 8, 9,
          'Sm', 'Samarium', '150.36', 9, 9,
          'Eu', 'Europium', '151.964', 10, 9,
          'Gd', 'Gadolinium', '157.25', 11, 9,
          'Tb', 'Terbium', '158.92535', 12, 9,
          'Dy', 'Dysprosium', '162.5', 13, 9,
          'Ho', 'Holmium', '164.93032', 14, 9,
          'Er', 'Erbium', '167.259', 15, 9,
          'Tm', 'Thulium', '168.93421', 16, 9,
          'Yb', 'Ytterbium', '173.054', 17, 9,
          'Lu', 'Lutetium', '174.9668', 18, 9,
          'Hf', 'Hafnium', '178.49', 4, 6,
          'Ta', 'Tantalum', '180.94788', 5, 6,
          'W', 'Tungsten', '183.84', 6, 6,
          'Re', 'Rhenium', '186.207', 7, 6,
          'Os', 'Osmium', '190.23', 8, 6,
          'Ir', 'Iridium', '192.217', 9, 6,
          'Pt', 'Platinum', '195.084', 10, 6,
          'Au', 'Gold', '196.966569', 11, 6,
          'Hg', 'Mercury', '200.59', 12, 6,
          'Tl', 'Thallium', '204.3833', 13, 6,
          'Pb', 'Lead', '207.2', 14, 6,
          'Bi', 'Bismuth', '208.9804', 15, 6,
          'Po', 'Polonium', '(209)', 16, 6,
          'At', 'Astatine', '(210)', 17, 6,
          'Rn', 'Radon', '(222)', 18, 6,
          'Fr', 'Francium', '(223)', 1, 7,
          'Ra', 'Radium', '(226)', 2, 7,
          'Ac', 'Actinium', '(227)', 4, 10,
          'Th', 'Thorium', '232.03806', 5, 10,
          'Pa', 'Protactinium', '231.0588', 6, 10,
          'U', 'Uranium', '238.02891', 7, 10,
          'Np', 'Neptunium', '(237)', 8, 10,
          'Pu', 'Plutonium', '(244)', 9, 10,
          'Am', 'Americium', '(243)', 10, 10,
          'Cm', 'Curium', '(247)', 11, 10,
          'Bk', 'Berkelium', '(247)', 12, 10,
          'Cf', 'Californium', '(251)', 13, 10,
          'Es', 'Einstenium', '(252)', 14, 10,
          'Fm', 'Fermium', '(257)', 15, 10,
          'Md', 'Mendelevium', '(258)', 16, 10,
          'No', 'Nobelium', '(259)', 17, 10,
          'Lr', 'Lawrencium', '(262)', 18, 10,
          'Rf', 'Rutherfordium', '(267)', 4, 7,
          'Db', 'Dubnium', '(268)', 5, 7,
          'Sg', 'Seaborgium', '(271)', 6, 7,
          'Bh', 'Bohrium', '(272)', 7, 7,
          'Hs', 'Hassium', '(270)', 8, 7,
          'Mt', 'Meitnerium', '(276)', 9, 7,
          'Ds', 'Darmstadium', '(281)', 10, 7,
          'Rg', 'Roentgenium', '(280)', 11, 7,
          'Cn', 'Copernicium', '(285)', 12, 7,
          'Nh', 'Nihonium', '(286)', 13, 7,
          'Fl', 'Flerovium', '(289)', 14, 7,
          'Mc', 'Moscovium', '(290)', 15, 7,
          'Lv', 'Livermorium', '(293)', 16, 7,
          'Ts', 'Tennessine', '(294)', 17, 7,
          'Og', 'Oganesson', '(294)', 18, 7
        ];

        const objects = [];
        const targets = { table: [], sphere: [], helix: [], grid: [] };

        init();
        animate();

        function init() {

          // Create a container element reference
          const containerElement = document.createElement('div');
          containerElement.style.position = 'absolute';
          containerElement.style.top = '0';
          containerElement.style.left = '0';
          containerElement.id = 'container1';
          document.body.appendChild(containerElement);

          // Create the menu div
          const menuDiv = document.createElement('div');
          menuDiv.id = 'menu';

          // Create buttons
          const tableButton = document.createElement('button');
          tableButton.id = 'table';
          tableButton.textContent = 'TABLE';

          const sphereButton = document.createElement('button');
          sphereButton.id = 'sphere';
          sphereButton.textContent = 'SPHERE';

          const helixButton = document.createElement('button');
          helixButton.id = 'helix';
          helixButton.textContent = 'HELIX';

          const gridButton = document.createElement('button');
          gridButton.id = 'grid';
          gridButton.textContent = 'GRID';

          // Append buttons to the menu div
          menuDiv.appendChild(tableButton);
          menuDiv.appendChild(sphereButton);
          menuDiv.appendChild(helixButton);
          menuDiv.appendChild(gridButton);

          containerElement.appendChild(menuDiv);

          // Append the menu div to the container
          if (sliderVerticalPos === 0) {
            document.getElementById( 'menu' ).style.display = "none";
          } else {
            document.getElementById( 'menu' ).style.display = "block";
          }


          camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
          camera.position.z = 3000;

          scene = new THREE.Scene();

          scene1 = scene.clone();

          
          // table

          for ( let i = 0; i < table.length; i += 5 ) {

            const element = document.createElement( 'div' );
            element.className = 'element';
            element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';

            const number = document.createElement( 'div' );
            number.className = 'number';
            number.textContent = ( i / 5 ) + 1;
            element.appendChild( number );

            const symbol = document.createElement( 'div' );
            symbol.className = 'symbol';
            symbol.textContent = table[ i ];
            element.appendChild( symbol );

            const details = document.createElement( 'div' );
            details.className = 'details';
            details.innerHTML = table[ i + 1 ] + '<br>' + table[ i + 2 ];
            element.appendChild( details );

            const objectCSS = new THREE.CSS3DObject( element );
            objectCSS.position.x = Math.random() * 4000 - 2000;
            objectCSS.position.y = Math.random() * 4000 - 2000;
            objectCSS.position.z = Math.random() * 4000 - 2000;
            scene.add( objectCSS );

            objects.push( objectCSS );

            //

            const object = new THREE.Object3D();
            object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
            object.position.y = - ( table[ i + 4 ] * 180 ) + 990;

            targets.table.push( object );

          }

          // sphere

          const vector = new THREE.Vector3();

          for ( let i = 0, l = objects.length; i < l; i ++ ) {

            const phi = Math.acos( - 1 + ( 2 * i ) / l );
            const theta = Math.sqrt( l * Math.PI ) * phi;

            const object = new THREE.Object3D();

            object.position.setFromSphericalCoords( 800, phi, theta );

            vector.copy( object.position ).multiplyScalar( 2 );

            object.lookAt( vector );

            targets.sphere.push( object );

          }

          // helix

          for ( let i = 0, l = objects.length; i < l; i ++ ) {

            const theta = i * 0.175 + Math.PI;
            const y = - ( i * 8 ) + 450;

            const object = new THREE.Object3D();

            object.position.setFromCylindricalCoords( 900, theta, y );

            vector.x = object.position.x * 2;
            vector.y = object.position.y;
            vector.z = object.position.z * 2;

            object.lookAt( vector );

            targets.helix.push( object );

          }

          // grid

          for ( let i = 0; i < objects.length; i ++ ) {

            const object = new THREE.Object3D();

            object.position.x = ( ( i % 5 ) * 400 ) - 800;
            object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
            object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;

            targets.grid.push( object );

          }

          //

          rendererCSS3D = new THREE.CSS3DRenderer();
          document.getElementById( 'container1' ).appendChild( rendererCSS3D.domElement );
        
          controls = new THREE.TrackballControls( camera, rendererCSS3D.domElement );
          controls.minDistance = 500;
          controls.maxDistance = 6000;
          controls.addEventListener( 'change', render );

          const buttonTable = document.getElementById( 'table' );
          buttonTable.addEventListener( 'pointerdown', function () {

            console.log("this is triggered");

            transform( targets.table, 2000 );

          } );

          const buttonSphere = document.getElementById( 'sphere' );
          buttonSphere.addEventListener( 'pointerdown', function () {
            transform( targets.sphere, 2000 );

          } );

          const buttonHelix = document.getElementById( 'helix' );
          buttonHelix.addEventListener( 'pointerdown', function () {
            transform( targets.helix, 2000 );
          });

          const buttonGrid = document.getElementById( 'grid' );
          buttonGrid.addEventListener( 'pointerdown', function () {

            transform( targets.grid, 2000 );

          } );

          transform( targets.table, 2000 );

          
          window.addEventListener( 'resize', onWindowResize );

        }

        function transform( targets, duration ) {

          TWEEN.removeAll();

          for ( let i = 0; i < objects.length; i ++ ) {

            const object = objects[ i ];
            const target = targets[ i ];

            new TWEEN.Tween( object.position )
              .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
              .easing( TWEEN.Easing.Exponential.InOut )
              .start();


            new TWEEN.Tween( object.rotation )
              .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
              .easing( TWEEN.Easing.Exponential.InOut )
              .start();

          }

          new TWEEN.Tween( this )
            .to( {}, duration * 2 )
            .onUpdate( render )
            .start();

        }



  
        function onWindowResize() {

          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          rendererCSS3D.setSize( window.innerWidth, window.innerHeight );

          render();

        }


        function animate() {

          requestAnimationFrame( animate );

          TWEEN.update();

          controls.update();

        }

        function render() {
          renderSceneSetupScene3(scene, camera);
        }

  }




  //////////////////////////////////
  // Scene4
  /////////////////////////

  function initLoadScene4(renderer) {

        let camera, scene;
        let controls;

        const particlesTotal = 512;
        const positions = [];
        const objects = [];
        let current = 0;

        init();
        animate();

        function init() {


          // Create a container element reference
          const containerElement = document.createElement('div');
          containerElement.style.position = 'absolute';
          containerElement.style.top = '0';
          containerElement.style.left = '0';
          containerElement.id = 'container1';
          document.body.appendChild(containerElement);


          camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
          camera.position.set( 600, 400, 1500 );
          camera.lookAt( 0, 0, 0 );

          scene = new THREE.Scene();
          scene1 = scene.clone();

          const image = document.createElement( 'img' );
          image.addEventListener( 'load', function () {

            for ( let i = 0; i < particlesTotal; i ++ ) {

              const object = new THREE.CSS3DSprite( image.cloneNode() );
              object.position.x = Math.random() * 4000 - 2000,
              object.position.y = Math.random() * 4000 - 2000,
              object.position.z = Math.random() * 4000 - 2000;
              scene.add( object );

              objects.push( object );

            }

            transition();

          } );
          image.src = '../static/src/lib/THREEJS/examples/textures/sprite.png';

          // Plane

          const amountX = 16;
          const amountZ = 32;
          const separationPlane = 150;
          const offsetX = ( ( amountX - 1 ) * separationPlane ) / 2;
          const offsetZ = ( ( amountZ - 1 ) * separationPlane ) / 2;

          for ( let i = 0; i < particlesTotal; i ++ ) {

            const x = ( i % amountX ) * separationPlane;
            const z = Math.floor( i / amountX ) * separationPlane;
            const y = ( Math.sin( x * 0.5 ) + Math.sin( z * 0.5 ) ) * 200;

            positions.push( x - offsetX, y, z - offsetZ );

          }

          // Cube

          const amount = 8;
          const separationCube = 150;
          const offset = ( ( amount - 1 ) * separationCube ) / 2;

          for ( let i = 0; i < particlesTotal; i ++ ) {

            const x = ( i % amount ) * separationCube;
            const y = Math.floor( ( i / amount ) % amount ) * separationCube;
            const z = Math.floor( i / ( amount * amount ) ) * separationCube;

            positions.push( x - offset, y - offset, z - offset );

          }

          // Random

          for ( let i = 0; i < particlesTotal; i ++ ) {

            positions.push(
              Math.random() * 4000 - 2000,
              Math.random() * 4000 - 2000,
              Math.random() * 4000 - 2000
            );

          }

          // Sphere

          const radius = 750;

          for ( let i = 0; i < particlesTotal; i ++ ) {

            const phi = Math.acos( - 1 + ( 2 * i ) / particlesTotal );
            const theta = Math.sqrt( particlesTotal * Math.PI ) * phi;

            positions.push(
              radius * Math.cos( theta ) * Math.sin( phi ),
              radius * Math.sin( theta ) * Math.sin( phi ),
              radius * Math.cos( phi )
            );

          }

          //

          rendererCSS3D = new THREE.CSS3DRenderer();
          document.getElementById( 'container1' ).appendChild( rendererCSS3D.domElement );

          
          controls = new THREE.TrackballControls( camera, rendererCSS3D.domElement );

          //

          window.addEventListener( 'resize', onWindowResize );

        }

        function onWindowResize() {

          camera.aspect = sliderVerticalPos / window.innerHeight;
          camera.updateProjectionMatrix();

          rendererCSS3D.setSize( sliderVerticalPos, window.innerHeight );

        }

        function transition() {

          const offset = current * particlesTotal * 3;
          const duration = 2000;

          for ( let i = 0, j = offset; i < particlesTotal; i ++, j += 3 ) {

            const object = objects[ i ];

            new TWEEN.Tween( object.position )
              .to( {
                x: positions[ j ],
                y: positions[ j + 1 ],
                z: positions[ j + 2 ]
              }, Math.random() * duration + duration )
              .easing( TWEEN.Easing.Exponential.InOut )
              .start();

          }

          new TWEEN.Tween( this )
            .to( {}, duration * 3 )
            .onComplete( transition )
            .start();

          current = ( current + 1 ) % 4;

        }

        function animate() {

          requestAnimationFrame( animate );

          TWEEN.update();
          controls.update();

          const time = performance.now();

          for ( let i = 0, l = objects.length; i < l; i ++ ) {

            const object = objects[ i ];
            const scale = Math.sin( ( Math.floor( object.position.x ) + time ) * 0.002 ) * 0.3 + 1;
            object.scale.set( scale, scale, scale );

          }

          renderSceneSetupScene3(scene, camera);
        
      }
  }


  //////////////////////////////////
  // Scene5
  /////////////////////////

  function initLoadScene5(renderer) {
      // - Global variables -

      // Graphics variables
      let container;
      let camera, controls, scene;
      let textureLoader;
      const clock = new THREE.Clock();

      const mouseCoords = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
      const ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

      // Physics variables
      const gravityConstant = 7.8;
      let collisionConfiguration;
      let dispatcher;
      let broadphase;
      let solver;
      let physicsWorld;
      const margin = 0.05;

      const convexBreaker = new THREE.ConvexObjectBreaker();

      // Rigid bodies include all movable objects
      const rigidBodies = [];

      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      let transformAux1;
      let tempBtVec3_1;

      const objectsToRemove = [];

      for ( let i = 0; i < 500; i ++ ) {

        objectsToRemove[ i ] = null;

      }

      let numObjectsToRemove = 0;

      const impactPoint = new THREE.Vector3();
      const impactNormal = new THREE.Vector3();

      // - Main code -

      Ammo().then( function ( AmmoLib ) {

        Ammo = AmmoLib;

        init();
        animate();

      } );


      // - Functions -

      function init() {

        initGraphics();

        initPhysics();

        createObjects();

        initInput();

      }

      function initGraphics() {

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xbfd1e5 );

        camera.position.set( - 14, 8, 16 );

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.target.set( 0, 2, 0 );
        controls.update();

        textureLoader = new THREE.TextureLoader();

        const ambientLight = new THREE.AmbientLight( 0xbbbbbb );
        scene.add( ambientLight );

        const light = new THREE.DirectionalLight( 0xffffff, 3 );
        light.position.set( - 10, 18, 5 );
        light.castShadow = true;
        const d = 14;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.near = 2;
        light.shadow.camera.far = 50;

        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;

        scene.add( light );

        window.addEventListener( 'resize', onWindowResize );

      }

      function initPhysics() {

        // Physics configuration

        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
        physicsWorld.setGravity( new Ammo.btVector3( 0, - gravityConstant, 0 ) );

        transformAux1 = new Ammo.btTransform();
        tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );

      }

      function createObject( mass, halfExtents, pos, quat, material ) {

        const object = new THREE.Mesh( new THREE.BoxGeometry( halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2 ), material );
        object.position.copy( pos );
        object.quaternion.copy( quat );
        convexBreaker.prepareBreakableObject( object, mass, new THREE.Vector3(), new THREE.Vector3(), true );
        createDebrisFromBreakableObject( object );

      }

      function createObjects() {

        // Ground
        pos.set( 0, - 0.5, 0 );
        quat.set( 0, 0, 0, 1 );
        const ground = createParalellepipedWithPhysics( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
        ground.receiveShadow = true;
        textureLoader.load( '../static/src/lib/THREEJS/examples/textures/grid.png', function ( texture ) {

          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set( 40, 40 );
          ground.material.map = texture;
          ground.material.needsUpdate = true;

        } );

        // Tower 1
        const towerMass = 1000;
        const towerHalfExtents = new THREE.Vector3( 2, 5, 2 );
        pos.set( - 8, 5, 0 );
        quat.set( 0, 0, 0, 1 );
        createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xB03014 ) );

        // Tower 2
        pos.set( 8, 5, 0 );
        quat.set( 0, 0, 0, 1 );
        createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xB03214 ) );

        //Bridge
        const bridgeMass = 100;
        const bridgeHalfExtents = new THREE.Vector3( 7, 0.2, 1.5 );
        pos.set( 0, 10.2, 0 );
        quat.set( 0, 0, 0, 1 );
        createObject( bridgeMass, bridgeHalfExtents, pos, quat, createMaterial( 0xB3B865 ) );

        // Stones
        const stoneMass = 120;
        const stoneHalfExtents = new THREE.Vector3( 1, 2, 0.15 );
        const numStones = 8;
        quat.set( 0, 0, 0, 1 );
        for ( let i = 0; i < numStones; i ++ ) {

          pos.set( 0, 2, 15 * ( 0.5 - i / ( numStones + 1 ) ) );

          createObject( stoneMass, stoneHalfExtents, pos, quat, createMaterial( 0xB0B0B0 ) );

        }

        // Mountain
        const mountainMass = 860;
        const mountainHalfExtents = new THREE.Vector3( 4, 5, 4 );
        pos.set( 5, mountainHalfExtents.y * 0.5, - 7 );
        quat.set( 0, 0, 0, 1 );
        const mountainPoints = [];
        mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( 0, mountainHalfExtents.y, 0 ) );
        const mountain = new THREE.Mesh( new THREE.ConvexGeometry( mountainPoints ), createMaterial( 0xB03814 ) );
        mountain.position.copy( pos );
        mountain.quaternion.copy( quat );
        convexBreaker.prepareBreakableObject( mountain, mountainMass, new THREE.Vector3(), new THREE.Vector3(), true );
        createDebrisFromBreakableObject( mountain );

      }

      function createParalellepipedWithPhysics( sx, sy, sz, mass, pos, quat, material ) {

        const object = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
        const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
        shape.setMargin( margin );

        createRigidBody( object, shape, mass, pos, quat );

        return object;

      }

      function createDebrisFromBreakableObject( object ) {

        object.castShadow = true;
        object.receiveShadow = true;

        const shape = createConvexHullPhysicsShape( object.geometry.attributes.position.array );
        shape.setMargin( margin );

        const body = createRigidBody( object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity );

        // Set pointer back to the three object only in the debris objects
        const btVecUserData = new Ammo.btVector3( 0, 0, 0 );
        btVecUserData.threeObject = object;
        body.setUserPointer( btVecUserData );

      }

      function removeDebris( object ) {

        scene.remove( object );

        physicsWorld.removeRigidBody( object.userData.physicsBody );

      }

      function createConvexHullPhysicsShape( coords ) {

        const shape = new Ammo.btConvexHullShape();

        for ( let i = 0, il = coords.length; i < il; i += 3 ) {

          tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], coords[ i + 2 ] );
          const lastOne = ( i >= ( il - 3 ) );
          shape.addPoint( tempBtVec3_1, lastOne );

        }

        return shape;

      }

      function createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

        if ( pos ) {

          object.position.copy( pos );

        } else {

          pos = object.position;

        }

        if ( quat ) {

          object.quaternion.copy( quat );

        } else {

          quat = object.quaternion;

        }

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        const motionState = new Ammo.btDefaultMotionState( transform );

        const localInertia = new Ammo.btVector3( 0, 0, 0 );
        physicsShape.calculateLocalInertia( mass, localInertia );

        const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
        const body = new Ammo.btRigidBody( rbInfo );

        body.setFriction( 0.5 );

        if ( vel ) {

          body.setLinearVelocity( new Ammo.btVector3( vel.x, vel.y, vel.z ) );

        }

        if ( angVel ) {

          body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );

        }

        object.userData.physicsBody = body;
        object.userData.collided = false;

        scene.add( object );

        if ( mass > 0 ) {

          rigidBodies.push( object );

          // Disable deactivation
          body.setActivationState( 4 );

        }

        physicsWorld.addRigidBody( body );

        return body;

      }

      function createRandomColor() {

        return Math.floor( Math.random() * ( 1 << 24 ) );

      }

      function createMaterial( color ) {

        color = color || createRandomColor();
        return new THREE.MeshPhongMaterial( { color: color } );

      }

      function initInput() {

        window.addEventListener( 'pointerdown', function ( event ) {

          mouseCoords.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1
          );

          raycaster.setFromCamera( mouseCoords, camera );

          // Creates a ball and throws it
          const ballMass = 35;
          const ballRadius = 0.4;

          const ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ), ballMaterial );
          ball.castShadow = true;
          ball.receiveShadow = true;
          const ballShape = new Ammo.btSphereShape( ballRadius );
          ballShape.setMargin( margin );
          pos.copy( raycaster.ray.direction );
          pos.add( raycaster.ray.origin );
          quat.set( 0, 0, 0, 1 );
          const ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );

          pos.copy( raycaster.ray.direction );
          pos.multiplyScalar( 24 );
          ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

        } );

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

        const deltaTime = clock.getDelta();

        updatePhysics( deltaTime );

        renderSceneSetup(scene, camera)

      }

      function updatePhysics( deltaTime ) {

        // Step world
        physicsWorld.stepSimulation( deltaTime, 10 );

        // Update rigid bodies
        for ( let i = 0, il = rigidBodies.length; i < il; i ++ ) {

          const objThree = rigidBodies[ i ];
          const objPhys = objThree.userData.physicsBody;
          const ms = objPhys.getMotionState();

          if ( ms ) {

            ms.getWorldTransform( transformAux1 );
            const p = transformAux1.getOrigin();
            const q = transformAux1.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

            objThree.userData.collided = false;

          }

        }

        for ( let i = 0, il = dispatcher.getNumManifolds(); i < il; i ++ ) {

          const contactManifold = dispatcher.getManifoldByIndexInternal( i );
          const rb0 = Ammo.castObject( contactManifold.getBody0(), Ammo.btRigidBody );
          const rb1 = Ammo.castObject( contactManifold.getBody1(), Ammo.btRigidBody );

          const threeObject0 = Ammo.castObject( rb0.getUserPointer(), Ammo.btVector3 ).threeObject;
          const threeObject1 = Ammo.castObject( rb1.getUserPointer(), Ammo.btVector3 ).threeObject;

          if ( ! threeObject0 && ! threeObject1 ) {

            continue;

          }

          const userData0 = threeObject0 ? threeObject0.userData : null;
          const userData1 = threeObject1 ? threeObject1.userData : null;

          const breakable0 = userData0 ? userData0.breakable : false;
          const breakable1 = userData1 ? userData1.breakable : false;

          const collided0 = userData0 ? userData0.collided : false;
          const collided1 = userData1 ? userData1.collided : false;

          if ( ( ! breakable0 && ! breakable1 ) || ( collided0 && collided1 ) ) {

            continue;

          }

          let contact = false;
          let maxImpulse = 0;
          for ( let j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++ ) {

            const contactPoint = contactManifold.getContactPoint( j );

            if ( contactPoint.getDistance() < 0 ) {

              contact = true;
              const impulse = contactPoint.getAppliedImpulse();

              if ( impulse > maxImpulse ) {

                maxImpulse = impulse;
                const pos = contactPoint.get_m_positionWorldOnB();
                const normal = contactPoint.get_m_normalWorldOnB();
                impactPoint.set( pos.x(), pos.y(), pos.z() );
                impactNormal.set( normal.x(), normal.y(), normal.z() );

              }

              break;

            }

          }

          // If no point has contact, abort
          if ( ! contact ) continue;

          // Subdivision

          const fractureImpulse = 250;

          if ( breakable0 && ! collided0 && maxImpulse > fractureImpulse ) {

            const debris = convexBreaker.subdivideByImpact( threeObject0, impactPoint, impactNormal, 1, 2, 1.5 );

            const numObjects = debris.length;
            for ( let j = 0; j < numObjects; j ++ ) {

              const vel = rb0.getLinearVelocity();
              const angVel = rb0.getAngularVelocity();
              const fragment = debris[ j ];
              fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
              fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

              createDebrisFromBreakableObject( fragment );

            }

            objectsToRemove[ numObjectsToRemove ++ ] = threeObject0;
            userData0.collided = true;

          }

          if ( breakable1 && ! collided1 && maxImpulse > fractureImpulse ) {

            const debris = convexBreaker.subdivideByImpact( threeObject1, impactPoint, impactNormal, 1, 2, 1.5 );

            const numObjects = debris.length;
            for ( let j = 0; j < numObjects; j ++ ) {

              const vel = rb1.getLinearVelocity();
              const angVel = rb1.getAngularVelocity();
              const fragment = debris[ j ];
              fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
              fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

              createDebrisFromBreakableObject( fragment );

            }

            objectsToRemove[ numObjectsToRemove ++ ] = threeObject1;
            userData1.collided = true;

          }

        }

        for ( let i = 0; i < numObjectsToRemove; i ++ ) {

          removeDebris( objectsToRemove[ i ] );

        }

        numObjectsToRemove = 0;

      }

  }



  //////////////////////////////////
  // Scene6
  /////////////////////////

  function initLoadScene6(renderer) {
      // Graphics variables
      let camera, controls, scene;
      let textureLoader;
      const clock = new THREE.Clock();

      const mouseCoords = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
      const ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );

      // Physics variables
      const gravityConstant = 7.8;
      let collisionConfiguration;
      let dispatcher;
      let broadphase;
      let solver;
      let physicsWorld;
      const margin = 0.05;

      const convexBreaker = new THREE.ConvexObjectBreaker();

      // Rigid bodies include all movable objects
      const rigidBodies = [];

      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      let transformAux1;
      let tempBtVec3_1;

      const objectsToRemove = [];

      for ( let i = 0; i < 500; i ++ ) {

        objectsToRemove[ i ] = null;

      }

      let numObjectsToRemove = 0;

      const impactPoint = new THREE.Vector3();
      const impactNormal = new THREE.Vector3();

      // - Main code -

      Ammo().then( function ( AmmoLib ) {

        Ammo = AmmoLib;

        init();
        animate();

      } );


      // - Functions -

      function init() {

        initGraphics();

        initPhysics();

        createObjects();

        initInput();

      }

      function initGraphics() {

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xbfd1e5 );

        camera.position.set( - 14, 8, 16 );

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.target.set( 0, 2, 0 );
        controls.update();

        textureLoader = new THREE.TextureLoader();

        const ambientLight = new THREE.AmbientLight( 0xbbbbbb );
        scene.add( ambientLight );

        const light = new THREE.DirectionalLight( 0xffffff, 3 );
        light.position.set( - 10, 18, 5 );
        light.castShadow = true;
        const d = 14;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.near = 2;
        light.shadow.camera.far = 50;

        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;

        scene.add( light );

        //

        window.addEventListener( 'resize', onWindowResize );

      }

      function initPhysics() {

        // Physics configuration

        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
        physicsWorld.setGravity( new Ammo.btVector3( 0, - gravityConstant, 0 ) );

        transformAux1 = new Ammo.btTransform();
        tempBtVec3_1 = new Ammo.btVector3( 0, 0, 0 );

      }

      function createObject( mass, halfExtents, pos, quat, material ) {

        const object = new THREE.Mesh( new THREE.BoxGeometry( halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2 ), material );
        object.position.copy( pos );
        object.quaternion.copy( quat );
        convexBreaker.prepareBreakableObject( object, mass, new THREE.Vector3(), new THREE.Vector3(), true );
        createDebrisFromBreakableObject( object );

      }

      function createObjects() {

        // Ground
        pos.set( 0, - 0.5, 0 );
        quat.set( 0, 0, 0, 1 );
        const ground = createParalellepipedWithPhysics( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
        ground.receiveShadow = true;
        textureLoader.load( '../static/src/lib/THREEJS/examples/textures/grid.png', function ( texture ) {

          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set( 40, 40 );
          ground.material.map = texture;
          ground.material.needsUpdate = true;

        } );

        // Tower 1
        const towerMass = 1000;
        const towerHalfExtents = new THREE.Vector3( 2, 5, 2 );
        pos.set( - 8, 5, 0 );
        quat.set( 0, 0, 0, 1 );
        createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xB03014 ) );

        // Tower 2
        pos.set( 8, 5, 0 );
        quat.set( 0, 0, 0, 1 );
        createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xB03214 ) );

        //Bridge
        const bridgeMass = 100;
        const bridgeHalfExtents = new THREE.Vector3( 7, 0.2, 1.5 );
        pos.set( 0, 10.2, 0 );
        quat.set( 0, 0, 0, 1 );
        createObject( bridgeMass, bridgeHalfExtents, pos, quat, createMaterial( 0xB3B865 ) );

        // Stones
        const stoneMass = 120;
        const stoneHalfExtents = new THREE.Vector3( 1, 2, 0.15 );
        const numStones = 8;
        quat.set( 0, 0, 0, 1 );
        for ( let i = 0; i < numStones; i ++ ) {

          pos.set( 0, 2, 15 * ( 0.5 - i / ( numStones + 1 ) ) );

          createObject( stoneMass, stoneHalfExtents, pos, quat, createMaterial( 0xB0B0B0 ) );

        }

        // Mountain
        const mountainMass = 860;
        const mountainHalfExtents = new THREE.Vector3( 4, 5, 4 );
        pos.set( 5, mountainHalfExtents.y * 0.5, - 7 );
        quat.set( 0, 0, 0, 1 );
        const mountainPoints = [];
        mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
        mountainPoints.push( new THREE.Vector3( 0, mountainHalfExtents.y, 0 ) );
        const mountain = new THREE.Mesh( new THREE.ConvexGeometry( mountainPoints ), createMaterial( 0xB03814 ) );
        mountain.position.copy( pos );
        mountain.quaternion.copy( quat );
        convexBreaker.prepareBreakableObject( mountain, mountainMass, new THREE.Vector3(), new THREE.Vector3(), true );
        createDebrisFromBreakableObject( mountain );

      }

      function createParalellepipedWithPhysics( sx, sy, sz, mass, pos, quat, material ) {

        const object = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
        const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
        shape.setMargin( margin );

        createRigidBody( object, shape, mass, pos, quat );

        return object;

      }

      function createDebrisFromBreakableObject( object ) {

        object.castShadow = true;
        object.receiveShadow = true;

        const shape = createConvexHullPhysicsShape( object.geometry.attributes.position.array );
        shape.setMargin( margin );

        const body = createRigidBody( object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity );

        // Set pointer back to the three object only in the debris objects
        const btVecUserData = new Ammo.btVector3( 0, 0, 0 );
        btVecUserData.threeObject = object;
        body.setUserPointer( btVecUserData );

      }

      function removeDebris( object ) {

        scene.remove( object );

        physicsWorld.removeRigidBody( object.userData.physicsBody );

      }

      function createConvexHullPhysicsShape( coords ) {

        const shape = new Ammo.btConvexHullShape();

        for ( let i = 0, il = coords.length; i < il; i += 3 ) {

          tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], coords[ i + 2 ] );
          const lastOne = ( i >= ( il - 3 ) );
          shape.addPoint( tempBtVec3_1, lastOne );

        }

        return shape;

      }

      function createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

        if ( pos ) {

          object.position.copy( pos );

        } else {

          pos = object.position;

        }

        if ( quat ) {

          object.quaternion.copy( quat );

        } else {

          quat = object.quaternion;

        }

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        const motionState = new Ammo.btDefaultMotionState( transform );

        const localInertia = new Ammo.btVector3( 0, 0, 0 );
        physicsShape.calculateLocalInertia( mass, localInertia );

        const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
        const body = new Ammo.btRigidBody( rbInfo );

        body.setFriction( 0.5 );

        if ( vel ) {

          body.setLinearVelocity( new Ammo.btVector3( vel.x, vel.y, vel.z ) );

        }

        if ( angVel ) {

          body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );

        }

        object.userData.physicsBody = body;
        object.userData.collided = false;

        scene.add( object );

        if ( mass > 0 ) {

          rigidBodies.push( object );

          // Disable deactivation
          body.setActivationState( 4 );

        }

        physicsWorld.addRigidBody( body );

        return body;

      }

      function createRandomColor() {

        return Math.floor( Math.random() * ( 1 << 24 ) );

      }

      function createMaterial( color ) {

        color = color || createRandomColor();
        return new THREE.MeshPhongMaterial( { color: color } );

      }

      function initInput() {

        window.addEventListener( 'pointerdown', function ( event ) {

          mouseCoords.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1
          );

          raycaster.setFromCamera( mouseCoords, camera );

          // Creates a ball and throws it
          const ballMass = 35;
          const ballRadius = 0.4;

          const ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ), ballMaterial );
          ball.castShadow = true;
          ball.receiveShadow = true;
          const ballShape = new Ammo.btSphereShape( ballRadius );
          ballShape.setMargin( margin );
          pos.copy( raycaster.ray.direction );
          pos.add( raycaster.ray.origin );
          quat.set( 0, 0, 0, 1 );
          const ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );

          pos.copy( raycaster.ray.direction );
          pos.multiplyScalar( 24 );
          ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

        } );

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

        const deltaTime = clock.getDelta();

        updatePhysics( deltaTime );

        renderSceneSetup(scene, camera);

      }

      function updatePhysics( deltaTime ) {

        // Step world
        physicsWorld.stepSimulation( deltaTime, 10 );

        // Update rigid bodies
        for ( let i = 0, il = rigidBodies.length; i < il; i ++ ) {

          const objThree = rigidBodies[ i ];
          const objPhys = objThree.userData.physicsBody;
          const ms = objPhys.getMotionState();

          if ( ms ) {

            ms.getWorldTransform( transformAux1 );
            const p = transformAux1.getOrigin();
            const q = transformAux1.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

            objThree.userData.collided = false;

          }

        }

        for ( let i = 0, il = dispatcher.getNumManifolds(); i < il; i ++ ) {

          const contactManifold = dispatcher.getManifoldByIndexInternal( i );
          const rb0 = Ammo.castObject( contactManifold.getBody0(), Ammo.btRigidBody );
          const rb1 = Ammo.castObject( contactManifold.getBody1(), Ammo.btRigidBody );

          const threeObject0 = Ammo.castObject( rb0.getUserPointer(), Ammo.btVector3 ).threeObject;
          const threeObject1 = Ammo.castObject( rb1.getUserPointer(), Ammo.btVector3 ).threeObject;

          if ( ! threeObject0 && ! threeObject1 ) {

            continue;

          }

          const userData0 = threeObject0 ? threeObject0.userData : null;
          const userData1 = threeObject1 ? threeObject1.userData : null;

          const breakable0 = userData0 ? userData0.breakable : false;
          const breakable1 = userData1 ? userData1.breakable : false;

          const collided0 = userData0 ? userData0.collided : false;
          const collided1 = userData1 ? userData1.collided : false;

          if ( ( ! breakable0 && ! breakable1 ) || ( collided0 && collided1 ) ) {

            continue;

          }

          let contact = false;
          let maxImpulse = 0;
          for ( let j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++ ) {

            const contactPoint = contactManifold.getContactPoint( j );

            if ( contactPoint.getDistance() < 0 ) {

              contact = true;
              const impulse = contactPoint.getAppliedImpulse();

              if ( impulse > maxImpulse ) {

                maxImpulse = impulse;
                const pos = contactPoint.get_m_positionWorldOnB();
                const normal = contactPoint.get_m_normalWorldOnB();
                impactPoint.set( pos.x(), pos.y(), pos.z() );
                impactNormal.set( normal.x(), normal.y(), normal.z() );

              }

              break;

            }

          }

          // If no point has contact, abort
          if ( ! contact ) continue;

          // Subdivision

          const fractureImpulse = 250;

          if ( breakable0 && ! collided0 && maxImpulse > fractureImpulse ) {

            const debris = convexBreaker.subdivideByImpact( threeObject0, impactPoint, impactNormal, 1, 2, 1.5 );

            const numObjects = debris.length;
            for ( let j = 0; j < numObjects; j ++ ) {

              const vel = rb0.getLinearVelocity();
              const angVel = rb0.getAngularVelocity();
              const fragment = debris[ j ];
              fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
              fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

              createDebrisFromBreakableObject( fragment );

            }

            objectsToRemove[ numObjectsToRemove ++ ] = threeObject0;
            userData0.collided = true;

          }

          if ( breakable1 && ! collided1 && maxImpulse > fractureImpulse ) {

            const debris = convexBreaker.subdivideByImpact( threeObject1, impactPoint, impactNormal, 1, 2, 1.5 );

            const numObjects = debris.length;
            for ( let j = 0; j < numObjects; j ++ ) {

              const vel = rb1.getLinearVelocity();
              const angVel = rb1.getAngularVelocity();
              const fragment = debris[ j ];
              fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
              fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

              createDebrisFromBreakableObject( fragment );

            }

            objectsToRemove[ numObjectsToRemove ++ ] = threeObject1;
            userData1.collided = true;

          }

        }

        for ( let i = 0; i < numObjectsToRemove; i ++ ) {

          removeDebris( objectsToRemove[ i ] );

        }

        numObjectsToRemove = 0;

      }
  }



  //////////////////////////////////
  // Scene7
  /////////////////////////

  function initLoadScene7(renderer) {

              //variable declaration section
              let physicsWorld, scene, camera, rigidBodies = [], pos = new THREE.Vector3(), tmpTrans = null;
              let ball, moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0, down: 0 };

              const STATE = { DISABLE_DEACTIVATION : 4 };

              let cbContactResult;
              let redTile, cbContactPairResult;

              //Ammojs Initialization
              Ammo().then(start)

              function start (){

                  tmpTrans = new Ammo.btTransform();

                  setupPhysicsWorld();

                  setupGraphics();

                  createFloorTiles();

                  createBall();

                  setupContactResultCallback();

                  setupContactPairResultCallback();

                  setupEventHandlers();
                  
                  renderFrame();

              }

              function setupPhysicsWorld(){

                  let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
                      dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
                      overlappingPairCache    = new Ammo.btDbvtBroadphase(),
                      solver                  = new Ammo.btSequentialImpulseConstraintSolver();
                      physicsWorld            = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
                      physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

              }


              function setupGraphics(){

                  //create clock for timing
                  clock = new THREE.Clock();

                  //create the scene
                  scene = new THREE.Scene();
                  scene.background = new THREE.Color( 0xabfeff );

                  //create camera
                  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
                  camera.position.set( 0, 80, 40 );
                  camera.lookAt(new THREE.Vector3(0, 0, 0));

                  //Add hemisphere light
                  let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
                  hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
                  hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
                  hemiLight.position.set( 0, 50, 0 );
                  scene.add( hemiLight );

                  //Add directional light
                  let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
                  dirLight.color.setHSL( 0.1, 1, 0.95 );
                  dirLight.position.set( -1, 1.75, 1 );
                  dirLight.position.multiplyScalar( 100 );
                  scene.add( dirLight );

                  dirLight.castShadow = true;

                  dirLight.shadow.mapSize.width = 2048;
                  dirLight.shadow.mapSize.height = 2048;

                  let d = 50;

                  dirLight.shadow.camera.left = -d;
                  dirLight.shadow.camera.right = d;
                  dirLight.shadow.camera.top = d;
                  dirLight.shadow.camera.bottom = -d;

                  dirLight.shadow.camera.far = 13500;

                  renderer.gammaInput = true;
                  renderer.gammaOutput = true;

                  renderer.shadowMap.enabled = true;

              }

          
              function renderFrame(){

                  let deltaTime = clock.getDelta();

                  moveBall();

                  updatePhysics( deltaTime );

                  renderSceneSetup( scene, camera );

                  requestAnimationFrame( renderFrame );

              }


              function setupEventHandlers(){

                  window.addEventListener( 'resize', onWindowResize, false );
                  window.addEventListener( 'keydown', handleKeyDown, false);
                  window.addEventListener( 'keyup', handleKeyUp, false);

              }


              function onWindowResize() {

                  camera.aspect = window.innerWidth / window.innerHeight;
                  camera.updateProjectionMatrix();

                  renderer.setSize( window.innerWidth, window.innerHeight );

              }

              
              function handleKeyDown(event){

                  let keyCode = event.keyCode;

                  switch(keyCode){

                      case 87: //W: FORWARD
                          moveDirection.forward = 1;
                          break;
                          
                      case 83: //S: BACK
                          moveDirection.back = 1;
                          break;
                          
                      case 65: //A: LEFT
                          moveDirection.left = 1;
                          break;
                          
                      case 68: //D: RIGHT
                          moveDirection.right = 1;
                          break;

                      case 84://T
                          checkContact();
                          break;
                                              
                      case 74://J
                          jump();
                          break;
                          
                  }
              }


              function handleKeyUp(event){
                  let keyCode = event.keyCode;

                  switch(keyCode){
                      case 87: //W: FORWARD
                          moveDirection.forward = 0;
                          break;
                          
                      case 83: //S: BACK
                          moveDirection.back = 0;
                          break;
                          
                      case 65: //A: LEFT
                          moveDirection.left = 0;
                          break;
                          
                      case 68: //D: RIGHT
                          moveDirection.right = 0;
                          break;
                  }

              }


              function createFloorTiles(){
                  let tiles = [
                      { name: "yellow", color: 0xFFFF00, pos: {x: -20, y: 0, z: 20} },
                      { name: "red", color: 0xFF0000, pos: {x: 20, y: 0, z: 20} },
                      { name: "green", color: 0x008000, pos: {x: 20, y: 0, z: -20} },
                      { name: "blue", color: 0x0000FF, pos: {x: -20, y: 0, z: -20} }
                  ]
                  
                  let scale = {x: 40, y: 6, z: 40};
                  let quat = {x: 0, y: 0, z: 0, w: 1};
                  let mass = 0;

                  for (const tile of tiles) {
                          
                      //threeJS Section
                      let pos = tile.pos;
                      let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: tile.color}));

                      mesh.position.set(pos.x, pos.y, pos.z);
                      mesh.scale.set(scale.x, scale.y, scale.z);

                      mesh.castShadow = true;
                      mesh.receiveShadow = true;

                      mesh.userData.tag = tile.name;

                      scene.add(mesh);


                      //Ammojs Section
                      let transform = new Ammo.btTransform();
                      transform.setIdentity();
                      transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
                      transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                      let motionState = new Ammo.btDefaultMotionState( transform );

                      let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
                      colShape.setMargin( 0.05 );

                      let localInertia = new Ammo.btVector3( 0, 0, 0 );
                      colShape.calculateLocalInertia( mass, localInertia );

                      let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                      let body = new Ammo.btRigidBody( rbInfo );

                      body.setFriction(4);
                      body.setRollingFriction(10);

                      physicsWorld.addRigidBody( body );

                      body.threeObject = mesh;

                      if( tile.name == "red"){

                          mesh.userData.physicsBody = body;
                          redTile = mesh;

                      } 
                      
                  }

              }


              function createBall(){
                  
                  let pos = {x: 0, y: 10, z: 0};
                  let radius = 1.5;
                  let quat = {x: 0, y: 0, z: 0, w: 1};
                  let mass = 1;

                  //threeJS Section
                  ball = ballObject = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x800080}));

                  ball.position.set(pos.x, pos.y, pos.z);
                  
                  ball.castShadow = true;
                  ball.receiveShadow = true;
                  
                  ball.userData.tag = "ball";

                  scene.add(ball);


                  //Ammojs Section
                  let transform = new Ammo.btTransform();
                  transform.setIdentity();
                  transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
                  transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                  let motionState = new Ammo.btDefaultMotionState( transform );

                  let colShape = new Ammo.btSphereShape( radius );
                  colShape.setMargin( 0.05 );

                  let localInertia = new Ammo.btVector3( 0, 0, 0 );
                  colShape.calculateLocalInertia( mass, localInertia );

                  let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                  let body = new Ammo.btRigidBody( rbInfo );

                  body.setFriction(4);
                  body.setRollingFriction(10);

                  body.setActivationState( STATE.DISABLE_DEACTIVATION )


                  physicsWorld.addRigidBody( body );
                  rigidBodies.push(ball);
                  
                  ball.userData.physicsBody = body;
                  
                  body.threeObject = ball;
                  
              }

              function setupContactResultCallback(){

                  cbContactResult = new Ammo.ConcreteContactResultCallback();
                  
                  cbContactResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){
                      
                      let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

                      const distance = contactPoint.getDistance();

                      if( distance > 0 ) return;

                      let colWrapper0 = Ammo.wrapPointer( colObj0Wrap, Ammo.btCollisionObjectWrapper );
                      let rb0 = Ammo.castObject( colWrapper0.getCollisionObject(), Ammo.btRigidBody );
                      
                      let colWrapper1 = Ammo.wrapPointer( colObj1Wrap, Ammo.btCollisionObjectWrapper );
                      let rb1 = Ammo.castObject( colWrapper1.getCollisionObject(), Ammo.btRigidBody );

                      let threeObject0 = rb0.threeObject;
                      let threeObject1 = rb1.threeObject;

                      let tag, localPos, worldPos

                      if( threeObject0.userData.tag != "ball" ){

                          tag = threeObject0.userData.tag;
                          localPos = contactPoint.get_m_localPointA();
                          worldPos = contactPoint.get_m_positionWorldOnA();

                      }
                      else{

                          tag = threeObject1.userData.tag;
                          localPos = contactPoint.get_m_localPointB();
                          worldPos = contactPoint.get_m_positionWorldOnB();

                      }
                      
                      let localPosDisplay = {x: localPos.x(), y: localPos.y(), z: localPos.z()};
                      let worldPosDisplay = {x: worldPos.x(), y: worldPos.y(), z: worldPos.z()};

                      console.log( { tag, localPosDisplay, worldPosDisplay } );
                      
                  }

              }


              function setupContactPairResultCallback(){

                  cbContactPairResult = new Ammo.ConcreteContactResultCallback();
                  
                  cbContactPairResult.hasContact = false;

                  cbContactPairResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){
                      
                      let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

                      const distance = contactPoint.getDistance();

                      if( distance > 0 ) return;

                      this.hasContact = true;
                      
                  }

              }



              function moveBall(){

                  let scalingFactor = 20;

                  let moveX =  moveDirection.right - moveDirection.left;
                  let moveZ =  moveDirection.back - moveDirection.forward;

                  if( moveX == 0 && moveZ == 0) return;

                  let resultantImpulse = new Ammo.btVector3( moveX, 0, moveZ )
                  resultantImpulse.op_mul(scalingFactor);

                  let physicsBody = ball.userData.physicsBody;
                  physicsBody.setLinearVelocity( resultantImpulse );

              }


              function checkContact(){

                  physicsWorld.contactTest( ball.userData.physicsBody , cbContactResult );

              }


              function jump(){

                  cbContactPairResult.hasContact = false;

                  physicsWorld.contactPairTest(ball.userData.physicsBody, redTile.userData.physicsBody, cbContactPairResult);

                  if( !cbContactPairResult.hasContact ) return;

                  let jumpImpulse = new Ammo.btVector3( 0, 15, 0 );

                  let physicsBody = ball.userData.physicsBody;
                  physicsBody.setLinearVelocity( jumpImpulse );

              }


              function updatePhysics( deltaTime ){

                  // Step world
                  physicsWorld.stepSimulation( deltaTime, 10 );

                  // Update rigid bodies
                  for ( let i = 0; i < rigidBodies.length; i++ ) {
                      let objThree = rigidBodies[ i ];
                      let objAmmo = objThree.userData.physicsBody;
                      let ms = objAmmo.getMotionState();
                      if ( ms ) {

                          ms.getWorldTransform( tmpTrans );
                          let p = tmpTrans.getOrigin();
                          let q = tmpTrans.getRotation();
                          objThree.position.set( p.x(), p.y(), p.z() );
                          objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

                      }
                  }

              }

  }


//initLoadScene8(renderer);

  //////////////////////////////////
  // Scene8
  /////////////////////////

      function initLoadScene8(renderer) {
  
      let camera, scene;
      let controls;
      let root;

      const objects = [];
      const tmpVec1 = new THREE.Vector3();
      const tmpVec2 = new THREE.Vector3();
      const tmpVec3 = new THREE.Vector3();
      const tmpVec4 = new THREE.Vector3();
      const offset = new THREE.Vector3();

      const VIZ_TYPE = {
        'Atoms': 0,
        'Bonds': 1,
        'Atoms + Bonds': 2
      };

      const MOLECULES = {
        'Ethanol': 'ethanol.pdb',
        'Aspirin': 'aspirin.pdb',
        'Caffeine': 'caffeine.pdb',
        'Nicotine': 'nicotine.pdb',
        'LSD': 'lsd.pdb',
        'Cocaine': 'cocaine.pdb',
        'Cholesterol': 'cholesterol.pdb',
        'Lycopene': 'lycopene.pdb',
        'Glucose': 'glucose.pdb',
        'Aluminium oxide': 'Al2O3.pdb',
        'Cubane': 'cubane.pdb',
        'Copper': 'cu.pdb',
        'Fluorite': 'caf2.pdb',
        'Salt': 'nacl.pdb',
        'YBCO superconductor': 'ybco.pdb',
        'Buckyball': 'buckyball.pdb',
        // 'Diamond': 'diamond.pdb',
        'Graphite': 'graphite.pdb'
      };

      const params = {
        vizType: 2,
        molecule: 'caffeine.pdb'
      };

      const loader = new THREE.PDBLoader();
      const colorSpriteMap = {};
      const baseSprite = document.createElement( 'img' );

      init();
      animate();

      function init() {

        // Create a container element reference
        const containerElement = document.createElement('div');
        containerElement.style.position = 'absolute';
        containerElement.style.top = '0';
        containerElement.style.left = '0';
        containerElement.id = 'container1';
        document.body.appendChild(containerElement);

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();
        scene1 = scene.clone();


        root = new THREE.Object3D();
        scene.add( root );

        //

        rendererCSS3D = new THREE.CSS3DRenderer();
        document.getElementById( 'container1' ).appendChild( rendererCSS3D.domElement );
        

        //

        controls = new THREE.TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 0.5;

        //

        baseSprite.onload = function () {

          loadMolecule( params.molecule );

        };

        baseSprite.src = '../static/src/lib/THREEJS/examples/textures/sprites/ball.png';

        //

        window.addEventListener( 'resize', onWindowResize );

        //

        const gui = new dat.GUI;

        gui.add( params, 'vizType', VIZ_TYPE ).onChange( changeVizType );
        gui.add( params, 'molecule', MOLECULES ).onChange( loadMolecule );
        gui.open();

      }

      function changeVizType( value ) {

        if ( value === 0 ) showAtoms();
        else if ( value === 1 ) showBonds();
        else showAtomsBonds();

      }

      //

      function showAtoms() {

        for ( let i = 0; i < objects.length; i ++ ) {

          const object = objects[ i ];

          if ( object instanceof CSS3DSprite ) {

            object.element.style.display = '';
            object.visible = true;

          } else {

            object.element.style.display = 'none';
            object.visible = false;

          }

        }

      }

      function showBonds() {

        for ( let i = 0; i < objects.length; i ++ ) {

          const object = objects[ i ];

          if ( object instanceof CSS3DSprite ) {

            object.element.style.display = 'none';
            object.visible = false;

          } else {

            object.element.style.display = '';
            object.element.style.height = object.userData.bondLengthFull;
            object.visible = true;

          }

        }

      }

      function showAtomsBonds() {

        for ( let i = 0; i < objects.length; i ++ ) {

          const object = objects[ i ];

          object.element.style.display = '';
          object.visible = true;

          if ( ! ( object instanceof THREE.CSS3DSprite ) ) {

            object.element.style.height = object.userData.bondLengthShort;

          }

        }

      }

      //

      function colorify( ctx, width, height, color ) {

        const r = color.r, g = color.g, b = color.b;

        const imageData = ctx.getImageData( 0, 0, width, height );
        const data = imageData.data;

        for ( let i = 0, l = data.length; i < l; i += 4 ) {

          data[ i + 0 ] *= r;
          data[ i + 1 ] *= g;
          data[ i + 2 ] *= b;

        }

        ctx.putImageData( imageData, 0, 0 );

      }

      function imageToCanvas( image ) {

        const width = image.width;
        const height = image.height;

        const canvas = document.createElement( 'canvas' );

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext( '2d' );
        context.drawImage( image, 0, 0, width, height );

        return canvas;

      }

      //

      function loadMolecule( model ) {

        const url = '../static/src/lib/THREEJS/examples/models/pdb/' + model;

        for ( let i = 0; i < objects.length; i ++ ) {

          const object = objects[ i ];
          object.parent.remove( object );

        }

        objects.length = 0;

        loader.load( url, function ( pdb ) {

          const geometryAtoms = pdb.geometryAtoms;
          const geometryBonds = pdb.geometryBonds;
          const json = pdb.json;

          geometryAtoms.computeBoundingBox();
          geometryAtoms.boundingBox.getCenter( offset ).negate();

          geometryAtoms.translate( offset.x, offset.y, offset.z );
          geometryBonds.translate( offset.x, offset.y, offset.z );

          const positionAtoms = geometryAtoms.getAttribute( 'position' );
          const colorAtoms = geometryAtoms.getAttribute( 'color' );

          const position = new THREE.Vector3();
          const color = new THREE.Color();

          for ( let i = 0; i < positionAtoms.count; i ++ ) {

            position.fromBufferAttribute( positionAtoms, i );
            color.fromBufferAttribute( colorAtoms, i );

            const atomJSON = json.atoms[ i ];
            const element = atomJSON[ 4 ];

            if ( ! colorSpriteMap[ element ] ) {

              const canvas = imageToCanvas( baseSprite );
              const context = canvas.getContext( '2d' );

              colorify( context, canvas.width, canvas.height, color );

              const dataUrl = canvas.toDataURL();

              colorSpriteMap[ element ] = dataUrl;

            }

            const colorSprite = colorSpriteMap[ element ];

            const atom = document.createElement( 'img' );
            atom.src = colorSprite;

            const object = new THREE.CSS3DSprite( atom );
            object.position.copy( position );
            object.position.multiplyScalar( 75 );

            object.matrixAutoUpdate = false;
            object.updateMatrix();

            root.add( object );

            objects.push( object );

          }

          const positionBonds = geometryBonds.getAttribute( 'position' );

          const start = new THREE.Vector3();
          const end = new THREE.Vector3();

          for ( let i = 0; i < positionBonds.count; i += 2 ) {

            start.fromBufferAttribute( positionBonds, i );
            end.fromBufferAttribute( positionBonds, i + 1 );

            start.multiplyScalar( 75 );
            end.multiplyScalar( 75 );

            tmpVec1.subVectors( end, start );
            const bondLength = tmpVec1.length() - 50;

            //

            let bond = document.createElement( 'div' );
            bond.className = 'bond';
            bond.style.height = bondLength + 'px';

            let object = new THREE.CSS3DObject( bond );
            object.position.copy( start );
            object.position.lerp( end, 0.5 );

            object.userData.bondLengthShort = bondLength + 'px';
            object.userData.bondLengthFull = ( bondLength + 55 ) + 'px';

            //

            const axis = tmpVec2.set( 0, 1, 0 ).cross( tmpVec1 );
            const radians = Math.acos( tmpVec3.set( 0, 1, 0 ).dot( tmpVec4.copy( tmpVec1 ).normalize() ) );

            const objMatrix = new THREE.Matrix4().makeRotationAxis( axis.normalize(), radians );
            object.matrix.copy( objMatrix );
            object.quaternion.setFromRotationMatrix( object.matrix );

            object.matrixAutoUpdate = false;
            object.updateMatrix();

            root.add( object );

            objects.push( object );

            //

            const joint = new THREE.Object3D();
            joint.position.copy( start );
            joint.position.lerp( end, 0.5 );

            joint.matrix.copy( objMatrix );
            joint.quaternion.setFromRotationMatrix( joint.matrix );

            joint.matrixAutoUpdate = false;
            joint.updateMatrix();

            bond = document.createElement( 'div' );
            bond.className = 'bond';
            bond.style.height = bondLength + 'px';

            object = new THREE.CSS3DObject( bond );
            object.rotation.y = Math.PI / 2;

            object.matrixAutoUpdate = false;
            object.updateMatrix();

            object.userData.bondLengthShort = bondLength + 'px';
            object.userData.bondLengthFull = ( bondLength + 55 ) + 'px';

            object.userData.joint = joint;

            joint.add( object );
            root.add( joint );

            objects.push( object );

          }

          //console.log( "CSS3DObjects:", objects.length );

          changeVizType( params.vizType );

        } );


      }

      //

  
        function onWindowResize() {

          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          rendererCSS3D.setSize( window.innerWidth, window.innerHeight );

          render();

        }

    
      
      function animate() {

        requestAnimationFrame( animate );
        controls.update();

        const time = Date.now() * 0.0004;

        root.rotation.x = time;
        root.rotation.y = time * 0.7;

        render();

      }

      function render() {

          renderSceneSetupScene3(scene, camera);

      }

}




  //////////////////////////////////
  // Scene9
  /////////////////////////

  function initLoadScene9 (renderer) {

      const clock = new THREE.Clock();

      const scene = new THREE.Scene();

      scene1 = scene.clone();

      scene.background = new THREE.Color( 0x88ccff );

      const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      camera.rotation.order = 'YXZ';

      const ambientlight = new THREE.AmbientLight( 0x6688cc );
      scene.add( ambientlight );

      const fillLight1 = new THREE.DirectionalLight( 0xff9999, 0.5 );
      fillLight1.position.set( - 1, 1, 2 );
      scene.add( fillLight1 );

      const fillLight2 = new THREE.DirectionalLight( 0x8888ff, 0.2 );
      fillLight2.position.set( 0, - 1, 0 );
      scene.add( fillLight2 );

      const directionalLight = new THREE.DirectionalLight( 0xffffaa, 1.2 );
      directionalLight.position.set( - 5, 25, - 1 );
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = 0.01;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.right = 30;
      directionalLight.shadow.camera.left = - 30;
      directionalLight.shadow.camera.top  = 30;
      directionalLight.shadow.camera.bottom = - 30;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.radius = 4;
      directionalLight.shadow.bias = - 0.00006;
      scene.add( directionalLight );

      const GRAVITY = 30;

      const NUM_SPHERES = 100;
      const SPHERE_RADIUS = 0.2;

      const STEPS_PER_FRAME = 5;

      const sphereGeometry = new THREE.SphereGeometry( SPHERE_RADIUS, 32, 32 );
      const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0x888855, roughness: 0.8, metalness: 0.5 } );

      const spheres = [];
      let sphereIdx = 0;

      for ( let i = 0; i < NUM_SPHERES; i ++ ) {

        const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        scene.add( sphere );

        spheres.push( { mesh: sphere, collider: new THREE.Sphere( new THREE.Vector3( 0, - 100, 0 ), SPHERE_RADIUS ), velocity: new THREE.Vector3() } );

      }

      const worldOctree = new THREE.Octree();

      const playerCollider = new THREE.Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );

      const playerVelocity = new THREE.Vector3();
      const playerDirection = new THREE.Vector3();

      let playerOnFloor = false;
      let mouseTime = 0;

      const keyStates = {};

      const vector1 = new THREE.Vector3();
      const vector2 = new THREE.Vector3();
      const vector3 = new THREE.Vector3();

      document.addEventListener( 'keydown', ( event ) => {

        keyStates[ event.code ] = true;

      } );

      document.addEventListener( 'keyup', ( event ) => {

        keyStates[ event.code ] = false;

      } );

      document.addEventListener( 'mousedown', () => {

        document.body.requestPointerLock();

        mouseTime = performance.now();

      } );

      document.addEventListener( 'mouseup', () => {

        throwBall();

      } );

      document.body.addEventListener( 'mousemove', ( event ) => {

        if ( document.pointerLockElement === document.body ) {

          camera.rotation.y -= event.movementX / 500;
          camera.rotation.x -= event.movementY / 500;

        }

      } );

      window.addEventListener( 'resize', onWindowResize );

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      function throwBall() {

        const sphere = spheres[ sphereIdx ];

        camera.getWorldDirection( playerDirection );

        sphere.collider.center.copy( playerCollider.end ).addScaledVector( playerDirection, playerCollider.radius * 1.5 );

        // throw the ball with more force if we hold the button longer, and if we move forward

        const impulse = 15 + 30 * ( 1 - Math.exp( ( mouseTime - performance.now() ) * 0.001 ) );

        sphere.velocity.copy( playerDirection ).multiplyScalar( impulse );
        sphere.velocity.addScaledVector( playerVelocity, 2 );

        sphereIdx = ( sphereIdx + 1 ) % spheres.length;

      }

      function playerCollisions() {

        const result = worldOctree.capsuleIntersect( playerCollider );

        playerOnFloor = false;

        if ( result ) {

          playerOnFloor = result.normal.y > 0;

          if ( ! playerOnFloor ) {

            playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );

          }

          playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

        }

      }

      function updatePlayer( deltaTime ) {

        let damping = Math.exp( - 4 * deltaTime ) - 1;

        if ( ! playerOnFloor ) {

          playerVelocity.y -= GRAVITY * deltaTime;

          // small air resistance
          damping *= 0.1;

        }

        playerVelocity.addScaledVector( playerVelocity, damping );

        const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
        playerCollider.translate( deltaPosition );

        playerCollisions();

        camera.position.copy( playerCollider.end );

      }

      function playerSphereCollision( sphere ) {

        const center = vector1.addVectors( playerCollider.start, playerCollider.end ).multiplyScalar( 0.5 );

        const sphere_center = sphere.collider.center;

        const r = playerCollider.radius + sphere.collider.radius;
        const r2 = r * r;

        // approximation: player = 3 spheres

        for ( const point of [ playerCollider.start, playerCollider.end, center ] ) {

          const d2 = point.distanceToSquared( sphere_center );

          if ( d2 < r2 ) {

            const normal = vector1.subVectors( point, sphere_center ).normalize();
            const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( playerVelocity ) );
            const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( sphere.velocity ) );

            playerVelocity.add( v2 ).sub( v1 );
            sphere.velocity.add( v1 ).sub( v2 );

            const d = ( r - Math.sqrt( d2 ) ) / 2;
            sphere_center.addScaledVector( normal, - d );

          }

        }

      }

      function spheresCollisions() {

        for ( let i = 0, length = spheres.length; i < length; i ++ ) {

          const s1 = spheres[ i ];

          for ( let j = i + 1; j < length; j ++ ) {

            const s2 = spheres[ j ];

            const d2 = s1.collider.center.distanceToSquared( s2.collider.center );
            const r = s1.collider.radius + s2.collider.radius;
            const r2 = r * r;

            if ( d2 < r2 ) {

              const normal = vector1.subVectors( s1.collider.center, s2.collider.center ).normalize();
              const v1 = vector2.copy( normal ).multiplyScalar( normal.dot( s1.velocity ) );
              const v2 = vector3.copy( normal ).multiplyScalar( normal.dot( s2.velocity ) );

              s1.velocity.add( v2 ).sub( v1 );
              s2.velocity.add( v1 ).sub( v2 );

              const d = ( r - Math.sqrt( d2 ) ) / 2;

              s1.collider.center.addScaledVector( normal, d );
              s2.collider.center.addScaledVector( normal, - d );

            }

          }

        }

      }

      function updateSpheres( deltaTime ) {

        spheres.forEach( sphere => {

          sphere.collider.center.addScaledVector( sphere.velocity, deltaTime );

          const result = worldOctree.sphereIntersect( sphere.collider );

          if ( result ) {

            sphere.velocity.addScaledVector( result.normal, - result.normal.dot( sphere.velocity ) * 1.5 );
            sphere.collider.center.add( result.normal.multiplyScalar( result.depth ) );

          } else {

            sphere.velocity.y -= GRAVITY * deltaTime;

          }

          const damping = Math.exp( - 1.5 * deltaTime ) - 1;
          sphere.velocity.addScaledVector( sphere.velocity, damping );

          playerSphereCollision( sphere );

        } );

        spheresCollisions();

        for ( const sphere of spheres ) {

          sphere.mesh.position.copy( sphere.collider.center );

        }

      }

      function getForwardVector() {

        camera.getWorldDirection( playerDirection );
        playerDirection.y = 0;
        playerDirection.normalize();

        return playerDirection;

      }

      function getSideVector() {

        camera.getWorldDirection( playerDirection );
        playerDirection.y = 0;
        playerDirection.normalize();
        playerDirection.cross( camera.up );

        return playerDirection;

      }

      function controls( deltaTime ) {

        // gives a bit of air control
        const speedDelta = deltaTime * ( playerOnFloor ? 25 : 8 );

        if ( keyStates[ 'KeyW' ] ) {

          playerVelocity.add( getForwardVector().multiplyScalar( speedDelta ) );

        }

        if ( keyStates[ 'KeyS' ] ) {

          playerVelocity.add( getForwardVector().multiplyScalar( - speedDelta ) );

        }

        if ( keyStates[ 'KeyA' ] ) {

          playerVelocity.add( getSideVector().multiplyScalar( - speedDelta ) );

        }

        if ( keyStates[ 'KeyD' ] ) {

          playerVelocity.add( getSideVector().multiplyScalar( speedDelta ) );

        }

        if ( playerOnFloor ) {

          if ( keyStates[ 'Space' ] ) {

            playerVelocity.y = 15;

          }

        }

      }

      const loader = new THREE.GLTFLoader().setPath( '../static/src/lib/THREEJS/examples/models/gltf/' );

      loader.load( 'collision-world.glb', ( gltf ) => {

        scene.add( gltf.scene );

        worldOctree.fromGraphNode( gltf.scene );

        gltf.scene.traverse( child => {

          if ( child.isMesh ) {

            child.castShadow = true;
            child.receiveShadow = true;

            if ( child.material.map ) {

              child.material.map.anisotropy = 8;

            }

          }

        } );

        animate();

      } );

      function teleportPlayerIfOob() {

        if ( camera.position.y <= - 25 ) {

          playerCollider.start.set( 0, 0.35, 0 );
          playerCollider.end.set( 0, 1, 0 );
          playerCollider.radius = 0.35;
          camera.position.copy( playerCollider.end );
          camera.rotation.set( 0, 0, 0 );

        }

      }


      function animate() {

        const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.

        for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

          controls( deltaTime );

          updatePlayer( deltaTime );

          updateSpheres( deltaTime );

          teleportPlayerIfOob();

        }

        renderSceneSetup ( scene, camera );
        requestAnimationFrame( animate );

      }
}


   //////////////////////////////////////////


  function viewDisplay1() {

       initLoadScene1(renderer);
  }

  function viewDisplay2() {

       initLoadScene2(renderer);
  }

  function viewDisplay3() {

       initLoadScene3(renderer);
  }


  function viewDisplay4() {

       initLoadScene4(renderer);
  }


  function viewDisplay5() {

       initLoadScene5(renderer);
  }


  function viewDisplay6() {

       initLoadScene6(renderer);
  }


  function viewDisplay7() {

       initLoadScene7(renderer);
  }

  ////////////////////////////

  /**
   * Utility method to round numbers to a given number of decimal places.
   *
   * Usage:
   *   3.5.round(0) // 4
   *   Math.random().round(4) // 0.8179
   *   var a = 5532; a.round(-2) // 5500
   *   Number.prototype.round(12345.6, -1) // 12350
   *   32..round(-1) // 30 (two dots required since the first one is a decimal)
   */
  Number.prototype.round = function(v, a) {
    if (typeof a === 'undefined') {
      a = v;
      v = this;
    }
    if (!a) a = 0;
    var m = Math.pow(10, a|0);
    return Math.round(v*m)/m;
  };






    




