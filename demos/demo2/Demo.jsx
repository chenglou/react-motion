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

// TODO: start at center, not upper left
const allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A',
];
const [count, width, height, top, left] = [11, 70, 90, 100, 150];
// indexed by visual position
const layout = range(count).map(n => {
  const row = Math.floor(n / 3);
  const col = n % 3;
  return [width * col, height * row];
});

const Demo = React.createClass({
  getInitialState() {
    return {
      mouse: [0, 0],
      delta: [0, 0], // difference between mouse and circle pos, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      order: range(count), // index: visual position. value: component key/id
    };
  },

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  },

  handleMouseMove({pageX, pageY}) {
    const {order, lastPress, isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      const col = clamp(Math.floor((pageX - left) / width), 0, 2);
      const row = clamp(Math.floor((pageY - top) / height), 0, Math.floor(count / 3));
      const index = row * 3 + col;
      const newOrder = reinsert(order, order.indexOf(lastPress), index);
      this.setState({mouse: [pageX - dx, pageY - dy], order: newOrder});
    }
  },

  handleMouseDown(key, [pressX, pressY], {pageX, pageY}) {
    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [pageX - pressX, pageY - pressY],
      mouse: [pressX, pressY],
    });
  },

  handleMouseUp() {
    this.setState({isPressed: false, delta: [0, 0]});
  },

  getValues() {
    const {order, lastPress, isPressed, mouse} = this.state;
    return {
      order: order.map((_, key) => {
        if (key === lastPress && isPressed) {
          return {val: mouse, config: []};
        }
        const visualPosition = order.indexOf(key);
        return {val: layout[visualPosition], config: [120, 17]};
      }),
      scales: {
        val: range(count).map((_, key) => lastPress === key && isPressed ? 1.2 : 1),
        config: [180, 10],
      },
    };
  },

  render() {
    const {order, lastPress} = this.state;
    return (
      <Spring endValue={this.getValues()}>
        {({order: currOrder, scales: {val: scales}}) =>
          <div
            className="demo2"
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}>
              {currOrder.map(({val: [x, y]}, key) =>
                <div
                  key={key}
                  onMouseDown={this.handleMouseDown.bind(null, key, [x, y])}
                  onTouchStart={this.handleTouchStart.bind(null, key, [x, y])}
                  className="demo2-ball"
                  style={{
                    backgroundColor: allColors[key],
                    WebkitTransform: `translate3d(${x + left}px, ${y + top}px, 0) scale(${scales[key]})`,
                    transform: `translate3d(${x + left}px, ${y + top}px, 0) scale(${scales[key]})`,
                    zIndex: key === lastPress ? 99 : order.indexOf(key),
                    boxShadow: `${(x - (3 * width - 50) / 2) / 15}px 5px 5px rgba(0,0,0,0.5)`,
                  }}
                />
              )}
          </div>
        }
      </Spring>
    );
  },
});

export default Demo;
