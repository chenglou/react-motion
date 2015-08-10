import React from 'react';
import {Spring} from '../../src/Spring';
import range from 'lodash.range';
import presets from '../../src/presets';

const Demo = React.createClass({
  getInitialState() {
    return {mouse: [250, 300]};
  },

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove);
  },

  handleMouseMove({pageX, pageY}) {
    this.setState({mouse: [pageX, pageY]});
  },

  handleTouchMove({touches}) {
    this.handleMouseMove(touches[0]);
  },

  getEndValue(prevValue) {
    // `prevValue` is the interpolated value of the last tick
    const endValue = prevValue.map((_, i) => {
      return i === 0
        ? {val: this.state.mouse, config: []}
        : {val: prevValue[i - 1].val, config: presets.gentle};
    });
    return endValue;
  },

  render() {
    return (
      <Spring
        defaultValue={range(6).map(() => ({val: [0, 0]}))}
        endValue={this.getEndValue}>
        {balls =>
          <div className="demo1">
            {balls.map(({val: [x, y]}, i) =>
              <div
                key={i}
                className={`demo1-ball ball-${i}`}
                style={{
                  WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                  transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                  zIndex: balls.length - i,
                }} />
            )}
          </div>
        }
      </Spring>
    );
  },
});

export default Demo;
