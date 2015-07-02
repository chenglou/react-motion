'use strict';

import React from 'react';
import Spring from '../Spring';
import {range} from '../utils';

let Demo = React.createClass({
  getInitialState: function() {
    return {mouse: [0, 0]};
  },

  handleMouseMove: function({pageX, pageY}) {
    this.setState({mouse: [pageX, pageY]});
  },

  getValues: function(tween, currentValues) {
    if (currentValues == null) {
      return range(6).map(() => [0, 0]);
    }
    return tween(currentValues.reduce((acc, _, i) => {
      return i === 0 ? [this.state.mouse] : [...acc, currentValues[i - 1]];
    }, []), 120, 17);
  },

  render: function() {
    return (
      <Spring className="demo1" values={this.getValues} onMouseMove={this.handleMouseMove}>
        {currentValues => currentValues.map(([x, y], i) => {
          return (
            <div
              key={i}
              className={`demo1-ball ball-${i}`}
              style={{
                WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                zIndex: currentValues.length - i,
              }} />
          );
        })}
      </Spring>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
