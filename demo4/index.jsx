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
      direction: null,
    };
  },

  next (curr) {
    let keys = Object.keys(this.state.photos);
    let idx = keys.indexOf(curr);
    return keys[(idx + 1) % keys.length];
  },

  prev (curr) {
    let keys = Object.keys(this.state.photos);
    let idx = keys.indexOf(curr);
    return keys[(idx - 1 + keys.length) % keys.length];
  },

  componentWillMount: function() {
    document.addEventListener('keydown', ({which}) => {
      let {photos, currKey} = this.state;
      let keys = Object.keys(photos);

      if(which === 39) { // right
        this.setState({
          currKey: this.next(currKey),
          direction: 'left',
        });
      } else if (which === 37) { // left
        this.setState({
          currKey: this.prev(currKey),
          direction: 'right',
        });
      }
    });
  },

  render: function() {
    let {photos, currKey, direction} = this.state;

    return (
      <Springs
        // style={{overflow: 'hidden', outline: '1px solid black'}}
        className="demo4"
        finalVals={(currVals, tween) => {
          let [width, height] = photos[currKey];
          let configs = {
            [currKey]: {
              left: 0,
              height: height,
              width: width,
            }
          };
          return tween(configs);
        }}
        onRemove={(key, tween, destVals, currVals, currV) => {
          if (direction === 'left') {
            let [width, height] = photos[key];
            let destHeight = photos[this.next(key)][1];
            let destWidth = destHeight / height * width;
            let currLeftEdge = currVals[key].left;
            return currLeftEdge <= -destWidth ?
              null :
              tween({
                left: -destWidth,
                height: destHeight,
                width: destWidth,
              });
          } else if (direction === 'right') {
            let [width, height] = photos[key];
            let destHeight = photos[this.prev(key)][1];
            let destWidth = destHeight / height * width;
            let currLeftEdge = currVals[key].left;
            return currLeftEdge >= photos[this.prev(key)][0] ?
              null :
              tween({
                left: photos[this.prev(key)][0],
                height: destHeight,
                width: destWidth,
              });
          }
        }}
        onAdd={(key, destVals, currVals) => {
          if (direction === 'right') {
            let [width, height] = photos[key];
            let initHeight = currVals[this.next(key)].height;
            let initWidth = initHeight / height * width;
            return {
              left: currVals[this.next(key)].left - initWidth,
              height: initHeight,
              width: initWidth,
            };
          } else if (direction === 'left') {
            let [width, height] = photos[key];
            let initHeight = currVals[this.prev(key)].height;
            let initWidth = initHeight / height * width;
            return {
              left: currVals[this.prev(key)].left + currVals[this.prev(key)].width,
              height: initHeight,
              width: initWidth,
            };
          }
        }}>
        {configs => {
          // height: configs[Object.keys(configs)[0]].height,
          // width: configs[Object.keys(configs)[0]].width,
          let [width, height] = photos[currKey];
          let s = {
            width: width,
            height: 999,
            overflow: 'hidden',
            // outline: '1px solid black',
            position: 'relative',
          };
          return (
            <div style={s}>
              {Object.keys(configs).map(key => {
                let s = {
                  position: 'absolute',
                };
                return (
                  <img src={key} style={{...s, ...configs[key]}}/>
                );
              })}
            </div>
          );
        }}
      </Springs>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
