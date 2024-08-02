const vertex = `
  attribute vec4 position;
  void main() {
    gl_Position = vec4( position );
  }
`;

const fragment = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  
  
  //Taken from Book of Shaders
  //https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
  vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
               dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
  }

  // Gradient Noise by Inigo Quilez - iq/2013
  // https://www.shadertoy.com/view/XdXGW8
  float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      vec2 u = f*f*(3.0-2.0*f);

      return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                       dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                  mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                       dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    float waveOffset = 0.3;
    float waveCenter = 1.;
    float waveFocus = 0.25;
    float waveSpeed = 2.; //Lower faster.
    
    float wMin = waveCenter - waveFocus;
    float wMax = waveCenter + waveFocus;
    
    //Smoothly extend on the x axis without stretching the noise
    uv.x *= u_resolution.x/u_resolution.y;
    uv.x += 1787.74328; //random starting seed
    uv.y *= 2.;

    float rn = noise( vec2(uv.x, u_time / waveSpeed));
    float ry = uv.y - rn;
    float r = smoothstep(wMin, wMax, ry);
    
    float bn = noise( vec2(uv.x, u_time / waveSpeed - waveOffset));
    float by = uv.y - bn;
    float b = smoothstep(wMin, wMax, by);
    
    float gn = noise( vec2(uv.x, u_time / waveSpeed + waveOffset));
    float gy = uv.y - gn;
    float g = smoothstep(wMin, wMax, gy);
    
    //float a = (r + g + b) / 3.0;
    
    gl_FragColor = vec4(r, b, g, 1.0);
  }
`;

class Footer {
    constructor(options) {
        console.log("this is actually fired from footer")
        this.gl = options.container;
        this.w = this.gl.offsetWidth;
        this.h = this.gl.offsetHeight;
        this.programInfo = twgl.createProgramInfo(this.gl, [vertex, fragment]);
        this.arrays = {
          position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
        };
        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, this.arrays);
        this.mouseX = 0;
        this.mouseY = 0;
        this.bindEvents();
        this.animate();
    }

    settings() {
        let that = this;
        this.settings = {
            progress: 0,
        };
    }

    bindEvents() {
        document.getElementById("footer-wave-canvas").addEventListener('mousemove', this.onMouseMove.bind(this))
    }

  
    onMouseMove(event) {
        this.mouse.x = (event.clientX / this.w) * 2 - 1;
        this.mouse.y = -(event.clientY / this.h) * 2 + 1;
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
    render(time) {
    twgl.resizeCanvasToDisplaySize(this.gl.canvas, 0.5); 
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      const uniforms = {
        u_time: (time) * 0.002,
        u_resolution: [this.gl.canvas.width, this.gl.canvas.height],
        u_mouse: [this.mouseX, this.mouseY],
      };
      this.gl.useProgram(this.programInfo.program);
      twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
      twgl.setUniforms(this.programInfo, uniforms);
      twgl.drawBufferInfo(this.gl, this.bufferInfo);
      requestAnimationFrame(this.render.bind(this));
    }
    animate(){
        requestAnimationFrame(this.render.bind(this));
    }
}

//Load Footer
const FT = new Footer({
    container: document.getElementById("footer-wave-canvas").getContext("webgl")
});




