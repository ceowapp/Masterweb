// JS code ist just to auto animate and can be removed
function animate (){
      var checked = document.querySelector('.sliderSelection:checked');
      var next = checked.nextElementSibling;
      console.log(next);
      if (next.id === "sliderContainer") {
        next = document.getElementById('input1');
      }
        next.checked = true;
  window.setTimeout(animate,3000);


    }
 window.onload = function () {
   animate();
};
    