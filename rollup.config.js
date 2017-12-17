import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const config = {
  output: {
    format: 'umd',
    name: 'ReactMotion',
  },
  sourcemap: true,
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    nodeResolve(),
    commonjs(),
  ],
};

export default config;
