const gltfModelUrl1 = {
  "Chair": '../../static/src/assets/media/gltf/sunflower/sunflower.gltf',
  "Mixer": '../../static/src/assets/media/gltf/garage/garage.gltf',
  "GeoPlanter": '../../static/src/assets/media/gltf/sunflower/sunflower.gltf',

  // Add more model entries as needed
};

function switchSrc(button, modelName) {
  const modelViewer1 = document.querySelector('#envlight-demo'); // Use id selector
  modelViewer1.src = gltfModelUrl1[modelName];

  const slides = modelViewer1.shadowRoot.querySelectorAll('.slide'); // Query within the model-viewer's shadow DOM
  slides.forEach(slide => {
    slide.classList.remove('selected');
  });
  button.classList.add('selected');
}
