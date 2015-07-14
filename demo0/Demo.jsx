import React from 'react';
import {Spring} from '../Spring';

const Demo = React.createClass({
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
        <Spring endValue={{val: this.state.open ? 400 : 0}}>
          {({val}) =>
            // children is a callback which should accept the current value of
            // `endValue`
            <div className="demo0">
              <div className="demo0-block" style={{
                WebkitTransform: `translate3d(${val}px, 0, 0)`,
                transform: `translate3d(${val}px, 0, 0)`,
              }} />
            </div>
          }
        </Spring>
      </div>
    );
  },
});

export default Demo;
