
let $ = document;
let slider = $.querySelector(".slider");
let sliderItem = $.querySelectorAll(".slider-item");

let preBtnSlider = $.getElementById("pre-btn-slider");
let nextBtnSlider = $.getElementById("next-btn-slider");
let bgSlider = $.querySelector(".bg-slider");
let slideContentH2 = $.querySelector(".slide-content h2");
let slideContentP = $.querySelector(".slide-content p");
let slideContentAnchor = $.querySelector(".slide-content a");
let slideButton = $.querySelector(".button-magnetic");
sliderItem = Array.from(sliderItem);
let currentPosition = 200;
let firstItemCurentPosition = currentPosition;
let nextItemForActive = 0;
let autoPreMoveSlide;
for (let item = 0; item < sliderItem.length; item++) {
  sliderItem[item].style.right = `${
    currentPosition - firstItemCurentPosition
  }px`;
  firstItemCurentPosition = firstItemCurentPosition - firstItemCurentPosition;
  currentPosition = currentPosition - 225;
}
let lastItemPosition = currentPosition + 225;
console.log(
  getComputedStyle(sliderItem[sliderItem.length - 1]).getPropertyValue("right")
);
let currentPositionItem = 0;
let defualtWidth = sliderItem[1].offsetWidth;
let defualtHeight = sliderItem[1].offsetHeight;
$.addEventListener("DOMContentLoaded", () => {
  preBtnSlider.addEventListener("click", preMoveSlid);
});
slideContentH2.innerHTML =
  sliderItem[0].lastElementChild.firstElementChild.firstElementChild.textContent;
slideContentP.innerHTML =
  sliderItem[0].lastElementChild.lastElementChild.previousElementSibling.firstElementChild.textContent;
slideContentAnchor.innerHTML =
  sliderItem[0].lastElementChild.lastElementChild.textContent;
slideContentAnchor.setAttribute(
  "href",
  sliderItem[0].lastElementChild.lastElementChild.getAttribute("href")
);
slideButton.setAttribute(
  "data-url",
  sliderItem[0].lastElementChild.lastElementChild.getAttribute("data-url")
);

function preMoveSlid() {
  preBtnSlider.setAttribute("disabled", " ");
  for (let i = 0; i < sliderItem.length; i++) {
    currentPositionItem = getComputedStyle(sliderItem[i]).getPropertyValue(
      "right"
    );

    if (
      sliderItem[i].classList.contains("activeBgc") ||
      parseFloat(getComputedStyle(sliderItem[i]).getPropertyValue("right")) >=
        parseFloat("200px")
    ) {
      sliderItem[i].classList.remove("activeBgc");

      console.log(sliderItem[i].nextElementSibling);
      if (
        sliderItem[i].nextElementSibling == null ||
        sliderItem[i].nextElementSibling.classList.contains("slider-item") !=
          true
      ) {
        nextItemForActive = sliderItem[0];
      } else {
        nextItemForActive = sliderItem[i].nextElementSibling;
      }
      sliderItem[i].style.right = `${lastItemPosition}px`;
    } else {
      sliderItem[i].style.right = `${parseInt(currentPositionItem) + 225}px`;
    }
  }

  nextItemForActive.style.transition = "all 0.5s";
  nextItemForActive.classList.add("activeBgc");
  slideContentH2.innerHTML =
    nextItemForActive.lastElementChild.firstElementChild.firstElementChild.textContent;
  slideContentP.innerHTML =
  nextItemForActive.lastElementChild.lastElementChild.previousElementSibling.firstElementChild.textContent;
  slideContentAnchor.innerHTML =
  nextItemForActive.lastElementChild.lastElementChild.textContent;
  slideContentAnchor.setAttribute(
    "href",
    nextItemForActive.lastElementChild.lastElementChild.getAttribute("href")
  );
  slideButton.setAttribute(
  "data-url",
  nextItemForActive.lastElementChild.lastElementChild.getAttribute("data-url")
);
  nextItemForActive.style.right = "0";
  setTimeout(() => {
    preBtnSlider.removeAttribute("disabled");
  }, 600);
}

function autoPlaySlider() {
  for (let w = 0; w < sliderItem.length; w++) {
    if (
      parseFloat(getComputedStyle(sliderItem[w]).getPropertyValue("right")) <
      -450
    ) {
      sliderItem[w].style.opacity = "0";
    } else if (
      parseFloat(getComputedStyle(sliderItem[w]).getPropertyValue("right")) >
      -450
    ) {
      sliderItem[w].style.opacity = "10";
    }
  }
  for (let w = 0; w < sliderItem.length; w++) {
    if (
      parseFloat(getComputedStyle(sliderItem[w]).getPropertyValue("right")) <=
      -250
    ) {
      sliderItem[w].classList.add("activeSmall");
    } else if (
      parseFloat(getComputedStyle(sliderItem[w]).getPropertyValue("right")) >
      -250
    ) {
      sliderItem[w].classList.remove("activeSmall");
    }
  }
}

setInterval(autoPlaySlider, 1);