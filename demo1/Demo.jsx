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

  getValues(update, currentPositions) {
    // currentPositions of `null` means it's the first render for Spring
    if (currentPositions == null) {
      return range(6).map(() => [0, 0]);
    }
    let endValue = currentPositions.reduce((acc, _, i) => {
      return i === 0 ? [this.state.mouse] : [...acc, currentPositions[i - 1]];
    }, []);
    // `update` is a function passed to you for tweaking your collection's spring
    // constants. 120 is the stiffness, 17 is the damping. This will update every
    // number in your collection.
    return update(endValue, 120, 17);
  },

  render() {
    return (
      <Spring
        className="demo1"
        endValue={this.getValues}
        onMouseMove={this.handleMouseMove}
        onTouchMove={this.handleTouchMove}>
        {currentPositions => currentPositions.map(([x, y], i) =>
          <div
            key={i}
            className={`demo1-ball ball-${i}`}
            style={{
              WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
              transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
              zIndex: currentPositions.length - i,
            }} />
        )}
      </Spring>
    );
  }
});

export default Demo;
