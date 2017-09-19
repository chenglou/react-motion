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

function reinsert2(arr, selection, to) {
  const _arr = arr.slice();
  const selected = _arr.filter(x => selection.has(x));
  const nonSelected = _arr.filter(x => !selection.has(x));
  const left = nonSelected.slice(0, to);
  const right = nonSelected.filter(x => !left.includes(x));
  return [].concat(left, selected, right);
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const springConfig = {stiffness: 300, damping: 50};
const itemsCount = 4;

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topDeltaY: 0,
      mouseY: 0,
      isPressed: false,
      moving: false,
      selection: new Set(),
      order: range(itemsCount).map(i => String.fromCharCode('A'.charCodeAt(0) + i)),
    };
  };

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  };

  handleTouchStart = (key, pressLocation, e) => {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  handleMouseDown = (value, pressY, {pageY}) => {
    const selection = new Set(this.state.selection)
    selection.add(value)
    this.setState({
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      isPressed: true,
      selection,
    });
  };

  handleMouseMove = ({pageY}) => {
    const {isPressed, topDeltaY, mouseY, order, selection} = this.state;

    if (isPressed) {
      const mouseY = pageY - topDeltaY;
      const currentRow = clamp(Math.round(mouseY / 100), 0, itemsCount - 1);
      let newOrder = order;

      const selectedValues = order.filter(x => selection.has(x))
      newOrder = reinsert2(order, selection, currentRow);

      this.setState({mouseY: mouseY, order: newOrder, moving: true});
    }
  };

  handleMouseUp = () => {
    const { moving } = this.state;
    if (moving) {
      this.setState({isPressed: false, moving: false, topDeltaY: 0, selection: new Set()});
    } else {
      this.setState({isPressed: false, moving: false, topDeltaY: 0});
    }
  };

  render() {
    const {mouseY, isPressed, order, selection, moving} = this.state;
    const selectedValues = order.filter(x => selection.has(x))

    return (
      <div className="demo9">
        {range(itemsCount).map(index => {
          const value = order[index]
          const style = selection.has(value)
            ? {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: moving ? (
                  spring(mouseY + selectedValues.indexOf(value) * 100, springConfig)
                ) : (
                  spring(order.indexOf(value) * 100, springConfig)
                )
              }
            : {
                scale: spring(1, springConfig),
                shadow: spring(1, springConfig),
                y: spring(order.indexOf(value) * 100, springConfig),
              };
          return (
            <Motion style={style} key={value}>
              {({scale, shadow, y}) =>
                <div
                  onMouseDown={this.handleMouseDown.bind(null, value, y)}
                  onTouchStart={this.handleTouchStart.bind(null, value, y)}
                  className="demo9-item"
                  style={{
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: selection.has(value) ? 99 : index,
                  }}>
                  {order.indexOf(value) + 1} {value}
                </div>
              }
            </Motion>
          );
        })}
      </div>
    );
  };
}
