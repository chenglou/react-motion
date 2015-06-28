'use strict';

import React from 'react';
import Springs from './Springs';
import {range, reinsert} from './utils';

let allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A'
];
let [count, width, height] = [11, 70, 90];
// indexed by visual position
let layout = range(count).map(n => {
  let row = Math.floor(n / 3);
  let col = n % 3;
  return [width * col, height * row];
});

export default React.createClass({
  getInitialState: function() {
    return {
      mouse: [0, 0],
      delta: [0, 0], // difference between mouse and circle pos, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      order: range(count), // index: visual position. value: component key/id
    };
  },

  handleMouseMove: function(e) {
    let {pageX, pageY} = e;
    let {order, lastPress, isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      let col = Math.min(Math.floor(pageX / width), 2);
      let row = Math.min(Math.floor(pageY / height), Math.floor(count / 3));
      let index = row * 3 + col;
      let newOrder = reinsert(order, order.indexOf(lastPress), index);
      this.setState({mouse: [pageX - dx, pageY - dy], order: newOrder});
    }
  },

  handleMouseDown: function(key, e) {
    let {pageX, pageY} = e;
    let col = Math.min(Math.floor(pageX / width), 2);
    let row = Math.min(Math.floor(pageY / height), Math.floor(count / 3));
    let dx = pageX - col * width;
    let dy = pageY - row * height;

    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [dx, dy],
      mouse: [pageX - dx, pageY - dy],
    });
  },

  handleMouseUp: function() {
    this.setState({isPressed: false, dx: 0, dy: 0});
  },

  render: function() {
    let {mouse, order, lastPress, isPressed} = this.state;
    return (
      <div
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        className="demo1">
        <Springs finalVals={(_, update) => {
          return {
            order: update(order.map((_, key) => {
              if (key === lastPress && isPressed) {
                // children update takes priority. k=-1 or b=-1 cancels spring
                // (act as "un-update"ing a subtree)
                return update(mouse, -1, -1);
              }
              let visualPosition = order.indexOf(key);
              return layout[visualPosition];
            })),
            scales: update(
              range(count).map((_, key) => lastPress === key && isPressed ? 1.2 : 1),
              180,
              10
            ),
          };
        }}>
          {({order, scales}) => order.map(([x, y], key) =>
            <div
              key={key}
              onMouseDown={this.handleMouseDown.bind(null, key)}
              className="demo1-circle"
              style={{
                backgroundColor: allColors[key],
                WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${scales[key]})`,
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scales[key]})`,
                zIndex: key === lastPress ? 99 : 1,
                boxShadow: `${(x - (3 * width - 50) / 2) / 15}px 5px 5px rgba(0,0,0,0.5)`,
              }}
            />
          )}
        </Springs>
      </div>
    );
  }
});
