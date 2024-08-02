// Select the sliding-bar-sentiment element and the second output-display element
const slidingBarElement = document.querySelector('.sliding-bar');
const outputAspectContainer = document.querySelector('.output-aspect');

// Add a click event listener to the sliding-bar-sentiment element
slidingBarElement.addEventListener('click', function () {
  // Toggle the display style of the second output-display element
  if (outputAspectContainer.style.display === 'none') {
    outputAspectContainer.style.display = 'block';
  } else {
    outputAspectContainer.style.display = 'none';
  }
});


/********************************************************************
//  Declare variables
********************************************************************/
const textFieldSentence = document.getElementById("sentence-input-md1");
const textFieldAspect = document.getElementById("sentence-input-md2");
const predictSentenceBtn = document.getElementById('predictSentence');
const textField = new MDCTextField(document.querySelector(".mdc-text-field"));




// Get the required elements
const input = document.getElementById("input");
const pasteTextBtn = document.getElementById("paste-text");
var sentenceInput=null;

let textClassifier;

const htmlContainer = document.getElementById("container");

// Initially disable aspect sentiment analysis section
predictSentenceBtn.disabled = true;

/********************************************************************
//  FUNCTION TO DISPLAY THE OUTPUT
********************************************************************/
function displayClassificationResultSentence(resultList) {
    let sad_icon_img = "./static/src/assets/components/aiSentiment/sad-icon.png";
    let happy_icon_img = "./static/src/assets/components/aiSentiment/happy-icon.png";
    let neutral_icon_img = "./static/src/assets/components/aiSentiment/neutral-icon.png";
    let slightly_happy_icon_img = "./static/src/assets/components/aiSentiment/slightly-happy-icon.png";
    let slightly_sad_icon_img = "./static/src/assets/components/aiSentiment/slightly-sad-icon.png";
    const categorySentenceOutput = document.getElementById('category_sentence_output');
    const scoreSentenceOutput = document.getElementById('score_sentence_output');
    const imgIcon = document.getElementById("icon_display");

    // Single-head model.
    for (const category of resultList) {
        const categoryName = category.categoryName;
        const categoryScore = category.score.toFixed(2)*100;
        const categorySentenceOutputDiv = document.createElement("div");
        const scoreSentenceOutputDiv = document.createElement("div");

        // Highlight the likely category
        if (categoryScore > 50) {
            categorySentenceOutputDiv.innerText = `${categoryName}`;
            scoreSentenceOutputDiv.innerText = `${categoryScore}`;
            categorySentenceOutputDiv.style.color = "#12b5cb";
            categorySentenceOutput.appendChild(categorySentenceOutputDiv);
            scoreSentenceOutput.appendChild(scoreSentenceOutputDiv);
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
    }
}

/********************************************************************
//  LOAD ML MODEL
********************************************************************/

import { MDCTextField } from "https://cdn.skypack.dev/@material/textfield";
import {
  TextClassifier,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text@0.10.0";


// Create the TextClassifier object upon page load
const createTextClassifier = async () => {
  const text = await FilesetResolver.forTextTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text@0.10.0/wasm"
  );
  textClassifier = await TextClassifier.createFromOptions(text, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/1/bert_classifier.tflite`
    },
    maxResults: 5
  });

  // Show demo section now model is ready to use.
  htmlContainer.classList.remove("disabled-container");
};
createTextClassifier();


/********************************************************************
// Function to evaluate the model
********************************************************************/

pasteTextBtn.addEventListener("click",()=>{
    if (input.value === "") {
    alert("There is nothing to paste. Please enter text for analysis.");
    return;
  }else{
    textFieldSentence.value = input.value;
    textFieldAspect.value = input.value;
    predictSentenceBtn.disabled = false;
  }
});


// Add a button click listener that classifies text on click
predictSentenceBtn.addEventListener("click", async () => {
const alertMSG = document.querySelector(".alert");
  if (input.value === "") {
    alert("Please enter text for analysis");
    return;
  }

await sleep(5);
const result = textClassifier.classify(input.value);
const categorySentenceOutput = document.getElementById('category_sentence_output');
const scoreSentenceOutput = document.getElementById('score_sentence_output');

// Check if valid returned output
if (result.classifications[0].categories.length > 0) {
    categorySentenceOutput.innerText = "";
    scoreSentenceOutput.innerText = "";
} else {
  alertMSG.style.display = "block";
}
const categories = [];
const resultVec = result.classifications[0].categories;
displayClassificationResultSentence(resultVec);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

