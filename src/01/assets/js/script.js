import { WebGLUtility, ShaderProgram } from '/assets/lib/webgl.js';

window.addEventListener(
  'DOMContentLoaded',
  async () => {
    const app = new WebGLApp();
    window.addEventListener('resize', app.resize, false);
    app.init('webgl-canvas');
    await app.load();
    app.setup();
    app.render();
  },
  false
);

class WebGLApp {
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.running = false;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    this.uPointSize = 2.0;
    this.uProgressIndex = 0;
  }

  init(canvas, options = {}) {
    if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if (c instanceof HTMLCanvasElement === true) {
        this.canvas = c;
      }
    }

    if (this.canvas === null) {
      throw new Error('invalid argument');
    }

    this.gl = this.canvas.getContext('webgl', options);
    if (this.gl === null) {
      throw new Error('webgl not supported');
    }
  }

  async load() {
    const vs = await WebGLUtility.loadFile('./assets/shader/main.vert');
    const fs = await WebGLUtility.loadFile('./assets/shader/main.frag');

    this.shaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: vs,
      fragmentShaderSource: fs,
      attribute: ['position', 'idx'],
      stride: [3, 1],
      uniform: ['pointScale', 'progressIndex'],
      type: ['uniform1f', 'uniform3fv'],
    });
  }

  setup() {
    this.setupGeometry();
    this.resize();
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.running = true;
  }

  setupGeometry() {
    // 黄金比
    const phi = (1 + Math.sqrt(5)) / 2;
    // フェルマー螺旋
    const N = 1;
    const M = phi;
    const PI_2 = Math.PI * 2;
    const MIN = 0;
    const MAX = 999;
    const MAX_VALUE = Math.sqrt(MAX);

    const calcPosition = (n = 0) => {
      const r = Math.sqrt(n) / MAX_VALUE;
      const x = r * Math.cos((n * PI_2 * N) / M) * 0.9;
      const y = r * Math.sin((n * PI_2 * N) / M) * 0.9;
      return { x, y };
    };

    this.position = [];
    this.idx = [];
    for (let i = MIN; i < MAX; i++) {
      const { x, y } = calcPosition(i);
      this.position.push(x, y, 0.0);
      this.idx.push(i);
    }
    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.position),
      WebGLUtility.createVbo(this.gl, this.idx),
    ];
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  render() {
    const gl = this.gl;

    if (this.running === true) {
      requestAnimationFrame(this.render);
    }

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.uProgressIndex += 1;
    this.uProgressIndex %= 999;
    const progressIndexArray = [
      this.uProgressIndex % 999,
      (this.uProgressIndex + 333) % 999,
      (this.uProgressIndex + 666) % 999,
    ];

    this.shaderProgram.use();
    this.shaderProgram.setAttribute(this.vbo);
    this.shaderProgram.setUniform([this.uPointSize, progressIndexArray]);

    gl.drawArrays(gl.POINTS, 0, this.position.length / 3);
  }
}
