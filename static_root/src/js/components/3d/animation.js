const modelViewer5 = document.querySelector('#change-speed-demo');
const speeds = [1, 2, 0.5, -1];

let i = 0;
const play = () => {
  modelViewer5.timeScale = speeds[i++%speeds.length];
  modelViewer5.play({repetitions: 1});
};
modelViewer5.addEventListener('load', play);
modelViewer5.addEventListener('finished', play);
