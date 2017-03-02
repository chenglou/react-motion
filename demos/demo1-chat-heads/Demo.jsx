import React from 'react';
import {StaggeredMotion, spring, Motion, presets} from '../../src/react-motion';
import range from 'lodash.range';


const Demo = React.createClass({
  getInitialState() {
    return {x: 250, y: 300, stiffness: 80};
  },

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove);
  },

  handleMouseMove({pageX: x, pageY: y}) {
    if(x > 20 && y > 20){ // chat heads avoid slider region
      this.setState({x, y});
    }
  },

  handleTouchMove({touches}) {
    this.handleMouseMove(touches[0]);
  },

  handleStiffnessChange(event) {
    this.setState({stiffness: event.target.value});
  },

  getStyles(prevStyles) {
    // `prevStyles` is the interpolated value of the last tick
    const stiffness = this.state.stiffness
    const endValue = prevStyles.map((_, i) => {
      return i === 0
        ? this.state
        : {
            x: spring(prevStyles[i - 1].x, {stiffness, damping: 17}),
            y: spring(prevStyles[i - 1].y, {stiffness, damping: 17}),
          };
    });
    return endValue;
  },

  render() {
    const stiffnessSpringParams = { stiffness: this.state.stiffness * 4, damping: this.state.stiffness * 4 }
   
    return (
      <div>
        <div class="container">
          <div class="slider">
            <Motion style={{x: spring(this.state.stiffness, stiffnessSpringParams)}}>
              {interpolatingStyle =>  <input type= "range" min="0" max="200" value={interpolatingStyle} onChange={this.handleStiffnessChange} />}
            </Motion>
            {this.state.stiffness}    
          </div>
      <StaggeredMotion
        defaultStyles={range(6).map(() => ({x: 0, y: 0}))}
        styles={this.getStyles}>
        {balls =>
          <div className="demo1">
            {balls.map(({x, y}, i) =>
              <div
                key={i}
                className={`demo1-ball ball-${i}`}
                style={{
                  WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                  transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                  zIndex: balls.length - i,
                }} />
            )}
          </div>
        }
      </StaggeredMotion>
      </div>
      </div>
    );
  },
});

// to do - need a perf optimisation whereby input range value is only wrapped in motion and 
// interpolated when mouse is hovered over the slider

export default Demo;