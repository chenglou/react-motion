import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';

const input = './src/react-motion.js';
const name = 'ReactMotion';
const globals = {
  react: 'React',
};

// treat as external "module/path" modules and reserved rollup paths
const external = (id) =>
  !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/');

const getBabelOptions = () => ({
  babelrc: false,
  exclude: '**/node_modules/**',
  babelHelpers: 'runtime',
  plugins: [
    ['@babel/proposal-class-properties', { loose: true }],
    ['transform-react-remove-prop-types', { mode: 'unsafe-wrap' }],
    ['@babel/transform-runtime', { useESModules: true }],
  ],
  presets: [
    [
      '@babel/env',
      { modules: false, loose: true, useBuiltIns: 'usage', corejs: '3' },
    ],
    '@babel/flow',
    '@babel/react',
  ],
});

const commonjsOptions = {
  include: '**/node_modules/**',
};

export default [
  {
    input,
    output: { file: 'build/react-motion.js', format: 'umd', name, globals },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(),
      babel(getBabelOptions()),
      commonjs(commonjsOptions),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        preventAssignment: true,
      }),
    ],
  },

  {
    input,
    output: { file: 'build/react-motion.min.js', format: 'umd', name, globals },
    external: Object.keys(globals),
    plugins: [
      nodeResolve(),
      babel(getBabelOptions()),
      commonjs(commonjsOptions),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      uglify(),
    ],
  },

  {
    input,
    output: { file: pkg.module, format: 'esm' },
    external,
    plugins: [babel(getBabelOptions())],
  },
];
