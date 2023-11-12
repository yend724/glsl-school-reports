import path from 'path';
import glsl from 'vite-plugin-glsl';

const dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
  root: path.resolve(dirname, 'src'),
  build: {
    outDir: path.resolve(dirname, 'dist'),
    rollupOptions: {
      input: {
        index: path.resolve(dirname, 'src', 'index.html'),
      },
    },
  },
  plugins: [glsl()],
};
