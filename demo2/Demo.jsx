import React from 'react';
import Spring from '../Spring';
import {range, reinsert} from '../utils';

// TODO: start at center, not upper left
let allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A'
];
let [count, width, height, top, left] = [11, 70, 90, 100, 150];
// indexed by visual position
let layout = range(count).map(n => {
  let row = Math.floor(n / 3);
  let col = n % 3;
  return [width * col, height * row];
});

let Demo = React.createClass({
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
    let {order, lastPress, isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      let col = Math.min(Math.floor((pageX - left) / width), 2);
      let row = Math.min(Math.floor((pageY - top) / height), Math.floor(count / 3));
      let index = row * 3 + col;
      let newOrder = reinsert(order, order.indexOf(lastPress), index);
      this.setState({mouse: [pageX - dx, pageY - dy], order: newOrder});
    }
  },

  handleMouseDown(key, [pressX, pressY], {pageX, pageY}) {
    let dx = pageX - pressX;
    let dy = pageY - pressY;
    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [dx, dy],
      mouse: [pageX - dx, pageY - dy],
    });
  },

  handleMouseUp() {
    this.setState({isPressed: false, dx: 0, dy: 0});
  },

  getValues() {
    let {order, lastPress, isPressed, mouse} = this.state;
    return {
      order: order.map((_, key) => {
        if (key === lastPress && isPressed) {
          return {val: mouse, config: []};
        }
        let visualPosition = order.indexOf(key);
        return {val: layout[visualPosition], config: [120, 17]};
      }),
      scales: {
        val: range(count).map((_, key) => lastPress === key && isPressed ? 1.2 : 1),
        config: [180, 10],
      }
    };
  },

  render() {
    let {order, lastPress} = this.state;
    return (
      <Spring
        className="demo2"
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        endValue={this.getValues}>
        {({order: currOrder, scales: {val: scales}}) => currOrder.map(({val: [x, y]}, key) =>
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
      </Spring>
    );
  }
});

export default Demo;
