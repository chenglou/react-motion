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
      stiffnessBehaviour: 'constant',
      dampingBehaviour: 'constant',
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

  handleStiffnessParamChange(event) {
    this.setState({stiffnessBehaviour: event.newValue});
  },

  handleDampingParamChange(event) {
    this.setState({dampingBehaviour: event.newValue});
  },
  
  getStyles(prevStyles) {
  // `prevStyles` is the interpolated value of the last tick
    let stiffness = this.state.stiffness
    let damping = this.state.damping

    const endValue = prevStyles.map((_, i) => {
      if (this.state.stiffnessBehaviour === 'linear'){
        stiffness = this.state.stiffness * i
      }
      if (this.state.stiffnessBehaviour === 'inverseLinear'){
        stiffness = this.state.stiffness / i
      }
      if (this.state.dampingBehaviour === 'linear'){
        damping = this.state.damping * i
      }
      if (this.state.dampingBehaviour === 'inverseLinear'){
        damping = this.state.damping / i
      }
      return i === 0
        ? this.state
        : {  
            x: spring(prevStyles[i - 1].x, {stiffness, damping}),
            y: spring(prevStyles[i - 1].y, {stiffness, damping}),
          };
    });
    return endValue;
  },

  render() {   
    const options = [
        {
            description: 'Constant',
            code: 'constant'
        },
        {
            description: 'Linear',
            code: 'linear'
        },
        {
            description: 'Inverse Linear',
            code: 'invertedLinear'
        },
    ];

    return (
      <div>
        <div className="dropdown-container">
         Stiffness Behaviour 
         <Dropdown className='Dropdown' 
                      options={options} 
                      value={this.state.stiffnessBehaviour}
                      labelField='description'
                      valueField='code'
                      onChange={this.handleStiffnessParamChange}
                      />
        </div>
        <div className="dropdown-container">
          Damping Behaviour
           <Dropdown className='Dropdown' 
                      options={options} 
                      value={this.state.dampingBehaviour}
                      labelField='description'
                      valueField='code'
                      onChange={this.handleDampingParamChange}
                      />
        </div>
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