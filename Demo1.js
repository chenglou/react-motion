'use strict';

import React from 'react';
import Springs from './Springs';
import {range, clone} from './utils';

// indexed by visual position
let layout = range(11).map(n => {
  let row = Math.floor(n / 3);
  let col = n % 3;
  return [70 * col, 90 * row];
});

function reinsert(arr, from, to) {
  arr = clone(arr);
  let val = arr[from];
  arr.splice(from, 1);
  arr.splice(to, 0, val);
  return arr;
}

export default React.createClass({
  getInitialState: function() {
    return {
      mouseX: 0,
      mouseY: 0,
      pressedComp: null,
      // index: visual position. value: component key/id
      order: range(11),
    };
  },

  handleMouseMove: function(e) {
    let {pageX, pageY} = e;
    let {order, pressedComp} = this.state;
    if (pressedComp != null) {
      let col = Math.min(Math.floor(pageX / 70), 2);
      let row = Math.min(Math.floor(pageY / 90), Math.floor(Object.keys(order).length / 3));
      let index = row * 3 + col;
      let newOrder = reinsert(order, order.indexOf(pressedComp), index);
      this.setState({mouseX: pageX, mouseY: pageY, order: newOrder});
    } else {
      this.setState({mouseX: pageX, mouseY: pageY});
    }
  },

  handleMouseDown: function(key) {
    this.setState({pressedComp: key});
  },

  handleMouseUp: function() {
    this.setState({pressedComp: null});
  },

  render: function() {
    let {mouseX, mouseY, order, pressedComp} = this.state;
    let box = {
      width: 500,
      height: 600,
      backgroundColor: 'lightgray',
    };
    let s = {
      position: 'absolute',
      border: '1px solid black',
      borderRadius: 99,
      width: 50,
      height: 50,
      backgroundColor: 'red',
    };

    return (
      <div onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} style={box}>
        <Springs finalVals={(_, update) => {
          return {
            order: update(order.map((_, key) => {
              if (key === pressedComp) {
                // nested (children) update takes priority. k=0, b=1 makes
                // spring infinitely rigid
                return update([mouseX, mouseY], 0, 1);
              }
              let visualPosition = order.indexOf(key);
              return layout[visualPosition];
            })),
            scale: update(range(11).map((_, key) => pressedComp === key ? 1.2 : 1), 180, 10),
          };
        }}>
          {data => {
            return data.order.map(([x, y], key) => {
              if (key === 4) {
                // console.log(x, y, data.scale[key]);
              }
            return (
              <div
                key={key}
                onMouseDown={this.handleMouseDown.bind(null, key)}
                style={{
                  ...s,
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${data.scale[key]})`,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${data.scale[key]})`,
                  zIndex: key === pressedComp ? 99 : 1,
                }
              }>{key}</div>
            );
          });}
          }
        </Springs>
      </div>
    );
  }
});
