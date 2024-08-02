var img1 = "../static/src/assets/global/textures/earth_texture.jpg";
const vertexGlobe = `
    attribute vec4 aVertex;
    attribute vec2 aTexCoord;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix; 
    uniform mat4 uProjectionMatrix;
    uniform sampler2D uSampler;

    varying vec4 vColor;

    void main(){
        gl_Position = uProjectionMatrix*uViewMatrix*uModelMatrix*aVertex;

        vec4 color = vec4((aVertex.x+1.0)*.5,(aVertex.y+1.0)*.5,(aVertex.z+1.0)*.5,1.0);
        vec4 texColor =texture2D(uSampler, aTexCoord); 
        
        gl_PointSize = (1.0+(texColor.g+texColor.r)*2.0-gl_Position.z*1.5)*2.0;
        
        vColor = color*texColor;
    }
`;

const fragmentGlobe = `
    precision mediump float;
    varying vec4 vColor;
    void main(){
        gl_FragColor = vColor;
    }
`;

var gl;

var _program={};

var _uViewMatrix;
var _uProjectionMatrix;

var _camera = {
        r: 2.0,
        theta: 0.75,
        phi: 0.0
};

var _canvasRect;
var _ctrl = false;
var _mouseDown = false;
var _mousePos = {
        x: 0,
        y: 0
};

var _partNum = 44100;
var _angle=3.14;
var _initTime;


window.onload = function init() {
        var canvas = document.getElementById("animFooter");

        /*gl = webglUtils.setupWebGL(canvas);
        if (!gl) {
                alert("WebGL isn't available");
        }*/


        //gl.enable(gl.BLEND);
        //gl.blendFunc(gl.SRC_ALPHA , gl.ONE_MINUS_SRC_ALPHA);

        //  Load shaders and initialize attribute buffers
        _program.program = createProgramInfo(canvas, vertexGlobe, fragmentGlobe);
        gl.useProgram(_program.program);
        gl.clearColor(.0, .0, .0, 1.0);
        gl.enable(gl.DEPTH_TEST);
    
        //Store Attributes location and enable vertex Arrays
        _program.aVertex = gl.getAttribLocation(_program.program, "aVertex");
        gl.enableVertexAttribArray(_program.aVertex);
    
        _program.aTexCoord = gl.getAttribLocation(_program.program, "aTexCoord");
        gl.enableVertexAttribArray(_program.aTexCoord);
        
        _program.uModelMatrixLoc = gl.getUniformLocation(_program.program, "uModelMatrix");
        _program.uViewMatrixLoc = gl.getUniformLocation(_program.program, "uViewMatrix");
        _program.uProjectionMatrixLoc = gl.getUniformLocation(_program.program, "uProjectionMatrix");
    
        _program.samplerLoc = gl.getUniformLocation(_program.program, "uSampler");
    
        _uViewMatrix = lookAt(vec3(_camera.r * Math.cos(_camera.theta) * Math.cos(_camera.phi),
                        _camera.r * Math.sin(_camera.theta),
                        _camera.r * Math.cos(_camera.theta) * Math.sin(_camera.phi)),
                vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        gl.uniformMatrix4fv(_program.uViewMatrixLoc, false, flatten(_uViewMatrix));

        _uProjectionMatrix = perspective(75, canvas.width / canvas.height, .1, 100.0);
        gl.uniformMatrix4fv(_program.uProjectionMatrixLoc, false, flatten(_uProjectionMatrix));
    
        initBuffers();
        initTextures();
    
        //EVENTS LISTENERS
        window.onresize = function(event) {
                setCanvasSize(document.getElementById("animFooter"));
        }
        setCanvasSize(canvas);
    
        /*canvas.addEventListener("touchstart", downHandler, false);
        canvas.addEventListener("touchmove", touchMoveHandler, false);
        window.addEventListener("touchend", upHandler, false);

        canvas.addEventListener("mousedown", downHandler, false);
        canvas.addEventListener("mousemove", moveHandler, false);
        window.addEventListener("mouseup", upHandler, false);

        window.addEventListener("keydown", keyDownHandler, false);
        window.addEventListener("keyup", keyUpHandler, false);
        window.addEventListener("mousewheel", mouseWheelHandler, false);
    
        document.getElementById("5k").addEventListener("click", buttonHandler, false);
        document.getElementById("50k").addEventListener("click", buttonHandler, false);
        document.getElementById("500k").addEventListener("click", buttonHandler, false);
    
        document.getElementById("5k").style.background="#ddd";
        document.getElementById("50k").style.background="#5cb85c";
        document.getElementById("500k").style.background="#ddd";*/
    
        //init start
        
        _initTime=new Date().getTime(); 
        render();
};

//EVENTS
function setCanvasSize(canvas) {
        var parent = document.querySelector(".pn-contact-anim")
        var canvasWidth = parent.clientWidth;
        var canvasHeight = parent.clientHeight;
        gl.viewport(0, 0, canvasWidth, canvasHeight);
        _uProjectionMatrix = perspective(75, canvasWidth / canvasHeight, .1, 100.0);
        gl.uniformMatrix4fv(_program.uProjectionMatrixLoc, false, flatten(_uProjectionMatrix));
}

function downHandler(event) {
        event.preventDefault();
        setCanvasSize(document.getElementById("animFooter"));
        _mouseDown = true;

        var touches = event.changedTouches;
        if (touches == undefined) {
                _mousePos.x = event.clientX - _canvasRect.left;
                _mousePos.y = event.clientY - _canvasRect.top;
        } else {
                _mousePos.x = touches[touches.length - 1].pageX - _canvasRect.left;
                _mousePos.y = touches[touches.length - 1].pageY - _canvasRect.top;
        }
}

/*function touchMoveHandler(event) {
        event.preventDefault();
        var touches = event.changedTouches;
        moveCamera(touches[touches.length - 1].pageX - _canvasRect.left, touches[touches.length - 1].pageY - _canvasRect.top);
}

function moveHandler(event) {
        event.preventDefault();

        moveCamera(event.clientX - _canvasRect.left, event.clientY - _canvasRect.top);
}

function moveCamera(newX, newY) {
        if (_mouseDown == true) {
                var moveX = newX - _mousePos.x;
                var moveY = newY - _mousePos.y;
                if (_ctrl == true) {
                        _camera.r += moveY * 0.01;
                        _camera.r = _camera.r < 0.1 ? 0.1 : _camera.r;
                } else {
                        _camera.phi = (_camera.phi + moveX * 0.01) % 6.28;
                        _camera.theta += moveY * 0.01;
                        _camera.theta = _camera.theta > 1.57 ? 1.57 : _camera.theta;
                        _camera.theta = _camera.theta < -1.57 ? -1.57 : _camera.theta;
                }
                updateCamera();

                _mousePos.x = newX;
                _mousePos.y = newY;
        }
}

function mouseWheelHandler(event){
    _camera.r-=event.wheelDelta*0.001;
    _camera.r = _camera.r<0.1?0.1:_camera.r;
    updateCamera();
}

function upHandler(event) {
        if (_mouseDown == true) {
                _mouseDown = false;
        }
}

function keyDownHandler(event) {
        if (event.keyCode == 17) {
                _ctrl = true;
        }
}

function keyUpHandler(event) {
        if (event.keyCode == 17) {
                _ctrl = false;
        }
}

function buttonHandler(event){
    switch(event.target.id){
        case "5k":
            _partNum = 4900;
        break;
        case "50k":
            _partNum = 44100;
        break;
        case "500k":
            _partNum = 396900;
        break;
    }
    /*document.getElementById("5k").style.background="#ddd";
    document.getElementById("50k").style.background="#ddd";
    document.getElementById("500k").style.background="#ddd";
    event.target.style.background="#5cb85c";
}*/

//FUNCTIONS

function initBuffers(){
    var vertex=[];
    var texCoord=[];
        
    var latMax = 630;
    var longMax = 630;
    var stepT = Math.PI/latMax;
    var stepP = 2*Math.PI/longMax;
    var ray = 0.5;
    
    var theta, sinTheta,cosTheta, phi, sinPhi, cosPhi,x,y,z;
    
    var stepA = 0;
    var stepB = 4900;
    var stepC = 44100;
    
    var okA, okB, step;
    
    for (var latNum = 0; latNum <= latMax; ++latNum) {
        theta = latNum * stepT;
        sinTheta = Math.sin(theta);
        cosTheta = Math.cos(theta);
    
        okB= latNum%3 == 0 ; 
        okA = latNum%9 == 0 ;
        
        for (var longNum = 0; longNum <= longMax; ++longNum) {
            phi = longNum * stepP;
            sinPhi = Math.sin(phi);
            cosPhi = Math.cos(phi);

            x = cosPhi * sinTheta;
            y = cosTheta;
            z = sinPhi * sinTheta;
            
            if(okB==true){
                if(longNum % 3 == 0){
                    if(okA==true){                       
                        if(longNum % 9 == 0){
                            step=stepA;
                            stepA++;
                        }else{
                            step=stepB;
                            stepB++;
                        }
                    }else{
                        step=stepB;
                        stepB++;
                    }
                }else{
                    step=stepC;
                    stepC++;
                }
            }else{
                step=stepC;
                stepC++;
            }
            
            vertex[step]=(vec3(x,y,z));
            texCoord[step]=(vec2(1-longNum/longMax,1-latNum/latMax));
            
        }
    }
    
    _program.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _program.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex), gl.STATIC_DRAW);
    gl.vertexAttribPointer(_program.aVertex, 3, gl.FLOAT, false, 0, 0);
    
    _program.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _program.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);
    gl.vertexAttribPointer(_program.aTexCoord, 2, gl.FLOAT, false, 0, 0);
}

//TEXTURES

function initTextures(){    
        var texture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture); //set the working textureObject
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //flip the Y axis, useful for image web standard
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //CLAMP_TO_EDGE
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //minification filter
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //magnification filter
    
        gl.uniform1i(_program.samplerLoc, 0);
        gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

function updateCamera() {
        _uViewMatrix = lookAt(vec3(_camera.r * Math.cos(_camera.theta) * Math.cos(_camera.phi),
                        _camera.r * Math.sin(_camera.theta),
                        _camera.r * Math.cos(_camera.theta) * Math.sin(_camera.phi)),
                vec3(0.0, 0.0, 0.0),
                vec3(0.0, 1.0, 0.0));
        gl.uniformMatrix4fv(_program.uViewMatrixLoc, false, flatten(_uViewMatrix));
        //render();
}

function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        var now = new Date().getTime();
        _angle = (_angle+(now-_initTime)*.0002)%6.28;
        //update uniforms
        gl.uniformMatrix4fv(_program.uModelMatrixLoc, false, flatten(rotateRad(_angle, 0, 1, 0)));
    
        gl.drawArrays(gl.POINTS, 0, _partNum);
    
        _initTime = now;
        requestAnimationFrame(render);
}
