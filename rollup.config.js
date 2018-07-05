import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { uglify } from 'rollup-plugin-uglify';

const input = './src/react-motion.js';
const name = 'ReactMotion';
const globals = {
  react: 'React'
};

const getBabelOptions = () => ({
  exclude: '**/node_modules/**'
});

const getCommonjsOptions = () => ({
  include: '**/node_modules/**'
});

export default [
  {
    input,
    output: { file: 'build/react-motion.js', format: 'umd', name, globals },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(),
      babel(getBabelOptions()),
      commonjs(getCommonjsOptions()),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      sizeSnapshot()
    ]
  },

  {
    input,
    output: { file: 'build/react-motion.min.js', format: 'umd', name, globals },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(),
      babel(getBabelOptions()),
      commonjs(getCommonjsOptions()),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      sizeSnapshot(),
      uglify()
    ]
  },

];
