attribute vec3 position;
attribute float idx;

uniform float pointScale;
uniform float progressIndex;

varying vec3 vColor;

void main() {
  float progress = step(idx, progressIndex);
  float r = 1.0;
  float g = 1.0 - progress;
  float b = 1.0 - progress;
  vColor = vec3(r, g, b);
  gl_Position = vec4(position, 1.0);
  gl_PointSize = pointScale + (progress * 4.0);
}
