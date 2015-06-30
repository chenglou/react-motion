'use strict';

import React from 'react';
import Springs from '../Springs';

let Demo = React.createClass({
  getInitialState: function() {
    return {
      photos: {
        './download1.jpeg': [800, 600],
        './download2.jpeg': [800, 400],
        './download3.jpeg': [700, 500],
      },
      currKey: './download1.jpeg',
      direction: 'left'
    };
  },

  componentWillMount: function() {
    document.addEventListener('keydown', this.handleKeyDown);
  },

  handleKeyDown: function({which}) {
    let {photos, currKey} = this.state;
    let keys = Object.keys(photos);

    if(which === 39) { // right
      this.setState({
        currKey: keys[(keys.indexOf(currKey) + 1 + keys.length) % keys.length],
        direction: 'right'
      });
    } else if (which === 37) { // left
      this.setState({
        currKey: keys[(keys.indexOf(currKey) - 1 + keys.length) % keys.length],
        direction: 'left'
      });
    }
  },

  render: function() {
    let {photos, currKey, direction} = this.state;

    let s = {

    };

    return (
      <Springs
        style={{width: photos[currKey][0], height: photos[currKey][1], overflow: 'hidden', outline: '1px solid black'}}
        className="demo4"
        finalVals={(currVals, tween) => {
          let configs = {
            [currKey]: {
              left: 0,
              width: photos[currKey][0],
              height: photos[currKey][1],
            }
          };
          return tween(configs);
        }}
        onRemove={(key, tween, destVals, currVals, currV) => {
          let left = direction === 'right' ? -photos[key][0] : photos[key][0];
          return currVals[key].left === left && currV[key].left === 0 ?
            null :
            tween({
              left: left,
              width: photos[currKey][0],
              height: photos[currKey][1],
            });
        }}
        onAdd={() => {
          return {
            left: direction === 'right' ? photos[currKey][0] : -photos[currKey][0],
            width: photos[currKey][0],
            height: photos[currKey][1],
          };
        }}>
        {configs => {
          return Object.keys(configs).map(key => {
            // console.log(configs[currKey]);
            return (
              <img src={key} style={{...s, ...configs[currKey], left: configs[key].left}}/>
            );
          });
        }}
      </Springs>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
