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
      React.render(
        <div className="demo6-error">Something went wrong.{e.message.split('\n')[0]}</div>,
        mountNode
      );
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
        <div className="nav-main" style={{
          // display: 'flex',
          width: '100%',
          outline: '1px solid black',
          display: 'flex',
          justifyContent: 'center',
          height: 50,
        }}>
          <div className="nav-inner" style={{
            width: 920,
            outline: '1px solid red',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <div style={{
              padding: '0 10px',
              lineHeight: '50px',
            }}>
              Docs
            </div>
            <div style={{
              padding: '0 10px',
              lineHeight: '50px',
            }}>
              Support
            </div>
            <div style={{
              padding: '0 10px',
              lineHeight: '50px',
            }}>
              Github
            </div>
          </div>
        </div>

        <div style={{
          outline: '1px solid red',
          paddingTop: 50,
        }}>
          <div ref="mountNode" style={{
            display: 'flex',
            justifyContent: 'center',
            fontWeight: 400,
            fontSize: '64px',
          }} />

          <div style={{
            textAlign: 'center',
          }}>
            A SPRING THAT SOLVES YOUR ANIMATION PROBLEMS
          </div>


          <div style={{
            width: 600,
            margin: '60px auto 0 auto',
          }}>
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
          </div>

        </div>

      </div>
    );
  },
});

export default Demo;
