import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

const video = document.getElementById("cameraVideo");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const capturedImageElement = document.getElementById("capturedImage");
const downloadButton = document.querySelector('#downloadButton');
const autoCaptureBtn = document.querySelector('#autoCapture');
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");


const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("captureHandleButton");
const enablePredictionButton = document.getElementById("capturePredictionButton");
let poseLandmarker;
let poseLandmarkerIMG;
let handImageClone;
let runningMode = "IMAGE";
let webcamPredict = false;
let webcamAvail = false;
let auto_trigger = false;
const videoHeight = "360px";
const videoWidth = "480px";


const loaderContainer= document.querySelector('.loader-container');

downloadButton.style.display = 'none';

loaderContainer.style.display = "none";

enablePredictionButton.disabled = true;
autoCaptureBtn.disabled = true;


// This is to load images

const category2DSelect = document.getElementById("category2D");

// Declare the category2DImages
const category2DImages = {
      OptionA: ["../static/src/assets/components/aiJewery/ring1.jpg", "../static/src/assets/components/aiJewery/ring1.jpg", "../static/src/assets/components/aiJewery/ring1.jpg"],
      OptionB: ["../static/src/assets/components/aiJewery/ring5.jpg", "../static/src/assets/components/aiJewery/ring5.jpg", "../static/src/assets/components/aiJewery/ring5.jpg"],
      OptionC: ["../static/src/assets/components/aiJewery/ring5.jpg", "../static/src/assets/components/aiJewery/ring5.jpg", "../static/src/assets/components/aiJewery/ring5.jpg"],
      OptionD: ["../static/src/assets/components/aiJewery/ring5.jpg", "../static/src/assets/components/aiJewery/ring5.jpg", "../static/src/assets/components/aiJewery/ring5.jpg"],
}

function loadCategory2DImages(category2D) {
  var images = category2DImages[category2D];
  if (images) {
    var carouselItems = document.querySelectorAll("#carousel .item");
    for (var i = 0; i < carouselItems.length; i++) {
      var image = carouselItems[i].querySelector(".segmentOnClick img");
      var imageURL = images[i % images.length];
      console.log("Images", imageURL);

      // Set a fallback image URL in case the specified URL is invalid
      var fallbackImageURL = "../static/src/assets/components/aiJewery/shop.jpg";

      image.onerror = function () {
        this.src = fallbackImageURL; // Use fallback image if the image fails to load
        console.log("Image loaded:", this.src);
      };

      image.src = imageURL;
    }
  } else {
    console.log("No images found for the specified category2D.");
  }
}



function addDefault() {
  const defaultCategory = Object.keys(category2DImages)[0]; // Get the first key from category2DImages

  // Clear existing options
  category2DSelect.innerHTML = "";

  // Populate category2D options based on the keys in category2DImages
  for (const category2DKey in category2DImages) {
    const optionCategory2D = document.createElement("option");
    optionCategory2D.value = category2DKey;
    optionCategory2D.text = category2DKey;
    category2DSelect.appendChild(optionCategory2D);
  }

  // Initially load the first category (e.g., 'Sticker')
  loadCategory2DImages(defaultCategory);
}


addDefault();


category2DSelect.addEventListener("change", function () {
  const categorySelected = category2DSelect.value;
  loadCategory2DImages(categorySelected);
});



// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numPoses: 2
  });
   poseLandmarkerIMG = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: "IMAGE",
    numPoses: 2
  });
  
  demosSection.classList.remove("invisible");
};
createPoseLandmarker();
/********************************************************************
// Section 1: this part is to auto capture image from webcam
********************************************************************/

// Disable the webcam stream.
function disableCam() {
  webcamAvail = false;
  webcamPredict = false;

  const stream = video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(function (track) {
      track.stop();
    });
    video.srcObject = null; // Release the webcam stream
  }

  // Hide the video element
  video.style.display = 'none';

}

 enablePredictionButton.addEventListener("click", function(){
  if (webcamPredict === true) {
      webcamPredict = false;
      autoCaptureBtn.disabled = true;
      enablePredictionButton.innerText = "ENABLE PREDICTIONS";
    } else{
      webcamPredict = true;
      autoCaptureBtn.disabled = true;
      enablePredictionButton.innerText = "DISABLE PREDICTIONS";
    }

  // getUsermedia parameters.
  const constraints = {
    video: true,
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.style.height = videoHeight;
    video.style.width = videoWidth;
    video.addEventListener("loadeddata", predictWebcam);
  });

});


// Enable the live webcam view and start detection.
function enableCam(event) {
  auto_trigger = false;
    if (!poseLandmarker) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }

  webcamAvail = true;
    // Hide the video element
  video.style.display = 'block';
  capturedImageElement.style.display = "none";

  const constraints = {
    video: true,
  };


  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      // getUsermedia parameters.
    video.srcObject = stream;
    video.style.height = videoHeight;
    video.style.width = videoWidth;
    webcamPredict = false;
    auto_trigger = false;
    enablePredictionButton.innerText = "ENABLE PREDICTIONS";
    video.addEventListener("loadeddata", predictWebcam);
  });

}



function toggleCamera() {
  if (webcamAvail=== true) {
    // Switching to image view
      webcamAvail= false;
      enablePredictionButton.disabled = true;
      autoCaptureBtn.disabled = true;
      enableWebcamButton.innerText = "ENABLE CAMERA";
      disableCam(); // Stop the webcam stream
  } else {
    webcamAvail=true;
    enablePredictionButton.disabled = false;
    enableWebcamButton.innerText = "DISABLE CAMERA";
    enableCam(); // Start the webcam stream
  }
  console.log("webcamAvail", webcamAvail);
}


// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton.addEventListener("click", toggleCamera);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}



let lastVideoTime = -1;
let results = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

async function predictWebcam() {
    const webcamElement = document.getElementById("cameraVideo");
    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;

  // Now let's start detecting the stream.
    await poseLandmarker;


  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
      canvasCtx.save();
      // Define an array of colors
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // Iterate through the landmarks and draw them with different colors
    for (let i = 0; i < result.landmarks.length; i++) {
        // Iterate through the landmarks and draw them with different colors
        const landmark = result.landmarks[i];
        console.log("landmark",landmark);
        drawingUtils.drawLandmarks(landmark, {
            radius: function (data) {
                return DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1,{ color: "red"});
            },
        }); 

        canvasCtx.fillStyle = "green";
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: "green" }); // Set connector color to red
  }

   canvasCtx.restore();

  });

}
  // Call this function again to keep predicting when the browser is ready.
  if (webcamPredict === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}





function switchView() {
  capturedImageElement.style.display =
    capturedImageElement.style.display === "block" ? "none" : "block";

// Remove previous handImageClone if it exists
    if (handImageClone) {
      handImageClone = null;
    }

 // Create the clone only if it doesn't exist
    createHandImageClone();
}



const uploadFile = document.getElementById("uploadFile");

// Handle the upload file event
uploadFile.addEventListener("change", uploadedImage, false);

function uploadedImage(event) {
// Disable the webcam stream
  disableCam();
  const reader = new FileReader();
  reader.onload = function () {
    const src = reader.result;
    capturedImageElement.src = src;
    capturedImageElement.style.display = "block";
    console.log("image upload",capturedImageElement);
// Remove previous handImageClone if it exists
    if (handImageClone) {
      handImageClone = null;
    }
  createHandImageClone();
  };

  reader.readAsDataURL(event.target.files[0]);
}


// Function to create the clone of the hand image
function createHandImageClone() {
  const imgHand = document.querySelector("#capturedImage");
  
  // Create a new Image object
  handImageClone = new Image();

  // Set an onload event handler to create the clone after the original image has loaded
  handImageClone.onload = function() {
    // Set the size of the clone to match the original image
    handImageClone.width = imgHand.width;
    handImageClone.height = imgHand.height;
  };

  // Set the source of the clone to the source of the original image
  handImageClone.src = imgHand.src;
}



/********************************************************************
// Demo 1: Grab a bunch of images from the page and detection them
// upon click.
********************************************************************/

// In this demo, we have put all our clickable images in divs with the
// CSS class 'detectionOnClick'. Lets get all the elements that have
// this class.


capturedImageElement.addEventListener("click", handleClick);

async function handleClick(event) {
  if (!poseLandmarker) {
    console.log("Wait for poseLandmarker to load before clicking!");
    return;
  }

  await poseLandmarkerIMG;
  
  // Remove all landmarks drawed before
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  // We can call poseLandmarker.detect as many times as we like with
  // different image data each time. The result is returned in a callback.
  poseLandmarker.detect(event.target, (result) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style =
      "left: 0px;" +
      "top: 0px;" +
      "width: " +
      event.target.width +
      "px;" +
      "height: " +
      event.target.height +
      "px;";

    event.target.parentNode.appendChild(canvas);
    const canvasCtx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
          radius: function (data) { return DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1); }
      });
      
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
  });
}

// Function to save the combined image
function saveCombinedImage() {
  // Set the size of the combined canvas to match the hand image
  const combinedCanvas = document.createElement("canvas");
  combinedCanvas.width = handImageClone.width;
  combinedCanvas.height = handImageClone.height;
  const combinedCtx = combinedCanvas.getContext("2d");

  // Draw the hand image clone on the combined canvas
  combinedCtx.drawImage(handImageClone, 0, 0, combinedCanvas.width, combinedCanvas.height);
 

// Generate a download link for the combined image
const downloadLink = document.createElement("a");
downloadLink.href = combinedCanvas.toDataURL();
downloadLink.download = "combined_image.png";

// Create a span element for the text styling
const textSpan = document.createElement("span");
textSpan.style.fontWeight = "bold";
textSpan.style.textDecoration = "none";
textSpan.style.color = "white";
textSpan.textContent = "Download Image";

// Append the text span to the download link
downloadLink.appendChild(textSpan);

// Append the download link to the downloadButton element
const downloadButton = document.querySelector("#downloadButton");
downloadButton.innerHTML = "";
downloadButton.appendChild(downloadLink);

}


downloadButton.addEventListener("click", () => {
  saveCombinedImage();
 });

  




/********************************************************************
// Section 3: this part is to init zoom function
********************************************************************/

// Add event listeners for double click and double touch
const segmentOnClickElements = document.querySelectorAll('.segmentOnClick');
segmentOnClickElements.forEach(element => {
  element.addEventListener('dblclick', toggleZoom); // For double click
  element.addEventListener('touchstart', handleTouch); // For touch start
});

let isZoomed = false; // Track the zoomed state
let zoomWindow; // Define the zoom window variable
let offset = 100; // Set the offset from image boundaries
let dragOffsetX, dragOffsetY; // Variables to store the offset between the mouse and the zoom window
let isDragging = false; // Track the dragging state
let image;


// Function to toggle zoom on double click or double touch
function toggleZoom(event) {
  // Toggle the zoomed state
  isZoomed = !isZoomed;

  // Get the image and zoom window elements
  image = this.querySelector('img');
  zoomWindow = this.querySelector('.zoom-window'); // Assign the zoom window variable

  if (isZoomed) {
    // Show the zoom window
    zoomWindow.style.display = 'block';

    // Create lens
    const lens = document.createElement("DIV");
    lens.setAttribute("class", "img-zoom-lens");
    // Insert lens
    zoomWindow.appendChild(lens);

    let scale = 1.5; // Adjust the scale as desired (smaller value for smaller zoom)

    // Calculate the ratio between result DIV and lens
    const cx = image.offsetWidth / lens.offsetWidth/scale;
    const cy = image.offsetHeight / lens.offsetHeight/scale;

    // Set background properties for the zoom window
    zoomWindow.style.backgroundImage = "url('" + image.src + "')";
    zoomWindow.style.backgroundSize = (image.width * cx) + "px " + (image.height * cy) + "px";

    // Execute a function when someone moves the cursor over the image or the lens
    lens.addEventListener("mousemove", moveLens);
    image.addEventListener("mousemove", moveLens);
    // And also for touch screens
    lens.addEventListener("touchmove", moveLens);
    image.addEventListener("touchmove", moveLens);

    // Add event listener for mouse down on the lens
    lens.addEventListener('mousedown', startDrag);
    // Add event listener for touch start on the lens
    lens.addEventListener('touchstart', startDrag);
  } else {
    // Hide the zoom window
    zoomWindow.style.display = 'none';
  }
}


function moveLens(e) {
  // Prevent any other actions that may occur when moving over the image
  e.preventDefault();
 let offsetX = 20,
    offsetY = 10;

  // Get the cursor's x and y positions
  const pos = getCursorPos(e);

  // Calculate the position of the lens
  let x = pos.x - zoomWindow.offsetWidth / 2;
  let y = pos.y - zoomWindow.offsetHeight / 2;

  // Calculate the maximum top and left values for the zoom window with offset
  const maxTop = image.offsetHeight - zoomWindow.offsetHeight - offset;
  const maxLeft = image.offsetWidth - zoomWindow.offsetWidth - offset;

  // Apply the restrictions
  x = Math.max(offset, Math.min(maxLeft, x));
  y = Math.max(offset, Math.min(maxTop, y));

  // Set the position of the lens
  zoomWindow.style.backgroundPosition = `-${x - offset}px -${y - offset}px`;

  if (isDragging) {
    // Calculate the new position of the zoom window based on the drag offset
    const newWindowX = e.clientX - dragOffsetX;
    const newWindowY = e.clientY - dragOffsetY;

    // Calculate the position of the lens based on the zoom window position
 const lensX = (newWindowX - offset - image.offsetLeft + (zoomWindow.offsetWidth / 2)) * (image.offsetWidth / zoomWindow.offsetWidth) + offsetX;
const lensY = (newWindowY - offset - image.offsetTop + (zoomWindow.offsetHeight / 2)) * (image.offsetHeight / zoomWindow.offsetHeight) + offsetY;


    // Set the position of the zoom window and lens
    zoomWindow.style.left = newWindowX + 'px';
    zoomWindow.style.top = newWindowY + 'px';
    zoomWindow.style.backgroundPosition = `-${lensX}px -${lensY}px`;

    // Print the position of the lens and zoom window
    console.log('Lens position:', lensX, lensY);
    console.log('Zoom window position:', newWindowX, newWindowY);
  }
}


function getCursorPos(e) {
  let x = 0,
    y = 0;
  e = e || window.event;

  // Get the x and y positions of the image
  const { left, top  } = zoomWindow.getBoundingClientRect();

  // Calculate the cursor's x and y coordinates relative to the image
  x = e.pageX - left - window.pageXOffset;
  y = e.pageY - top - window.pageYOffset;

  return { x, y };
}

function handleTouch(event) {
  if (event.touches.length === 2) {
    // Store the initial touch positions
    initialMouseX = event.touches[0].clientX;
    initialMouseY = event.touches[0].clientY;
    initialZoomWindowX = parseInt(window.getComputedStyle(zoomWindow).left);
    initialZoomWindowY = parseInt(window.getComputedStyle(zoomWindow).top);
  }
}

// Add event listener for touch end
document.addEventListener('touchend', handleTouchEnd);

// Function to handle touchend event
function handleTouchEnd(event) {
  // Reset the initial touch positions
  initialMouseX = null;
  initialMouseY = null;
  initialZoomWindowX = null;
  initialZoomWindowY = null;
}

function startDrag(e) {
  isDragging = true;

  // Calculate the offset between the mouse and the zoom window
  dragOffsetX = e.clientX - zoomWindow.offsetLeft;
  dragOffsetY = e.clientY - zoomWindow.offsetTop;

  // Add event listeners for dragging
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
}

function handleDrag(e) {
  // Prevent any other actions that may occur during dragging
  e.preventDefault();

  // Calculate the new position of the zoom window based on the drag offset
  let newWindowX = e.clientX - dragOffsetX;
  let newWindowY = e.clientY - dragOffsetY;

  // Calculate the maximum top and left values for the zoom window with offset
  const maxTop = image.offsetHeight - zoomWindow.offsetHeight;
  const maxLeft = image.offsetWidth - zoomWindow.offsetWidth - offset;

  // Restrict the zoom window within the image boundaries
  newWindowX = Math.max(offset, Math.min(newWindowX, maxLeft));
  newWindowY = Math.max(offset, Math.min(newWindowY, maxTop));

  // Set the new position of the zoom window
  zoomWindow.style.left = `${newWindowX}px`;
  zoomWindow.style.top = `${newWindowY}px`;

  /// Get the cursor's x and y positions
  const { x, y } = getCursorPos(e);

  // Calculate the position of the lens based on the zoom window position
  const lensX = x - newWindowX - zoomWindow.offsetWidth / 2;
  const lensY = y - newWindowY - zoomWindow.offsetHeight / 2;

  // Set the position of the lens
  zoomWindow.style.backgroundPosition = `-${lensX}px -${lensY}px`
}


function stopDrag() {
  isDragging = false;

  // Remove event listeners for dragging
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
}


