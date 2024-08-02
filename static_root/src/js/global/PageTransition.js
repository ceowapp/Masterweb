import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { Text } from 'troika-three-text';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';        
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GTLFCustomLoader from "./LoadGLTFModel.js";

/*class ModelLoader extends GTLFCustomLoader{
  constructor(options, settings) {
    super(settings);
    this.scene = new THREE.Scene();
    this.container = options.container;
    this.mdSettings = settings;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.ratio = this.width / this.height;
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.container,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.preserveDrawingBuffer = true;
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(this.scene.position);
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.isPlaying = true;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.target = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    this.addLight();
    this.addObjects();
    this.onResize();
    this.animate();
    this.addEventListeners();
    //if(this.light) this.scene.add( this.light );
    //this.addPlane();
    //this.addPlane();
  
  }

  addLight(){
    this.aLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.aLight.position.set(0, 0, -5);
    this.scene.add(this.aLight);
  }

  addObjects() {
    // Example usage in some function:
    this.addSingleObject(this.mdSettings)
      .then((model) => {
        this.model = model.scene;
        this.group.add(this.model);
        this.group.scale.set(this.mdSettings.scale, this.mdSettings.scale, this.mdSettings.scale);
        this.group.position.set(this.mdSettings.posX, this.mdSettings.posY, this.mdSettings.posZ);
      })
      .catch((error) => {
        // Handle errors during loading
        console.error('Error loading model:', error);
      });
  }

  renderObject() {
    if(this.group){
      let time = performance.now() * 0.001;
      //this.model.rotation.y += ( this.targetRotation - this.model.rotation.y )*0.01*time;
    }
  } 
  settings() {
    this.settings = {
        progress: 0,
    };
  }
    stop() {
      this.isPlaying = false;
    }

    play() {
      if(!this.isPlaying){
        this.render()
        this.isPlaying = true;
      }
    }

  //ADD EVENT LISTENER
  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }
  // RENDER
  render() {
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
  }

  //RESIZE
  onResize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}*/
class ModelLoader1 extends GTLFCustomLoader {
  constructor(options, settings) {
    super(settings);
    this.container = options.container;
    this.mdSettings = settings;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.ratio = this.width / this.height;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.container,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.preserveDrawingBuffer = true;
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 1, 10000);
    this.camera.position.set(0, 3, 20);
    this.camera.lookAt(new THREE.Vector3());
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    this.isPlaying = true;
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.target = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    this.setup(); 
    this.addObjects();
  }

  setup() {
    this._settings = {
      distortion: 0,
      bloomThreshold: 0.1,
      bloomStrength: 1.0,
      bloomRadius: 1.0,
    };
  }

  async addObjects() {
    for (let i = 0; i < this.mdSettings.length; i++) {
      const gltf = await new GLTFLoader().loadAsync(this.mdSettings[i].path);
      this.model = gltf.scene;
      this.group.add(this.model);
      this.group.scale.set(this.mdSettings[i].scale, this.mdSettings[i].scale, this.mdSettings[i].scale);
      this.group.position.set(this.mdSettings[i].posX, this.mdSettings[i].posY, this.mdSettings[i].posZ);
      this._setPostEffect(this.scene, this.camera);
      this.onResize();
      this.animate();
      this.bindEvents();
      // Wait for 2-3 seconds before switching to the next model
      await this.wait(2000);
      this.group.remove(this.model);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _setPostEffect(scene, camera) {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    var unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.5, 0.4, 0.85);
    unrealBloomPass.threshold = this._settings.bloomThreshold;
    unrealBloomPass.strength = this._settings.bloomStrength;
    unrealBloomPass.radius = this._settings.bloomRadius;
    this.composer.addPass(unrealBloomPass);
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }

  render() {
    if (!this.isPlaying) return;
    // Call your rendering logic here
    gsap.to(this.model.rotation, { duration: 2, y: Math.PI * 2 });
    this.composer.render();  
  }
}
 /*class PageTransition{
  constructor() {
        console.log("this is clicked leftArrow")

    this.colorDot = [
        "#ffff00",
        "#76ff03",
        "#f06292",
        "#4fc3f7",
        "#ba68c8",
        "#f57c00"
    ];
    this.container1= document.querySelector(".scroll-section-wrap");
    this.container= document.querySelector(".master-wrap");
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.slides = [].slice.call(this.container.getElementsByTagName('section'));
    this.dur = 0.5;
    this.offsets = [];
    this.oldSlide = 0;
    this.activeSlide = 0;
    this.dots = document.querySelector(".dot-wrap");
    this.navDots = [];
    this.iw = this.width;
    this.mouseAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.handAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.cursorAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.arrowAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.addEvents();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("resize", this.sizeIt.bind(this));
    document.querySelector("#leftArrow").addEventListener("click", this.slideAnim.bind(this));
    document.querySelector("#rightArrow").addEventListener("click", this.slideAnim.bind(this));
   } 

  addEvents() {
    for (let i = 0; i < this.slides.length; i++) {
      let newDot = document.createElement("li");
      newDot.className = "dot";
      newDot.index = i;
      newDot.style.background = this.colorDot[i];
      newDot.style.boxShadow = `0 0 50px ${this.colorDot[i]}`;
      this.navDots.push(newDot);
      newDot.addEventListener("click", this.slideAnim);
      this.dots.appendChild(newDot);
    }
    // get elements positioned
    gsap.set(".dots, .titleWrap", { xPercent: -50 });
    gsap.set(".arrow", { yPercent: -50 });
    gsap.set(".title", { y: 30 });
    // lower screen animation with nav dots and rotating titles
    this.dotAnim = gsap.timeline({ paused: true });
    this.dotAnim.to(
      ".dot",
      {
        stagger: { each: 1, yoyo: true, repeat: 1 },
        scale: 2.1,
        rotation: 0.1,
        ease: "power2.out"
      },
      0.5
    );
    this.dotAnim.to(
      ".title",
      this.slides.length + 1,
      { y: -(this.slides.length * 30), rotation: 0.01, ease: "none" },
      0
    );
    this.dotAnim.time(1);
    // make the whole thing draggable
    this.dragMe = Draggable.create(this.container1, {
      type: "x",
      edgeResistance: 1,
      snap: this.offsets,
      inertia: true,
      bounds: this.container1,
      onDrag: this.tweenDot,
      onThrowUpdate: this.tweenDot,
      onDragEnd: this.slideAnim,
      allowNativeTouchScrolling: false,
      zIndexBoost: false
    });
     this.dragMe[0].id = "dragger";
     this.sizeIt();
  }

   slideAnim(e) {
    this.oldSlide = this.activeSlide;
    // dragging the panels
    if (this.id === "dragger") {
      this.activeSlide = this.offsets.indexOf(this.endX);
    } else {
      if (gsap.isTweening(this.container1)) {
        return;
      }
      // arrow clicks
      if (e.srcElement.ownerSVGElement.id === "leftArrow" || e.srcElement.ownerSVGElement.id === "rightArrow") {
        this.activeSlide =
          this.id === "rightArrow" ? (this.activeSlide += 1) : (this.activeSlide -= 1);
        // click on a dot
      } else if (this.className === "dot") {
        this.activeSlide = this.index;
        // scrollwheel
      } else {
        this.activeSlide = e.deltaY > 0 ? (this.activeSlide += 1) : (this.activeSlide -= 1);
      }
    }
    // make sure we're not past the end or beginning slide
    this.activeSlide = this.activeSlide < 0 ? 0 : this.activeSlide;
    this.activeSlide = this.activeSlide > this.slides.length - 1 ? this.slides.length - 1 : this.activeSlide;
    if (this.oldSlide === this.activeSlide) {
      return;
    }
    // if we're dragging we don't animate the container
    if (this.id != "dragger") {
      gsap.to(this.container1, this.dur, { x: this.offsets[this.activeSlide], onUpdate: this.tweenDot });
    }
  }

  sizeIt() {
    this.offsets = [];
    this.iw = this.width;
    //let offsetScroll = document.querySelector(".firstContainer").clientHeight;
    //gsap.to(".firstContainer",{y: offsetScroll, duration:2.5, ease: "power2.out",})
    gsap.set(".scroll-section-wrap", { width: this.slides.length * this.iw });
    gsap.set(this.slides, { width: this.iw });
    for (let i = 0; i < this.slides.length; i++) {
      this.offsets.push(-this.width);
      console.log("this is triggered sizeIt", document.querySelector(".scroll-section-wrap").clientWidth);

    }
    gsap.set(this.container1, { x: this.offsets[this.activeSlide] });
    this.dragMe[0].vars.snap = this.offsets;
  }
  tweenDot() {
    gsap.set(this.dotAnim, {
      time: Math.abs(gsap.getProperty(this.container1, "x") / this.iw) + 1
    });
  }
}*/
 class PageTransition{
  constructor() {
    this.colorDot = [
        "#ffff00",
        "#76ff03",
        "#f06292",
        "#4fc3f7",
        "#ba68c8",
        "#f57c00"
    ];
    this.offsets = [];
    this.oldSlide = 0;
    this.activeSlide = 0;
    this.navDots = [];
    this.iw = this.width;
    this.mouseAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.handAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.cursorAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.arrowAnim = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    this.addEvents();
    this.addEvents3();
  }

  bindEvents() {
    //window.addEventListener("resize", this.sizeIt.bind(this));
    document.querySelector("#leftArrow").addEventListener("click", this.slideAnim.bind(this));
    document.querySelector("#rightArrow").addEventListener("click", this.slideAnim.bind(this));
   } 

  addEvents(){
    gsap.registerPlugin(ScrollTrigger);
    let sections_left = gsap.utils.toArray(".panel-inner-left");
    gsap.to(sections_left, {
      xPercent: -100 * (sections_left.length - 1),
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#panel-slider-outsider-left",
        pin: true,
        scrub: 1,
        snap: 1 / (sections_left.length - 1),
        //markers: {color: "white"},
        end: () => "+=" + document.querySelector("#panel-slider-outsider-left").offsetWidth
      }
    });
    let sections_right = gsap.utils.toArray(".panel-inner-right");
      gsap.to(sections_right, {
      xPercent: 100 * (sections_right.length - 1),
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#panel-slider-outsider-right",
        pin: true,
        scrub: 1,
        snap: 1 / (sections_right.length - 1),
        //markers: {color: "white"},
        end: () => "+=" - document.querySelector("#panel-slider-outsider-right").offsetWidth
      }
    });
  }

    addEvents3(){
      gsap.registerPlugin(ScrollTrigger);
      let sections_left = gsap.utils.toArray(".panel-inner-left-1");
      gsap.to(sections_left, {
        xPercent: -100 * (sections_left.length - 1),
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#panel-slider-outsider-left-1",
          pin: true,
          scrub: 1,
          snap: 1 / (sections_left.length - 1),
          //markers: {color: "white"},
          end: () => "+=" + document.querySelector("#panel-slider-outsider-left-1").offsetWidth
        }
      });
      /*let sections_right = gsap.utils.toArray(".panel-inner-right-1");
        gsap.to(sections_right, {
        xPercent: 100 * (sections_right.length - 1),
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#panel-slider-outsider-right-1",
          pin: true,
          scrub: 1,
          snap: 1 / (sections_right.length - 1),
          //markers: {color: "white"},
          end: () => "+=" - document.querySelector("#panel-slider-outsider-right-1").offsetWidth
        }
      });*/
    }




  addEvents1() {
    gsap.registerPlugin(ScrollTrigger);
    const horizontalSections = gsap.utils.toArray('div#panel-slider-outsider')
    horizontalSections.forEach(function (sec, i) {  
    var thisPinWrap = sec.querySelector('#panel-slider-insider');
    var thisAnimWrap = thisPinWrap.querySelector('.animation-wrap');
    var getToValue = () => -(thisAnimWrap.scrollWidth - window.innerWidth); 
    gsap.fromTo(thisAnimWrap, { 
        x: () => thisAnimWrap.classList.contains('to-right') ? 0 : getToValue() 
      }, { 
        x: () => thisAnimWrap.classList.contains('to-right') ? getToValue() : 0, 
        ease: "none",
        scrollTrigger: {
          trigger: sec,   
          start: "top top",
          end: () => "+=" + (thisAnimWrap.scrollWidth - window.innerWidth),
          pin: thisPinWrap,
          invalidateOnRefresh: true,
          //anticipatePin: 1,
          scrub: true,
          //markers: true,
        }
      });
    }); 
  }

  addEvents2() {
    gsap.set(".introAnim", {position: "absolute", left: 0, top: 0, width: "100%", height: "100%", opacity: 1 })
    gsap.set(".introAnimDevice", { x:65, y:90 })
    gsap.set(".tablet, .laptop, .desktop, .ooh", { opacity: 0 })
  
    let tl = gsap.timeline({defaults:{duration:0.67, ease:"expo.inOut"}, scrollTrigger: {
              trigger: "#panel-morph-device",
              start: "top 30%",
              end: "bottom 60%",
              scrub: 0.5,
              snap:'labels',
              markers: true,
              // snap: {
              //     snapTo: "labels", // snap to the closest label in the timeline
              //     duration: {min: 0.1, max: 0.3}, // the snap animation should be at least 0.3 seconds, but no more than 1.3 sec (determined by velocity)
              //     // ease: "expo.inOut" // the ease of the snap animation ("power3" by default)
              //   }
              }})

            .add("tablet", 0.1)
            .to(".phone", { morphSVG: (i) => ".tablet" + (i + 1) }, "tablet")
            .to(".phone5, .phone6", { opacity: 0, morphSVG: ".tablet5" }, "tablet")
            .to(".adShape1", { morphSVG: ".adShape2" }, "tablet")

            .add("laptop", 1.5)
            .to(".phone", { morphSVG: (i) => ".laptop" + (i + 1) }, "laptop")
            .to(".phone3", { opacity: 0, y: -4 }, "laptop")
            .fromTo(
              ".laptop5",
              { scale: 0, transformOrigin: "50% 50%" },
              { scale: 1, opacity: 1 },
              "laptop"
            )
            .to(".adShape1", { morphSVG: ".adShape4" }, "laptop")
            .from(".adShape3", { scale: 0, opacity: 0 }, "laptop")

            .add("desktop", 3)
            .to(".phone1", { morphSVG: ".desktop1" }, "desktop")
            .to(".phone2", { morphSVG: ".desktop2" }, "desktop")
            .to(".phone4", { morphSVG: ".desktop3" }, "desktop")
            .to(
              ".laptop5",
              { morphSVG: { shape: ".desktop4", shapeIndex: 0 }, y: 0.5 },
              "desktop"
            )
            .to(".adShape1", { morphSVG: ".adShape6" }, "desktop")
            .to(".adShape3", { morphSVG: ".adShape5" }, "desktop")

            .add("ooh", 4.5)
            .to(".phone1", { morphSVG: ".ooh1" }, "ooh")
            .to(".phone2", { morphSVG: ".ooh2" }, "ooh")
            .to(".phone4", { scale: 0, y: -48 }, "ooh")
            .to(".laptop5", { morphSVG: ".ooh3", y: 0 }, "ooh")
            .to(".adShape1", { morphSVG: ".adShape8" }, "ooh")
            .to(".adShape3", { morphSVG: ".adShape7", ease: "back.inOut(0.6)" }, "ooh")
            .add("end");

      }


    addEvents4() {
      var morphTimeline = new TimelineMax({
        repeat:-1,
        repeatDelay:2
      });

      morphTimeline
        .timeScale(1.5)
        .to($('#megaphone'),2,{morphSVG:{shape:"#links"}, fill:"none",opacity:1})
        .to($('#megaphone'),2,{morphSVG:{shape:"#computer"}, fill:"none"},"+=2")
        .to($('#megaphone'),2,{morphSVG:{shape:"#light"}, fill:"none"},"+=2")
        .to($('#megaphone'),2,{morphSVG:{shape:"#megaphone"}, fill:"none"},"+=2")
      ;

      /*TweenMax.to($('#megaphone'),3,{stroke:"hsl(+=360,+=0%,+=0%)",repeat:-1,yoyo:true});*/

      /*TweenMax.to($('#megaphone'),3,{stroke:"hsl(+=0,+=0%,-=50%)",repeat:-1,yoyo:true,repeatDelay:0});*/

      }

       addEvents5() {
        gsap.registerPlugin(MorphSVGPlugin)
          //here we create a timeline so it can play on repeat
          var morphTimeline = new TimelineMax({ 
            repeat:-1,
            repeatDelay:2
          }); 
          morphTimeline
            .to('#pathtuto1',2,{morphSVG:{shape:"#pathtuto2"}}) 
          //path #pathtuto1 morph into #pathtuto2 during 2 seconds
            .to('#pathtuto1',2,{morphSVG:{shape:"#pathtuto3"}},"+=2")
          //2 seconds later path #pathtuto1 morph into #pathtuto3 during 2 seconds
            .to('#pathtuto1',2,{morphSVG:{shape:"#pathtuto1"}},"+=2"); 
          //2 seconds later path #pathtuto1 morph back into #pathtuto1 during 2 seconds
          ;
      }

      addEvents6() {
       // write a simple tween object
          var tween = KUTE.fromTo('#line', {path: '#line' }, { path: '#circle' }).start();

          document.getElementById('#panel-morph-device').onclick = function() {
            !tween.playing && tween.start();
          }
                  //var tween = KUTE.fromTo('#pathtuto2', {path: '#pathtuto2' }, { path: '#pathtuto1' }).start();
        }


  /*addEvents() {
    for (let i = 0; i < this.slides.length; i++) {
      let newDot = document.createElement("li");
      newDot.className = "dot";
      newDot.index = i;
      newDot.style.background = this.colorDot[i];
      newDot.style.boxShadow = `0 0 50px ${this.colorDot[i]}`;
      this.navDots.push(newDot);
      newDot.addEventListener("click", this.slideAnim);
      this.dots.appendChild(newDot);
    }
    // get elements positioned
    gsap.set(".dots, .titleWrap", { xPercent: -50 });
    gsap.set(".arrow", { yPercent: -50 });
    gsap.set(".title", { y: 30 });
    // lower screen animation with nav dots and rotating titles
    this.dotAnim = gsap.timeline({ paused: true });
    this.dotAnim.to(
      ".dot",
      {
        stagger: { each: 1, yoyo: true, repeat: 1 },
        scale: 2.1,
        rotation: 0.1,
        ease: "power2.out"
      },
      0.5
    );
    this.dotAnim.to(
      ".title",
      this.slides.length + 1,
      { y: -(this.slides.length * 30), rotation: 0.01, ease: "none" },
      0
    );
    this.dotAnim.time(1);
    // make the whole thing draggable
    this.dragMe = Draggable.create(this.container1, {
      type: "x",
      edgeResistance: 1,
      snap: this.offsets,
      inertia: true,
      bounds: this.container1,
      onDrag: this.tweenDot,
      onThrowUpdate: this.tweenDot,
      onDragEnd: this.slideAnim,
      allowNativeTouchScrolling: false,
      zIndexBoost: false
    });
     this.dragMe[0].id = "dragger";
     this.sizeIt();
  }

   slideAnim(e) {
    this.oldSlide = this.activeSlide;
    // dragging the panels
    if (this.id === "dragger") {
      this.activeSlide = this.offsets.indexOf(this.endX);
    } else {
      if (gsap.isTweening(this.container1)) {
        return;
      }
      // arrow clicks
      if (e.srcElement.ownerSVGElement.id === "leftArrow" || e.srcElement.ownerSVGElement.id === "rightArrow") {
        this.activeSlide =
          this.id === "rightArrow" ? (this.activeSlide += 1) : (this.activeSlide -= 1);
        // click on a dot
      } else if (this.className === "dot") {
        this.activeSlide = this.index;
        // scrollwheel
      } else {
        this.activeSlide = e.deltaY > 0 ? (this.activeSlide += 1) : (this.activeSlide -= 1);
      }
    }
    // make sure we're not past the end or beginning slide
    this.activeSlide = this.activeSlide < 0 ? 0 : this.activeSlide;
    this.activeSlide = this.activeSlide > this.slides.length - 1 ? this.slides.length - 1 : this.activeSlide;
    if (this.oldSlide === this.activeSlide) {
      return;
    }
    // if we're dragging we don't animate the container
    if (this.id != "dragger") {
      gsap.to(this.container1, this.dur, { x: this.offsets[this.activeSlide], onUpdate: this.tweenDot });
    }
  }

  sizeIt() {
    this.offsets = [];
    this.iw = this.width;
    //let offsetScroll = document.querySelector(".firstContainer").clientHeight;
    //gsap.to(".firstContainer",{y: offsetScroll, duration:2.5, ease: "power2.out",})
    gsap.set(".scroll-section-wrap", { width: this.slides.length * this.iw });
    gsap.set(this.slides, { width: this.iw });
    for (let i = 0; i < this.slides.length; i++) {
      this.offsets.push(-this.width);
      console.log("this is triggered sizeIt", document.querySelector(".scroll-section-wrap").clientWidth);

    }
    gsap.set(this.container1, { x: this.offsets[this.activeSlide] });
    this.dragMe[0].vars.snap = this.offsets;
  }
  tweenDot() {
    gsap.set(this.dotAnim, {
      time: Math.abs(gsap.getProperty(this.container1, "x") / this.iw) + 1
    });
  }*/
}


 /*class InfiniteTunnel{
  constructor(options) {
    this.container = options.container;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.ratio = this.width / this.height;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer( { alpha: true, canvas: this.container} );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0); 
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.preserveDrawingBuffer = true;
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.001,
      2000
    );
    this.cameraTargetPercentage = 0;
    this.currentCameraPercentage = 0;
    this.cameraRotationProxyX = 3.14159;
    this.cameraRotationProxyY = 0;
    this.tubePerc = {
      percent: 0
    };
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.isPlaying = true;
    this.group = new THREE.Group();
    this.camera.position.z = 400;
    this.group.add(this.camera);
    this.group1 = new THREE.Group();
    this.target = new THREE.Vector2();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastPlace = 0;
    this.newPlace = 0
    this.speed = 0.02;
    this.markers = [];
    this.settings();
    this.utils();
    this.setup();
    this.addTube();
    this.addTimeline();
    this.addParticles();
    this.onResize();
    this.animate();
    this.addEventListeners();
  }

  settings() {
    this._settings = {
      params: {
        exposure: 1.3,
        bloomStrength: .9,
        bloomThreshold: 0,
        bloomRadius: 0
      }
    }
  }

  utils() {
    this.Mathutils = {
      normalize: function($value, $min, $max) {
          return ($value - $min) / ($max - $min);
      },
      interpolate: function($normValue, $min, $max) {
          return $min + ($max - $min) * $normValue;
      },
      map: function($value, $min1, $max1, $min2, $max2) {
          if ($value < $min1) {
              $value = $min1;
          }
          if ($value > $max1) {
              $value = $max1;
          }
          var res = this.interpolate(this.normalize($value, $min1, $max1), $min2, $max2);
          return res;
      }
    }
  }


  updateCurve = function() {
    var index = 0, vertice_o = null, vertice = null;
    // For each vertice of the tube, move it a bit based on the spline
    for (var i = 0, j = this.tubeGeometry.attributes.position.array.count; i < j; i += 1) {
      // Get the original tube vertice
      vertice_o = this.tubeGeometry_o.attributes.position.array[i];
      // Get the visible tube vertice
      vertice = this.tubeGeometry.attributes.position.array[i];
      // Calculate index of the vertice based on the Z axis
      // The tube is made of 50 rings of vertices
      // Update tube vertice
      index = Math.floor(i / 50);
      vertice.x +=
        (vertice_o.x + this.tubeGeometry.attributes.position.array[index].x - vertice.x) /
        1;
      vertice.y +=
        (vertice_o.y + this.tubeGeometry.attributes.position.array[index].y - vertice.y) /
        0.5;
    }
    // Warn ThreeJs that the points have changed
    this.tubeGeometry.attributes.position.needsUpdate = true;
    // Update the points along the curve base on mouse position
    this.path.points[2].x = -this.mouse.x * 0.1;
    this.path.points[4].x = -this.mouse.x * 0.1;
    this.path.points[2].y = this.mouse.y * 0.1;
    // Warn ThreeJs that the spline has changed
    this.wireframe.geometry.attributes.position.needsUpdate = true;
    var geometry1 = new THREE.TubeGeometry( this.path, 150, 3.4, 32, false );
    var geo1 = new THREE.EdgesGeometry( geometry1 );
    this.wireframe.geometry.attributes.position.copy(geo1.attributes.position);
  };

  updateCameraPercentage(percentage) {
    this.p1 = this.path.getPointAt(percentage%1);
    this.p2 = this.path.getPointAt((percentage + 0.03)%3);
    this.p3 = this.path.getPointAt((percentage + 0.05)%1);
    this.group.position.set(this.p1.x,this.p1.y,this.p1.z);  
    // Warn ThreeJs that the spline has changed
    this.wireframe.position.set(this.p1.x,this.p1.y,this.p1.z);
    this.group.lookAt(this.p2);
    this.pointLight.position.set(this.p2.x, this.p2.y, this.p2.z);
  }

  addTimeline(){
    gsap.registerPlugin(ScrollTrigger);
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".scrollTarget",
        start: "top top",
        end: "bottom 100%",
        scrub: 5,
        //markers: {color: "white"}
      }
    })
    tl.to(this.tubePerc, {
       percent:.96,
       ease: Linear.easeNone,
       duration: 10,
       onUpdate: () => {
         this.cameraTargetPercentage = this.tubePerc.percent;
         console.log("this.cameraTargetPercentage", this.tubePerc.percent)
       }
    });
  }

  addTube() {
    this.points = [
      [0, 0, 0],
      [40, -1, 10],
      [66, 50, 20],
      [116, 52, 12],
      [140, 23, 8],
      [147, 73, -16],
      [170, -45, 5],
      [197, -54, 10],
      [222, -53, 0]
    ];
    for (var i = 0; i < this.points.length; i++) {
      var x = this.points[i][0];
      var y = this.points[i][2];
      var z = this.points[i][1];
      this.points[i] = new THREE.Vector3(x, y, z);
    }
    this.path = new THREE.CatmullRomCurve3(this.points);
    this.path.tension = .5;
    this.tubeGeometry = new THREE.TubeGeometry( this.path, 300, 4, 32, false );
    var texture = new THREE.TextureLoader().load( '../static/src/assets/global/textures/InfiniteTube/3d_space_5.jpg' , function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set( 0, 0 );
        texture.repeat.set( 15, 2 );
    });
    var mapHeight = new THREE.TextureLoader().load('../static/src/assets/global/textures/InfiniteTube/waveform-bump3.jpg', function( texture){
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set( 0, 0 );
        texture.repeat.set( 15, 2 );
    });
    this.tubeMaterial = new THREE.MeshPhongMaterial({
      side:THREE.BackSide,
      map: texture,
      shininess: 20,
      bumpMap: mapHeight,
      bumpScale: -.03,
      specular: 0x0b2349
    });
    this.tube = new THREE.Mesh( this.tubeGeometry, this.tubeMaterial );
    var geometry1 = new THREE.TubeGeometry( this.path, 150, 3.4, 32, false );
    var geo = new THREE.EdgesGeometry( geometry1 );
    var mat = new THREE.LineBasicMaterial( {
      linewidth: 2,
      opacity: .2,
      transparent: 1
    });
    this.wireframe = new THREE.LineSegments( geo, mat );
    this.group1.add(this.tube);
    this.group1.add(this.wireframe);
    this.group1.position.set(0, 0 ,-7);
    this.group1.rotateY(Math.PI/2);
    this.tubeGeometry_o = this.tubeGeometry.clone();
    this.scene.add( this.group1 );
  }

  setup(){
    this.aLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.aLight.position.set(0, 0, 5);
    this.pointLight = new THREE.PointLight(0xffffff, .35, 4,0);
    this.pointLight.castShadow = true;
    this.scene.fog = new THREE.Fog(0x194794,0,100);
    this.scene.add(this.pointLight);
    this.scene.add(this.aLight);
    var renderScene = new RenderPass( this.scene, this.camera );
    var bloomPass = new UnrealBloomPass( new THREE.Vector2( this.width, this.height ), 1.5, 0.4, 0.85 );
    bloomPass.renderToScreen = true;
    bloomPass.threshold = this._settings.params.bloomThreshold;
    bloomPass.strength = this._settings.params.bloomStrength;
    bloomPass.radius = this._settings.params.bloomRadius;
    this.composer = new  EffectComposer( this.renderer );
    this.composer.setSize( this.width, this.height );
    this.composer.addPass( renderScene );
    this.composer.addPass( bloomPass );
  }

  addParticles() {
    var spikeyTexture = new THREE.TextureLoader().load('../static/src/assets/global/textures/InfiniteTube/spikey.png');
    var particleCount = 6800;
    this.particles1 = new THREE.BufferGeometry();
    this.particles2 = new THREE.BufferGeometry();
    this.particles3 = new THREE.BufferGeometry();
    this.pMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: .5,
      map: spikeyTexture,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
  let particleArr1 = [];
  let particleArr2 = [];
  let particleArr3 = [];
    for (var p = 0; p < particleCount; p++) {
      var pX = Math.random() * 500 - 250,
          pY = Math.random() * 50 - 25,
          pZ = Math.random() * 500 - 250;
          particleArr1.push(pX, pY, pZ);
         
    }
    this.particles1.setAttribute( 'position', new THREE.Float32BufferAttribute( particleArr1, 3 ) )
    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {
      var pX = Math.random() * 500,
          pY = Math.random() * 10 - 5,
          pZ = Math.random() * 500;
          particleArr2.push(pX, pY, pZ)
    }
    this.particles2.setAttribute( 'position', new THREE.Float32BufferAttribute( particleArr2, 3 ) )
    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {
      var pX = Math.random() * 500,
          pY = Math.random() * 10 - 5,
          pZ = Math.random() * 500;
          particleArr3.push(pX, pY, pZ)
    }
    this.particles3.setAttribute( 'position', new THREE.Float32BufferAttribute( particleArr3, 3 ) )
    this.particleSystem1 = new THREE.Points(
        this.particles1,
        this.pMaterial);
    this.particleSystem2 = new THREE.Points(
        this.particles2,
        this.pMaterial);
    this.particleSystem3 = new THREE.Points(
        this.particles3,
        this.pMaterial);
    this.scene.add(this.particleSystem1);
    this.scene.add(this.particleSystem2);
    this.scene.add(this.particleSystem3);
  }

  stop() {
      this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  //ADD EVENT LISTENER
  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = (e) =>{
    this.cameraRotationProxyX = this.Mathutils.map(e.clientX, 0, this.width, 3.24, 3.04);
    this.cameraRotationProxyY = this.Mathutils.map(e.clientY, 0, this.height, -.1, .1);
  }

  onMouseMove1 = (e) =>{
    this.mouse.x = (e.clientX - window.innerWidth/2);
    this.mouse.y = (window.innerWidth/2 - e.clientY);
  }

  // RENDER
  render() {
    //texture.offset.x+=.004
    //texture2.needsUpdate = true;
    this.currentCameraPercentage = this.cameraTargetPercentage;
    this.camera.rotation.y += (this.cameraRotationProxyX - this.camera.rotation.y) / 15;
    this.camera.rotation.x += (this.cameraRotationProxyY - this.camera.rotation.x) / 15;
    this.updateCameraPercentage(this.currentCameraPercentage);    
    this.particleSystem1.rotation.y += 0.00002;
    this.particleSystem2.rotation.x += 0.00005;
    this.particleSystem3.rotation.z += 0.00001;
    this.tubeMaterial.map.offset.x += this.speed;
    /*this.mouse.x += (this.target.x - this.mouse.x) / 30;
    this.mouse.y += (this.target.y - this.mouse.y) / 30;
    this.camera.rotation.z = this.mouse.x * 0.2;
    this.camera.rotation.y = Math.PI - this.mouse.x * 0.06;
    this.camera.position.x = this.mouse.x * 0.015;
    this.updateCurve();
    this.composer.render();   
    //this.renderer.render(this.scene, this.camera);
    //this.renderer.clearDepth();
  }*/


  // RENDER
  /*render() {
    //texture.offset.x+=.004
    //texture2.needsUpdate = true;
    this.mouse.x += (this.target.x - this.mouse.x) / 30;
    this.mouse.y += (this.target.y - this.mouse.y) / 30;
    this.camera.rotation.z = this.mouse.x * 0.2;
    this.camera.rotation.y = Math.PI - this.mouse.x * 0.06;
    this.camera.position.x = this.mouse.x * 0.015;
    this.camera.position.y = -this.mouse.y * 0.015;
    this.particleSystem1.rotation.y += 0.00002;
    this.particleSystem2.rotation.x += 0.00005;
    this.particleSystem3.rotation.z += 0.00001;
    this.composer.render();
    this.updateCurve();
    //this.renderer.render(this.scene, this.camera);
    //this.renderer.clearDepth();
  }



  //RESIZE
  onResize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}*/

(function () {
    function init() {
      var canvasElements = document.querySelectorAll(".scroll-content-container");
      var canvasArr = Array.prototype.slice.call(canvasElements);
      var infiniteCanvas = document.querySelector(".experience");
      var mdSettings =
        [    
          {
            path: '../static/src/assets/dataset/models/skeleton/skeleton.glb',
            scale: 1,
            posX: 0,
            posY: 0,
            posZ: 200,
          },
          {
            path: '../static/src/assets/dataset/models/garden/kalvarienberg.glb',
            scale: 1,
            posX: 0,
            posY: 0,
            posZ: 100,
          },
          {
            path: '../static/src/assets/dataset/models/bible/holy_bible.glb',
            scale: 1,
            posX: 0,
            posY: 0,
            posZ: 100,
          }
      ];
      new PageTransition();
      //Model 1
      var opt1 = {
          container: canvasArr[0]
      }
      //new ModelLoader1(opt1, mdSettings);
      }
      //Model 2
      /*var opt2 = {
          container: canvasArr[1]
      }
      new ModelLoader1(opt2, mdSettings[1]);
      //Model 3
      var opt3 = {
          container: canvasArr[2]
      }
      new ModelLoader1(opt3, mdSettings[2]);
      //Model 4
      var opt4 = {
          container: canvasArr[3]
      }
      new ModelLoader1(opt4, mdSettings[3]);*/

    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();



