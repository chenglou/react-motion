/* eslint-disable */

// webpack trying to bundle babel errors, haven't checked why too much
import babel from 'babel-browser-transform/dist/babel-browser-transform';
import CodeMirror from 'react-codemirror';
// import React from 'react';
const React = require('react');
const {Spring} = require('../../src/Spring');
// import {Spring} from '../../src/Spring';
// loads js syntax
import 'codemirror/mode/javascript/javascript';
// import l from '../../src/log';

const Demo = React.createClass({
  getInitialState() {
    return {
      code: 'asd',
    };
  },

  componentDidMount() {
    // this.makeHot = window.ReactHotAPI(() => [React.findDOMNode(this.refs.mountNode)]);
    // console.log(this.makeHot,' ========');
    this.evalCode();
  },

  componentDidUpdate() {
    this.evalCode();
  },

  evalCode() {
    const {code} = this.state;
    const mountNode = React.findDOMNode(this.refs.mountNode);
    if (code === '') {
      React.render(<div>Display here</div>, mountNode);
      return;
    }

    try {
      // const makeHot = this.makeHot;
      const jsCode = babel.transform(code).code;
      // this needs mountNode to be available
      eval(jsCode);
      // eval([
      //   'if (module.exports) {',
      //   '  module.exports = makeHot(module.exports, "module.exports");',
      //   '  React.render(React.createElement(Demoa), mountNode);',
      //   '}'
      // ].join('\n'));
    } catch (e) {
      React.render(<div className="demo6-error">Something went wrong.{e.toString()}</div>, mountNode);
    }
  },

  updateCode(newCode) {
    this.setState({
      code: newCode,
    });
  },

  render() {
    const {code} = this.state;

    return (
      <div>
        <CodeMirror
          value={code}
          onChange={this.updateCode}
          options={{
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            // javascript mode does bad things with jsx indents last time I checked
            smartIndent: false,
            matchBrackets: true,
            theme: 'monokai',
          }} />

        <div ref="mountNode"></div>
      </div>
    );
  },
});

export default Demo;
