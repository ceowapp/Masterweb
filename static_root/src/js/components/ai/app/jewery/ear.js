
/********************************************************************
// Section 1: Initialize, set attributes and load models
********************************************************************/




const imageContainers = document.getElementsByClassName("detectOnClick");
const uploadFile = document.getElementById("uploadFile") as HTMLInputElement;
const imageUpload = document.getElementById("imageUpload") as HTMLImageElement;

// Handle the upload file event
uploadFile.addEventListener("change", uploadedImage, false);

function uploadedImage(event) {
  const reader = new FileReader();
  reader.onload = function () {
    const src = reader.result;
    imageUpload.src = src;
    imageUpload.style.display = "block";
    const canvas = imageUpload.parentElement.getElementsByClassName(
      "canvas-segmentation"
    )[0];
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const clickPoint = imageUpload.parentElement.getElementsByClassName(
      "click-point"
    )[0];
    clickPoint.style.display = "none";
  };
  reader.readAsDataURL(event.target.files[0]);
}

// Handle clicks on the demo images
for (let i = 0; i < imageContainers.length; i++) {
  imageContainers[i].children[0].addEventListener("click", handleClick);
}


















import {
GestureRecognizer,
  HandLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


const demosSection = document.getElementById("demos");
let gestureRecognizer;
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
let webcamAvail = true;
let imageSegmenter;
const videoHeight = "360px";
const videoWidth = "480px";
let labels = [];

  // Hide the drag text initially
  var dragText = document.querySelector('.drag-text');
  dragText.style.display = 'none';

  // Hide the extracted object initially
  var extractedObject1 = document.querySelector('#extractedObject1');
  extractedObject1.style.display = 'none';

  const img = document.querySelector("#imgRing");
  const canvas = document.querySelector("#canvas");
  let lastModel;
  let lastClassName;
  let warmedUp = false;




const video = document.getElementById("cameraVideo");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");
const capturedImageElement = document.getElementById("capturedImage");




// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU"
    },
    runningMode: runningMode

  });
  demosSection.classList.remove("invisible");
};
createGestureRecognizer();



// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode:runningMode, // Set runningMode to "VIDEO"
    numHands: 2
  });
  demosSection.classList.remove("invisible");
};
createHandLandmarker();



/********************************************************************
// Section 2: this part is to auto capture image from webcam
********************************************************************/


function captureHandsImage() {
webcamAvail = false;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  capturedImageElement.src = canvas.toDataURL("image/png");

}


// Disable the webcam stream.
function disableCam() {
webcamAvail = false;
 const stream = video.srcObject;
  if (!stream) {
    return; // No stream to stop
  }

  const tracks = stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });

  video.srcObject = null;
}


function toggleCamera() {
  const enableWebcamButton = document.getElementById("captureHandleButton");

  if (webcamAvail) {
    // Switching to image view
    enableWebcamButton.innerText = "ENABLE CAMERA";
    disableCam(); // Stop the webcam stream
  } else {
    // Switching to camera view
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    enableCam(); // Start the webcam stream
  }
}


// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("captureHandleButton");
  enableWebcamButton.addEventListener("click", toggleCamera);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}


// Enable the live webcam view and start detection.
function enableCam(event) {
webcamAvail = true;
  if (!gestureRecognizer) {
    alert("Please wait for gestureRecognizer to load");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  // getUsermedia parameters.
  const constraints = {
    video: true,
  };

// Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}



let lastVideoTime = -1;
let results = undefined;

async function predictWebcam() {
  const webcamElement = document.getElementById("cameraVideo");
  
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
  }
  
  let nowInMs = Date.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    results = gestureRecognizer.recognizeForVideo(video, nowInMs);
  }
  
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  canvasElement.style.height = videoHeight;
  webcamElement.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  webcamElement.style.width = videoWidth;
  
  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5
      });
      drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
    }
  }
  canvasCtx.restore();
  
  if (results.gestures.length > 0) {
    gestureOutput.style.display = "block";
    gestureOutput.style.width = videoWidth;
    const categoryName = results.gestures[0][0].categoryName;
    const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);
    gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %`;
  } else {
    gestureOutput.style.display = "none";
  }
  

setTimeout(() => {
const detectedGesture = results.gestures.length > 0 ? results.gestures[0][0] : null;
  const handLandmarks = results.landmarks && results.landmarks.length > 0 ? results.landmarks[0] : null;
  if (
    (detectedGesture &&
      (detectedGesture.categoryName === "Closed_Fist" || detectedGesture.categoryName === "Open_Palm") &&
      detectedGesture.score > 0.7) ||
    (handLandmarks && handLandmarks[5] && handLandmarks[9] && handLandmarks[13] && handLandmarks[17])
  ) {
    console.log("Detected Gesture:", detectedGesture);
    console.log("Detected Gesture:", handLandmarks);

    captureHandsImage();
    switchView();  
   webcamAvail = false;
    return; // Stop further execution

  }  
}, 10000); // Delay execution of the entire if statement logic by 5 seconds

// Continue gesture detection
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}



function switchView() {

  const webcamElement = document.getElementById("cameraVideo");
  const canvasElement = document.getElementById("output_canvas");
  const capturedImageElement = document.getElementById("capturedImage");

  // Toggle between webcam view and captured image view
  webcamElement.style.display =
    webcamElement.style.display === "block" ? "none" : "block";
  capturedImageElement.style.display =
    capturedImageElement.style.display === "block" ? "none" : "block";

  if (webcamElement.style.display === "block") {
    // Show hand landmarks in webcam view
    canvasElement.style.display = "block";
  } else {
    // Hide hand landmarks in captured image view
    canvasElement.style.display = "none";
  }
}


/********************************************************************
// Section 1: Image segmentation, auto placement
********************************************************************/

function loadCategory2DImages() {
  var category = $("#category").val();
  var category2D = $("#category2D").val();

  var images = category2DImages[category.toLowerCase()];
  if (images && images[category2D.toLowerCase()]) {
    var imageURLs = Array.isArray(images[category2D.toLowerCase()]) ? images[category2D.toLowerCase()] : [images[category2D.toLowerCase()]];
    var carouselItems = document.querySelectorAll('#carousel .item');

    // Perform image segmentation on the first image in the image list
    if (carouselItems.length > 0) {
      var image = carouselItems[0].querySelector('.segmentOnClick img');
      var canvas = carouselItems[0].querySelector('.segmentOnClick canvas');
      var p = carouselItems[0].querySelector('.segmentOnClick .classification');

      // Load the image
      image.src = imageURLs[0];

      // Perform image segmentation and extract main object and background
      imageSegmentation(image, canvas, p);
    }
  } else {
    console.log('No images found for the specified category and category2D.');
  }
}

// Listen to change events on the category and category2D select elements
$(document).ready(function() {
  $("#category, #category2D").change(function() {
    loadCategory2DImages();
  });
});



// Call the loadCategory2DImages function initially to load the default images
loadCategory2DImages();


  
  setupButton(
    "tflite-custom",
    async () =>
      await tfTask.ImageSegmentation.CustomModel.TFLite.load({
        model:
          "https://tfhub.dev/sayakpaul/lite-model/mobilenetv2-coco/fp16/1?lite-format=tflite"
      })
  );

  async function setupButton(className, modelCreateFn, needWarmup) {
    document
      .querySelector(`.model.${className} .btn`)
      .classList.remove("disabled");
    const resultEle = document.querySelector(`.model.${className} .result`);
    document
      .querySelector(`.model.${className} .btn`)
      .addEventListener("click", async () => {
        let model;
        // Create the model when the user clicks on a button.
        if (lastClassName !== className) {
          // Clean up the previous model if it existed.
          if (lastModel) {
            lastModel.cleanUp();
          }
          // Create the new model and save it.
          resultEle.textContent = "Loading...";
          model = await modelCreateFn();
          lastModel = model;
          lastClassName = className;
        }
        // Reuse the model if the user clicks on the same button.
        else {
          model = lastModel;
        }

        // Warm up if needed.
        if (needWarmup && !warmedUp) {
          await model.predict(img);
          warmedUp = true;
        }

        // Run inference and update the result.
        const start = Date.now();
        const result = await model.predict(img);
        const latency = Date.now() - start;
        renderCanvas(result); // Render the segmentation result
        resultEle.textContent = `Latency: ${latency}ms`;
      });
 
  }

  function renderCanvas(result) {
    const ctx = canvas.getContext("2d");
    canvas.width = result.width;
    canvas.height = result.height;
    ctx.clearRect(0, 0, result.width, result.height);

    // Draw the original image onto the object canvas
    ctx.drawImage(img, 0, 0, result.width, result.height);

    // Get the pixel data from the object canvas
    const imageData = ctx.getImageData(0, 0, result.width, result.height);
    const data = imageData.data;

    // Create an object canvas and context
    const objectCanvas = document.createElement("canvas");
    objectCanvas.width = result.width;
    objectCanvas.height = result.height;
    const objectCtx = objectCanvas.getContext("2d");
    objectCtx.clearRect(0, 0, result.width, result.height);

    // Draw the original image onto the object canvas
    objectCtx.drawImage(img, 0, 0, result.width, result.height);

    // Get the pixel data from the object canvas
    const objectImageData = objectCtx.getImageData(0, 0, result.width, result.height);
    const objectData = objectImageData.data;

    // Loop through each pixel in the segmentation map
    for (let i = 0; i < result.segmentationMap.length; i += 4) {
      const isBackground = result.segmentationMap[i] === 0;
      const x = (i / 4) % result.width;
      const y = Math.floor(i / 4 / result.width);

      if (isBackground) {
        // Set the alpha channel to 0 for the background pixels
        data[i + 3] = 0;
        objectData[i + 3] = 0;
      } else {
        // Set the pixel color to pink for the foreground
        const dataIndex = y * result.width * 4 + x * 4;
        data[dataIndex] = 255; // Set red channel to 255
        data[dataIndex + 1] = 0; // Set green channel to 0
        data[dataIndex + 2] = 255; // Set blue channel to 255
        data[dataIndex + 3] = 255; // Set alpha channel to 255
      }
    }

    // Put the modified pixel data back to the object canvas
    ctx.putImageData(imageData, 0, 0);
    objectCtx.putImageData(objectImageData, 0, 0);

    // Set the extracted object as the source of both extractedObject and extractedObject1 images
    const extractedObjectImage = document.querySelector("#extractedObject");
    const extractedObjectImage1 = document.querySelector("#extractedObject1");
    const extractedObjectImage2 = document.querySelector("#extractedObject2");
    extractedObjectImage.src = canvas.toDataURL();
    extractedObjectImage1.src = objectCanvas.toDataURL();
   extractedObjectImage2.src = extractedObjectImage1.src 
  }
});



const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU"
    },
    runningMode: runningMode
  });
};

createGestureRecognizer();

ringPlaceButton.addEventListener("click", () => {
  predictImage();
});


let dropzones = [];
let imgRing1; // Declare imgRing1 as a global variable
let imgRing1Copy;
let dropzoneContainer; // Declare dropzoneContainer as a global variable
let imgRing;

async function predictImage() {
  // Ensure the gestureRecognizer is initialized
  if (!gestureRecognizer) {
    await createGestureRecognizer();
  }

  const imgHand = document.querySelector("#imgHand");
  const imgRing = document.querySelector("#extractedObject");

  const results = await gestureRecognizer.recognize(imgHand);
  const handLandmarks =
    results.landmarks && results.landmarks.length > 0 ? results.landmarks[0] : null;

  // Check if hand landmarks are available
  if (!handLandmarks) {
    console.log("Hand landmarks not found.");
    return; // Exit the function if landmarks are not available
  }

  // Define the finger ratio between fingers (index finger : middle finger : ring finger : pinky finger)
  const fingerRatio = [1, 1, 0.9, 0.8, 0.7];

  // Extract the desired hand positions [tip, base] of each finger
  const extractedHandPositions = [
    [handLandmarks[3], handLandmarks[4]], // Thumb
    [handLandmarks[5], handLandmarks[6]], // Index finger
    [handLandmarks[9], handLandmarks[10]], // Middle finger
    [handLandmarks[13], handLandmarks[14]], // Ring finger
    [handLandmarks[17], handLandmarks[18]] // Pinky finger
  ];

  // Create a canvas for drawing the result
  const canvasOutput = document.createElement("canvas");
  canvasOutput.width = imgHand.width;
  canvasOutput.height = imgHand.height;
  const ctx = canvasOutput.getContext("2d");

  // Draw the hand image on the canvas
  ctx.drawImage(imgHand, 0, 0, canvasOutput.width, canvasOutput.height);

  // Calculate the finger diameter based on the distance between the tip and base of the index finger
  const indexFingerDistanceX = extractedHandPositions[1][1].x - extractedHandPositions[1][0].x;
  const indexFingerDistanceY = extractedHandPositions[1][1].y - extractedHandPositions[1][0].y;
  const indexFingerDistance = Math.sqrt(indexFingerDistanceX * indexFingerDistanceX + indexFingerDistanceY * indexFingerDistanceY);
  const fingerDiameter = indexFingerDistance * imgHand.width * 0.4;

  // Define the move-up distance ratios for each finger
  const moveUpDistanceRatio = [
    1.7, // Thumb
    0.6, // Index finger
    0.6, // Middle finger
    0.5, // Ring finger
    0.4 // Pinky finger
  ];

  // Clear the previous dropzones
  const dropzoneContainer = document.querySelector(".dropzone-container");
  dropzoneContainer.innerHTML = "";

  // Loop through each finger data and calculate the new position
  extractedHandPositions.forEach((fingerPositions, index) => {
    const tipPosition = fingerPositions[0];
    const basePosition = fingerPositions[1];

    const distanceX = tipPosition.x - basePosition.x;
    const distanceY = tipPosition.y - basePosition.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    // Calculate the new position by adding a fraction of the vector from base to tip
    const newPositionX = basePosition.x + moveUpDistanceRatio[index] * distanceX
    const newPositionY = basePosition.y + moveUpDistanceRatio[index] * distanceY;

    // Calculate the width and height of the ring based on the finger diameter
    const ringWidth = fingerDiameter * fingerRatio[index];
    const ringHeight = ringWidth * (imgRing.height / imgRing.width);

    // Calculate the top-left corner position of the ring
    const ringX = newPositionX * imgHand.width;
    const ringY = newPositionY * imgHand.height;

    // Calculate the angle of the finger axis with the x-axis and add 90 degrees to make it perpendicular
    const angle = Math.atan2(basePosition.y - tipPosition.y, basePosition.x - tipPosition.x) + Math.PI / 2;
 console.log("DropzoneX", ringX);
console.log("DropzoneY", ringY);
console.log("Dropzone Width", ringWidth);
console.log("Dropzone Height", ringHeight);
console.log("Dropzone Angle", angle);


    // Rotate and translate the canvas context around the ring position
    ctx.translate(ringX, ringY);
    ctx.rotate(angle);

    // Scale the canvas context to fit the ring width and height
    ctx.scale(ringWidth / imgRing.width, ringHeight / imgRing.height);

    // Draw the ring image on the canvas at the rotated, translated, and scaled position
    ctx.drawImage(imgRing, -imgRing.width / 2, -imgRing.height / 2);

    // Reset the canvas transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
// Create a drop zone using the extractedObject image
const dropzone = document.createElement("div");
dropzone.className = "dropzone";
dropzone.style.position = "absolute";

// Apply the same position, scale, and rotation as imgRing
dropzone.style.transformOrigin = "top left";
dropzone.style.transform = `rotate(${angle}rad)`;
dropzone.style.left = `${ringX}px`;
dropzone.style.top = `${ringY}px`;
dropzone.style.width = `${ringWidth}px`;
dropzone.style.height = `${ringHeight}px`;


// Set a custom data attribute to store the index of the drop zone
dropzone.dataset.index = index;

// Store the angle in a custom data attribute
  dropzone.dataset.angle = angle;

// Add the drop zone to the container
dropzoneContainer.appendChild(dropzone);

  });

  // Display the result by setting the source of the hand image to the canvas output
  imgHand.src = canvasOutput.toDataURL();
}


let dragCount = [];
var imgRing1Positions = {}; // To store the positions of imgRing1 for each drop zone index

// Enable draggables to be dropped into this
interact('.dropzone').dropzone({
  // Only accept elements matching this CSS selector
  accept: '#extractedObject1',
  // Require a 75% element overlap for a drop to be possible
  overlap: 0.85,

  // Listen for drop related events
  ondropactivate: function (event) {
    // Add active dropzone feedback
    event.target.classList.add('drop-active');
  },
ondragenter: function(event) {
  var draggableElement = event.relatedTarget;
  var dropzoneElement = event.target;
  var currentDropzoneIndex = dropzoneElement.dataset.index;

  // Get the stored angle from the dropzone's data attribute
  const dropzoneAngle = parseFloat(dropzoneElement.dataset.angle);

  const imgHand = document.querySelector("#imgHand");
  const imgRing1 = document.querySelector("#extractedObject2");
  const imgRing = document.querySelector("#extractedObject");

  // Feedback the possibility of a drop
  dropzoneElement.classList.add('drop-target');
  draggableElement.classList.add('can-drop');
  draggableElement.textContent = 'Dragged in';

  // Create a canvas for drawing the result
  const canvasOutput = document.createElement("canvas");
  canvasOutput.width = imgHand.width;
  canvasOutput.height = imgHand.height;
  const ctx = canvasOutput.getContext("2d");

 // Check if the dragCount for the current drop zone index exists
  if (!dragCount[currentDropzoneIndex]) {
    dragCount[currentDropzoneIndex] = 0; // Initialize dragCount for the current index if it doesn't exist
  }

  // Draw the hand image on the canvas
  ctx.drawImage(imgHand, 0, 0, canvasOutput.width, canvasOutput.height);

  // Get the position and size of the dropzoneElement
  const computedStyles = getComputedStyle(dropzoneElement);
  const dropzoneX = parseFloat(computedStyles.left);
  const dropzoneY = parseFloat(computedStyles.top);
  const dropzoneWidth = parseFloat(computedStyles.width);
  const dropzoneHeight = parseFloat(computedStyles.height);
  console.log("DropzoneX", dropzoneX);
  console.log("DropzoneY", dropzoneY);
  console.log("Dropzone Width", dropzoneWidth);
  console.log("Dropzone Height", dropzoneHeight);
  console.log("Dropzone Angle", dropzoneAngle);

  // Rotate and translate the canvas context around the dropzone position
  ctx.translate(dropzoneX, dropzoneY);

  // Convert the angle from radians to degrees
  ctx.rotate(dropzoneAngle);

  // Scale the canvas context to fit the ring width and height
  ctx.scale(dropzoneWidth / imgRing1.width, dropzoneHeight / imgRing1.height);

  console.log("Drag entered the dropzone", dragCount);

  // Increment the drag count for the current drop zone index
  dragCount[currentDropzoneIndex]++;

  console.log("Drag entered the dropzone",dragCount);

  // Toggle the display of imgRing1 based on the drag count
  if (dragCount[currentDropzoneIndex] % 2 === 0) {
    // Draw imgRing at the center of the transformed canvas
    ctx.drawImage(imgRing, -imgRing.width / 2, -imgRing.height / 2);
  } else {
    // Draw imgRing1 at the center of the transformed canvas
    ctx.drawImage(imgRing1, -imgRing1.width / 2, -imgRing1.height / 2);
  }

  // Update imgRing1 position for the current drop zone index
  imgRing1Positions[currentDropzoneIndex] = {
    x: dropzoneX,
    y: dropzoneY,
    width: dropzoneWidth,
    height: dropzoneHeight,
    angle: dropzoneAngle,
    dragCount: dragCount[currentDropzoneIndex]
  };

  console.log("Position Index", imgRing1Positions);

  // Reset the canvas transformation
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Set the source of imgHand to the canvas output
  imgHand.src = canvasOutput.toDataURL();

  // Print a message to the console
  console.log("Drag entered the dropzone");
  saveCombinedImage();
},
 ondragleave: function (event) {
    // Remove the drop feedback style
    event.target.classList.remove('drop-target');
    event.relatedTarget.classList.remove('can-drop');
    event.relatedTarget.textContent = 'Dragged out';
  },
ondrop: function(event) {
     event.relatedTarget.textContent = 'Dropped'

},
ondropdeactivate: function (event) {
    // Remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});




// Make the draggables draggable
interact('.drag-drop').draggable({
  inertia: true,
  modifiers: [
    interact.modifiers.restrictRect({
      restriction: 'parent',
      endOnly: true
    })
  ],
  autoScroll: true,
  listeners: {
    move: dragMoveListener,
    start: function (event) {
      // Hide the drag text when dragging starts
      var dragText = document.querySelector('.drag-text');
      if (dragText) {
        dragText.style.display = 'none';
      }
    }
  }
});

function dragMoveListener(event) {
  var target = event.target;
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // Get the boundaries of the imgHand image
  var dropzone = document.getElementById('imgHand');
  var dropzoneRect = dropzone.getBoundingClientRect();

  // Calculate the adjusted x coordinate based on the image position
  var adjustedX = x + dropzoneRect.left;

  // Restrict the drag within the boundaries of the imgHand image
  adjustedX = Math.max(dropzoneRect.left, Math.min(dropzoneRect.right - target.offsetWidth, adjustedX));
  y = Math.max(dropzoneRect.top, Math.min(dropzoneRect.bottom - target.offsetHeight, y));

  // Calculate the actual x coordinate based on the adjusted x
  x = adjustedX - dropzoneRect.left;

  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}



// Global variable to store the clone of the hand image
let handImageClone;

// Function to create the clone of the hand image
function createHandImageClone() {
  const imgHand = document.querySelector("#imgHand");
  
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

// Function to save the combined image
function saveCombinedImage() {
  const imgRing1 = document.querySelector("#extractedObject2");
  const imgRing = document.querySelector("#extractedObject");

  // Set the size of the combined canvas to match the hand image
  const combinedCanvas = document.createElement("canvas");
  combinedCanvas.width = handImageClone.width;
  combinedCanvas.height = handImageClone.height;
  const combinedCtx = combinedCanvas.getContext("2d");

  // Draw the hand image clone on the combined canvas
  combinedCtx.drawImage(handImageClone, 0, 0, combinedCanvas.width, combinedCanvas.height);

  // Draw imgRing1 or imgRing on the combined canvas for each recorded position
  for (const index in imgRing1Positions) {
    const position = imgRing1Positions[index];
    console.log("Position Index", position);

    if (position.dragCount % 2 !== 0) {
      // Rotate and translate the canvas context around the dropzone position
      combinedCtx.translate(position.x, position.y);

      // Convert the angle from radians to degrees
      combinedCtx.rotate(position.angle);

      // Scale the canvas context to fit the ring width and height
      combinedCtx.scale(position.width / imgRing1.width, position.height / imgRing1.height);

      // Draw imgRing1 at the center of the transformed canvas
      combinedCtx.drawImage(imgRing1, -imgRing1.width / 2, -imgRing1.height / 2);
    }

    // Reset the canvas transformation
    combinedCtx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Generate a download link for the combined image
  const downloadLink = document.createElement("a");
  downloadLink.href = combinedCanvas.toDataURL();
  downloadLink.download = "combined_image.png";
  downloadLink.innerText = "Download Image";

  // Append the download link to the downloadButton element
  const downloadButton = document.querySelector("#downloadButton");
  downloadButton.innerHTML = "";
  downloadButton.appendChild(downloadLink);
}

// Call createHandImageClone function to create the initial clone
createHandImageClone();




// Attach event listeners after predictImage has completed
predictImage().then(function () {
// Show the extractedObject1 after predictImage finishes
  var extractedObject1 = document.querySelector('#extractedObject1');
  extractedObject1.style.display = 'block';

 // Show the drag text after predictImage finishes
  var dragText = document.querySelector('.drag-text');
  if (dragText) {
    dragText.style.display = 'block';
  }

});






  



