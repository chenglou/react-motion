import React from 'react';
import {Spring, utils} from '../../src/react-motion';

const {rgbToHex, interpolateColor} = utils.color;

const colors = {
  close: rgbToHex(130, 181, 198),
  open: rgbToHex(220, 57, 184),
};

const Demo = React.createClass({
  getInitialState() {
    return {open: false};
  },

  handleMouseDown() {
    this.setState({open: !this.state.open});
  },

  handleTouchStart(e) {
    e.preventDefault();
    this.handleMouseDown();
  },

  render() {
    return (
      <div>
        <button
          onMouseDown={this.handleMouseDown}
          onTouchStart={this.handleTouchStart}>
          Toggle
        </button>

        <Spring endValue={this.state.open ? 400 : 0}>
          {val =>
            // children is a callback which should accept the current value of
            // `endValue`
            <div className="demo0">
              <div className="demo0-block" style={{
                WebkitTransform: `translate3d(${val}px, 0, 0)`,
                transform: `translate3d(${val}px, 0, 0)`,
                backgroundColor: interpolateColor(val, colors.close, colors.open, 0, 400),
              }} />
            </div>
          }
        </Spring>
      </div>
    );
  },
});

export default Demo;
