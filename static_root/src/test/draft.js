function customSettings() {
    var that = this;
    var soundtrackList = [
    Soundtrack1: '../examples/sound1.mp3',
    Soundtrack2: '../examples/sound2.mp3',
    ];
    const SoundControls = function () {
        this.master = listener.getMasterVolume();
        this.element = sound.getVolume();
      };

    const GeneratorControls = function () {
        this.frequency = oscillator.frequency.value;
        this.wavetype = oscillator.type;
    };
    this.backgroundmusic = 'Soundtrack1';
    this.modelOpt = 'Soldier';
    this.modelDisplay = null;
    this.allDisplay = true;
    this.noneDisplay = true;
    this.wallGeometry = null;
    this.['Reset Audio'] = audioTriggered;
    this.['Add SubAudio'] = isAudioFinder;
    this.['Add IsolatorAudio'] = isAudioIsolator;
    this.wall = 'Generate Wall';
    this.["Enable Audio"] = activateAudio;
    this.["Audio Mode"] = 'Normal';
    this.pitch = uniform( 1.5 );
    this.delayVolume = uniform( .2 );
    this.delayOffset = uniform( .55 );
    this.after = function() {
        const matchingPair = soundtrackList.find(pair => pair.that.backgroundmusic === soundtrackList.soundtrackURL);
        if (matchingPair) {
          return matchingPair.soundtrackURL; // Exit the loop when a match is found
        }
    };
    this.RegenerateAudio = function() {
    that['Replay Audio']();
    };

    this['Replay Audio'] = function() {
      var = o {
      after: that.after
      }
      initAudio(o);
      localStorage.setItem("url", that.backgroundmusic);
      localStorage.setItem("pitch", that.pitch);
      localStorage.setItem("delayVolume", that.delayVolume);
      localStorage.setItem("delayOffset", that.delayOffset);
   }
    this['Reset Audio'] = function() {
    localStorage.setItem("audioTriggered", that.audioTriggered);
    if (!audioTriggered){
        initAudio();
      }
    }
    this.GenerateWall = function() {    
      // Call the loadObject function to load the object and handle it asynchronously
    that['Generate Wall']()
      .then((geometry) => {
        that.wallGeometry = geometry;
      })
    .catch((error) => {
      console.error("Error loading object:", error);
      });
    };

  this['Generate Wall'] = function() {
    return new Promise((resolve, reject) => {
    var = o {
      wallType: that.wallType,
      width: that.width,
      depth: that.depth,
      height: that.height,
      radius: that.radius,
      mode: 'random',
      length: that.length,
    }

    if (that.wallType === "Line"){
      that.radius.enabled = false;
      that.width.enabled = false;
      that.height.enabled = false;

    } else if (that.wallType === "Rectangle") {
      that.radius.enabled = false;
      that.width.enabled = true;
      that.height.enabled = true;

    } else if (that.wallType === "Circle") {
      that.radius.enabled = true;
      that.width.enabled = false;
      that.height.enabled = false;
    }

    wallScene = THREE.Terrain.generateWall(geo,o);
    resolve(wallScene.children);
    });
  }
  this.audioIsolator = function(geometry, model, camera) {
      const listener = new THREE.AudioListener();
      camera.add( listener );
      const audioElement = document.getElementById( 'music' );
      if (isAudioIsolator) {
          audioElement.play();
      }
      const positionalAudio = new THREE.PositionalAudio( listener );
      positionalAudio.setMediaElementSource( audioElement );
      positionalAudio.setRefDistance( 1 );
      positionalAudio.setDirectionalCone( geometry.position.copy() );//update this

      const helper = new PositionalAudioHelper( positionalAudio, 0.1 );
      positionalAudio.add( helper );

      model.add( positionalAudio );
    };
    
    this.addAudioFinder = function (camera, songElement, model) {
        const listener = new THREE.AudioListener();
        camera.add( listener );
      
        const sound = new THREE.PositionalAudio( listener );
        sound.setMediaElementSource( songElement );
        sound.setRefDistance( 20 );

        if (isAudioFinder) {
            songElement.play();
        }

        model.add( sound );
        animate();

        // analysers

        const analyser = new THREE.AudioAnalyser( sound1, 32 );

        function animate() {

          requestAnimationFrame( animate );
          render();

        }

      function render() {

        const delta = clock.getDelta();

        controls.update( delta );

        model.material.emissive.b = analyser.getAverageFrequency() / 256;

       }

    }
    const loader = new THREE.GLTFLoader();
    Promise.all([
      // model 1
    loader.loadAsync('models/gltf/Soldier.glb'), ///models/gltf/Soldier.glb
    loader.loadAsync('models/gltf/Xbot.glb') ///models/gltf/Soldier.glb
     .then((gltf) => {
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.frustumCulled = false;

                // Apply the scale and position adjustments to the geometry vertices
                child.scale.set(scale, scale, scale);
                child.geometry.computeVertexNormals();
            }
        });

      skeleton = new THREE.SkeletonHelper( model );
      skeleton.visible = false;

      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer( model );

      numAnimations = animations.length;

      for ( let i = 0; i !== numAnimations; ++ i ) {

        let clip = animations[ i ];
        const name = clip.name;

        if ( baseActions[ name ] ) {

          const action = mixer.clipAction( clip );
          activateAction( action );
          baseActions[ name ].action = action;
          allActions.push( action );

        } else if ( additiveActions[ name ] ) {

          // Make the clip additive and remove the reference frame

          THREE.AnimationUtils.makeClipAdditive( clip );

          if ( clip.name.endsWith( '_pose' ) ) {

            clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );

          }

          const action = mixer.clipAction( clip );
          activateAction( action );
          additiveActions[ name ].action = action;
          allActions.push( action );

        }

    addSettingsModel1(camera1, model1);
       
})
.catch((error) => {
  console.error('Error loading GLTF model:', error);
}),



  loader.loadAsync('models/gltf/RobotExpressive/RobotExpressive.glb') ///models/gltf/Soldier.glb
     .then((gltf) => {

          model =gltf.scene;
          scene.add( model );

          createGUI( model, gltf.animations );

        }, undefined, function ( e ) {

          console.error( e );

        } );


    addSettingsModel3(camera1, model1);
       
    })
    .catch((error) => {
      console.error('Error loading GLTF model:', error);
    }),

    ]).then((results) => {
      // Here, the models are returned in the order they were requested

      const [Sodier, SkinningRobot, AnimatedRobot] = results;
      trackModelPosition(results, offsetX, offsetY);

      for ( let i = 0; i < results.length; i ++ ) {

        results[i].layers.set( i );

        scene3.add( results[i] );
        const offsetX = 0.1;
        const offsetY = 0.1;
        if (that.modelDisplay===results[i]){
            audioIsolator(that.wallGeometry,results[i], camera3);
          }else if (allDisplay){
            audioIsolator(that.wallGeometry,results[i], camera3);
          }else if (noneDisplay){
            isAudioIsolator = false;

          }
        }
      }
       if (that.modelOpt==='Soldier'){
            scene1.add(results[0]);
            skeleton = new THREE.SkeletonHelper( results[0] );
            skeleton.visible = false;
            scene.add( skeleton );
            const animations = gltf.animations;
            mixer = new THREE.AnimationMixer( results[0] );

            idleAction = mixer.clipAction( animations[ 0 ] );
            walkAction = mixer.clipAction( animations[ 3 ] );
            runAction = mixer.clipAction( animations[ 1 ] );
            actions = [ idleAction, walkAction, runAction ];
            addSettingsModel1();
        } else if(that.modelOpt==='SkinningRobot'){

        }else if(that.modelOpt==='AnimatedRobot'){


         } 

      // You can work with the loaded models here
    }).catch((err) => {
      console.log(err);
    });

    let audio;

          let container, stats, clock, gui, mixer, actions, activeAction, previousAction;
      let camera, scene, renderer, model, face;

      const api = { state: 'Walking' };

      function activateSoundtrack(camera,model) {
        // Inside your createPanel function
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // Load the audio file
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('sounds/walk.mp3', function (buffer) {
        audio = new THREE.PositionalAudio(listener);
        audio.setBuffer(buffer);

        // Adjust the volume and other settings as needed
        audio.setVolume(1); // Adjust the volume
        audio.setRefDistance(1); // Adjust the reference distance
        audio.setRolloffFactor(1); // Adjust the rolloff factor

        // Attach the audio to your character or object
        model.add(audio); // Attach it to your character object
        });

      }
    

    function trackModelPosition(list, offsetX, offsetY) {
        for (var ii = 1; ii < list.length; ++ii) {
            list[0].position.x, list[0].position.y = mouseX, mouseY;
            list[ii].position.x = list[ii].position.x + offsetX;
            list[ii+1].position.x = list[ii].position.x + offsetX;
          }
      }

      function createPanel() {
        const panel = new GUI( { width: 310 } );

        const folder1 = panel.addFolder( 'Visibility' );
        const folder2 = panel.addFolder( 'Activation/Deactivation' );
        const folder3 = panel.addFolder( 'Pausing/Stepping' );
        const folder4 = panel.addFolder( 'Crossfading' );
        const folder5 = panel.addFolder( 'Blend Weights' );
        const folder6 = panel.addFolder( 'General Speed' );
        const settings = {
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

        folder1.add( settings, 'show model' ).onChange( showModel );
        folder1.add( settings, 'show skeleton' ).onChange( showSkeleton );
        folder2.add( settings, 'deactivate all' );
        folder2.add( settings, 'activate all' );
        folder3.add( settings, 'pause/continue' );
        folder3.add( settings, 'make single step' );
        folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );
        crossFadeControls.push( folder4.add( settings, 'from walk to idle' ) );
        crossFadeControls.push( folder4.add( settings, 'from idle to walk' ) );
        crossFadeControls.push( folder4.add( settings, 'from walk to run' ) );
        crossFadeControls.push( folder4.add( settings, 'from run to walk' ) );
        folder4.add( settings, 'use default duration' );
        folder4.add( settings, 'set custom duration', 0, 10, 0.01 );
        folder5.add( settings, 'modify idle weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeight( idleAction, weight );

        } );
        folder5.add( settings, 'modify walk weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeight( walkAction, weight );

        } );
        folder5.add( settings, 'modify run weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

          setWeight( runAction, weight );

        } );
        folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

        folder1.open();
        folder2.open();
        folder3.open();
        folder4.open();
        folder5.open();
        folder6.open();

      }


      function showModel( visibility ) {

        model.visible = visibility;

      }


      function showSkeleton( visibility ) {

        skeleton.visible = visibility;

      }


      function modifyTimeScale( speed ) {

        mixer.timeScale = speed;

      }


      function deactivateAllActions() {

        actions.forEach( function ( action ) {

          action.stop();

        } );

        audio.stop();

      }

      function activateAllActions() {

        setWeight( idleAction, settings[ 'modify idle weight' ] );
        setWeight( walkAction, settings[ 'modify walk weight' ] );
        setWeight( runAction, settings[ 'modify run weight' ] );

        actions.forEach( function ( action ) {

          action.play();

        } );

          audio.play();

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

        } );

        audio.paused = true;

      }

      function unPauseAllActions() {

        actions.forEach( function ( action ) {
          action.paused = false;
        } );
        audio.paused = false;

      }

      function toSingleStepMode() {

        unPauseAllActions();

        singleStepMode = true;
        sizeOfNextStep = settings[ 'modify step size' ];

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

        if ( settings[ 'use default duration' ] ) {

          return defaultDuration;

        } else {

          return settings[ 'set custom duration' ];

        }

      }

      function synchronizeCrossFade( startAction, endAction, duration ) {

        mixer.addEventListener( 'loop', onLoopFinished );

        function onLoopFinished( event ) {

          if ( event.action === startAction ) {

            mixer.removeEventListener( 'loop', onLoopFinished );

            executeCrossFade( startAction, endAction, duration );

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
        audio.duration(duration);
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

        settings[ 'modify idle weight' ] = idleWeight;
        settings[ 'modify walk weight' ] = walkWeight;
        settings[ 'modify run weight' ] = runWeight;

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
     

    }

     function animateModel1 () {

        // Render loop
        requestAnimationFrame( animateModel1 );

        idleWeight = idleAction.getEffectiveWeight();
        if (idleAction){
          audio.setPlaybackRate(idleWeight);
        }
        walkWeight = walkAction.getEffectiveWeight();
        if (walkAction){
          audio.setPlaybackRate(walkWeight);
        }
        runWeight = runAction.getEffectiveWeight();
         if (runAction){
          audio.setPlaybackRate(runWeight);
        }

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

        // Update the positional audio's position to match the character's position
        audio.position.copy(character.position); // Assuming character is your animated model

      }

      function addSettingsModel1() {
       createPanel();
       activateAllActions();
       animateModel1();
      }



///////////////////////////////////////////////////////

//Model2

/////////////////////////////////////////////////////

  function createGUI( model, animations ) {

        const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
        const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

        gui = new GUI();

        mixer = new THREE.AnimationMixer( model );

        actions = {};

        for ( let i = 0; i < animations.length; i ++ ) {

          const clip = animations[ i ];
          const action = mixer.clipAction( clip );
          actions[ clip.name ] = action;

          if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {

            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;

          }

        }


        const statesFolder = gui.addFolder( 'States' );

        const clipCtrl = statesFolder.add( api, 'state' ).options( states );

        clipCtrl.onChange( function () {

          fadeToAction( api.state, 0.5 );

        });

        statesFolder.open();

        // emotes

        const emoteFolder = gui.addFolder( 'Emotes' );

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

        emoteFolder.open();

        // expressions

        face = model.getObjectByName( 'Head_4' );

        const expressions = Object.keys( face.morphTargetDictionary );
        const expressionFolder = gui.addFolder( 'Expressions' );

        for ( let i = 0; i < expressions.length; i ++ ) {

          expressionFolder.add( face.morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );

        }

        activeAction = actions[ 'Walking' ];
        activeAction.play();

        expressionFolder.open();

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


      //

      function animateModel2() {

        const dt = clock.getDelta();

        if ( mixer ) mixer.update( dt );

        requestAnimationFrame( animate );

        renderer.render( scene, camera );
      }


      function addSettingsModel2(camera,model) {
       createGUI();
       animateModel2();
      }




///////////////////////////////////////////////////////

//Model3

/////////////////////////////////////////////////////


  const crossFadeControlsModel3 = [];
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


  function createPanelModel3() {

    const panel = new GUI( { width: 310 } );

    const folder1 = panel.addFolder( 'Base Actions' );
    const folder2 = panel.addFolder( 'Additive Action Weights' );
    const folder3 = panel.addFolder( 'General Speed' );

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

        setWeight( settings.action, weight );
        settings.weight = weight;

      } );

    }

    folder3.add( panelSettings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

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

  function activateActionModel3( action ) {

    const clip = action.getClip();
    const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
    setWeight( action, settings.weight );
    action.play();

  }

  function modifyTimeScaleModel3( speed ) {

    mixer.timeScale = speed;

  }

  function prepareCrossFadeModel3( startAction, endAction, duration ) {

    // If the current action is 'idle', execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if ( currentBaseAction === 'idle' || ! startAction || ! endAction ) {

      executeCrossFadeModel3( startAction, endAction, duration );

    } else {

      synchronizeCrossFadeModel3( startAction, endAction, duration );

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

  function synchronizeCrossFadeModel3( startAction, endAction, duration ) {

    mixer.addEventListener( 'loop', onLoopFinished );

    function onLoopFinished( event ) {

      if ( event.action === startAction ) {

        mixer.removeEventListener( 'loop', onLoopFinished );

        executeCrossFadeModel3( startAction, endAction, duration );

      }

    }

  }

  function executeCrossFadeModel3( startAction, endAction, duration ) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    if ( endAction ) {

      setWeight( endAction, 1 );
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

  function setWeightModel3( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

  }

  

  function animateModel3() {

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




function addSettingsModel3(camera,model) {
 createPanelModel3();
 animateModel3();
}

//////////////////////////////////////////////////////


///////////////////////////////




  this.Reset = function(){



  }







  
//////////////////////


  var gui = new dat.GUI();
  var customsettings = new customSettings();

  var modelFolder = gui.addFolder('Model Control');
  modelFolder.add(customsettings, 'modelOpt', ['Sodier', 'Skinning Robot', 'AnimatedRobot']).onChange(
    function(val) {
      modelOpt = val;
  });
  var audioFolder = gui.addFolder('Audio Control');
  audioFolder.add(customsettings, 'backgroundmusic', ['Soundtrack1', 'Soundtrack2', 'Soundtrack3', 'Soundtrack4']).onFinishChange(customsettings['Replay']);
  audioFolder.add(customsettings, 'backgroundmusic', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
  audioFolder.add(customsettings, 'pitch', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
  audioFolder.add(customsettings, 'delayVolume', 0, 1).step(.01).onFinishChange(customsettings.RegenerateAudio);
  audioFolder.add(customsettings, 'delayOffset', 0.1, 1).step(.01).onFinishChange(customsettings.RegenerateAudio);
  audioFolder.open();
  gui.add(customsettings, 'Reset Audio').onChange(function(val) {
    audioTriggered = val;
    if (audioTriggered) {
      that['Reset Audio']();  
    }
  })

  gui.add(customsettings, 'Replay Audio').onChange(function(val) {
  activateAudio = val;
  localStorage.setItem("activateAudio", val);
  if (activateAudio) {
    that['Replay Audio']();  
  }

});

const layers = {

      'toggle model1': function () {

        camera3.layers.toggle( 0 );
        that.modelDisplay =  Skinning Robot

      },

      'toggle model2': function () {

        camera3.layers.toggle( 1 );
        that.modelDisplay =  Skinning Robot


      },
      'toggle model3': function () {

        camera3.layers.toggle( 2 );
        that.modelDisplay =  Skinning Robot


      },

      'enable all': function () {
        camera3.layers.enableAll();
        that.allDisplay
      },

      'disable all': function () {
        camera3.layers.disableAll();
                that.noneDisplay

      }

    };
    var characterLock = gui.addFolder('Character Control');
    characterLock.add( layers, 'toggle model1' );
    characterLock.add( layers, 'toggle model2' );
    characterLock.add( layers, 'toggle model3' );
    characterLock.add( layers, 'enable all' );
    characterLock.add( layers, 'disable all' );
    characterLock.open();

    var wallFolder = gui.addFolder('Wall Control');
    wallFolder.add(customsettings, 'wallType', ['Line', 'Rectangle', 'Circle']).onFinishChange(customsettings['Replay']);
    wallFolder.add(customsettings, 'width', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
    wallFolder.add(customsettings, 'depth', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
    wallFolder.add(customsettings, 'height', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
    wallFolder.add(customsettings, 'radius', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
    wallFolder.add(customsettings, 'length', .5, 2).step(.01).onFinishChange(customsettings.RegenerateAudio);
    wallFolder.open();
    gui.add(customsettings, 'Reset Audio').onChange(function(val) {
      audioTriggered = val;
      if (audioTriggered) {
        that['Reset Audio']();  
      }
    }); v

    gui.add(customsettings, 'Add SubAudio').onChange(function(val) {
      isAudioFinder =val;
    });

    gui.add(customsettings, 'Add IsolatorAudio').onChange(function(val) {
      isAudioIsolator =val;
    });

    const soundControls = new SoundControls();
    const generatorControls = new GeneratorControls();
    const volumeFolder = gui.addFolder( 'sound volume' );
    const generatorFolder = gui.addFolder( 'sound generator' );

    volumeFolder.add( soundControls, 'master' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

      listener.setMasterVolume( soundControls.master );

    } );
    volumeFolder.add( soundControls, 'element' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

      sound1.setVolume( soundControls.element );

    } );
  

    volumeFolder.open();
    generatorFolder.add( generatorControls, 'frequency' ).min( 50.0 ).max( 5000.0 ).step( 1.0 ).onChange( function () {

      oscillator.frequency.setValueAtTime( generatorControls.frequency, listener.context.currentTime );

    } );
    generatorFolder.add( generatorControls, 'wavetype', [ 'sine', 'square', 'sawtooth', 'triangle' ] ).onChange( function () {

      oscillator.type = generatorControls.wavetype;

    } );

    generatorFolder.open();


    function initAudio(options){

      if (!options.after) {
        that.backgroundmusic === 'Soundtrack1';
        localStorage.setItem("url", that.backgroundmusic);
      }

       // Call the "after" callback
        if (typeof options.after === 'function') {
            options.after();
        }
        // Get the existing canvas element by its ID
        const canvas = document.getElementById('audio-scene');
        const context = canvas.getContext('2d');

        // Create a CanvasTexture from the canvas
        const texture = new THREE.CanvasTexture(canvas);

        // Create a material using the CanvasTexture
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // Create a mesh with the material
        const geometry = new THREE.PlaneGeometry(5, 2); // Adjust the geometry as needed
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Adjust the position and rotation of the mesh as needed
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, Math.PI / 4, 0);


      let scene, camera, renderer, analyser, uniforms;

      const startButton = document.getElementById( 'audio-button' );
      startButton.addEventListener( 'click', init );

      function init() {

        const fftSize = 128;

        //

        const overlay = document.getElementById( 'overlay' );
        overlay.remove();

      //

      const container = document.getElementById( 'audio-container' );

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( clientWidth, clientHeight );
      container.appendChild( renderer.domElement );

      camera = new THREE.Camera();

      const listener = new THREE.AudioListener();

      const audio = new THREE.Audio( listener );

      if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {

        const loader = new THREE.AudioLoader();
        loader.load( that.backgroundmusic, function ( buffer ) {

          audio.setBuffer( buffer );
          audio.play();

        } );

      } else {

        const mediaElement = new Audio( that.backgroundmusic );
        mediaElement.play();

        audio.setMediaElementSource( mediaElement );

      }

      analyser = new THREE.AudioAnalyser( audio, fftSize );

      //

      const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

      uniforms = {

        tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize / 2, 1, format ) }

      };

      const material = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

      } );

      const geometry = new THREE.PlaneGeometry( 1, 1 );

      const mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      //

      window.addEventListener( 'resize', onWindowResize );

      animate();

    }

      function onWindowResize() {

        renderer.setSize( containerWidth, clientHeight );

      }

      function animate() {

        requestAnimationFrame( animate );

        render();

      }

      function render() {

        analyser.getFrequencyData();

        uniforms.tAudioData.value.needsUpdate = true;

        renderer.render( scene, camera );

      }

    }




