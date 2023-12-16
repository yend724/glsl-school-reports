precision mediump float;

uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform vec2 mouse;
uniform float time;

varying vec2 vTexCoord;

void main() {
    vec2 vUv = vTexCoord;

    vec4 text01 = texture2D(textureUnit0, vUv);
    vec4 text02 = texture2D(textureUnit1, vUv);
    vec4 offset = texture2D(textureUnit2, vUv);

    float len = length(mouse - vUv);

    float dis = clamp(1.0 - len * 2.0, 0.0, 1.0);

    vec4 color1 = texture2D(textureUnit0,vUv - len * 0.2 * offset.rg * dis);
    vec4 color2 = texture2D(textureUnit1,vUv + len * 0.2 * offset.rg * dis);
    gl_FragColor = mix(color1, color2, mouse.x);
}

