// import gsap from 'gsap';
// import { Pane } from 'tweakpane';
import { WebGLUtility, ShaderProgram } from '/assets/lib/webgl.js';
import { WebGLOrbitCamera } from '/assets/lib/camera';
import { WebGLMath } from '/assets/lib/math.js';
import VertexShader from '../shader/main.vert';
import FragmentShader from '../shader/main.frag';
import SampleImg01 from '../img/sample01.png';

const info = document.querySelector('#info');

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
  /**
   * @constructor
   */
  constructor() {
    // 汎用的なプロパティ
    this.canvas = null;
    this.gl = null;
    this.running = false;

    // this を固定するためメソッドをバインドする
    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    // 各種パラメータや uniform 変数用
    this.previousTime = 0; // 直前のフレームのタイムスタンプ
    this.uTime = 0.0; // uniform 変数 time 用
    this.uMouse = [0.0, 0.0]; // マウス座標用
    this.uVelocity = [0.0, 0.0]; // uniform 変数 velocity 用

    // tweakpane を初期化
    // const pane = new Pane();
    // pane
    //   .addBlade({
    //     view: 'list',
    //     label: 'monochrome',
    //     options: [
    //       { text: 'monochrome-0', value: 0 },
    //       { text: 'monochrome-1', value: 1 },
    //     ],
    //     value: 0,
    //   })
    //   .on('change', v => {
    //     const gl = this.gl;
    //     gl.activeTexture(gl.TEXTURE2);
    //     gl.bindTexture(gl.TEXTURE_2D, this.monochrome[v.value]);
    //   });

    window.addEventListener(
      'pointermove',
      mouseEvent => {
        const x = mouseEvent.pageX / window.innerWidth;
        const y = mouseEvent.pageY / window.innerHeight;
        const signedX = x;
        const signedY = y;
        this.uMouse[0] = signedX;
        this.uMouse[1] = signedY; // スクリーン空間とは正負が逆

        this.uVelocity[0] = mouseEvent.movementX ?? 0;
        this.uVelocity[1] = mouseEvent.movementY ?? 0;
      },
      false
    );
  }
  /**
   * シェーダやテクスチャ用の画像など非同期で読み込みする処理を行う。
   * @return {Promise}
   */
  async load() {
    this.shaderProgram = new ShaderProgram(this.gl, {
      vertexShaderSource: VertexShader,
      fragmentShaderSource: FragmentShader,
      attribute: ['position', 'texCoord'],
      stride: [3, 2],
      uniform: ['mvpMatrix', 'textureUnit0', 'time', 'mouse', 'velocity'],
      type: [
        'uniformMatrix4fv',
        'uniform1i',
        'uniform1f',
        'uniform2fv',
        'uniform2fv',
      ],
    });

    this.texture0 = await WebGLUtility.createTextureFromFile(
      this.gl,
      SampleImg01
    );
  }
  /**
   * WebGL のレンダリングを開始する前のセットアップを行う。
   */
  setup() {
    const gl = this.gl;

    const fov = 60;
    const fovRad = fov * 0.5 * (Math.PI / 180);
    const aspect = window.innerHeight / window.innerWidth;
    const dist = ((2 * 0.5) / Math.tan(fovRad)) * Math.min(aspect, 1.0);

    const cameraOption = {
      distance: dist,
      min: dist,
      max: dist,
      move: 2.0,
    };
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption);

    this.setupGeometry();
    this.resize();
    this.running = true;
    this.previousTime = Date.now();

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    // 3つのユニットにそれぞれテクスチャをバインドしておく
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texture1);
  }
  /**
   * ジオメトリ（頂点情報）を構築するセットアップを行う。
   */
  setupGeometry() {
    // 頂点座
    // prettier-ignore
    this.position = [
      -1.0,  1.0,  0.0,
       1.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0,
    ];
    // テクスチャ座
    // prettier-ignore
    this.texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];
    // すべての頂点属性を VBO にしておく
    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.position),
      WebGLUtility.createVbo(this.gl, this.texCoord),
    ];
  }
  /**
   * WebGL を利用して描画を行う。
   */
  render() {
    // 短く書けるようにローカル変数に一度代入する
    const gl = this.gl;
    const m4 = WebGLMath.Mat4;
    const v3 = WebGLMath.Vec3;

    if (Math.abs(this.uVelocity[0]) > 0.001) {
      this.uVelocity[0] *= 0.9;
    } else {
      this.uVelocity[0] = 0;
    }
    if (Math.abs(this.uVelocity[1]) > 0.001) {
      this.uVelocity[1] *= 0.9;
    } else {
      this.uVelocity[1] = 0;
    }

    info.textContent = `uMouse: ${this.uMouse[0]}, ${this.uMouse[1]}\nuVelocity: ${this.uVelocity[0]}, ${this.uVelocity[1]}`;

    // running が true の場合は requestAnimationFrame を呼び出す
    if (this.running === true) {
      requestAnimationFrame(this.render);
    }

    // 直前のフレームからの経過時間を取得
    const now = Date.now();
    const time = (now - this.previousTime) / 1000;
    this.uTime += time;
    this.previousTime = now;

    // ビューポートの設定と背景色・深度値のクリア
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // - 各種行列を生成する ---------------------------------------------------
    // モデル座標変換行列
    const rotateAxis = v3.create(0.0, 1.0, 0.0);
    const m = m4.rotate(m4.identity(), 0, rotateAxis);

    // ビュー座標変換行列（WebGLOrbitCamera から行列を取得する）
    const v = this.camera.update();

    // プロジェクション座標変換行列
    const fovy = 60; // 視野角（度数）
    const aspect = this.canvas.width / this.canvas.height; // アスペクト比
    const near = 0.1; // ニア・クリップ面までの距離
    const far = 10.0; // ファー・クリップ面までの距離
    const p = m4.perspective(fovy, aspect, near, far);

    // 行列を乗算して MVP 行列を生成する（行列を掛ける順序に注意）
    const vp = m4.multiply(p, v);
    const mvp = m4.multiply(vp, m);
    // ------------------------------------------------------------------------

    // プログラムオブジェクトを指定し、VBO と uniform 変数を設定
    this.shaderProgram.use();
    this.shaderProgram.setAttribute(this.vbo);
    this.shaderProgram.setUniform([
      mvp,
      0,
      this.uTime,
      this.uMouse,
      this.uVelocity,
    ]);

    // 設定済みの情報を使って、頂点を画面にレンダリングする
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.position.length / 3);
  }
  /**
   * リサイズ処理を行う。
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  /**
   * WebGL を実行するための初期化処理を行う。
   * @param {HTMLCanvasElement|string} canvas - canvas への参照か canvas の id 属性名のいずれか
   * @param {object} [option={}] - WebGL コンテキストの初期化オプション
   */
  init(canvas, option = {}) {
    if (canvas instanceof HTMLCanvasElement === true) {
      this.canvas = canvas;
    } else if (Object.prototype.toString.call(canvas) === '[object String]') {
      const c = document.querySelector(`#${canvas}`);
      if (c instanceof HTMLCanvasElement === true) {
        this.canvas = c;
      }
    }
    if (this.canvas == null) {
      throw new Error('invalid argument');
    }
    this.gl = this.canvas.getContext('webgl', option);
    if (this.gl == null) {
      throw new Error('webgl not supported');
    }
  }
}
