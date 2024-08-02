/********************************************************************
// JavaScript code for sliding functionality/loading effect here
********************************************************************/

document.getElementById('sliding-bar-img').addEventListener('click', function () {
    document.getElementById('image-input').classList.toggle('slide-img');
});

document.getElementById('sliding-bar-text').addEventListener('click', function () {
    document.getElementById('text-input').classList.toggle('slide-txt');
});

document.getElementById('sliding-bar-pc').addEventListener('click', function () {
    document.getElementById('pointcloud-input').classList.toggle('slide-pc');
});

/********************************************************************
//  Declare variables
********************************************************************/
let submitValue = document.getElementsByTagName("li");
let submitCard = document.querySelector(".card");
const sectionIMG = document.getElementById("image-input");
const sectionTXT = document.getElementById("text-input");
const sectionPC = document.getElementById("pointcloud-input");
const sectionWrapper = document.querySelector('.section-wrapper');
const img2pcForm = document.getElementById('img_to_pc_form');
const txt2pcForm= document.getElementById('txt_to_pc_form');
const pc23dForm= document.getElementById('pc_to_3d_form');
const generatedPCViewIMGContainer = document.getElementById('generatedPCViewIMG');
const generatedPCViewTEXTContainer = document.getElementById('generatedPCViewTEXT');
const generated3DViewContainer = document.getElementById('generated3DView');



let submit_info = null;
let uploadedIMG = null;
let isImg = false;
let isTxt = false;
let isPC = false;

const buttonGeneratorPointCloudIMG = document.getElementById("buttonGeneratorPointCloudIMG");
const buttonDownloadPointCloudIMG = document.getElementById("buttonDownloadPointCloudIMG");
const buttonGeneratorPointCloudText = document.getElementById("buttonGeneratorPointCloudText");
const buttonDownloadPointCloudText = document.getElementById("buttonDownloadPointCloudText");
const buttonGenerator3DModel = document.getElementById("buttonGenerator3DModel");
const buttonDownload3DModel = document.getElementById("buttonDownload3DModel");


buttonGeneratorPointCloudIMG.disabled = true;
buttonDownloadPointCloudIMG.disabled = true;
buttonGeneratorPointCloudText.disabled = true;
buttonDownloadPointCloudText.disabled = true;
buttonGenerator3DModel.disabled = true;
buttonDownload3DModel.disabled = true;

// Initially, all the sections should be greyed out
sectionWrapper.classList.add('disabled-section');

/********************************************************************
// Functions for rendering 
********************************************************************/

// Fucntion to render generated pointcloud
function renderPointCloud(pc, container) {
    // Extract coordinates and colors from the response data
    const xCoords = pc.coords.map(coord => coord[0]);
    const yCoords = pc.coords.map(coord => coord[1]);
    const zCoords = pc.coords.map(coord => coord[2]);
    const colors = pc.channels["R"].map((r, i) => `rgb(${r},${pc.channels["G"][i]},${pc.channels["B"][i]})`);

    // Create the data for the 3D scatter plot
    const scatterData = {
        x: xCoords,
        y: yCoords,
        z: zCoords,
        mode: 'markers',
        marker: {
            size: 2,
            color: colors,
        },
        type: 'scatter3d'
    };

    // Define the layout for the 3D scatter plot
    const layout = {
        scene: {
            xaxis: { visible: false },
            yaxis: { visible: false },
            zaxis: { visible: false },
        },
        title: "MODEL VIEW", // Set your desired title here
    };

    // Create the Plotly 3D scatter plot
    Plotly.newPlot(container, [scatterData], layout);
}


/********************************************************************
// Section 1: Handle the image output
********************************************************************/

// Function for update views on uploaded image
function updateIMG(input) {
    isImg = true;
    isTxt = false;
    isPC = false;

    if (isImg) {
        sectionIMG.classList.remove('disabled-section');
        sectionTXT.classList.add("disabled-section");
        sectionPC.classList.add("disabled-section");
        generatedPCViewIMGContainer.style.display = "block";
        generatedPCViewTEXTContainer.style.display = "none";
        generated3DViewContainer.style.display = "none";
        const image = document.querySelector(".imgUpload");
        console.log("uploaded image", image);

        const reader = new FileReader();

        reader.onload = function () {
            const src = reader.result;
            image.src = src;
            image.style.display = 'block';

        };

        reader.readAsDataURL(input.files[0]);

        buttonGeneratorPointCloudIMG.disabled = false;
    }
}


// Function for generate pointcloud model from image prompt
function submitFormIMG() {
    // Serialize the form data
    const formData = new FormData(document.getElementById("img_to_pc_form"));

    // Send a POST request using AJAX
    fetch("/index-3d.html/handle_generator_img/", {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            const pointCloudData = data.point_cloud;
            renderPointCloud(pointCloudData,generatedPCViewIMGContainer);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}


// Function to handle download generated pointcloud model
buttonDownloadPointCloudIMG.addEventListener("click", function () {

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Make an AJAX request to the Django view
    fetch("/index-3d.html/download/output_model/", {
        method: "POST",
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin', // Do not send CSRF token to another domain.
    })
    .then(response => {
        if (response.status === 200) {
            return response.blob();
        } else {
            console.error("Error:", response.statusText);
            throw new Error("File download failed.");
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "output_model.npz";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});


// Update functionality of download button
buttonGeneratorPointCloudIMG.addEventListener("click", function () {
    buttonDownloadPointCloudIMG.disabled = false;
});


/********************************************************************
// Section 2: Handle the submission input
********************************************************************/

// Function for generate pointcloud model from text prompt
function submitFormTXT() {
    const userInput = document.getElementById('user-input');
    const submitCard = document.querySelector('.container .card');
    if (userInput.value === '') {
        alert('Please enter a valid value. The prompt input cannot be null.');
    } else {
        const submitValue = userInput.value;
        submitCard.textContent = submitValue;
        // Create a FormData object to send the input
        const formData = new FormData(document.getElementById('txt_to_pc_form'));

        // Make an AJAX request to the Django view
        fetch("/index-3d.html/handle_generator_txt/", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            const pointCloudData = data.point_cloud;
            renderPointCloud(pointCloudData,generatedPCViewTEXTContainer);
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
    }
}


// Function for update views on text prompt
function updateText(input) {
    const isImg = false;
    const isTxt = true;
    const isPC = false;
    const submitCard = document.querySelector('.container .card');

    if (input.value) {
        submitCard.textContent = input.value;
        buttonGeneratorPointCloudText.disabled = false;
    }
    
    if (isTxt) {
        sectionTXT.classList.remove('disabled-section');
        sectionIMG.classList.add("disabled-section");
        sectionPC.classList.add("disabled-section");
        generatedPCViewIMGContainer.style.display = "none";
        generatedPCViewTEXTContainer.style.display = "block";
        generated3DViewContainer.style.display = "none";

    }
}

// Update functionality of download button
buttonGeneratorPointCloudText.addEventListener("click", function () {
    buttonDownloadPointCloudText.disabled = false;
});


/********************************************************************
// Section 3: Handle the pointcloud input
********************************************************************/

// Function for update views on pointcloud input

function updatePC(input) {
    isImg = false;
    isTxt = false;
    isPC = true;
    
    if (input) {
        buttonGenerator3DModel.disabled = false;
    } else {
        buttonGenerator3DModel.disabled = true;
    }

    if (isPC) {
        sectionIMG.classList.add('disabled-section');
        sectionTXT.classList.add("disabled-section");
        sectionPC.classList.remove("disabled-section");
        generatedPCViewIMGContainer.style.display = "none";
        generatedPCViewTEXTContainer.style.display = "none";
        generated3DViewContainer.style.display = "block";
    }
}




// Function for generate 3D model from point cloud input
function submitFormPC() {
    // Serialize the form data
    const formData = new FormData(document.getElementById("pc_to_3d_form"));
    const PCPlotUpload = document.querySelector(".uploadPointcloud");
    return new Promise((resolve, reject) => {
        fetch("/index-3d.html/handle_generator_3d/", {
            method: "POST",
            body: formData,
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            pointCloudData = data.point_cloud;
            renderPointCloud(pointCloudData,PCPlotUpload);
            PCPlotUpload.style.display ="block";
            const event = new CustomEvent("modelDataReceived", { detail: data });
            document.dispatchEvent(event);
            console.log("event", event);
            resolve();
        })
        .catch((error) => {
            reject(error);
        });
    });
}



// Function to handle download generated 3d model
buttonDownload3DModel.addEventListener("click", function () {

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Make an AJAX request to the Django view
    fetch("/index-3d.html/download/output_model/", {
        method: "POST",
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin', // Do not send CSRF token to another domain.
    })
    .then(response => {
        if (response.status === 200) {
            return response.blob();
        } else {
            console.error("Error:", response.statusText);
            throw new Error("File download failed.");
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "output_model.npz";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});


// Update functionality of download button
buttonGenerator3DModel.addEventListener("click", function () {
    buttonDownload3DModel.disabled = false;
});







