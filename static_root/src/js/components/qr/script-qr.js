const htmlLinks = {
  ar: "../static/src/public/QR/components/ar.html",
  customAR: "../static/src/public/QR/components/customAR.html",
  smartAR: "../static/src/public/QR/components/smartAR.html",
  qrGenerator: "../static/src/public/QR/components/qrGenerator.html",
  customMarker: "../static/src/public/QR/components/customMarker.html",
};

const jsLinks = {
  ar: ["../static/src/public/QR/js/ar.js"],
  customAR: [
    "../static/src/public/QR/js/customAR.js",
    "https://sdk.amazonaws.com/js/aws-sdk-2.1446.0.min.js",
  ],
  smartAR: ["../static/src/public/QR/js/smartAR.js"],
  qrGenerator: [
    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
    "https://unpkg.com/html5-qrcode@2.3.1/html5-qrcode.min.js",
    "../static/src/public/QR/dist/prod-min.js",
  ],
  customMarker: [
    "../static/src/public/QR/js/customMarker.js",
    "../static/src/public/QR/dist/pdfmake.min.js",
    "https://code.getmdl.io/1.3.0/material.min.js",
    "../static/src/public/QR/utils/vfs_fonts.js",
    "../static/src/public/QR/utils/threex-arpatternfile.js",
  ],
};


document.addEventListener("DOMContentLoaded", function () {
  // Get the specific buttons you want to target
  var arButton = document.getElementById("arBtn");
  var customARButton = document.getElementById("customARBtn");
  var smartARButton = document.getElementById("smartARBtn");
  var qrGeneratorButton = document.getElementById("qrGeneratorBtn");
  var customMarkerButton = document.getElementById("customMarkerBtn");
  var returnBtn = document.getElementById('returnButtonARBtn');
  
  
  // AR 
  arButton.addEventListener("click", function (e) {
    // do NOT send the form the usual way
    e.preventDefault();
     let page = "ar";
    
    // Send the 'page' value to the server-side
    sendData(page);
  });


  // CUSTOM AR
  customARButton.addEventListener("click", function (e) {
    // do NOT send the form the usual way
    e.preventDefault();
     let page = "customAR";
    
    // Send the 'page' value to the server-side
    sendData(page);
  });


// SMART AR
  smartARButton.addEventListener("click", function (e) {
    // do NOT send the form the usual way
    e.preventDefault();
     let page = "smartAR";
    
    // Send the 'page' value to the server-side
    sendData(page);
  });


  // QR GENERATOR
  qrGeneratorButton.addEventListener("click", function (e) {
    // do NOT send the form the usual way
    e.preventDefault();
     let page = "qrGenerator";
    
    // Send the 'page' value to the server-side
    sendData(page);
  });


  // CUSTOM MARKERS
  customMarkerButton.addEventListener("click", function (e) {
    // do NOT send the form the usual way
    e.preventDefault();
     let page = "customMarker";
    
    // Send the 'page' value to the server-side
    sendData(page);
  });

   // Set up the button click event handler
  returnBtn.addEventListener('click', handleReturnButton);

});


  // Function to handle the button click and redirect based on the page URL
function handleReturnButton() {
  const currentPageUrl = window.location.href;
  const baseUrl = window.location.origin;
  console.log("currentPageUrl", currentPageUrl);
  console.log("baseUrl", baseUrl);


  if (currentPageUrl.endsWith('index-qr.html/')) {
    // If the page URL ends with 'threeJS.html', redirect to the base URL 'http://127.0.0.1:8080'
    window.location.href = baseUrl + '/index.html';
  } else if (currentPageUrl.includes('/index-qr.html/?page=')) {
    // If the page URL includes '?page=', redirect to 'http://127.0.0.1:8080/threeJS.html'
    window.location.href = baseUrl + '/index-qr.html';
  }
}




function updateURL(content) {
  var baseUrl = window.location.origin + window.location.pathname;
  var queryParams = "?page=" + content;
  history.pushState(null, "", baseUrl + queryParams);
}




async function sendData(page) {

  // Prepare the data to send in the POST request
  const data = {
    page: page,
  };

  try {
    const response = await fetch(`/index-qr.html/?page=${page}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // If the POST request is successful, load the content based on the 'page' value
      loadContent(htmlLinks[page], jsLinks[page]);
      updateURL(page);
    } else {
      console.error("Failed to send data to the server.");
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
}



function loadContent(htmlLink, jsLink) {
  // Clear previous content and scripts
  removeScripts();
  const contentContainer = document.querySelector(".content-container");
  contentContainer.innerHTML = "";
  // Fetch HTML content
  fetch(htmlLink)
    .then((response) => response.text())
    .then((content) => {
      contentContainer.innerHTML = content;

      // Dynamically load JavaScript files
      if (Array.isArray(jsLink)) {
        jsLink.forEach((scriptUrl) => {
          loadScript(scriptUrl);
        });
      } else if (jsLink && jsLink.scripts) {
        jsLink.scripts.forEach((scriptUrl) => {
          loadScript(scriptUrl);
        });
      }
    })
    .catch((error) => {
      console.error("Error loading content:", error);
    });
}

function removeScripts() {
  // Remove all existing script elements
  const scriptElements = document.querySelectorAll("script");
  scriptElements.forEach((scriptElement) => {
    scriptElement.remove();
  });
}


function loadScript(scriptUrl) {
  var script = document.createElement("script");
  script.src = scriptUrl;
  document.body.appendChild(script);
}

