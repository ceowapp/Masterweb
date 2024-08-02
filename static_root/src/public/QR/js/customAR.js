(function() {

// Define the dictionaries
const modelGltf = {
  model1: "../static/src/public/QR/models/duck/duck.glb",
  model2: "../static/src/public/QR/models/sunflower/sunflower.gltf",
  model3: "../static/src/public/QR/models/stereo/stereo.gltf",
  model4: "../static/src/public/QR/models/animated/animated.gltf"
};

const barcodeImg = {
  "barcode 0": "../static/src/public/QR/images/barcode/3x3/0.png",
  "barcode 1": "../static/src/public/QR/images/barcode/3x3/1.png",
  "barcode 2": "../static/src/public/QR/images/barcode/3x3/2.png",
  "barcode 3": "../static/src/public/QR/images/barcode/3x3/3.png",
  "barcode 4": "../static/src/public/QR/images/barcode/3x3/4.png",
  "barcode 5": "../static/src/public/QR/images/barcode/3x3/5.png",
  "barcode 6": "../static/src/public/QR/images/barcode/3x3/6.png",
  "barcode 7": "../static/src/public/QR/images/barcode/3x3/7.png",
  "barcode 8": "../static/src/public/QR/images/barcode/3x3/8.png",
  "barcode 9": "../static/src/public/QR/images/barcode/3x3/9.png",
  "barcode 10": "../static/src/public/QR/images/barcode/3x3/10.png",
  "barcode 11": "../static/src/public/QR/images/barcode/3x3/11.png",
  "barcode 12": "../static/src/public/QR/images/barcode/3x3/12.png",
  "barcode 13": "../static/src/public/QR/images/barcode/3x3/13.png",
  "barcode 14": "../static/src/public/QR/images/barcode/3x3/14.png",
  "barcode 15": "../static/src/public/QR/images/barcode/3x3/15.png",
  "barcode 16": "../static/src/public/QR/images/barcode/3x3/16.png",
  "barcode 17": "../static/src/public/QR/images/barcode/3x3/17.png",
  "barcode 18": "../static/src/public/QR/images/barcode/3x3/18.png",
  "barcode 19": "../static/src/public/QR/images/barcode/3x3/19.png",
  "barcode 20": "../static/src/public/QR/images/barcode/3x3/20.png",
  "barcode 21": "../static/src/public/QR/images/barcode/3x3/21.png",
  "barcode 22": "../static/src/public/QR/images/barcode/3x3/22.png",
  "barcode 23": "../static/src/public/QR/images/barcode/3x3/23.png",
  "barcode 24": "../static/src/public/QR/images/barcode/3x3/24.png",
  "barcode 25": "../static/src/public/QR/images/barcode/3x3/25.png",
  "barcode 26": "../static/src/public/QR/images/barcode/3x3/26.png",
  "barcode 27": "../static/src/public/QR/images/barcode/3x3/27.png",
  "barcode 28": "../static/src/public/QR/images/barcode/3x3/28.png",
  "barcode 29": "../static/src/public/QR/images/barcode/3x3/29.png",
  "barcode 30": "../static/src/public/QR/images/barcode/3x3/30.png",
  "barcode 31": "../static/src/public/QR/images/barcode/3x3/31.png",
  "barcode 32": "../static/src/public/QR/images/barcode/3x3/32.png",
  "barcode 33": "../static/src/public/QR/images/barcode/3x3/33.png",
  "barcode 34": "../static/src/public/QR/images/barcode/3x3/34.png",
  "barcode 35": "../static/src/public/QR/images/barcode/3x3/35.png",
  "barcode 36": "../static/src/public/QR/images/barcode/3x3/36.png",
  "barcode 37": "../static/src/public/QR/images/barcode/3x3/37.png",
  "barcode 38": "../static/src/public/QR/images/barcode/3x3/38.png",
  "barcode 39": "../static/src/public/QR/images/barcode/3x3/39.png",
  "barcode 40": "../static/src/public/QR/images/barcode/3x3/40.png",
  "barcode 41": "../static/src/public/QR/images/barcode/3x3/41.png",
  "barcode 42": "../static/src/public/QR/images/barcode/3x3/42.png",
  "barcode 43": "../static/src/public/QR/images/barcode/3x3/43.png",
  "barcode 44": "../static/src/public/QR/images/barcode/3x3/44.png",
  "barcode 45": "../static/src/public/QR/images/barcode/3x3/45.png",
  "barcode 46": "../static/src/public/QR/images/barcode/3x3/46.png",
  "barcode 47": "../static/src/public/QR/images/barcode/3x3/47.png",
  "barcode 48": "../static/src/public/QR/images/barcode/3x3/48.png",
  "barcode 49": "../static/src/public/QR/images/barcode/3x3/49.png",
  "barcode 50": "../static/src/public/QR/images/barcode/3x3/50.png",
  "barcode 51": "../static/src/public/QR/images/barcode/3x3/51.png",
  "barcode 52": "../static/src/public/QR/images/barcode/3x3/52.png",
  "barcode 53": "../static/src/public/QR/images/barcode/3x3/53.png",
  "barcode 54": "../static/src/public/QR/images/barcode/3x3/54.png",
  "barcode 55": "../static/src/public/QR/images/barcode/3x3/55.png",
  "barcode 56": "../static/src/public/QR/images/barcode/3x3/56.png",
  "barcode 57": "../static/src/public/QR/images/barcode/3x3/57.png",
  "barcode 58": "../static/src/public/QR/images/barcode/3x3/58.png",
  "barcode 59": "../static/src/public/QR/images/barcode/3x3/59.png",
  "barcode 60": "../static/src/public/QR/images/barcode/3x3/60.png",
  "barcode 61": "../static/src/public/QR/images/barcode/3x3/61.png",
  "barcode 62": "../static/src/public/QR/images/barcode/3x3/62.png",
  "barcode 63": "../static/src/public/QR/images/barcode/3x3/63.png"
};

const patternData = {
  pattern1: ["../static/src/public/QR/images/pattern/bolognajs.patt","../static/src/public/QR/images/pattern/bologna.png"],
  pattern2: ["../static/src/public/QR/images/pattern/bolognajs1.patt","../static/src/public/QR/images/pattern/bologna1.png"],  
  pattern3: ["../static/src/public/QR/images/pattern/bolognajs1.patt","../static/src/public/QR/images/pattern/bologna1.png"],  
};

// Define format objects
const format3D = {
    '.gltf': '.gltf',
    '.glb': '.glb'
};

const formatBarcode = {
    '.png': '.png',
    '.jpg': '.jpg'
};

const formatPattern = {
    '.ptt': '.ptt',
    '.jpg': '.jpg'
};

const s3 = new AWS.S3({
            accessKeyId: 'AKIAQREX4EOZZIZNVFH5',
            secretAccessKey: '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'
});

const bucketName = 'myuploaddataserver'; 

const hiroImage = '../static/src/public/QR/images/inner-hiro.png';

const modelViewer = document.querySelector("#preview-model");

let markerTypeSelected = null;
let markerSelect = null;
let markerSelectNum = null;
let modelSelect = null;
let markerSelectURL = null;
const markerDropdown = document.getElementById('markerDropdown');
const markerType = document.getElementById('markerType');
const markerPreview = document.getElementById('markerPreview');
 // Populate the dropdown with model options from the modelGltf dictionary
const modelDropdown = document.getElementById('modelDropdown'); // Get the modelDropdown element
var uploadModelBtn = document.getElementById("uploadModel");
var uploadMarkerBtn = document.getElementById("uploadMarker");
var downloadModelBtn = document.getElementById("downloadModel");
var downloadMarkerBtn = document.getElementById("downloadMarker");
var matchButton = document.getElementById('matchBtn');
var turnOffButton = document.getElementById('turnOffButton');
const uploadForm = document.getElementById('uploadForm');
const arSceneViewer = document.querySelector(".ar-scene-view");
const arSceneContainer = document.querySelector(".ar-scene-content");

//Add defaul setup

addDefault();


// Function to add the default AR scene
function addDefault() {

  markerPreview.src = hiroImage; // Set the source of markerPreview
  markerSelect = markerPreview.src; // Set the source of markerPreview
  markerSelectNum = parseInt(markerSelect.split('/').pop().split('.')[0]);
  const marker_option = document.createElement('option');
  const model_option = document.createElement('option');

  modelDropdown.innerHTML = ''; // Clear existing options

  markerDropdown.innerHTML = ''; // Clear existing options
  markerTypeSelected = 'default';
  //Add default option for marker
  marker_option.value = hiroImage;
  marker_option.text = 'Default';
  markerDropdown.appendChild(marker_option);

  //Add default option for model

 for (const [model_name, model_val] of Object.entries(modelGltf)) {
      model_option.value = model_val;
      model_option.text = model_name;
      modelDropdown.appendChild(model_option.cloneNode(true));
    }

  if (Object.keys(modelGltf).length > 0) {
   // Load the first barcode option immediately
      modelViewer.src = Object.values(modelGltf)[0]; // Load the first barcode image
      modelSelect = modelViewer.src;
      console.log("model URL TEST", modelSelect)
      localStorage.setItem("sharedValue", modelSelect);
    }
}


// Listen for the 'change' event on the markerDropdown element
modelDropdown.addEventListener('change', function() {
    modelSelect = modelDropdown.value;
    modelViewer.src = modelSelect;
    localStorage.setItem("sharedValue", modelSelect);
});


markerType.addEventListener('change', function () {
  markerDropdown.innerHTML = ''; // Clear existing options

  markerTypeSelected = markerType.value;
  const option = document.createElement('option');


  if (markerTypeSelected === 'default') {
    option.value = hiroImage; 
    option.text = 'default';
    markerDropdown.appendChild(option);
    markerPreview.src = option.value;
    markerSelect = markerPreview.src;
    markerSelectNum = parseInt(markerSelect.split('/').pop().split('.')[0]);
    uploadForm.style.display = 'none'; // Use '=' for assignment
    matchButton.disabled=false;
    uploadMarkerBtn.disabled = false;
  } else if (markerTypeSelected === 'barcode') {
    uploadForm.style.display = 'block'; // Use '=' for assignment
    for (const [barcode_name, barcode_val] of Object.entries(barcodeImg)) {
      option.value = barcode_val;
      option.text = barcode_name;
      markerDropdown.appendChild(option.cloneNode(true));
    }
    // Load the first barcode option immediately
    if (Object.keys(barcodeImg).length > 0) {
      markerPreview.src = Object.values(barcodeImg)[0]; // Load the first barcode image
      markerSelect = markerPreview.src;
      markerSelectNum = parseInt(markerSelect.split('/').pop().split('.')[0]);

    }
    matchButton.disabled=true;
    uploadMarkerBtn.disabled = false;
  } else if (markerTypeSelected === 'pattern') {
    uploadForm.style.display = 'none'; // Use '=' for assignment
    for (const [pattern_name, pattern_val] of Object.entries(patternData)) {
      option.value = pattern_val[1];
      option.text = pattern_name;
      markerDropdown.appendChild(option.cloneNode(true));
    }
    // Load the first pattern option immediately
    if (Object.keys(patternData).length > 0) {
      markerPreview.src = Object.values(patternData)[0][1]; // Load the first pattern image
      markerSelect = markerPreview.src;
      markerSelectNum = parseInt(markerSelect.split('/').pop().split('.')[0]);
      markerSelectURL = Object.values(patternData)[0][0];
      localStorage.setItem('patternValue', markerSelectURL);
    }
    matchButton.disabled=false;
    uploadMarkerBtn.disabled = false;
  }
});



markerDropdown.addEventListener('change', function() {
  markerSelect = markerDropdown.value;
  markerSelectKey = markerDropdown.selectedOptions[0].text; // Use selectedOptions to get the selected option text
  console.log("Selected option:", markerSelectKey);
  markerPreview.src = markerSelect;
  markerSelectNum = parseInt(markerSelect.split('/').pop().split('.')[0]);
  
  if (patternData.hasOwnProperty(markerSelectKey)) {
    markerSelectURL = patternData[markerSelectKey][0];
    console.log("markerSelectURL default", markerSelectURL);
    localStorage.setItem('patternValue', markerSelectURL);
  } else {
    console.log("Pattern data not found for selected option:", markerSelectKey);
  }
});



function downloadMK() {
  // Check if a model is selected
  if (markerSelect) {
    const link = document.createElement('a');
    link.href = markerSelect;

    // Extract the filename from the URL
    const filename = markerSelect.split('/').pop();
    link.download = filename; // Use the extracted filename for download

    // Simulate a click on the link to trigger the download
    link.click();
  } else {
    console.error('No marker selected.');
  }
}




function downloadMD() {
  // Check if a model is selected
  if (modelSelect) {
    const link = document.createElement('a');
    link.href = modelSelect;

    // Extract the filename from the URL
    const filename = modelSelect.split('/').pop();
    link.download = filename; // Use the extracted filename for download

    // Simulate a click on the link to trigger the download
    link.click();
  } else {
    console.error('No model selected.');
  }
}




// Attach event to the download button
downloadModelBtn.addEventListener('click', function() {
  downloadMD(); // Simulate a click on the input element
});

// Attach event to the download button
downloadMarkerBtn.addEventListener('click', function() {
  downloadMK(); // Simulate a click on the input element
});



// Set session timeout for file deletion after 2 hours
let lastInteractionTime = Date.now();

document.addEventListener('click', () => {
    lastInteractionTime = Date.now();
});

document.addEventListener('keypress', () => {
    lastInteractionTime = Date.now();
});

function checkInactivityAndDelete() {
    const currentTime = Date.now();
    const inactivityDuration = currentTime - lastInteractionTime;

    if (inactivityDuration >= 4 * 60 * 60 * 1000) { // 2 hours
        // Delete files within the 'uploads' folder
        s3.listObjects({ Bucket: bucketName, Prefix: 'uploads/' }, (err, data) => {
            if (!err) {
                const filesToDelete = data.Contents.map(file => ({ Key: file.Key }));
                if (filesToDelete.length > 0) {
                    s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: filesToDelete } }, (err, data) => {
                        if (err) {
                            console.error('Error deleting files:', err);
                        } else {
                            console.log('Files deleted:', data.Deleted);
                            location.reload(); // Reload the page after deleting files
                        }
                    });
                }
            }
        });
    }
}





// Create an input element for file upload
const inputModel = document.createElement('input');
inputModel.type = 'file';
inputModel.multiple = true; // Allow multiple file selection

function uploadMD() {
    const files = inputModel.files;
    // Set inputModel.accept based on format3D
    inputModel.accept = "'" + Object.keys(format3D).join(',') + "'";
    const modal = document.getElementById('myModal');
    const span = document.getElementsByClassName('close')[0];

    // Get the <span> element that closes the modal
    span.onclick = function() {
        modal.style.display = 'none';
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    if (files && files.length > 0) {
        for (const file of files) {
            const modelName = file.name.replace(/\.[^/.]+$/, ''); // Extract model name without extension
            const modelKey = `uploads/${file.name}`; // Set the desired key in your bucket

            // Check if the file already exists in the bucket
            s3.headObject({ Bucket: bucketName, Key: modelKey }, (err, data) => {
                if (!err) {
                    const useResponse = confirm(`A model named "${file.name}" already exists. Do you want to replace it?`);
                    if (useResponse) {
                        const uploadParams = {
                            Bucket: bucketName,
                            Key: modelKey,
                            Body: file
                        };

                        s3.upload(uploadParams, (err, data) => {
                            if (err) {
                                console.error('Error uploading model:', err);
                            } else {
                                const modelPath = data.Location; // S3 URL of the uploaded model
                                // Append the newly uploaded model to the model list
                                modelGltf[modelName] = modelPath;
                                updateModelDropdown(modelName);
                                updateModelViewer();

                            }
                        });
                    }
                } else {
                    const uploadParams = {
                        Bucket: bucketName,
                        Key: modelKey,
                        Body: file
                    };

                    s3.upload(uploadParams, (err, data) => {
                        if (err) {
                            console.error('Error uploading model:', err);
                        } else {
                            const modelPath = data.Location; // S3 URL of the uploaded model
                            // Append the newly uploaded model to the model list
                            modelGltf[modelName] = modelPath;
                            updateModelDropdown(modelName);
                            updateModelViewer();
                        }
                    });
                }
            });
        }
    }
}



// Attach change event to the input element
inputModel.addEventListener('change', uploadMD);

// Function to update the view
function updateModelDropdown(modelUploadName) {
  // Update the model dropdown options
    const option = document.createElement('option');
    option.value = modelUploadName;
    option.textContent = modelUploadName;
    modelDropdown.appendChild(option);
}

// Function to update the view
function updateModelViewer() {
  // Get the keys (model names) from the modelGltf object
  const modelNames = Object.keys(modelGltf); 
  // Update the selected model in the model viewer
  const lastModelName = modelNames[modelNames.length - 1];
  const lastModelPath = modelGltf[lastModelName];
  console.log("last model", lastModelName);
  modelViewer.src = lastModelPath;
  modelDropdown.value = lastModelName;
  modelSelect = modelDropdown.value;
  modelSelectSrc = lastModelPath;
  localStorage.setItem("sharedValue", lastModelPath);
}


// Attach event to the upload button
uploadModelBtn.addEventListener('click', function() {
  inputModel.click(); // Simulate a click on the input element
});


const inputMarker = document.createElement('input');
inputMarker.type = 'file';
inputMarker.multiple = true; // Allow multiple file selection


function uploadMKDefault() {
  alert('There is nothing to load.');
  uploadMarkerBtn.disabled = true;
}


// Function to handle barcode marker upload and appending
function uploadMKBarcode() {
    const files = inputMarker.files;
    const modal = document.getElementById('myModal');
    const span = document.getElementsByClassName('close')[0];
    console.log("marker", markerType);

    // Get the <span> element that closes the modal
    span.onclick = function () {
        modal.style.display = 'none';
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    inputMarker.accept = "'" + Object.keys(formatBarcode).join(',') + "'";
    if (files && files.length > 0) {
        for (const file of files) {
            const barcodeName = file.name.replace(/\.[^/.]+$/, ''); // Extract model name without extension
            try {
                const modelKey = `uploads/${file.name}`; // Set the desired key in your bucket

                // Check if the file already exists in the bucket
                s3.headObject({ Bucket: bucketName, Key: modelKey }, (err, data) => {
                    if (!err) {
                        const useResponse = confirm(`A model named "${file.name}" already exists. Do you want to replace it?`);
                        if (useResponse) {
                            const uploadParams = {
                                Bucket: bucketName,
                                Key: modelKey,
                                Body: file
                            };

                            s3.upload(uploadParams, (err, data) => {
                                if (err) {
                                    console.error('Error uploading model:', err);
                                } else {
                                    const barcodePath = data.Location; // S3 URL of the uploaded model
                                    barcodeImg[barcodeName] = barcodePath;
                                    updateMarkerDropdown(barcodeName);
                                    updateMarkerViewer(barcodeImg);
                                }
                            });
                        }
                    } else {
                        const uploadParams = {
                            Bucket: bucketName,
                            Key: modelKey,
                            Body: file
                        };

                        s3.upload(uploadParams, (err, data) => {
                            if (err) {
                                console.error('Error uploading model:', err);
                            } else {
                                const barcodePath = data.Location; // S3 URL of the uploaded model
                                barcodeImg[barcodeName] = barcodePath;
                                updateMarkerDropdown(barcodeName);
                                updateMarkerViewer(barcodeImg);
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error uploading model:', error);
            }
        }
    }
}




// Function to handle marker upload and appending
function uploadMKPattern() {
    const files = inputMarker.files;
    const modal = document.getElementById('myModal');
    const span = document.getElementsByClassName('close')[0];
    console.log("marker", markerType);

    // Get the <span> element that closes the modal
    span.onclick = function () {
        modal.style.display = 'none';
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    inputMarker.accept = "'" + Object.keys(formatPattern).join(',') + "'";
    if (files && files.length === 2) {
        const patternFiles = {
            ptt: null,
            png: null
        };

        // Separate the files into .ptt and .png
        for (const file of files) {
            const fileExtension = file.name.split('.').pop();
            if (fileExtension === 'ptt') {
                patternFiles.ptt = file;
            } else if (fileExtension === 'png') {
                patternFiles.png = file;
            }
        }

        // Check if both .ptt and .png files are present
        if (patternFiles.ptt && patternFiles.png) {
            const patternName = patternFiles.ptt.name.replace(/\.[^/.]+$/, ''); // Extract model name without extension
            const patternData = [
                [patternFiles.ptt, patternFiles.png]
            ];

            try {
                const modelKey = `uploads/${patternFiles.ptt.name}`; // Set the desired key in your bucket

                // Check if the file already exists in the bucket
                s3.headObject({ Bucket: bucketName, Key: modelKey }, (err, data) => {
                    if (!err) {
                        const useResponse = confirm(`A model named "${patternFiles.ptt.name}" already exists. Do you want to replace it?`);
                        if (useResponse) {
                            const uploadParams = {
                                Bucket: bucketName,
                                Key: modelKey,
                                Body: patternFiles.ptt
                            };

                            s3.upload(uploadParams, (err, data) => {
                                if (err) {
                                    console.error('Error uploading model:', err);
                                } else {
                                    const patternImgPath = data.Location; // S3 URL of the uploaded model
                                    patternData[0][1] = patternImgPath;
                                    updateMarkerDropdown(patternName);
                                    updateMarkerViewer(patternData);
                                }
                            });
                        }
                    } else {
                        const uploadParams = {
                            Bucket: bucketName,
                            Key: modelKey,
                            Body: patternFiles.ptt
                        };

                        s3.upload(uploadParams, (err, data) => {
                            if (err) {
                                console.error('Error uploading model:', err);
                            } else {
                                const patternImgPath = data.Location; // S3 URL of the uploaded model
                                patternData[0][1] = patternImgPath;
                                updateMarkerDropdown(patternName);
                                updateMarkerViewer(patternData);
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error uploading model:', error);
            }
        } else {
            alert('Please upload one .ptt file and one .png file for the pattern marker type.');
        }
    } else {
        alert('Please upload exactly two files for the pattern marker type.');
    }
}


// Attach event to the upload button
uploadMarkerBtn.addEventListener('click', function () {
    if (!uploadMarkerBtn.disabled) {
    attachEventListeners();
    console.log("markerTypeSelected",markerTypeSelected);
  }

});


function attachEventListeners() {
      if (markerTypeSelected === 'default') {
      uploadMKDefault();
    } else if (markerTypeSelected === 'barcode') {
      // Add a change event listener to handle file upload for barcode
      inputMarker.click();
      inputMarker.addEventListener('change', uploadMKBarcode);
    } else if (markerTypeSelected === 'pattern') {
      // Add a change event listener to handle file upload for pattern
      inputMarker.click();
      inputMarker.addEventListener('change', uploadMKPattern);
    }
}


// Function to update
function updateMarkerDropdown(markerUploadName) {
  // Update the model dropdown options
  const option = document.createElement('option');
  option.value = markerUploadName;
  option.textContent = markerUploadName;
  markerDropdown.appendChild(option);
}


// Function to update
function updateMarkerViewer(markerList) {
  // Get the keys (marker names) from the markerList object
  const markerUploadNames = Object.keys(markerList);       
  // Update the selected marker in the marker viewer
  const lastMarkerName = markerUploadNames[markerUploadNames.length - 1];
  const lastMarkerPath = markerList[lastMarkerName];
  markerPreview.src = lastMarkerPath;
  console.log(lastMarkerPath, "lastMarkerPath");
  markerDropdown.value = lastMarkerName;
  markerSelect = markerDropdown.value;
  markerSelectNum = parseInt(markerSelect.split('/').pop().split('.')[0]);
}





setTimeout(checkInactivityAndDelete, 15 * 60 * 1000); // Check every 15 minutes

let sceneAdded = false;
let arScene = null;

function loadARScene(htmlFile) {
  if (!sceneAdded) {
    arScene = document.createElement("iframe");
    arScene.setAttribute("src", htmlFile);
    arScene.setAttribute("width", "500");
    arScene.setAttribute("height", "500");
    arScene.style.border = "2px solid #3498db"; // Add your desired styles here
    arSceneContainer.appendChild(arScene);
    arSceneViewer.style.display = 'flex';
    arSceneContainer.style.display = 'flex';
    turnOffButton.style.display = 'block';
    sceneAdded = true;
  }
}

function formSubmit(event) {
  var baseUrl = window.location.origin + window.location.pathname;
  var formUrl = baseUrl + "?page=CustomAR";

  var request = new XMLHttpRequest();
  request.open('POST', formUrl, true);
  request.onload = function() {
    // Parse and use the server response
    console.log(request.responseText);
  };

  request.onerror = function() {
    // Handle request error
  };

  // Create FormData from form that triggered the event
  var formData = new FormData(event.target);

  // Send the FormData as the payload
  request.send(formData);
  event.preventDefault();
}

// Prevent the form from redirecting to another URL
uploadForm.addEventListener("submit", function(event) {
  formSubmit(event);
  const barcodeInput = document.getElementById('barcodeVal');
  const barcodeValue = barcodeInput.value.trim();
  console.log('Barcode value:', barcodeValue);
  console.log('Marker value:', markerSelectNum);
  if (barcodeValue === '') {
    alert('Please enter the barcode value.');
    matchButton.disabled = true;
    return;
  } else if (parseInt(barcodeInput.value) !== markerSelectNum) {
    alert('Please enter the correct value.\nThe input value must match the selected marker.');
    matchButton.disabled = true;
  } else {
    localStorage.setItem('barcodeValueStore', barcodeValue);
    console.log('Barcod value:', barcodeValue);
    matchButton.disabled = false;
  }
});

function openARView() {
  // Load the appropriate AR scene based on markerTypeSelected
  if (markerTypeSelected === 'default'){
      loadARScene('./QR/components/default.html');
      console.log("default.html loaded");
  } else if (markerTypeSelected === 'barcode') {
      loadARScene('./QR/components/barcode.html');
      console.log("barcode.html loaded");
  } else if (markerTypeSelected === 'pattern') {
      loadARScene('./QR/components/pattern.html');
  }
}

matchButton.addEventListener('click', function() {
  if (!matchButton.disabled) {
    openARView();
  }
});


function removeScene() {
  if (sceneAdded && arScene !== null) {
    arScene.remove();
    arScene = null;
    sceneAdded = false;
  }
}



turnOffButton.addEventListener('click', function() {
  removeScene();
  arSceneContainer.style.display = 'none';
  arSceneViewer.style.display = 'none';
  turnOffButton.style.display = 'none';
});


})();

