(function() {
  // Get the specific buttons you want to target

  let sceneARAdded = false;
  let arSceneAdded = null;
  var simpleARButton = document.getElementById("simpleAR");
  var eventARButton = document.getElementById("eventAR");
  var mp4ARButton = document.getElementById("mp4AR");
  var turnOffBtn = document.getElementById("turnOffBtn");


  // Add click event listeners to the targeted buttons
  simpleARButton.addEventListener("click", function() {
    addSimpleScene();
  });


   // Add click event listeners to the targeted buttons
  eventARButton.addEventListener("click", function() {
    addEventScene();
  });


 // Add click event listeners to the targeted buttons
  mp4ARButton.addEventListener("click", function() {
    addVideoScene();
  });


  turnOffBtn.addEventListener("click", function() {
    removeScene();
  });


function addSimpleScene() {
  if (!sceneARAdded) {
    arSceneAdded = document.createElement("iframe");
    arSceneAdded.setAttribute("src", "../static/src/public/QR/components/simpleARScene.html");
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


function addEventScene() {
  if (!sceneARAdded) {
    arSceneAdded = document.createElement("iframe");
    arSceneAdded.setAttribute("src", "../static/src/public/QR/components/eventARScene.html");
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

function addVideoScene() {
  if (!sceneARAdded) {
    arSceneAdded = document.createElement("iframe");
    arSceneAdded.setAttribute("src", "../static/src/public/QR/components/mp4ARScene.html");
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






