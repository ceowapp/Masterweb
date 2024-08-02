<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Local Model Viewer</title>
</head>
<body>
  <input type="file" id="fileInput" accept=".glb, .gltf">
  <div id="modelViewer"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.min.js"></script>
  <script>
    const fileInput = document.getElementById('fileInput');
    const modelViewer = document.getElementById('modelViewer');

    fileInput.addEventListener('change', (event) => {
      const files = event.target.files;

      if (files && files.length > 0) {
        const file = files[0];
        const modelName = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target.result;
          displayModel(fileContent);
        };
        reader.readAsArrayBuffer(file);
      }
    });

    function displayModel(modelData) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      modelViewer.appendChild(renderer.domElement);

      const loader = new THREE.GLTFLoader();
      loader.parse(modelData, '', (gltf) => {
        scene.add(gltf.scene);
        camera.position.z = 5;

        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };

        animate();
      });
    }
  </script>
</body>
</html>
