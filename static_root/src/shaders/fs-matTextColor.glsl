uniform vec3 color;
uniform float opacity;
varying vec3 vColor;
pc_FragColor = vec4(vColor * color, opacity)               