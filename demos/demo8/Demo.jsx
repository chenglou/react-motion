import React from 'react';
import {Spring} from '../../src/Spring';
import range from 'lodash.range';

function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const Demo = React.createClass({
  getInitialState() {
    return {
      delta: 0,
      mouse: 0,
      isPressed: false,
      lastPressed: 0,
      order: range(4),
    };
  },

  handleMouseDown(pos, pressY, {pageY}) {
    this.setState({
      delta: pageY - pressY,
      mouse: pressY,
      isPressed: true,
      lastPressed: pos,
    });
  },

  handleMouseMove({pageY}) {
    const {isPressed, delta, order, lastPressed} = this.state;
    if (isPressed) {
      const mouse = pageY - delta;
      const row = clamp(Math.round(mouse / 100), 0, 3);
      const newOrder = reinsert(order, order.indexOf(lastPressed), row);
      this.setState({mouse: mouse, order: newOrder});
    }
  },

  handleMouseUp() {
    this.setState({
      isPressed: false,
      delta: 0,
    });
  },

  render() {
    const {
      mouse, isPressed, lastPressed, order,
    } = this.state;

    let endValue = order.map((n, i) => {
      if (lastPressed === i && isPressed) {
        return {
          scale: {val: 1.1, config: [300, 50]},
          shadow: {val: 16, config: [300, 50]},
          y: {val: mouse, config: []},
        };
      }
      return {
        scale: {val: 1, config: [300, 50]},
        shadow: {val: 1, config: [300, 50]},
        y: {val: order.indexOf(i) * 100, config: [300, 50]},
      };
    });

    return (
      <div
        className="demo8"
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        <Spring endValue={endValue}>
          {items =>
            <div className="demo8-inner">
              {items.map(({scale, shadow, y}, n) => {
                return (
                  <div
                    key={n}
                    className="demo8-item"
                    onMouseDown={this.handleMouseDown.bind(null, n, y.val)}
                    style={{
                      boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow.val}px ${2 * shadow.val}px 0px`,
                      transform: `translate3d(0, ${y.val}px, 0) scale(${scale.val})`,
                      WebkitTransform: `translate3d(0, ${y.val}px, 0) scale(${scale.val})`,
                      zIndex: n === lastPressed ? 99 : n,
                    }}>
                    {order.indexOf(n) + 1}
                  </div>
                );
              })}
            </div>
          }
        </Spring>
      </div>
    );
  },
});

export default Demo;
