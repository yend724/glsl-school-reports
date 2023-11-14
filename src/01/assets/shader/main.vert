attribute vec3 position;
attribute float idx;

uniform float pointScale;
uniform vec3 progressIndex;

varying vec3 vColor;

void main() {
  float progress1 = step(idx, progressIndex[0]);
  float progress2 = step(idx, progressIndex[1]);
  float progress3 = step(idx, progressIndex[2]);
  float r = progress1 * 0.5 + 0.5;
  float g = progress2;
  float b = 1.0 - progress3 * 0.5;
  vColor = vec3(r, g, b);
  gl_Position = vec4(position, 1.0);
  gl_PointSize = pointScale + progress1 + progress2 + progress3;
}
