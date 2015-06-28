'use strict';

import React from 'react';
import Springs from './Springs';
import {range, clone} from './utils';

let ALLCOLORS = ['#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A'];

let COUNT = 11;
let CELLX = 70;
let CELLY = 90;

// indexed by visual position
let layout = range(COUNT).map(n => {
  let row = Math.floor(n / 3);
  let col = n % 3;
  return [CELLX * col, CELLY * row];
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
      diffX: 0,
      diffY: 0
    };
  },

  handleMouseMove: function(e) {
    let {pageX, pageY} = e;
    let {order, lastPressedComp, isPressed, diffX, diffY} = this.state;
    if (isPressed) {
      let col = Math.min(Math.floor(pageX / CELLX), 2);
      let row = Math.min(Math.floor(pageY / CELLY), Math.floor(Object.keys(order).length / 3));
      let index = row * 3 + col;
      let newOrder = reinsert(order, order.indexOf(lastPressedComp), index);
      this.setState({mouseX: pageX - diffX, mouseY: pageY - diffY, order: newOrder});
    } else {
      this.setState({mouseX: pageX, mouseY: pageY});
    }
  },

  handleMouseDown: function(key, e) {
    let {pageX, pageY} = e;
    let col = Math.min(Math.floor(pageX / CELLX), 2);
    let row = Math.min(Math.floor(pageY / CELLY), Math.floor(Object.keys(this.state.order).length / 3));
    let [diffX, diffY] = [pageX - col * CELLX, pageY - row * CELLY];

    this.setState({
      lastPressedComp: key,
      isPressed: true,
      diffX: diffX,
      diffY: diffY,
      mouseX: pageX - diffX,
      mouseY: pageY - diffY,
    });
  },

  handleMouseUp: function() {
    this.setState({isPressed: false, diffX: 0, diffY: 0});
  },

  render: function() {
    let {mouseX, mouseY, diffX, diffY, order, lastPressedComp, isPressed} = this.state;
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
      display: 'table',
      textAlign: 'center'
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
                  backgroundColor: ALLCOLORS[key],
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  zIndex: key === lastPressedComp ? 99 : 1,
                  WebkitBoxShadow: `${(x - (3 * CELLX - 50) / 2) / 15}px 5px 5px 0px rgba(0,0,0,0.50)`,
                  MozBoxShadow: `${(x - (3 * CELLX - 50) / 2) / 15}px 5px 5px 0px rgba(0,0,0,0.50)`,
                  boxShadow: `${(x - (3 * CELLX - 50) / 2) / 15}px 5px 5px 0px rgba(0,0,0,0.50)`
                }
              }></div>
            );
          });}
          }
        </Springs>
      </div>
    );
  }
});
