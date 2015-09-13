import React from 'react';
import {Spring} from '../../src/react-motion';
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

const springConfig = [300, 50];
const itemsCount = 4;

const Demo = React.createClass({
  getInitialState() {
    return {
      delta: 0,
      mouse: 0,
      isPressed: false,
      lastPressed: 0,
      order: range(itemsCount),
    };
  },

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  },

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
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
      const row = clamp(Math.round(mouse / 100), 0, itemsCount - 1);
      const newOrder = reinsert(order, order.indexOf(lastPressed), row);
      this.setState({mouse: mouse, order: newOrder});
    }
  },

  handleMouseUp() {
    this.setState({isPressed: false, delta: 0});
  },

  render() {
    const {mouse, isPressed, lastPressed, order} = this.state;
    const endValue = range(itemsCount).map(i => {
      if (lastPressed === i && isPressed) {
        return {
          scale: {val: 1.1, config: springConfig},
          shadow: {val: 16, config: springConfig},
          y: {val: mouse, config: []},
        };
      }
      return {
        scale: {val: 1, config: springConfig},
        shadow: {val: 1, config: springConfig},
        y: {val: order.indexOf(i) * 100, config: springConfig},
      };
    });

    return (
      <Spring endValue={endValue}>
        {items =>
          <div className="demo8">
            {items.map(({scale, shadow, y}, n) =>
              <div
                key={n}
                className="demo8-item"
                onMouseDown={this.handleMouseDown.bind(null, n, y.val)}
                onTouchStart={this.handleTouchStart.bind(null, n, y.val)}
                style={{
                  boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow.val}px ${2 * shadow.val}px 0px`,
                  transform: `translate3d(0, ${y.val}px, 0) scale(${scale.val})`,
                  WebkitTransform: `translate3d(0, ${y.val}px, 0) scale(${scale.val})`,
                  zIndex: n === lastPressed ? 99 : n,
                }}>
                {order.indexOf(n) + 1}
              </div>
            )}
          </div>
        }
      </Spring>
    );
  },
});

export default Demo;
