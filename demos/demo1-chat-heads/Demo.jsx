import React, { PureComponent } from "react";
import {
  StaggeredMotion,
  spring,
  Motion,
  presets
} from "../../src/react-motion";
import range from "lodash.range";
import Slider from "./Slider";

const makeOptions = options => options.map(option => ({ description: option, value: option.replace(' ', '_').toLowerCase() }))

const options = makeOptions([ 'Constant', 'Linear', 'InverseLinear' ]);


class Demo extends PureComponent {
  constructor(props){
    super(props)
    this.state = {
      x: 250,
      y: 300,
      stiffness: 100,
      damping: 17,
      precision: 0.01,
      stiffnessBehaviour: "constant",
      dampingBehaviour: "constant",
      headerHeight: 0
    };

    this.getStyles = this.getStyles.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleStiffnessChange = this.handleStiffnessChange.bind(this)
    this.handlePrecisionChange = this.handlePrecisionChange.bind(this)
    this.handleDampingChange = this.handleDampingChange.bind(this)
    this.handleStiffnessParamChange = this.handleStiffnessParamChange.bind(this)
    this.handleDampingParamChange = this.handleDampingParamChange.bind(this)
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("touchmove", this.handleTouchMove);
    this.setState({ headerHeight: this.divRef.clientHeight });
  }

  handleMouseMove({ pageX: x, pageY: y }) {
    const height = this.state.headerHeight;
    const chatHeadRadiusPx = 20;

    // chat heads avoid header area
    if (y > height * 3.3 + chatHeadRadiusPx) {
      this.setState({ x, y: y - height * 3.3 });
    }
  }

  handleTouchMove({ touches }) {
    this.handleMouseMove(touches[0]);
  }

  handleStiffnessChange(event) {
    this.setState({ stiffness: event.target.value });
  }

  handlePrecisionChange(event) {
    if (!isNaN(event.target.value)) {
      this.setState({ precision: event.target.value });
    }
  }

  handleDampingChange(event) {
    this.setState({ damping: event.target.value });
  }

  handleStiffnessParamChange(event) {
    this.setState({ stiffnessBehaviour: event.target.value });
  }

  handleDampingParamChange(event) {
    this.setState({ dampingBehaviour: event.target.value });
  }

 

  getStyles(prevStyles) {
    // `prevStyles` is the interpolated value of the last tick
    let { stiffness, stiffnessBehaviour, damping, dampingBehaviour, precision } = this.state


    const endValue = prevStyles.map((_, i) => {
      if (stiffnessBehaviour === "linear") {
        stiffness = stiffness * i;
      }
      if (stiffnessBehaviour === "inverseLinear") {
        stiffness = stiffness / i;
      }
      if (dampingBehaviour === "linear") {
        damping = damping * i;
      }
      if (dampingBehaviour === "inverseLinear") {
        damping = damping / i;
      }

      return i === 0
        ? this.state
        : {
            x: spring(prevStyles[i - 1].x, { stiffness, damping, precision }),
            y: spring(prevStyles[i - 1].y, { stiffness, damping, precision })
          };
    });

    return endValue;
  }

  render() {
    const selectOptions = options.map(({ value, description }) =>
      <option value={value}>
        {description}
      </option>
    );

    const stiffnessSelect = (
      <div className="dropdown-container">
        <select
          value={this.state.stiffnessBehaviour}
          onChange={this.handleStiffnessParamChange}
        >
          {selectOptions}
        </select>
      </div>
    );

    const dampingSelect = (
      <div className="dropdown-container">
        <select
          value={this.state.dampingBehaviour}
          onChange={this.handleDampingParamChange}
        >
          {selectOptions}
        </select>
      </div>
    );

    const precisionInput = (
      <div className="input-container">
        <label>Precision</label>
        <input
          type="text"
          value={this.state.precision}
          size={4}
          onChange={this.handlePrecisionChange}
        />
      </div>
    );

    return (
      <div>
        <div className="header" ref={element => (this.divRef = element)}>
          <div className="parent-container">
            {stiffnessSelect}
            {dampingSelect}
            {precisionInput}
          </div>
        </div>
        <div className="slider-container">
          <Slider
            value={this.state.stiffness}
            label={"Stiffness"}
            min={1}
            max={350}
            onChange={this.handleStiffnessChange}
          />
        </div>
        <div className="slider-container" style={{marginBottom:'2em', marginTop: '0'}}>
          <Slider
            value={this.state.damping}
            label={"Damping"}
            min={0}
            max={100}
            onChange={this.handleDampingChange}
          />
        </div>
        <StaggeredMotion
          defaultStyles={range(6).map(() => ({ x: 0, y: 0 }))}
          styles={this.getStyles}
        >
          {balls =>
            <div className="demo1">
              {balls.map(({ x, y }, i) =>
                <div
                  key={i}
                  className={`demo1-ball ball-${i}`}
                  style={{
                    WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                    transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                    zIndex: balls.length - i
                  }}
                />
              )}
            </div>}
        </StaggeredMotion>
      </div>
    );
  }
};

export default Demo;
