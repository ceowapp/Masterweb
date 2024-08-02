import {
  InteractiveSegmenter,
  FilesetResolver,
  MPMask
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let interactiveSegmenter;



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

/********************************************************************
 // Demo 1: Grab a bunch of images from the page and detection them
 // upon click.
 ********************************************************************/

 // Add event listener to the segmentationBtn
// Deactivate zoom when segmentation button is clicked
const segmentationBtn = document.getElementById("segmentation");

segmentationBtn.addEventListener('click', deactivateZoom);

// Add click event listeners to the elements
segmentationBtn.addEventListener('click', function() {
  const segmentOnClickElements = document.querySelectorAll('.segmentOnClick');

  segmentOnClickElements.forEach(element => {
    element.addEventListener('click', handleClick);
  });
});


  // Function to deactivate zoom
  function deactivateZoom() {
    isZoomed = false;
    if (zoomWindow) {
      zoomWindow.style.display = 'none';
    }
  }
  



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
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const width = mask.width;
  const height = mask.height;
  const maskData = mask.getAsFloat32Array();
  canvas.width = width;
  canvas.height = height;

  console.log("Start visualization");

  ctx.fillStyle = "#00000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(18, 181, 203, 0.7)";

  // Create a canvas and context for the object with mask color
  const objectCanvas = document.createElement("canvas");
  const objectCtx = objectCanvas.getContext("2d");
  objectCanvas.width = width;
  objectCanvas.height = height;
  objectCtx.fillStyle = "#00000000";
  objectCtx.fillRect(0, 0, width, height);
  objectCtx.fillStyle = "rgba(18, 181, 203, 0.7)";

  // Create a canvas and context for the object with original color
  const objectCanvas1 = document.createElement("canvas");
  const objectCtx1 = objectCanvas1.getContext("2d");
  objectCanvas1.width = width;
  objectCanvas1.height = height;
  objectCtx1.fillStyle = "#00000000";
  objectCtx1.fillRect(0, 0, width, height);

  maskData.map((category, index) => {
    if (Math.round(category * 255.0) === 0) {
      const x = (index + 1) % width;
      const y = Math.floor((index + 1 - x) / width);
      ctx.fillRect(x, y, 1, 1);
    } else {
      // For pixels that are part of the object
      const x = (index + 1) % width;
      const y = Math.floor((index + 1 - x) / width);

      // Draw the original image onto objectCtx1
      objectCtx1.drawImage(targetElement, x, y, 1, 1, x, y, 1, 1);
    }
  });

  // Store the extracted images
  localStorage.setItem('extractedImg1', objectCanvas.toDataURL());
  localStorage.setItem('extractedImg2', objectCanvas1.toDataURL());
}

