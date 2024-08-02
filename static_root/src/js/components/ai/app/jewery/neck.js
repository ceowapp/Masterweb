import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

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
let faceLandmarker;
let faceLandmarkerIMG;
let handImageClone;
let runningMode = "IMAGE";
let webcamPredict = false;
let webcamAvail = false;
let auto_trigger = false;
let isDetected = false;
let isClicked = false;
const videoHeight = "360px";
const videoWidth = "480px";
let confirmResult;
let autoCaptureTimeout;



const loaderContainer= document.querySelector('.loader-container');

downloadButton.style.display = 'none';

loaderContainer.style.display = "none";

enablePredictionButton.disabled = true;
autoCaptureBtn.disabled = true;


// This is to load images

const category2DSelect = document.getElementById("category2D");

// Declare the category2DImages
const category2DImages = {
  Option1: ["../static/src/assets/components/aiJewery/ring.jpg", "../static/src/assets/components/aiJewery/ring.jpg", "../static/src/assets/components/aiJewery/ring.jpg"],
  Option2: ["../static/src/assets/components/aiJewery/ring1.jpg", "../static/src/assets/components/aiJewery/ring1.jpg", "../static/src/assets/components/aiJewery/ring1.jpg"],
  Option3: ["../static/src/assets/components/aiJewery/ring/tattoo.png"],
  Option4: ["../static/src/assets/components/aiJewery/ring/decal.png"],
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
      var fallbackImageURL = "./images/shop.jpg";

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
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode:"VIDEO",
    numFaces: 1
  });
  faceLandmarkerIMG = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode:"IMAGE",
    numFaces: 1
  });
  demosSection.classList.remove("invisible");
}
createFaceLandmarker();


/********************************************************************
// Section 1: this part is to auto capture image from webcam
********************************************************************/

// Disable the webcam stream.
function disableCam() {
  webcamAvail = false;
  webcamPredict = false;
  auto_trigger = false;

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
      auto_trigger = false;
      enablePredictionButton.innerText = "ENABLE PREDICTIONS";
    } else{
      webcamPredict = true;
      auto_trigger = true;
      autoCaptureBtn.disabled = false;
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
    if (!faceLandmarker) {
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
    enablePredictionButton.innerText = "ENABLE PREDICTIONS";
    webcamPredict = false;
    auto_trigger = false;
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
let meshShapes = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

async function predictWebcam() {
  const webcamElement = document.getElementById("cameraVideo");

  await faceLandmarker;

  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, nowInMs);
  }



  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasElement.style.height = videoHeight;
  webcamElement.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  webcamElement.style.width = videoWidth;

  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
  }
  meshShapes = results.faceBlendshapes;
  drawBlendShapes(videoBlendShapes, meshShapes);

  // Continue gesture detection
  if (webcamPredict === true && webcamAvail === true) {
    window.requestAnimationFrame(predictWebcam);
  }

// Auto capture hand image
// Auto capture hand image 
autoCaptureBtn.addEventListener("click",() => {
  isClicked = true;
  clearTimeout(autoCaptureTimeout);
  if (isClicked === true) {
    if (auto_trigger === true) {
    loaderContainer.style.display = "block";
    auto_trigger = false;
    isDetected = false; // Reset the flag when capture is disabled
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Define a threshold for smile confidence (e.g., 70%)
      const smileConfidenceThreshold = 0.7;
      // Loop through the mesh shapes to find smile-related blend shapes
      for (const shape of meshShapes[0].categories) {
        console.log("score", shape);
        // Check if the shape represents a smile on the left or right side
        if (shape.categoryName === "mouthSmileLeft" || shape.categoryName === "mouthSmileRight") {
          // Check if the confidence score of the smile is above the threshold
          if (shape.score.toFixed(4) * 100 > smileConfidenceThreshold) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            capturedImageElement.src = canvas.toDataURL("image/png");
            loaderContainer.style.display = "none";
            isDetected = true;
            webcamAvail = false;
            disableCam();
            switchView();
            console.log("capture image", capturedImageElement);
            enableWebcamButton.innerText = "ENABLE CAMERA";
            enablePredictionButton.disabled = true;
            autoCaptureBtn.disabled = true;
            auto_trigger = false;
            downloadButton.style.display = 'block';
            autoCaptureBtn.innerText = "ENABLE CAPTURE";
            return; // Stop further execution
          }
        }
      }
       // Start the timeout for no hand detection
        autoCaptureTimeout = setTimeout(() => {
          if (isDetected === false) {
            confirmResult = confirm("Auto capture has been inactive for over 15 seconds. Do you want to restart auto capture?");
            if (confirmResult) {
              // User confirmed, disable auto capture
              auto_trigger = false;
              autoCaptureBtn.innerText = "ENABLE CAPTURE";
              loaderContainer.style.display = "none";
              // Cancel the previous timeout if it exists
              if (autoCaptureTimeout) {
                clearTimeout(autoCaptureTimeout);
              }
            }
          }
        }, 15000); // 15 seconds timeout

    }, 5000); // Delay execution of the entire if statement logic by 10 seconds
  } else {
    auto_trigger = true;
      // Cancel the previous timeout if it exists
      if (autoCaptureTimeout) {
        clearTimeout(autoCaptureTimeout);
      }
      autoCaptureBtn.innerText = "DISABLE CAPTURE";
      loaderContainer.style.display = "none";
      return;
  }
}
});
}


// This is to draw the detection results onto the canvas
function drawBlendShapes(el, blendShapes) {
  if (!blendShapes.length) {
    return;
  }

  let htmlMaker = "<ul class='blend-shapes-list'>"; // Start a list
  for (let i = 0; i < blendShapes[0].categories.length; i++) {
    if (i % 3 === 0) {
      // Start a new row after every three elements
      htmlMaker += "<div class='blend-shapes-row'>";
    }

    const shape = blendShapes[0].categories[i];
    htmlMaker += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${shape.categoryName}</span>
        <span class="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">
          ${(+shape.score).toFixed(4)}
        </span>
      </li>
    `;

    if ((i + 1) % 3 === 0 || i === blendShapes[0].categories.length - 1) {
      // Close the row after every three elements or at the end
      htmlMaker += "</div>";
    }
  }

  // If there are remaining items (1 or 2), close the final row
  if (blendShapes[0].categories.length % 3 === 1 || blendShapes[0].categories.length % 3 === 2) {
    htmlMaker += "</div>";
  }

  htmlMaker += "</ul>"; // Close the list

  el.innerHTML = htmlMaker;
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


// When an image is clicked, let's detect it and display results!
async function handleClick(event) {
  if (!faceLandmarkerIMG) {
    console.log("Wait for faceLandmarker to load before clicking!");
    return;
  }

  await faceLandmarkerIMG;

  // Remove all landmarks drawed before
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  // We can call faceLandmarker.detect as many times as we like with
  // different image data each time. This returns a promise
  // which we wait to complete and then call a function to
  // print out the results of the prediction.
  const faceLandmarkerResult = faceLandmarkerIMG.detect(event.target);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  canvas.style.left = "0px";
  canvas.style.top = "100px";
  canvas.style.width = `${event.target.width}px`;
  canvas.style.height = `${event.target.height}px`;

  event.target.parentNode.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmarks of faceLandmarkerResult.faceLandmarks) {
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0"
    });
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: "#30FF30" }
    );
  }
  drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
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

    // Add event listener for mouse down on the zoom window
    zoomWindow.addEventListener('mousedown', startDrag);

    // Add event listener for touch start on the zoom window
    zoomWindow.addEventListener('touchstart', startDrag);
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





