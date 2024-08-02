(function() {
  // Get the specific buttons you want to target

  let sceneARAdded = false;
  let arSceneAdded = null;
  var dynamicARButton = document.getElementById("dynamicAR");
  var locationARButton = document.getElementById("locationAR");
  var turnOffBtn = document.getElementById("turnOffBtn");


  // Add click event listeners to the targeted buttons
  dynamicARButton.addEventListener("click", function() {
    addDynamicScene();
  });


   // Add click event listeners to the targeted buttons
  locationARButton.addEventListener("click", function() {
    addLocationScene();
  });

  turnOffBtn.addEventListener("click", function() {
    removeScene();
  });


function addDynamicScene() {
  if (!sceneARAdded) {
    arSceneAdded = document.createElement("iframe");
    arSceneAdded.setAttribute("src", "../static/src/public/QR/components/dynamicAR.html");
    arSceneAdded.setAttribute("width", "500");
    arSceneAdded.setAttribute("height", "500");
    arSceneAdded.style.border = "2px solid #3498db"; // Add your desired styles here

    var contentAR = document.querySelector(".content-holder-scene");
    contentAR.appendChild(arSceneAdded);
    contentAR.style.display = 'flex';
    turnOffBtn.style.display = 'flex';
    
    sceneARAdded = true;
  }
}


function addLocationScene() {
  if (!sceneARAdded) {
    arSceneAdded = document.createElement("iframe");
    arSceneAdded.setAttribute("src", "../static/src/public/QR/components/locationAR.html");
    arSceneAdded.setAttribute("width", "500");
    arSceneAdded.setAttribute("height", "500");
    arSceneAdded.style.border = "2px solid #3498db"; // Add your desired styles here

    var contentAR = document.querySelector(".content-holder-scene");
    contentAR.appendChild(arSceneAdded);
    contentAR.style.display = 'flex';
    turnOffBtn.style.display = 'flex';
    
    sceneARAdded = true;
  }
}

function removeScene() {
  if (sceneARAdded && arSceneAdded !== null) {
    arSceneAdded.remove();
    arSceneAdded = null;
    sceneARAdded = false;
    turnOffBtn.style.display = 'none';
  }
}

})();