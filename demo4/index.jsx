'use strict';

import React from 'react';
import Springs from '../Springs';
import {clone} from '../utils';

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

  onMouseMove: function(e) {
    e.preventDefault();
    let {pageX} = e;
    let {isPressed, mouseX, diffX, currKey} = this.state;
    if(isPressed) {
      if(pageX - diffX > mouseX) { // moving to the right
        this.setState({
          direction: 'right',
          mouseX: pageX - diffX
        });
      } else {
        this.setState({
          direction: 'left',
          mouseX: pageX - diffX
        });
      }
    }
  },

  onTouchMove: function(e) {
    e.preventDefault();
    this.onMouseMove(e.touches[0]);
  },

  onMouseDown: function(left, e) {
    e.preventDefault();
    let {pageX} = e;
    let diffX = pageX - left;
    this.setState({
      diffX: diffX,
      isPressed: true,
      mouseX: pageX - diffX,
      direction: 'right'
    });
  },

  onTouchStart: function(left, {touches: [first]}) {
    this.onMouseDown(left, first);
  },

  onMouseUp: function() {
    let {mouseX, currKey, photos} = this.state;
    if(mouseX + photos[currKey][0] < document.body.clientWidth * 2 / 3) { // some sort of middle point
      this.setState({
        isPressed: false,
        currKey: this.next(currKey),
        direction: 'left'
      });
    } else if (mouseX > document.body.clientWidth * 1 / 3) {
      this.setState({
        isPressed: false,
        currKey: this.prev(currKey),
        direction: 'right'
      });
    } else {
      this.setState({
        isPressed: false,
      });
    }
  },

  render: function() {
    let {photos, currKey, direction, mouseX, isPressed} = this.state;
    return (
      <Springs
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onMouseUp}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
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
        }}
        changeCurr={(currVals, currV) => {
          // 3 possibilities is currKey === 2
          // [1, 2] ----> if 2 is moving right
          // [2, 3] ----> if 2 is moving left
          // [1, 2, 3] ---> ?????
          if(isPressed) {
            let newCurrVals = clone(currVals);
            let newCurrV = clone(currV);

            let prev = this.prev(currKey);
            let next = this.next(currKey);

            let currWidth = photos[currKey][0];
            let currHeight = photos[currKey][1];

            let prevWidth = photos[prev][0];
            let prevHeight = photos[prev][1];

            let nextWidth = photos[next][0];
            let nextHeight = photos[next][1];

            let deltaX = mouseX / currWidth;

            let dir = direction === 'right' ? 1 : -1;

            newCurrV[currKey] = {
              left: 0,
              width: 0,
              height: 0,
            };

            newCurrV[prev] = {
              left: 0,
              width: 0,
              height: 0,
            };
            newCurrV[next] = {
              left: 0,
              width: 0,
              height: 0,
            };

            newCurrVals[prev] = {
              left: mouseX - dir * prevWidth,
              width: prevWidth,
              height: currHeight + dir * (prevHeight - currHeight) * deltaX
            };
            newCurrVals[next] = {
              left: mouseX + dir * currWidth,
              width: nextWidth,
              height: currHeight - dir * (nextHeight - currHeight) * deltaX,
            };
            newCurrVals[currKey] = {
              left: mouseX,
              width: currWidth,
              height: currHeight + dir * (prevHeight - currHeight) * deltaX,
            };

            return [newCurrVals, newCurrV];
          }

          return [currVals, currV];
        }}>
        {({containerWidth, ...rest}) => {
          return (
            <div className="demo4" style={{width: containerWidth}}>
              {Object.keys(rest).map(key =>
                <img
                  className="demo4-photo"
                  src={key}
                  style={rest[key]}
                  onMouseDown={this.onMouseDown.bind(null, rest[key].left)}
                  onTouchStart={this.onTouchStart.bind(null, rest[key].left)}/>
              )}
            </div>
          );
        }}
      </Springs>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
