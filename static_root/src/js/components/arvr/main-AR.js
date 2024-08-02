var menuToggle = document.querySelector('[data-js="menu-toggle"]');

// Remove this setInterval to trigger the open/close manually through the UI
var interval = setInterval(function() {
  menuToggle.click();
}, 2000);

// Clear the interval on any click
document.body.addEventListener('click', function () {
   clearInterval(interval);
});

menuToggle.addEventListener('click', function () {
  document.body.classList.toggle('panel-open');
  menuToggle.classList.toggle('open');
});

var closePanel = document.querySelector('[data-js="hidden-panel-close"]');

closePanel.addEventListener('click', function () {
  document.body.classList.remove('panel-open');
  menuToggle.classList.remove('open');
});


document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.dropdown-container a[href]');
  const contentSection = document.getElementById('contentSection');
  const returnBtn = document.getElementById('returnButton');

  // Function to handle the button click and redirect based on the page URL
function handleReturnButton() {
  const currentPageUrl = window.location.href;
  const baseUrl = window.location.origin;
  window.location.href = baseUrl + '/index.html';
  //if (currentPageUrl.includes('threeJS.html/?page=')) window.location.href = baseUrl + '/threeJS.html';
}

// Set up the button click event handler
returnBtn.addEventListener('click', handleReturnButton);

  links.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const pageURL = event.srcElement.accessKey;
      const linkHref = this.getAttribute('href');
      const params = new URLSearchParams(linkHref.split('?')[1]);
      const page = params.get('page');
      const baseUrl = window.location.origin;
      const currentPageUrl = baseUrl + '/' + pageURL + '.html'; // Fixed concatenation
      window.location.href = currentPageUrl;
      updateURL(pageURL);
      // Load the default content (normalAR.html) after setting up the event listeners
    });
  });

});

function loadContent(htmlLink) {
      // Fetch HTML content
      fetch(htmlLink)
        .then(response => response.text())
        .then(content => {
          const contentSection = document.getElementById('contentSection');
          contentSection.innerHTML = content;
        })
        .catch(error => {
          console.error('Error loading content:', error);
        });

      // Dynamically load JavaScript file
      /*const script = document.createElement('script');
      script.src = jsLink;
      document.body.appendChild(script);*/
   }

async function sendData(page) {
  // Prepare the data to send in the POST request
  const data = {
    page: page,
  };
  updateURL(page);
  try {
    const response = await fetch(`/threeJS.html/?page=${page}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      console.error("Load content successfully.");
    } else {
      console.error("Failed to send data to the server.");
    }
  } catch (error) {
    console.error("Error sending data:", error);
  }
}

function updateURL(content) {
  var baseUrl = window.location.origin + window.location.pathname;
  var queryParams = "?page=" + content;
  history.pushState(null, "", baseUrl + queryParams);
}



/* 
  contentSection.innerHTML = '';
if (page === 'dimensionAR') {
  loadContent('../static/src/public/ARVR/dimensionAR.html');
  } else if (page === 'normalAR') {
    loadContent('../static/src/public/ARVR/normalAR.html');
  }else if (page === 'cameraAR') {
    loadContent('../static/src/public/ARVR/cameraAR.html');
  }else if (page === 'lightingAR') {
    loadContent('../static/src/public/ARVR/lightAR.html');
  }else if (page === 'materialAR') {
    loadContent('../static/src/public/ARVR/materialAR.html');
  }else if (page === 'animationAR') {
    loadContent('../static/src/public/ARVR/animationAR.html');
  }else if (page === 'clippingAR') {
    loadContent('../static/src/public/ARVR/clippingAR.html');
      }*/