'use strict';

import React from 'react';
import Springs from './Springs';
import {range, clone} from './utils';

let COUNT = 11;
// indexed by visual position
let layout = range(COUNT).map(n => {
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
      lastPressedComp: null,
      isPressed: false,
      // index: visual position. value: component key/id
      order: range(COUNT),
    };
  },

  handleMouseMove: function(e) {
    let {pageX, pageY} = e;
    let {order, lastPressedComp, isPressed} = this.state;
    if (isPressed) {
      let col = Math.min(Math.floor(pageX / 70), 2);
      let row = Math.min(Math.floor(pageY / 90), Math.floor(Object.keys(order).length / 3));
      let index = row * 3 + col;
      let newOrder = reinsert(order, order.indexOf(lastPressedComp), index);
      this.setState({mouseX: pageX, mouseY: pageY, order: newOrder});
    } else {
      this.setState({mouseX: pageX, mouseY: pageY});
    }
  },

  handleMouseDown: function(key) {
    this.setState({lastPressedComp: key, isPressed: true});
  },

  handleMouseUp: function() {
    this.setState({isPressed: false});
  },

  render: function() {
    let {mouseX, mouseY, order, lastPressedComp, isPressed} = this.state;
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
              if (key === lastPressedComp && isPressed) {
                // nested (children) update takes priority. k=-1 or b=-1
                // cancels spring (act as "un-update"ing a subtree)
                return update([mouseX, mouseY], -1, -1);
              }
              let visualPosition = order.indexOf(key);
              return layout[visualPosition];
            })),
            scale: update(
              range(COUNT).map((_, key) => lastPressedComp === key && isPressed ? 1.2 : 1),
              180,
              10
            ),
            // talk about lifting do you even constant lift
          };
        }}>
          {data => {
            return data.order.map(([x, y], key) => {
              let scale = data.scale[key];
            return (
              <div
                key={key}
                onMouseDown={this.handleMouseDown.bind(null, key)}
                style={{
                  ...s,
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  zIndex: key === lastPressedComp ? 99 : 1,
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
