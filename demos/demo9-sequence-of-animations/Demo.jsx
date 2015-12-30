import React from 'react';
import {Motion, spring} from '../../src/react-motion';

const Demo = React.createClass({
  index: 0,
  getInitialState() {
    return {play: false};
  },
  handleMouseDown() {
    this.setState({play: true});
    document.getElementById('play').disabled = true;
  },
  handleTouchStart(e) {
    e.preventDefault();
    this.handleMouseDown();
  },
  getStyle(){
    return [
      {x: spring(this.state.play?  400 : 0), y: 0},
      {x: 400, y: spring(this.state.play ? 400 : 0)},
      {x: spring(this.state.play ? 0 : 400), y: 400},
      {x: 0, y: spring(this.state.play ? 0 : 400)},
    ];
  },
  onCompleted(){
    this.index ++;
    if (this.index === 4) {
      this.setState({play: false});
    }
  },
  render() {
    return (
      <div>
        <button
          id='play'
          onMouseDown={this.handleMouseDown}
          onTouchStart={this.handleTouchStart}>
          Play
        </button>

        <Motion defaultStyle={{x: 0, y: 0}} style={this.getStyle()} onCompleted={this.onCompleted}>
          {({x, y}) =>
            // children is a callback which should accept the current value of
            // `style`
            <div className='demo9'>
              <div className='demo9-block' style={{
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
                  transform: `translate3d(${x}px, ${y}px, 0)`,
                }} >
                <span className='demo9-span'>{this.index}</span>
              </div>
            </div>
          }
        </Motion>
      </div>
    );
  },
});

export default Demo;
