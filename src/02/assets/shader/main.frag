precision mediump float;

uniform sampler2D textureUnit0;
uniform sampler2D textureUnit2;
uniform vec2 mouse;
uniform vec2 velocity;
uniform float time;

varying vec2 vTexCoord;

float split = 16.0;
float xSplitUnit = 1.0 / split;
float ySplitUnit = 1.0 / split;

void main() {
    vec2 vUv = vTexCoord;

    float xIndex = floor(vUv.x / xSplitUnit) / split + xSplitUnit * .5;
    float yIndex = floor(vUv.y / ySplitUnit) / split + ySplitUnit * .5;
    float len = length(mouse - vec2(xIndex, yIndex));

    vec4 offset = texture2D(textureUnit2, vUv);
    vec4 texture = texture2D(textureUnit0, vUv);

    texture = texture2D(textureUnit0, vUv - 0.02 * offset.rg * velocity * smoothstep(0.0, 0.25, max(0.25 - len, 0.0)));
    gl_FragColor = texture;
}

