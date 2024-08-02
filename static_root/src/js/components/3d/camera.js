const modelViewer2 = document.querySelector("#hotspot-camera-view-demo");
const annotationClicked = (annotation) => {
  let dataset = annotation.dataset;
  modelViewer2.cameraTarget = dataset.target;
  modelViewer2.cameraOrbit = dataset.orbit;
  modelViewer2.fieldOfView = '45deg';
}

modelViewer2.querySelectorAll('button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => annotationClicked(hotspot));
});