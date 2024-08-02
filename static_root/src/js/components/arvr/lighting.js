const modelViewer3 = document.querySelector('#neutral-demo');
const checkbox3 = document.querySelector('#neutral');
checkbox3.addEventListener('change', () => {
    modelViewer3.environmentImage = checkbox3.checked ? null : 'legacy';
  });








