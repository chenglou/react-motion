import CodeMirror from 'react-codemirror';
import React from 'react';
import {Spring} from '../../src/Spring';
// loads js syntax
import 'codemirror/mode/javascript/javascript';
// import l from '../../src/log';

const Demo = React.createClass({
  getInitialState() {
    return {
      code: 'asd',
    };
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

        <Spring endValue={{val: parseInt(code, 10) || 0}}>
          {({val}) =>
            <div>{val}</div>
          }
        </Spring>
      </div>
    );
  },
});

export default Demo;
