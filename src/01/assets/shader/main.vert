attribute vec3 position;
attribute float idx;

uniform float pointScale;
uniform vec2 progressIndex;

varying vec3 vColor;

void main() {
  float progress1 = step(idx, progressIndex[0]);
  float progress2 = step(idx, progressIndex[1]);
  float r = progress2 - progress1;
  float g = 0.0;
  float b = 1.0 - r;
  vColor = vec3(r, g, b);
  gl_Position = vec4(position, 1.0);
  gl_PointSize = pointScale;
}
