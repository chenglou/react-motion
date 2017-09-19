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

function reinsert2(arr, selectedIndex, to) {
  const _arr = arr.slice(0);
  // const val = selectedIndex.map(x => _arr[x])
  const target = _arr[to]
  const selected = _arr.filter((x, i) => selectedIndex.has(x))
  const noSelected = _arr.filter((x, i) => !selectedIndex.has(x))
  console.log('new', target, selected, noSelected);
  const index = noSelected.findIndex(x => x === target)
  console.log('index', index);
  console.log(
    [ ...noSelected.slice(0, index + 1), ...selected, ...noSelected.slice(index + 1) ]
  );
  return [ ...noSelected.slice(0, index + 1), ...selected, ...noSelected.slice(index + 1) ]
  // const val = _arr[from];
  // _arr.splice(from, 1);
  // _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const NAMES = [ 'A', 'B', 'C', 'D' ]

const springConfig = {stiffness: 300, damping: 50};
const itemsCount = 4;

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topDeltaY: 0,
      mouseY: 0,
      isPressed: false,
      originalPosOfLastPressed: 0,
      selection: new Set(),
      // order: range(itemsCount),
      order: ['A', 'B', 'C', 'D'],
      moved: false,
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

  handleMouseDown = (pos, pressY, {pageY}) => {
    const { selection, order } = this.state
    const val = order[pos]
    if (selection.has(val)) {
      selection.delete(val)
    } else {
      selection.add(val)
    }
    this.setState({
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      isPressed: true,
      originalPosOfLastPressed: pos,
      selection
    });
  };

  handleMouseMove = ({pageY}) => {
    const {isPressed, topDeltaY, order, originalPosOfLastPressed, selection} = this.state;

    if (isPressed) {
      const mouseY = pageY - topDeltaY;
      const currentRow = clamp(Math.round(mouseY / 100), 0, itemsCount - 1);
      let newOrder = order;

      // if (currentRow !== order.indexOf(originalPosOfLastPressed)) {
      //   newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow);
      // }
      if (!selection.has(order[currentRow])) {
        console.log(
          'ROW',
          currentRow,
        );
        newOrder = reinsert2(order, selection, currentRow);
      }

      this.setState({mouseY: mouseY, order: newOrder, moved: true});
    }
  };

  handleMouseUp = () => {
    const {moved} = this.state
    if (this.state.moved) {
      const selection = new Set()
      this.setState({isPressed: false, topDeltaY: 0, selection, moved: false});
    } else {
      this.setState({isPressed: false, topDeltaY: 0});
    }
  };

  render() {
    const {mouseY, isPressed, originalPosOfLastPressed, order, selection, moved} = this.state;
    // const selected = [...selection.values()].sort()
    // console.log([...selected], selected.indexOf(1))
    const selectedOrder = order.filter(x => selection.has(x))
    console.log(selectedOrder)
    // console.log(selectedOrder);
    // console.log([...selection.values()])

    return (
      <div className="demo9">
        {range(itemsCount).map(i => {
          // const style = originalPosOfLastPressed === i && isPressed
          let style = {}
          if (selection.has(order[i])) {
            if (moved) {
              style = {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: spring(mouseY + selectedOrder.indexOf(i) * 100, springConfig),
              }
            } else {
              style = {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: spring(order.indexOf(i) * 100, springConfig),
              }
            }
          } else {
            style = {
              scale: spring(1, springConfig),
              shadow: spring(1, springConfig),
              y: spring(order.indexOf(i) * 100, springConfig),
            }
          }
          // const style = selection.has(i) && isPressed
          //   ? {
          //       scale: spring(1.1, springConfig),
          //       shadow: spring(16, springConfig),
          //       y: mouseY,
          //     }
          //   : {
          //       scale: spring(1, springConfig),
          //       shadow: spring(1, springConfig),
          //       y: spring(order.indexOf(i) * 100, springConfig),
          //     };
          return (
            <Motion style={style} key={i}>
              {({scale, shadow, y}) =>
                <div
                  onMouseDown={this.handleMouseDown.bind(null, i, y)}
                  onTouchStart={this.handleTouchStart.bind(null, i, y)}
                  className="demo9-item"
                  style={{
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: i === originalPosOfLastPressed ? 99 : i,
                  }}>
                  {order.indexOf(i) + 1} {[i]}
                </div>
              }
            </Motion>
          );
        })}
      </div>
    );
  };
}
