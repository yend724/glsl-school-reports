attribute vec3 position;
attribute float idx;

uniform float pointScale;
uniform float progressIndex;

varying vec3 vColor;

void main() {
  float p = step(idx, progressIndex);
  float r = p;
  float g = 0.5;
  float b = 1.0 - r;
  vColor = vec3(r, g, b);
  gl_Position = vec4(position, 1.0);
  gl_PointSize = pointScale + p * 3.0;
}