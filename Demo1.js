'use strict';

import React from 'react';
import Springs from './Springs';
import {range, clone} from './utils';

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
      press: null,
      // index: visual position. value: component key/id
      order: range(11),
    };
  },

  handleMouseMove: function(e) {
    let {pageX, pageY} = e;
    let {order, press} = this.state;
    if (press != null) {
      let col = Math.min(Math.floor(pageX / 70), 2);
      let row = Math.min(Math.floor(pageY / 90), Math.floor(Object.keys(order).length / 3));
      let index = row * 3 + col;
      let newOrder = reinsert(order, order.indexOf(press), index);
      this.setState({mouseX: pageX, mouseY: pageY, order: newOrder});
    } else {
      this.setState({mouseX: pageX, mouseY: pageY});
    }
  },

  handleMouseDown: function(key) {
    this.setState({press: key});
  },

  handleMouseUp: function() {
    this.setState({press: null});
  },

  render: function() {
    let {mouseX, mouseY, order, press} = this.state;
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
        <Springs finalVals={() => order.map((_, i) => layout[order.indexOf(i)])}>
          {
            currVals => currVals.map(([x, y], i) => {
              return (
                <div
                  key={i}
                  onMouseDown={this.handleMouseDown.bind(null, i)}
                  style={{
                    ...s,
                    WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                  }
                }>{i}</div>
              );
            })
          }
        </Springs>
      </div>
    );
  }
});
