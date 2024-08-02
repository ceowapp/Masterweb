// script.js

document.addEventListener("DOMContentLoaded", function() {

   /********************************************************************
    // Section 1: ARVR SECTION
   ********************************************************************/


    var openAugmentedJSButton = document.getElementById("arOpen");
    var openVirtualJSButton = document.getElementById("vrOpen");
    var openVRAudioJSButton = document.getElementById("vrAudioOpen");


    if (openAugmentedJSButton) {
        openAugmentedJSButton.addEventListener("click", function () {
        // Open the global_illumination.html file
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }
    

    if (openVirtualJSButton) {
        openVirtualJSButton.addEventListener("click", function () {
            // Open the global_illumination.html file
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }


    if (openVRAudioJSButton) {
        openVRAudioJSButton.addEventListener("click", function () {
            // Open the global_illumination.html file
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }


    /********************************************************************
    // Section 2: QR SECTION
   ********************************************************************/

    var openQRJSButton = document.getElementById("qrOpen");

    if (openQRJSButton) {
        openQRJSButton.addEventListener("click", function () {
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }


    /********************************************************************
    // Section 3: 3D APPLICATION SECTION
    ********************************************************************/

    var openThreejsGallery = document.getElementById("3dOpen");
    var openVerge3DButton = document.getElementById("vgOpen");
    var open3dDisplayJSButton = document.getElementById("displayOpen");
    var openTextAppJSButton = document.getElementById("textOpen");
    var openLegoJSButton = document.getElementById("legoOpen");

    if (openThreejsGallery) {
        openThreejsGallery.addEventListener("click", function () {
        // Open the global_illumination.html file
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }

    if (openVerge3DButton) {
        openVerge3DButton.addEventListener("click", function () {
        // Open the global_illumination.html file
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }


    if (open3dDisplayJSButton) {
        open3dDisplayJSButton.addEventListener("click", function () {
        // Open the global_illumination.html file
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }

    
    if (openTextAppJSButton) {
        openTextAppJSButton.addEventListener("click", function () {
        // Open the global_illumination.html file
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }


    if (openLegoJSButton) {
        openLegoJSButton.addEventListener("click", function () {
        // Open the global_illumination.html file
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }


    /********************************************************************
    // Section 4: AI SECTION
    ********************************************************************/

    /*var openTryonJSButton = document.getElementById("trOpen");
    var openFaceAIJSButton = document.getElementById("facemeshAIOpen");
    var open3DGeneratorJSButton = document.getElementById("3dGeneratorAIOpen");
    var openTextAnalysisJSButton = document.getElementById("textAnalysisAIOpen");


    if (openTryonJSButton) {
        openTryonJSButton.addEventListener("click", function () {
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }

    if (openFaceAIJSButton) {
        openFaceAIJSButton.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }

    if (open3DGeneratorJSButton) {
        open3DGeneratorJSButton.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }

    if (openTextAnalysisJSButton) {
        openTextAnalysisJSButton.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }


    /********************************************************************
    // Section 5: ROBOTICS SECTION
    ********************************************************************/


    /********************************************************************
    // Section 6: CONSTRUCTION SECTION
    ********************************************************************/


    /********************************************************************
    // Section : DATA SECTION
    ********************************************************************/

    /********************************************************************
    // Section : CONSTRUCTION SECTION
    ********************************************************************/

    /********************************************************************
    // Section : TECHNOLOGY SECTION
    ********************************************************************/

    /********************************************************************
    // Section : APP DEVELOPMENT SECTION
    ********************************************************************/

    var openAndroidJSButton = document.getElementById("androidOpen");
    var openIOSJSButton = document.getElementById("iosOpen");
    var openWebappJSButton = document.getElementById("webappOpen");

    if (openAndroidJSButton) {
        openAndroidJSButton.addEventListener("click", function () {
        const url = this.getAttribute("data-url");
        window.location.href = url;
        });
    }

    if (openIOSJSButton) {
        openIOSJSButton.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }

    if (openWebappJSButton) {
        openWebappJSButton.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            window.location.href = url;
        });
    }

    /********************************************************************
    // Section : SIDE CONTENT SECTION
    ********************************************************************/

    /********************************************************************
    // Section : RESOURCES SECTION
    ********************************************************************/

    /********************************************************************
    // Section : CONTACT SECTION
    ********************************************************************/



    /********************************************************************
    // Section : CHATBOT SECTION
    ********************************************************************/

      // Add this JavaScript code before the closing </body> tag
        const chatbotModal = document.getElementById('chatbotModal');
        const openChatbot = document.getElementById('chatbotToggle');
        const closeChatbot = document.getElementById('closeChatbot');

        openChatbot.addEventListener('click', () => {
            chatbotModal.style.display = 'block';
        });

        openChatbot.addEventListener('click', () => {
        chatbotModal.style.display = 'block';
        // Set the dimensions of the modal content to match the chatbot iframe
        chatbotModal.querySelector('.modal-content').style.width = `${chatbotIframe.offsetWidth}px`;
        chatbotModal.querySelector('.modal-content').style.height = `${chatbotIframe.offsetHeight+35}px`;
         });
        
        closeChatbot.addEventListener('click', () => {
            chatbotModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === chatbotModal) {
                chatbotModal.style.display = 'none';
            }
        });

    
});


/********************************************************************
// Section : ADD/REMOVE PAGE LOADER SECTION
********************************************************************/
