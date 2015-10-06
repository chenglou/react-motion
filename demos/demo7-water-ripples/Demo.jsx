import React from 'react';
import {TransitionMotion, spring} from '../../src/react-motion';

const Demo = React.createClass({
  getInitialState() {
    return {mouse: [], now: 't' + 0};
  },

  handleMouseMove({pageX, pageY}) {
    // Make sure the state is queued and not batched.
    this.setState(() => {
      return {
        mouse: [pageX - 25, pageY - 25],
        now: 't' + Date.now(),
      };
    });
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  },

  willLeave(key, valOfKey) {
    return {
      ...valOfKey,
      opacity: spring(0, [60, 15]),
      scale: spring(2, [60, 15]),
    };
  },

  render() {
    const {mouse: [mouseX, mouseY], now} = this.state;
    const styles = mouseX == null ? {} : {
      [now]: {
        opacity: spring(1),
        scale: spring(0),
        x: spring(mouseX),
        y: spring(mouseY),
      },
    };
    return (
      <TransitionMotion willLeave={this.willLeave} styles={styles}>
        {circles =>
          <div
            onMouseMove={this.handleMouseMove}
            onTouchMove={this.handleTouchMove}
            className="demo7">
            {Object.keys(circles).map(key => {
              const {opacity, scale, x, y} = circles[key];
              return (
                <div
                  key={key}
                  className="demo7-ball"
                  style={{
                    opacity: opacity,
                    scale: scale,
                    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                }} />
              );
            })}
          </div>
        }
      </TransitionMotion>
    );
  },
});

export default Demo;
