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

  next: function(curr) {
    let keys = Object.keys(this.state.photos);
    let idx = keys.indexOf(curr);
    return keys[(idx + 1) % keys.length];
  },

  prev: function(curr) {
    let keys = Object.keys(this.state.photos);
    let idx = keys.indexOf(curr);
    return keys[(idx - 1 + keys.length) % keys.length];
  },

  componentWillMount: function() {
    document.addEventListener('keydown', ({which}) => {
      let {photos, currKey} = this.state;
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
        finalVals={(currVals, tween) => {
          let [width, height] = photos[currKey];
          let configs = {
            [currKey]: {
              left: 0,
              height: height,
              width: width,
            },
            // will never be diffed
            containerWidth: photos[currKey][0],
          };
          return tween(configs, 150, 23);
        }}
        onRemove={(key, tween, destVals, currVals) => {
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
              }, 150, 23);
          } else if (direction === 'right') {
            let [width, height] = photos[key];
            let prevPhoto = photos[this.prev(key)];
            let destHeight = prevPhoto[1];
            let destWidth = destHeight / height * width;
            let currLeftEdge = currVals[key].left;
            return currLeftEdge >= prevPhoto[0] ?
              null :
              tween({
                left: prevPhoto[0],
                height: destHeight,
                width: destWidth,
              }, 150, 23);
          }
        }}
        onAdd={(key, destVals, currVals) => {
          if (direction === 'right') {
            let [width, height] = photos[key];
            let currNextPhoto = currVals[this.next(key)];
            let initHeight = currNextPhoto.height;
            let initWidth = initHeight / height * width;
            return {
              left: currNextPhoto.left - initWidth,
              height: initHeight,
              width: initWidth,
            };
          } else if (direction === 'left') {
            let [width, height] = photos[key];
            let currPrevPhoto = currVals[this.prev(key)];
            let initHeight = currPrevPhoto.height;
            let initWidth = initHeight / height * width;
            return {
              left: currPrevPhoto.left + currPrevPhoto.width,
              height: initHeight,
              width: initWidth,
            };
          }
        }}>
        {({containerWidth, ...rest}) => {
          return (
            <div className="demo4" style={{width: containerWidth}}>
              {Object.keys(rest).map(key =>
                <img className="demo4-photo" src={key} style={rest[key]} />
              )}
            </div>
          );
        }}
      </Springs>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
