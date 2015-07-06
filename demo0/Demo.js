import React from 'react';
import {Spring} from '../src';

let Demo = React.createClass({
  getInitialState() {
    return {open: false};
  },

  handleMouseDown() {
    this.setState({open: !this.state.open});
  },

  render() {
    return (
      <div>
        <button onMouseDown={this.handleMouseDown}>Toggle</button>
        <Spring className="demo0" endValue={this.state.open ? 400 : 0}>
          {x =>
            // children is a callback which should accept the current value of
            // `endValue`
            <div className="demo0-block" style={{
              WebkitTransform: `translate3d(${x}px, 0, 0)`,
              transform: `translate3d(${x}px, 0, 0)`,
            }} />
          }
        </Spring>
      </div>
    );
  },
});

export default Demo;
