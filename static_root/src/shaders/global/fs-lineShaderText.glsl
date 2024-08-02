uniform vec3 color;
uniform float opacity;
varying vec3 vNormal;
uniform vec3 emissiveColor;
varying vec3 vColor;

void main() {
    float strength = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
    gl_FragColor = vec4( vColor * color + emissiveColor * strength, opacity );
}

