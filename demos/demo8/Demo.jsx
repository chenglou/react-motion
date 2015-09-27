import React from 'react';
import {Motion, spring} from '../../src/react-motion';
import range from 'lodash.range';

function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const springConfig = [300, 50];
const itemsCount = 4;

const Demo = React.createClass({
  getInitialState() {
    return {
      delta: 0,
      mouse: 0,
      isPressed: false,
      lastPressed: 0,
      order: range(itemsCount),
    };
  },

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  },

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  },

  handleMouseDown(pos, pressY, {pageY}) {
    this.setState({
      delta: pageY - pressY,
      mouse: pressY,
      isPressed: true,
      lastPressed: pos,
    });
  },

  handleMouseMove({pageY}) {
    const {isPressed, delta, order, lastPressed} = this.state;
    if (isPressed) {
      const mouse = pageY - delta;
      const row = clamp(Math.round(mouse / 100), 0, itemsCount - 1);
      const newOrder = reinsert(order, order.indexOf(lastPressed), row);
      this.setState({mouse: mouse, order: newOrder});
    }
  },

  handleMouseUp() {
    this.setState({isPressed: false, delta: 0});
  },

  render() {
    const {mouse, isPressed, lastPressed, order} = this.state;

    return (
      <div className="demo8">
        {range(itemsCount).map(i => {
          const style = lastPressed === i && isPressed
            ? {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: mouse,
              }
            : {
                scale: spring(1, springConfig),
                shadow: spring(1, springConfig),
                y: spring(order.indexOf(i) * 100, springConfig),
              };
          return (
            <Motion style={style} key={i}>
              {({scale, shadow, y}) =>
                <div
                  onMouseDown={this.handleMouseDown.bind(null, i, y)}
                  onTouchStart={this.handleTouchStart.bind(null, i, y)}
                  className="demo8-item"
                  style={{
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: i === lastPressed ? 99 : i,
                  }}>
                  {order.indexOf(i) + 1}
                </div>
              }
            </Motion>
          );
        })}
      </div>
    );
  },
});

export default Demo;
