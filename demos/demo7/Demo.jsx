import React from 'react';
import {TransitionSpring} from '../../src/Spring';

const Demo = React.createClass({
  getInitialState() {
    return {
      delta: [0, 0],
      mouse: [0, 0],
      now: 't' + 0,
    };
  },

  handleMouseMove({pageX, pageY}) {
    console.log(pageX, pageY);
    this.setState(() => {
      return {
        mouse: [pageX - 25, pageY - 25],
        now: 't' + Date.now(),
      };
    });
  },

  willLeave(key, correspondingValueOfKeyThatJustLeft) {
    console.log(correspondingValueOfKeyThatJustLeft.x.val);
    return {
      ...correspondingValueOfKeyThatJustLeft,
      opacity: {val: 0, config: [60, 15]},
      scale: {val: 2, config: [60, 15]},
    };
  },

  render() {
    const {mouse: [x, y], now} = this.state;

    return (
      <div onMouseMove={this.handleMouseMove} style={{
        width: 500,
        height: 500,
        border: '1px solid black',
      }}>
        <TransitionSpring
          willLeave={this.willLeave}
          endValue={() => {
            return {
              [now]: {
                opacity: {val: 1, config: [60, 15]},
                scale: {val: 0, config: [60, 15]},
                x: {val: x, config: [60, 15]},
                y: {val: y, config: [60, 15]},
              },
            };
          }}>
          {
            circles =>
              <div>
                {
                  Object.keys(circles).map(key => {
                    const {opacity, scale, x, y} = circles[key];
                    return (
                      <div style={{
                        opacity: opacity.val,
                        scale: scale.val,
                        transform: `translate3d(${x.val}px, ${y.val}px, 0) scale(${scale.val})`,
                        border: '1px solid black',
                        borderRadius: 99,
                        width: 50,
                        height: 50,
                        position: 'absolute',
                      }} />
                    );
                  })
                }
              </div>
          }
        </TransitionSpring>
      </div>
    );
  },
});


export default Demo;
