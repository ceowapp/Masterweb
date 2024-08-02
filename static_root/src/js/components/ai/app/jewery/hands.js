/********************************************************************
// Section 1: Initialize, set attributes and load models
********************************************************************/
import {
GestureRecognizer,
  HandLandmarker,
  InteractiveSegmenter,
  FilesetResolver,
  DrawingUtils,
  MPMask
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("captureHandleButton");
const enablePredictionButton = document.getElementById("capturePredictionButton");

let gestureRecognizer;
let gestureRecognizerImg;
let handLandmarker = undefined;
let runningMode = "IMAGE";
let webcamPredict = false;
let webcamAvail = false;
let auto_trigger = false;
let isDetected = false;
let isClicked = false;
let imageSegmenter;
let noHandDetectionTimeout;
const videoHeight = "360px";
const videoWidth = "480px";
let labels = [];
let handImageClone;
let handImageClone1;
let isActivate = true; // Track the zoomed state
let confirmResult;
let autoCaptureTimeout;

 
const video = document.getElementById("cameraVideo");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");
const capturedImageElement = document.getElementById("capturedImage");
const ringPlaceButton = document.querySelector("#ringPlace");
const downloadButton = document.querySelector('#downloadButton');
const autoCaptureBtn = document.querySelector('#autoCapture');
const loaderContainer= document.querySelector('.loader-container');

ringPlaceButton.style.display = 'none';
extractedObject1.style.display = 'none';
downloadButton.style.display = 'none';

enablePredictionButton.disabled = true;
autoCaptureBtn.disabled = true;


// This is to load images

const category2DSelect = document.getElementById("category2D");

// Declare the category2DImages
const category2DImages = {
  Sticker: ["../static/src/assets/components/aiJewery/ring1.jpg", "../static/src/assets/components/aiJewery/ring1.jpg", "../static/src/assets/components/aiJewery/ring1.jpg"],
  Patch: ["../static/src/assets/components/aiJewery/ring2.jpg", "../static/src/assets/components/aiJewery/ring2.jpg", "../static/src/assets/components/aiJewery/ring2.jpg"],
  Tattoo: ["../static/src/assets/components/aiJewery/ring3.jpg", "../static/src/assets/components/aiJewery/ring3.jpg", "../static/src/assets/components/aiJewery/ring3.jpg"],
  Decal: ["../static/src/assets/components/aiJewery/ring4.jpg", "../static/src/assets/components/aiJewery/ring4.jpg", "../static/src/assets/components/aiJewery/ring4.jpg"],
};

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

// addDefault()--add default setup 
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



// Before we can use GestureRecognizer class we must wait for it to finish
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
    runningMode: "VIDEO"

  });
   gestureRecognizerImg = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU"
    },
    runningMode: "IMAGE"

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

// Disable/enable hand detection
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
    if (!gestureRecognizer) {
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
    ringPlaceButton.style.display = 'none';
    extractedObject1.style.display = 'none';
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


// Toggle on/off camera
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



// Live stream hand detection 

let lastVideoTime = -1;
let results = undefined;

async function predictWebcam() {
  const webcamElement = document.getElementById("cameraVideo");

  // Now let's start detecting the stream.
  await gestureRecognizer;

  const processFrame = async () => {
    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      results = await gestureRecognizer.recognizeForVideo(video, nowInMs); // Wait for results
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

    // Continue gesture detection
    if (webcamPredict === true && webcamAvail === true) {
      window.requestAnimationFrame(processFrame);
    }
  };

// Disable/enable auto capture image on condition-based
autoCaptureBtn.addEventListener("click", () => {
  isClicked = true;
  clearTimeout(autoCaptureTimeout);
  if (isClicked === true) {
    if (auto_trigger === true) {
      loaderContainer.style.display = "block";
      auto_trigger = false;
      isDetected = false; // Reset the flag when capture is disabled
      setTimeout(() => {
        const detectedGesture = results.gestures.length > 0 ? results.gestures[0][0] : null;
        const handLandmarks = results.landmarks && results.landmarks.length > 0 ? results.landmarks[0] : null;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log("Detected Gesture:", detectedGesture);
        if (
          (detectedGesture &&
            (detectedGesture.categoryName === "Closed_Fist" || detectedGesture.categoryName === "Open_Palm") &&
            detectedGesture.score > 0.7) ||
          (handLandmarks && handLandmarks[5] && handLandmarks[9] && handLandmarks[13] && handLandmarks[17])
        ) {
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
          autoCaptureBtn.innerText = "ENABLE CAPTURE";
          return; // Stop further execution
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
      }, 5000); // Delay execution of the entire if statement logic by 5 seconds
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
  // Initial call to start gesture detection
  processFrame();
}



// Switch view after capture image
function switchView() {
  capturedImageElement.style.display =
    capturedImageElement.style.display === "block" ? "none" : "block";
 
 setTimeout(function() {
   ringPlaceButton.style.display = 'block';
   var extractedObject1 = document.querySelector('#extractedObject1');
   extractedObject1.style.display = 'none';
   var dragText = document.querySelector('.drag-text');
  if (dragText) {
    dragText.style.display = 'none';
}
  }, 2000);

// Remove previous handImageClone if it exists
    if (handImageClone) {
      handImageClone = null;
    }

 // Create the clone only if it doesn't exist
    createHandImageClone();
}


// Function to upload hand image
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

 setTimeout(function() {
      ringPlaceButton.style.display = 'block';
      var extractedObject1 = document.querySelector('#extractedObject1');
      extractedObject1.style.display = 'none';
     var dragText = document.querySelector('.drag-text');
     if (dragText) {
    dragText.style.display = 'none';}
    }, 2000);

  reader.readAsDataURL(event.target.files[0]);
}



// Function to create the clone of the hand image
function createHandImageClone() {

  const imgHand = document.querySelector("#capturedImage");
  
  // Create a new Image object
  handImageClone = new Image();
  handImageClone1 = new Image();

  // Set an onload event handler to create the clone after the original image has loaded
  handImageClone.onload = function() {
    // Set the size of the clone to match the original image
    handImageClone.width = imgHand.width;
    handImageClone.height = imgHand.height;
  };
    // Set an onload event handler to create the clone after the original image has loaded
  handImageClone1.onload = function() {
    // Set the size of the clone to match the original image
    handImageClone1.width = imgHand.width;
    handImageClone1.height = imgHand.height;
  };


  // Set the source of the clone to the source of the original image
  handImageClone.src = imgHand.src;
  handImageClone1.src = imgHand.src;
}


/********************************************************************
// Section 3: Image segmentation, auto placement
********************************************************************/

  const canvas = document.querySelector("#canvas");
  let lastModel;
  let lastClassName;
  let warmedUp = false;


  
  // Load the model and initialize it
  let model;


  function renderCanvas(result,img) {
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


async function loadModel(img) {
  model = await tfTask.ImageSegmentation.CustomModel.TFLite.load({
    model: "https://tfhub.dev/sayakpaul/lite-model/mobilenetv2-coco/fp16/1?lite-format=tflite"
  });
    
  // Start the inference and update the result
  const start = Date.now();
  const result = await model.predict(img);
  const latency = Date.now() - start;
  renderCanvas(result,img); // Render the segmentation result
}



function loadImageSegmentation() {
  var image = document.getElementById('slide-img-1');
  if (image !== null && image !== undefined) {
    // Perform image segmentation and extract the main object and background
    loadModel(image);
  } else {
    console.log("There is no image for processing");
  }
}

loadImageSegmentation();


// Place segmented objects onto hand
let dropzones = [];
let imgRing1; // Declare imgRing1 as a global variable
let imgRing1Copy;
let dropzoneContainer; // Declare dropzoneContainer as a global variable
let imgRing;

async function predictImage(imgHand) {
  // Ensure the gestureRecognizer is initialized
  if (!gestureRecognizerImg) {
    await createGestureRecognizer();
  }

  await gestureRecognizerImg;


  const imgRing = document.querySelector("#extractedObject");

  const results = await gestureRecognizerImg.recognize(imgHand);
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
  // Clear the previous content of the canvas
  ctx.clearRect(0, 0, canvasOutput.width, canvasOutput.height);

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
  var currentDropzoneIndex = parseFloat(dropzoneElement.dataset.index);

  // Get the stored angle from the dropzone's data attribute
  const dropzoneAngle = parseFloat(dropzoneElement.dataset.angle);

  const imgHand = document.querySelector("#capturedImage");
  const imgRing1 = document.querySelector("#extractedObject2");
  const imgRing = document.querySelector("#extractedObject");
  const scale = 1.2; // Adjust the scale factor as needed
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
  const dropzoneWidth = parseFloat(dropzoneElement.style.width);
  const dropzoneHeight = parseFloat(dropzoneElement.style.height);

  // Rotate and translate the canvas context around the dropzone position
  ctx.translate(dropzoneX, dropzoneY);

  // Convert the angle from radians to degrees
  ctx.rotate(dropzoneAngle);

  // Scale the canvas context to fit the ring width and height
  ctx.scale(scale*dropzoneWidth / imgRing1.width, scale*dropzoneHeight / imgRing1.height);

  console.log("Drag entered the dropzone", dragCount);

  // Increment the drag count for the current drop zone index
  dragCount[currentDropzoneIndex]++;

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


// Function to save the combined image
function dragMoveListener(event) {
  var target = event.target;
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // Get the boundaries of the capturedImage
  var dropzone = document.getElementById('capturedImage');
  var dropzoneRect = dropzone.getBoundingClientRect();

  // Calculate the adjusted x and y coordinates based on the image position
  var adjustedX = x + dropzoneRect.left;
  var adjustedY = y + dropzoneRect.top;

  // Restrict the drag within the boundaries of the capturedImage
  adjustedX = Math.max(dropzoneRect.left, Math.min(dropzoneRect.right - target.offsetWidth, adjustedX));
  adjustedY = Math.max(dropzoneRect.top, Math.min(dropzoneRect.bottom - target.offsetHeight, adjustedY));

  // Calculate the actual x and y coordinates based on the adjusted values
  x = adjustedX - dropzoneRect.left;
  y = adjustedY - dropzoneRect.top;

  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
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
   const scale = 1.2; // Adjust the scale factor as needed

    if (position.dragCount % 2 !== 0) {
      // Rotate and translate the canvas context around the dropzone position
      combinedCtx.translate(position.x, position.y);

      // Convert the angle from radians to degrees
      combinedCtx.rotate(position.angle);

      // Scale the canvas context to fit the ring width and height
      combinedCtx.scale(scale*position.width / imgRing1.width, scale*position.height / imgRing1.height);

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


// Function to handle ringPlaceButton event

ringPlaceButton.addEventListener("click", () => {
  const imgHand = document.querySelector("#capturedImage");
  predictImage(imgHand);
 ringPlaceButton.style.display = 'none';
setTimeout(function() {
      downloadButton.style.display = 'block';
 // Show the extractedObject1 after predictImage finishes
  var extractedObject1 = document.querySelector('#extractedObject1');
  extractedObject1.style.display = 'block';

 // Show the drag text after predictImage finishes
  var dragText = document.querySelector('.drag-text');
  if (dragText) {
    dragText.style.display = 'block';
  }
    }, 2000);

});



/********************************************************************
// Section 4: Interactive segmentation 
********************************************************************/

let interactiveSegmenter;
let isSegmentationEnabled = false;



// Before we can use InteractiveSegmenter class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createSegmenter = async () => {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  interactiveSegmenter = await InteractiveSegmenter.createFromOptions(
    filesetResolver,
    {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite`,
        delegate: "GPU"
      },
      outputCategoryMask: true,
      outputConfidenceMasks: false
    }
  );

};
createSegmenter();

 // Add event listener to the segmentationBtn
// Deactivate zoom when segmentation button is clicked
const segmentationBtn = document.getElementById("segmentation");


// Add click event listeners to the elements
segmentationBtn.addEventListener('click', function() {

   if (isActivate === true) {
      isActivate = false;
    } else{
      isActivate = true;
    }

  if (isSegmentationEnabled === true) {
      isSegmentationEnabled = false;
      placeManual.disabled = false;
      placeManual.innerText = "ENABLE PLACE";
      segmentationBtn.innerText = "ENABLE SEGMENTATION";
    } else{
      isSegmentationEnabled = true;
      placeManual.disabled = true;
      placeManual.innerText = "DISABLE PLACE";
      segmentationBtn.innerText = "DISABLE SEGMENTATION";
    }

    console.log("isActivate", isActivate);
    console.log("isSegmentationEnabled", isSegmentationEnabled);


  const segmentOnClickElements = document.querySelectorAll('.segmentOnClick');
  if (isSegmentationEnabled === true){
    segmentOnClickElements.forEach(element => {
    element.addEventListener('click', handleClick);
  });
  }
});



async function handleClick(event) {
  if (!interactiveSegmenter) {
    alert("InteractiveSegmenter still loading. Try again shortly.");
    return;
  }

  interactiveSegmenter.segment(
    event.target,
    {
      keypoint: {
        x: event.offsetX / event.target.width,
        y: event.offsetY / event.target.height
      }
    },
    (result) => {
      drawSegmentation(result.categoryMask, event.target.parentElement);
      drawClickPoint(event.target.parentElement, event);
    }
  );
 demosSection.classList.remove("invisible");
}


/**
 * Draw click point
 */
function drawClickPoint(targetElement, event) {
  const clickPoint = targetElement.getElementsByClassName("click-point")[0];
  clickPoint.style.top = `${event.offsetY - 8}px`;
  clickPoint.style.left = `${event.offsetX - 8}px`;
  clickPoint.style.display = "block";
}


/**
 * Draw segmentation and store
 */


function drawSegmentation(mask, targetElement) {
  const width = mask.width;
  const height = mask.height;
  const maskData = mask.getAsFloat32Array();

  const canvas_maskColor = targetElement.querySelector(".canvas-segmentation");
  canvas_maskColor.width = width;
  canvas_maskColor.height = height;
  const ctx_maskColor = canvas_maskColor.getContext("2d");
  ctx_maskColor.fillStyle = "#00000000";
  ctx_maskColor.fillRect(0, 0, width, height);
  ctx_maskColor.fillStyle = "rgba(18, 181, 203, 0.7)";


  const canvas_originalColor = document.createElement("canvas");
  canvas_originalColor.width = width;
  canvas_originalColor.height = height;
  const ctx_originalColor = canvas_originalColor.getContext("2d");
  ctx_originalColor.fillStyle = "#00000000";
  ctx_originalColor.fillRect(0, 0, width, height);
  ctx_originalColor.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent background


  maskData.map((category, index) => {
    if (Math.round(category * 255.0) === 0) {
      const x = (index % width);
      const y = Math.floor(index / width);
      ctx_maskColor.fillRect(x, y, 1, 1);
    }else{
     // Draw the original image onto objectCtx1
      ctx_originalColor.fillRect(x, y, 1, 1);
    }
  });

const extractedObjectImage = document.querySelector("#extractedObject");
const extractedObjectImage1 = document.querySelector("#extractedObject1");
const extractedObjectImage2 = document.querySelector("#extractedObject2");
    // Set src to no color and color segmented objects
  extractedObjectImage.src = canvas_maskColor.toDataURL();
  extractedObjectImage1.src = canvas_originalColor.toDataURL();
  extractedObjectImage2.src = canvas_originalColor.toDataURL();

}

//This is for adding image segmentation objects
const placeManual = document.getElementById('playManual');

placeManual.addEventListener("click", function () {
    capturedImageElement.src = handImageClone1.src;
    predictImage(capturedImageElement);

  console.log("isSegmentationEnabled", isSegmentationEnabled);
  setTimeout(function() {
 // Show the extractedObject1 after predictImage finishes
  extractedObject1.style.display = 'block';

 // Show the drag text after predictImage finishes
  var dragText = document.querySelector('.drag-text');
  if (dragText) {
    dragText.style.display = 'block';
  }
    }, 2000);

});





/********************************************************************
// Section 4: this part is for zoom function
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





