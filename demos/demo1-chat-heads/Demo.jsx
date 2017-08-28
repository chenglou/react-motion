import React from "react";
import {
  StaggeredMotion,
  spring,
  Motion,
  presets
} from "../../src/react-motion";
import range from "lodash.range";
import Slider from "./Slider";

const options = [
  {
    description: "Constant",
    value: "constant"
  },
  {
    description: "Linear",
    value: "linear"
  },
  {
    description: "Inverse Linear",
    value: "invertedLinear"
  }
];

const Demo = React.createClass({
  getInitialState() {
    return {
      x: 250,
      y: 300,
      stiffness: 100,
      damping: 17,
      precision: 0.01,
      stiffnessBehaviour: "constant",
      dampingBehaviour: "constant",
      headerHeight: 0
    };
  },

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("touchmove", this.handleTouchMove);
    this.setState({ headerHeight: this.divRef.clientHeight });
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.x !== nextState.x) {
      return true;
    }
    if (this.props.y !== nextProps.y) {
      return true;
    }
    if (this.state.stiffness !== nextState.stiffness) {
      return true;
    }
    if (this.state.damping !== nextState.damping) {
      return true;
    }
    if (this.state.precision !== nextState.damping) {
      return true;
    }

    return false;
  },

  handleMouseMove({ pageX: x, pageY: y }) {
    const height = this.state.headerHeight;
    const chatHeadRadiusPx = 20;
    // chat heads avoid header area
    if (y > height * 3.3 + chatHeadRadiusPx) {
      this.setState({ x, y: y - height * 3.3 });
    }
  },

  handleTouchMove({ touches }) {
    this.handleMouseMove(touches[0]);
  },

  handleStiffnessChange(event) {
    this.setState({ stiffness: event.target.value });
  },

  handlePrecisionChange(event) {
    if (!isNaN(event.target.value)) {
      this.setState({ precision: event.target.value });
    }
  },

  handleDampingChange(event) {
    this.setState({ damping: event.target.value });
  },

  handleStiffnessParamChange(event) {
    this.setState({ stiffnessBehaviour: event.target.value });
  },

  handleDampingParamChange(event) {
    this.setState({ dampingBehaviour: event.target.value });
  },

  getStyles(prevStyles) {
    // `prevStyles` is the interpolated value of the last tick
    let stiffness = this.state.stiffness;
    let damping = this.state.damping;
    let precision = this.state.precision;

    const endValue = prevStyles.map((_, i) => {
      if (this.state.stiffnessBehaviour === "linear") {
        stiffness = this.state.stiffness * i;
      }
      if (this.state.stiffnessBehaviour === "inverseLinear") {
        stiffness = this.state.stiffness / i;
      }
      if (this.state.dampingBehaviour === "linear") {
        damping = this.state.damping * i;
      }
      if (this.state.dampingBehaviour === "inverseLinear") {
        damping = this.state.damping / i;
      }
      return i === 0
        ? this.state
        : {
            x: spring(prevStyles[i - 1].x, { stiffness, damping, precision }),
            y: spring(prevStyles[i - 1].y, { stiffness, damping, precision })
          };
    });
    return endValue;
  },

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
});

export default Demo;
