  import * as THREE from 'three';

  import WebGPU from 'three/addons/capabilities/WebGPU.js';
  import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

  import { CinematicCamera } from 'three/addons/cameras/CinematicCamera.js';

  let camera1, camera2, scene, renderer;

  let video, texture, material, mesh, videomesh;

  let mouseX = 0;
  let mouseY = 0;


  const container = document.getElementById( 'video-content' );
  const containerWidth = 480;
  const containerHeight = 360;

  let cube_count;
  const radius = 100;
  let theta = 0;
  const meshes = [],
    materials = [],

    xgrid = 20,
    ygrid = 10;

init();


function addCinematicCamera() {

      camera2 = new CinematicCamera( 60, containerWidth / containerHeight, 1, 10000 );
      camera2.setLens( 1 );
      camera2.position.z = 300;
      camera2.lookAt(0, 0, 0); // Set the look-at target based on your requirements

      //const light = new THREE.DirectionalLight( 0xffffff );
      //light.position.set( 1, 1, 1 ).normalize();
      //scene.add( light );

      const effectController = {
        focalLength: 15,
        fstop: 2.8,
        showFocus: false,
        focalDepth: 3,

    };

      const matChanger = function ( ) {

        for ( const e in effectController ) {

          if ( e in camera2.postprocessing.bokeh_uniforms ) {

            camera2.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];

          }

        }

        camera2.postprocessing.bokeh_uniforms[ 'znear' ].value = camera2.near;
        camera2.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera2.far;
        camera2.setLens( effectController.focalLength, camera2.frameHeight, effectController.fstop, camera2.coc );
        effectController[ 'focalDepth' ] = camera2.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;

      };

      matChanger();

      animate(camera2);

}



  function init() {

    if ( WebGPU.isAvailable() === false ) {

      document.body.appendChild( WebGPU.getErrorMessage() );

      throw new Error( 'No WebGPU support' );

    }

    camera1 = new THREE.PerspectiveCamera( 40, containerWidth / containerHeight, 1, 10000 );
    camera1.position.z = 500;

    scene = new THREE.Scene();

    const light = new THREE.DirectionalLight( 0xffffff, 7 );
    light.position.set( 0.5, 1, 1 ).normalize();
    scene.add( light );

    renderer = new WebGPURenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( containerWidth, containerHeight );
    const addCinematicButton = document.getElementById( 'cb1' );

    addCinematicButton.addEventListener('change', function() {
        if (addCinematicButton.checked) {
          addCinematicCamera();
          window.addEventListener( 'resize', function () {
          onWindowResize(camera2);
          });
        } else {
          renderer.setAnimationLoop( renderNormalScene );
          window.addEventListener( 'resize', function () {
          onWindowResize(camera1);
          });

        }

    });

    container.appendChild( renderer.domElement );

    video = document.getElementById( 'video' );

    texture = new THREE.VideoTexture( video );

  ////////////////////////////////////////////
  // THIS IS TO HANDLE CLICK BUTTON EVENTS
  /////////////////////////////////////////


  // BUTTON TO TURN ON/OFF VIDEO

  initDefaultScene(texture);     

  const playButton = document.getElementById( 'cb3' );

  playButton.addEventListener('change', function() {
    if (playButton.checked) {
      // Checkbox is checked, play the video at the current paused time
      video.play();
    } else {
      // Checkbox is unchecked, pause the video and remember the current time
      video.pause();
    }
  });

  
  //BUTTON TO TURN ON/OFF VIDEO TEXTURE

   const checkboxTexture = document.getElementById('bb8-checkbox');

    checkboxTexture.addEventListener('change', function() {
      if (checkboxTexture.checked) {
        clearScene(scene);
        addVideoTexture ( texture);
      } else {
        clearScene(scene);
        addVideoNormal(texture);
      }
    });
               
  }



  function clearScene(scene) {
    // Remove all objects from the scene
    while (scene.children.length > 0) {
        const obj = scene.children[0];
        // Remove the object from the scene
        scene.remove(obj);
    }
}




function addVideoNormal(texture) {
    const geometry = new THREE.PlaneGeometry( containerWidth, containerHeight );
    const material = new THREE.MeshBasicMaterial( { map: texture, depthWrite: false } );
    videomesh = new THREE.Mesh( geometry, material );

    // Synchronize the faceMesh's rotation with the camera's rotation
    videomesh.scale.x = (container.clientWidth)/containerWidth;
    videomesh.scale.y =  (container.clientHeight)/containerHeight;
    scene.add(videomesh);
}



function addVideoTexture (texture) {
        let i, j, ox, oy, geometry;

        const ux = 1 / xgrid;
        const uy = 1 / ygrid;

        const xsize = (container.clientWidth)/ xgrid;
        const ysize = (container.clientHeight) / ygrid;

        const parameters = { color: 0xffffff, map: texture };

        cube_count = 0;

        for ( i = 0; i < xgrid; i ++ ) {

          for ( j = 0; j < ygrid; j ++ ) {

            ox = i;
            oy = j;

            geometry = new THREE.BoxGeometry( xsize, ysize, xsize );

            change_uvs( geometry, ux, uy, ox, oy );

            materials[ cube_count ] = new THREE.MeshPhongMaterial( parameters );

            material = materials[ cube_count ];

            material.hue = i / xgrid;
            material.saturation = 1 - j / ygrid;

            material.color.setHSL( material.hue, material.saturation, 0.5 );

            mesh = new THREE.Mesh( geometry, material );

            mesh.position.x = ( i - xgrid / 2 ) * xsize;
            mesh.position.y = ( j - ygrid / 2 ) * ysize;
            mesh.position.z = 0;

            mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
            scene.add( mesh );

            mesh.dx = 0.001 * ( 0.5 - Math.random() );
            mesh.dy = 0.001 * ( 0.5 - Math.random() );

            meshes[ cube_count ] = mesh;

            cube_count += 1;

          }

        }

  }


  function onWindowResize(camera) {

    camera.aspect = containerWidth/ containerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( containerWidth, containerHeight );

    
}



  function change_uvs( geometry, unitx, unity, offsetx, offsety ) {

    const uvs = geometry.attributes.uv.array;

    for ( let i = 0; i < uvs.length; i += 2 ) {

      uvs[ i ] = ( uvs[ i ] + offsetx ) * unitx;
      uvs[ i + 1 ] = ( uvs[ i + 1 ] + offsety ) * unity;

    }

  }



  let h, counter = 1;

  function renderNormalScene() {

    const time = Date.now() * 0.00005;

    camera1.lookAt( 0,0,0 );

    for ( let i = 0; i < cube_count; i ++ ) {

      material = materials[ i ];

      h = ( 360 * ( material.hue + time ) % 360 ) / 360;
      material.color.setHSL( h, material.saturation, 0.5 );

    }

    if ( counter % 1000 > 200 ) {

      for ( let i = 0; i < cube_count; i ++ ) {

        mesh = meshes[ i ];

        mesh.rotation.x += 10 * mesh.dx;
        mesh.rotation.y += 10 * mesh.dy;

        mesh.position.x -= 150 * mesh.dx;
        mesh.position.y += 150 * mesh.dy;
        mesh.position.z += 300 * mesh.dx;

      }

    }

    if ( counter % 1000 === 0 ) {

      for ( let i = 0; i < cube_count; i ++ ) {

        mesh = meshes[ i ];

        mesh.dx *= - 1;
        mesh.dy *= - 1;

      }

    }

    counter ++;

    render(camera1);

  }


function initDefaultScene(texture) {
  addVideoNormal(texture);
  animate(camera1);
}

function animate(camera) {
  requestAnimationFrame(function () {
    animate(camera); // Pass the camera to the next animation frame
  });
  render(camera);
  texture.needsUpdate = true; // Update the video texture
}

function render(camera) {
  renderer.render(scene, camera);
}
