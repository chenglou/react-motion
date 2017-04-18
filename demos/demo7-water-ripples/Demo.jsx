import React from 'react';
import {TransitionMotion, spring} from '../../src/react-motion';

const leavingSpringConfig = {stiffness: 60, damping: 15};

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {mouse: [], now: 't' + 0};
  };

  handleMouseMove = ({pageX, pageY}) => {
    // Make sure the state is queued and not batched.
    this.setState(() => {
      return {
        mouse: [pageX - 25, pageY - 25],
        now: 't' + Date.now(),
      };
    });
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  willLeave = (styleCell) => {
    return {
      ...styleCell.style,
      opacity: spring(0, leavingSpringConfig),
      scale: spring(2, leavingSpringConfig),
    };
  };

  render() {
    const {mouse: [mouseX, mouseY], now} = this.state;
    const styles = mouseX == null ? [] : [{
      key: now,
      style: {
        opacity: spring(1),
        scale: spring(0),
        x: spring(mouseX),
        y: spring(mouseY),
      }
    }];
    return (
      <TransitionMotion willLeave={this.willLeave} styles={styles}>
        {circles =>
          <div
            onMouseMove={this.handleMouseMove}
            onTouchMove={this.handleTouchMove}
            className="demo7">
            {circles.map(({key, style: {opacity, scale, x, y}}) =>
              <div
                key={key}
                className="demo7-ball"
                style={{
                  opacity: opacity,
                  scale: scale,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                }} />
            )}
          </div>
        }
      </TransitionMotion>
    );
  };
}
