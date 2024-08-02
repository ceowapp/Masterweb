const modelViewer4 = document.querySelector("#pickMaterial");

modelViewer4.addEventListener("load", () => {
  const changeColor = (event) => {
    const material = modelViewer4.materialFromPoint(event.clientX, event.clientY);
    if (material != null) {
      material.pbrMetallicRoughness.
        setBaseColorFactor([Math.random(), Math.random(), Math.random()]);
    }
  };

  modelViewer4.addEventListener("click", changeColor);
});
