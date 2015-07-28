import React from 'react';
import {Spring} from '../../src/Spring';
import range from 'lodash.range';

const Demo = React.createClass({
  getInitialState() {
    return {mouse: [250, 300]};
  },

  handleMouseMove({pageX, pageY}) {
    this.setState({mouse: [pageX, pageY]});
  },

  handleTouchMove({touches}) {
    this.handleMouseMove(touches[0]);
  },

  getEndValue(prevValue) {
    // `prevValue` is the interpolated value of the last tick
    const endValue = prevValue.val.map(
      (_, i) => i === 0 ? this.state.mouse : prevValue.val[i - 1]
    );
    return {val: endValue, config: [120, 17]};
  },

  render() {
    return (
      <Spring
        defaultValue={{val: range(6).map(() => [0, 0])}}
        endValue={this.getEndValue}>
        {({val}) =>
          <div
            className="demo1"
            onMouseMove={this.handleMouseMove}
            onTouchMove={this.handleTouchMove}>
              {val.map(([x, y], i) =>
                <div
                  key={i}
                  className={`demo1-ball ball-${i}`}
                  style={{
                    WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                    transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                    zIndex: val.length - i,
                  }} />
              )}
          </div>
        }
      </Spring>
    );
  },
});

export default Demo;
