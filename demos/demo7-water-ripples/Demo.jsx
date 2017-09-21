import React, { PureComponent } from "react";
import { TransitionMotion, spring } from "../../src/react-motion";

const leavingSpringConfig = { stiffness: 60, damping: 15 };

class Demo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mouse: [],
      now: "t" + 0
    };
  }

  handleMouseMove = ({ pageX, pageY }) => {
    // Make sure the state is queued and not batched.
    this.setState({
      mouse: [pageX - 25, pageY - 25],
      now: "t" + Date.now()
    });
  };

  handleTouchMove = e => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  willLeave = styleCell => ({
    ...styleCell.style,
    opacity: spring(0, leavingSpringConfig),
    scale: spring(2, leavingSpringConfig)
  });

  getStyles = () => {
    const { mouse: [mouseX, mouseY], now } = this.state;
    
    return mouseX == null
      ? []
      : [
          {
            key: now,
            style: {
              opacity: spring(1),
              scale: spring(0),
              x: spring(mouseX),
              y: spring(mouseY)
            }
          }
        ];
  };

  render() {
    const styles = this.getStyles();
    
    return (
      <TransitionMotion willLeave={this.willLeave} styles={styles}>
        {circles => (
          <div
            onMouseMove={this.handleMouseMove}
            onTouchMove={this.handleTouchMove}
            className="demo7"
          >
            {circles.map(({ key, style: { opacity, scale, x, y } }) => (
              <div
                key={key}
                className="demo7-ball"
                style={{
                  opacity: opacity,
                  scale: scale,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                }}
              />
            ))}
          </div>
        )}
      </TransitionMotion>
    );
  }
}

export default Demo;
