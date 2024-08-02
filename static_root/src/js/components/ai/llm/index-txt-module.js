/********************************************************************
//  Declare variables
********************************************************************/
const submitForm= document.getElementById('txt-submit');
const predictAspectBtn = document.getElementById('predictAspect');

// Get the required elements
let aspectLabel;

// Initially disable aspect sentiment analysis section
predictAspectBtn.disabled = true;

/********************************************************************
//  FUNCTION TO DISPLAY THE OUTPUT
********************************************************************/

function displayClassificationAspectSentence(categoryName,categoryScore) {
    let sad_icon_img = "./static/src/assets/components/aiSentiment/sad-icon.png";
    let happy_icon_img = "./static/src/assets/components/aiSentiment/happy-icon.png";
    let neutral_icon_img = "./static/src/assets/components/aiSentiment/neutral-icon.png";
    let slightly_happy_icon_img = "./static/src/assets/components/aiSentiment/slightly-happy-icon.png";
    let slightly_sad_icon_img = "./static/src/assets/components/aiSentiment/slightly-sad-icon.png";

    const categorySentenceOutput = document.getElementById('category_sentence_output');
    const scoreSentenceOutput = document.getElementById('score_sentence_output');
    const imgIcon = document.getElementById("icon_display");

    // Clear previous results
    categorySentenceOutput.innerHTML = "";
    scoreSentenceOutput.innerHTML = "";

    // Single-head model.
        const categorySentenceOutputDiv = document.createElement("div");
        const scoreSentenceOutputDiv = document.createElement("div");

        // Highlight the likely category
        if (categoryScore > 50) {
            categorySentenceOutputDiv.style.color = "#12b5cb";
              categorySentenceOutputDiv.innerText = `${categoryName}`;
              scoreSentenceOutputDiv.innerText = `${categoryScore}`;
              categorySentenceOutput.appendChild(categorySentenceOutputDiv);
              scoreSentenceOutput.appendChild(scoreSentenceOutputDiv);
        }

    // Handle icon display based on the last category
    if (categoryName === "negative") {
        if (categoryScore > 50 && categoryScore <= 60) {
            imgIcon.src = slightly_sad_icon_img;
        } else if (categoryScore > 60) {
            imgIcon.src = sad_icon_img;
        }
    } else if (categoryName === "positive") {
        if (categoryScore >= 50 && categoryScore < 60) {
            imgIcon.src = slightly_happy_icon_img;
        } else if (categoryScore >= 60) {
            imgIcon.src = happy_icon_img;
        } else if (categoryScore === 50) {
            imgIcon.src = neutral_icon_img;
        }
    }
}


function displayClassificationAspect(resultList, aspectLabel) {
    let sad_icon_img = "./static/src/assets/components/aiSentiment/sad-icon.png";
    let happy_icon_img = "./static/src/assets/components/aiSentiment/happy-icon.png";
    let neutral_icon_img = "./static/src/assets/components/aiSentiment/neutral-icon.png";
    let slightly_happy_icon_img = "./static/src/assets/components/aiSentiment/slightly-happy-icon.png";
    let slightly_sad_icon_img = "./static/src/assets/components/aiSentiment/slightly-sad-icon.png";

    const categoryAspectOutput = document.getElementById('category_aspect_output');
    const scoreAspectOutput = document.getElementById('score_aspect_output');
    const labelAspectOutput = document.getElementById('label_aspect_output');
    const imgIcon = document.getElementById("icon_display");

    // Clear previous results
    categoryAspectOutput.innerHTML = "";
    scoreAspectOutput.innerHTML = "";
    labelAspectOutput.innerHTML = "";

    // Single-head model.
    resultList.forEach(item => {
        const categoryName = item.aspect_category;
        const categoryScore = (item.aspect_score * 100).toFixed(2); // Multiply by 100 and format as needed
        console.log("categoryName",categoryName);
        console.log("categoryScore",categoryScore);
        const labelAspectOutputDiv = document.createElement("div");
        const categoryAspectOutputDiv = document.createElement("div");
        const scoreAspectOutputDiv = document.createElement("div");

        labelAspectOutputDiv.innerText = `${aspectLabel}`;
        labelAspectOutput.appendChild(labelAspectOutputDiv);

        // Highlight the likely category
        if (categoryScore > 50) {
            categoryAspectOutputDiv.style.color = "#12b5cb";
             categoryAspectOutputDiv.innerText = `${categoryName}`;
            scoreAspectOutputDiv.innerText = `${categoryScore}`;
            categoryAspectOutput.appendChild(categoryAspectOutputDiv);
            scoreAspectOutput.appendChild(scoreAspectOutputDiv);
        }

        if (categoryName === "negative") {
            if (categoryScore > 50 && categoryScore <= 60) {
                imgIcon.src = slightly_sad_icon_img;
            } else if (categoryScore > 60) {
                imgIcon.src = sad_icon_img;
            }
        } else if (categoryName === "positive") {
            if (categoryScore >= 50 && categoryScore < 60) {
                imgIcon.src = slightly_happy_icon_img;
            } else if (categoryScore >= 60) {
                imgIcon.src = happy_icon_img;
            } else if (categoryScore === 50) {
                imgIcon.src = neutral_icon_img;
            }
        }
    });
}


/********************************************************************
// Section 1: Handle the image output
********************************************************************/

// Function to submit the form for text analysis
function updateView(input) {
    if (input.value) {
    predictAspectBtn.disabled = false;
    } 
}


// Function to submit the form for text analysis
function submitFormTXT() {
    const aspectInput = document.getElementById('aspect-input');
    const alertMSG = document.querySelector(".alert");
    const alertUnmatchMSG = document.querySelector(".alert-unmatch");


    if (aspectInput.value === '') {
        alert('Please enter a valid value. The prompt input cannot be null.');
    } else {
        aspectLabel = aspectInput.value;       
        const formData = new FormData(document.getElementById('txt-submit'));

        // Make an AJAX request to the Django view
        fetch("/index-txt.html/sentiment_analysis_processor/", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Handle the sentence analysis result response from the server
            const sentenceResultData = data.sentence_result;
            const aspectResultData = data.aspect_results;
            const checkingResultData = data.checking_result;

            if (checkingResultData === false) {
                alertUnmatchMSG.style.display = "block";
            }else{
                if (sentenceResultData && aspectResultData) {
                    const categoryName = sentenceResultData["sentence_category"]; 
                    const categoryScore = (sentenceResultData["sentence_score"] * 100).toFixed(2);
                    displayClassificationAspectSentence(categoryName,categoryScore);
                    displayClassificationAspect(aspectResultData, aspectLabel);
                } else {
                    alertMSG.style.display = "block";
                }
            }  
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
    }
}




