const modelViewer5 = document.querySelector('#dimension-demo');

modelViewer5.addEventListener('input', (event) => {
  modelViewer5.src = event.target.value;
});

const checkbox = modelViewer5.querySelector('#show-dimensions');
console.log('Model Viewer:', checkbox); // Add this line to check the targeting


function setVisibility(element) {
  if (checkbox.checked) {
    element.classList.remove('hide');
  } else {
    element.classList.add('hide');
  }
}

checkbox.addEventListener('change', () => {
  setVisibility(modelViewer5.querySelector('#dimLines'));
  modelViewer5.querySelectorAll('button').forEach((hotspot) => {
    setVisibility(hotspot);
  });
});

// update svg
function drawLine(svgLine, dotHotspot1, dotHotspot2, dimensionHotspot) {
  if (dotHotspot1 && dotHotspot2) {
    svgLine.setAttribute('x1', dotHotspot1.canvasPosition.x);
    svgLine.setAttribute('y1', dotHotspot1.canvasPosition.y);
    svgLine.setAttribute('x2', dotHotspot2.canvasPosition.x);
    svgLine.setAttribute('y2', dotHotspot2.canvasPosition.y);

    // use provided optional hotspot to tie visibility of this svg line to
    if (dimensionHotspot && !dimensionHotspot.facingCamera) {
      svgLine.classList.add('hide');
    }
    else {
      svgLine.classList.remove('hide');
    }
  }
}

const dimLines = modelViewer5.querySelectorAll('line');

const renderSVG = () => {
  drawLine(dimLines[0], modelViewer5.queryHotspot('hotspot-dot+X-Y+Z'), modelViewer5.queryHotspot('hotspot-dot+X-Y-Z'), modelViewer5.queryHotspot('hotspot-dim+X-Y'));
  drawLine(dimLines[1], modelViewer5.queryHotspot('hotspot-dot+X-Y-Z'), modelViewer5.queryHotspot('hotspot-dot+X+Y-Z'), modelViewer5.queryHotspot('hotspot-dim+X-Z'));
  drawLine(dimLines[2], modelViewer5.queryHotspot('hotspot-dot+X+Y-Z'), modelViewer5.queryHotspot('hotspot-dot-X+Y-Z')); // always visible
  drawLine(dimLines[3], modelViewer5.queryHotspot('hotspot-dot-X+Y-Z'), modelViewer5.queryHotspot('hotspot-dot-X-Y-Z'), modelViewer5.queryHotspot('hotspot-dim-X-Z'));
  drawLine(dimLines[4], modelViewer5.queryHotspot('hotspot-dot-X-Y-Z'), modelViewer5.queryHotspot('hotspot-dot-X-Y+Z'), modelViewer5.queryHotspot('hotspot-dim-X-Y'));
};

modelViewer5.addEventListener('camera-change', renderSVG);

modelViewer5.addEventListener('load', () => {
  const center = modelViewer5.getBoundingBoxCenter();
  const size = modelViewer5.getDimensions();
  const x2 = size.x / 2;
  const y2 = size.y / 2;
  const z2 = size.z / 2;

  modelViewer5.updateHotspot({
    name: 'hotspot-dot+X-Y+Z',
    position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`
  });

  modelViewer5.updateHotspot({
    name: 'hotspot-dim+X-Y',
    position: `${center.x + x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`
  });
  modelViewer5.querySelector('button[slot="hotspot-dim+X-Y"]').textContent =
      `${(size.z * 100).toFixed(0)} cm`;

  modelViewer5.updateHotspot({
    name: 'hotspot-dot+X-Y-Z',
    position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`
  });

  modelViewer5.updateHotspot({
    name: 'hotspot-dim+X-Z',
    position: `${center.x + x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`
  });
  modelViewer5.querySelector('button[slot="hotspot-dim+X-Z"]').textContent =
      `${(size.y * 100).toFixed(0)} cm`;

  modelViewer5.updateHotspot({
    name: 'hotspot-dot+X+Y-Z',
    position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`
  });

  modelViewer5.updateHotspot({
    name: 'hotspot-dim+Y-Z',
    position: `${center.x} ${center.y + y2 * 1.1} ${center.z - z2 * 1.1}`
  });
  modelViewer5.querySelector('button[slot="hotspot-dim+Y-Z"]').textContent =
      `${(size.x * 100).toFixed(0)} cm`;

  modelViewer5.updateHotspot({
    name: 'hotspot-dot-X+Y-Z',
    position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`
  });

  modelViewer5.updateHotspot({
    name: 'hotspot-dim-X-Z',
    position: `${center.x - x2 * 1.2} ${center.y} ${center.z - z2 * 1.2}`
  });
  modelViewer5.querySelector('button[slot="hotspot-dim-X-Z"]').textContent =
      `${(size.y * 100).toFixed(0)} cm`;

  modelViewer5.updateHotspot({
    name: 'hotspot-dot-X-Y-Z',
    position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`
  });

  modelViewer5.updateHotspot({
    name: 'hotspot-dim-X-Y',
    position: `${center.x - x2 * 1.2} ${center.y - y2 * 1.1} ${center.z}`
  });
  modelViewer5.querySelector('button[slot="hotspot-dim-X-Y"]').textContent =
      `${(size.z * 100).toFixed(0)} cm`;

  modelViewer5.updateHotspot({
    name: 'hotspot-dot-X-Y+Z',
    position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`
  });

  renderSVG();
});

