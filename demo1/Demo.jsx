import React from 'react';
import Spring from '../Spring';
import {range} from '../utils';

let Demo = React.createClass({
  getInitialState() {
    return {mouse: [0, 0]};
  },

  handleMouseMove({pageX, pageY}) {
    this.setState({mouse: [pageX, pageY]});
  },

  handleTouchMove({touches}) {
    this.handleMouseMove(touches[0]);
  },

  getValues(tween, positions) {
    // positions of `null` means it's the first render for Spring
    if (positions == null) {
      return range(6).map(() => [0, 0]);
    }
    let endValue = positions.reduce((acc, _, i) => {
      return i === 0 ? [this.state.mouse] : [...acc, positions[i - 1]];
    }, []);
    // `tween` is a function passed to you for tweaking your collection's spring
    // constants. 120 is the stiffness, 17 is the damping. This will tween every
    // number in your collection.
    return tween(endValue, 120, 17);
  },

  render() {
    return (
      <Spring
        className="demo1"
        endValue={this.getValues}
        onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleTouchMove}>
        {positions => positions.map(([x, y], i) =>
          <div
            key={i}
            className={`demo1-ball ball-${i}`}
            style={{
              WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
              transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
              zIndex: positions.length - i,
            }} />
        )}
      </Spring>
    );
  }
});

export default Demo;
