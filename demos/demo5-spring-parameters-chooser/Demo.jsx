import React from 'react';
import {Motion, spring} from '../../src/react-motion';
import range from 'lodash.range';

const gridWidth = 150;
const gridHeight = 150;
const grid = range(4).map(() => range(6));

const Demo = React.createClass({
  getInitialState() {
    return {
      delta: [0, 0],
      mouse: [0, 0],
      isPressed: false,
      firstConfig: [60, 5],
      slider: {dragged: null, num: 0},
      lastPressed: [0, 0],
    };
  },

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('touchend', this.handleMouseUp);
  },

  handleTouchStart(pos, press, e) {
    this.handleMouseDown(pos, press, e.touches[0]);
  },

  handleMouseDown(pos, [pressX, pressY], {pageX, pageY}) {
    this.setState({
      delta: [pageX - pressX, pageY - pressY],
      mouse: [pressX, pressY],
      isPressed: true,
      lastPressed: pos,
    });
  },

  handleTouchMove(e) {
    if (this.state.isPressed) {
      e.preventDefault();
    }
    this.handleMouseMove(e.touches[0]);
  },

  handleMouseMove({pageX, pageY}) {
    const {isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      this.setState({mouse: [pageX - dx, pageY - dy]});
    }
  },

  handleMouseUp() {
    this.setState({
      isPressed: false,
      delta: [0, 0],
      slider: {dragged: null, num: 0},
    });
  },

  handleChange(constant, num, {target}) {
    const {firstConfig: [s, d]} = this.state;
    if (constant === 'stiffness') {
      this.setState({
        firstConfig: [target.value - num * 30, d],
      });
    } else {
      this.setState({
        firstConfig: [s, target.value - num * 2],
      });
    }
  },

  handleMouseDownInput(constant, num) {
    this.setState({
      slider: {dragged: constant, num: num},
    });
  },

  render() {
    const {
      mouse, isPressed, lastPressed, firstConfig: [s0, d0], slider: {dragged, num},
    } = this.state;
    return (
      <div className="demo5">
        {grid.map((row, i) => {
          return row.map((cell, j) => {
            const cellStyle = {
              top: gridHeight * i,
              left: gridWidth * j,
              width: gridWidth,
              height: gridHeight,
            };
            const stiffness = s0 + i * 30;
            const damping = d0 + j * 2;
            const motionStyle = isPressed
              ? {x: mouse[0], y: mouse[1]}
              : {
                  x: spring(gridWidth / 2 - 25, {stiffness, damping}),
                  y: spring(gridHeight / 2 - 25, {stiffness, damping}),
                };

            return (
              <div style={cellStyle} className="demo5-cell">
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={stiffness}
                  onMouseDown={this.handleMouseDownInput.bind(null, 'stiffness', i)}
                  onChange={this.handleChange.bind(null, 'stiffness', i)} />
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={damping}
                  onMouseDown={this.handleMouseDownInput.bind(null, 'damping', j)}
                  onChange={this.handleChange.bind(null, 'damping', j)} />
                <Motion style={motionStyle}>
                  {({x, y}) => {
                    let thing;
                    if (dragged === 'stiffness') {
                      thing = i < num ? <div className="demo5-minus">-{(num - i) * 30}</div>
                        : i > num ? <div className="demo5-plus">+{(i - num) * 30}</div>
                        : <div className="demo5-plus">0</div>;
                    } else {
                      thing = j < num ? <div className="demo5-minus">-{(num - j) * 2}</div>
                        : j > num ? <div className="demo5-plus">+{(j - num) * 2}</div>
                        : <div className="demo5-plus">0</div>;
                    }
                    const active = lastPressed[0] === i && lastPressed[1] === j
                      ? 'demo5-ball-active'
                      : '';
                    return (
                      <div
                        style={{
                          transform: `translate3d(${x}px, ${y}px, 0)`,
                          WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
                        }}
                        className={'demo5-ball ' + active}
                        onMouseDown={this.handleMouseDown.bind(null, [i, j], [x, y])}
                        onTouchStart={this.handleTouchStart.bind(null, [i, j], [x, y])}>
                        <div className="demo5-preset">
                          {stiffness}{dragged === 'stiffness' && thing}
                        </div>
                        <div className="demo5-preset">
                          {damping}{dragged === 'damping' && thing}
                        </div>
                      </div>
                    );
                  }}
                </Motion>
              </div>
            );
          });
        })}
      </div>
    );
  },
});


export default Demo;
