const { BABEL_ENV, NODE_ENV } = process.env;

const loose = true;
const modules = BABEL_ENV === 'cjs' || NODE_ENV === 'test' ? 'commonjs' : false;

const presets = [
  ['@babel/env', { loose, modules }],
  '@babel/react',
  '@babel/flow',
];

const plugins = [
  ['@babel/proposal-class-properties', { loose }],
  '@babel/proposal-object-rest-spread',
];

if (NODE_ENV === 'production') {
  plugins.push('@babel/transform-react-constant-elements');
  plugins.push('@babel/transform-react-inline-elements');
}

if (modules === 'commonjs') {
  plugins.push('add-module-exports');
}

module.exports = { presets, plugins }
