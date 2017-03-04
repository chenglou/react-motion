import React from 'react';
import {StaggeredMotion, spring, Motion, presets} from '../../src/react-motion';
import range from 'lodash.range';
import Slider from './Slider'
import Dropdown from './Dropdown'

const Demo = React.createClass({
  getInitialState() {
    return {
      x: 250,
      y: 300, 
      stiffness: 100, 
      damping: 17,
      staggeredStiffness: false,
      inverseStaggeredStiffness: false,
      staggeredDamping: false,
      inverseStaggeredDamping: false
    };
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

  handleDampingChange(event) {
    this.setState({damping: event.target.value});
  },

  toggleLinearStiffness(){
    this.setState({linearStiffness: !this.state.linearStiffness})
  },

  toggleInverseLinearStiffness(){
    this.setState({inverseLinearStiffness: !this.state.inverseLinearStiffness})
  },

  resetEffects(){
    this.setState({
          inverseLinearStiffness: false,
          linearStiffness: false,
          linearDamping: false,
          inverseLinearDamping: false
        })
  },

  getStyles(prevStyles) {
    // `prevStyles` is the interpolated value of the last tick
    let stiffness = this.state.stiffness
    let damping = this.state.damping
    const endValue = prevStyles.map((_, i) => {
       if (this.state.inverseLinearStiffness === true){
        stiffness = this.state.stiffness / i
                damping = this.state.damping / i

      }
      if (this.state.linearStiffness === true){
        damping = this.state.damping / i
      }
      return i === 0
        ? this.state
        : {  // do stiffness * i for coel effect then add slider for this and slider for how many chat heads
            x: spring(prevStyles[i - 1].x, {stiffness, damping}),
            y: spring(prevStyles[i - 1].y, {stiffness, damping}),
          };
    });
    return endValue;
  },

  render() {   
    return (
      <div>
        <a class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a>

      <button onClick={this.toggleLinearStiffness} > Linear Spring Stiffness </button>
      <button onClick={this.toggleInverseLinearStiffness} > Inverse Linear Spring Stiffness </button>
      <button onClick={this.resetEffects} > Reset </ button>

      <Slider value={this.state.stiffness} min={1} max={350} onChange={this.handleStiffnessChange} />
      <Slider value={this.state.damping} min={0} max={100} onChange={this.handleDampingChange} />
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
    );
  },
});

// to do - need a perf optimisation whereby input range value is only wrapped in motion and 
// interpolated when mouse is hovered over the slider

export default Demo;