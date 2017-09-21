import React, { PureComponent } from "react";
import {
  StaggeredMotion,
  spring,
  Motion,
  presets
} from "../../src/react-motion";
import range from "lodash.range";
import Slider from "./Slider";

const makeOptions = options =>
  options.map(option => ({
    description: option,
    value: option.replace(" ", "_").toLowerCase()
  }));

const options = makeOptions(["Constant", "Linear", "InverseLinear"]);

class Demo extends PureComponent {
  constructor(props) {
    super(props);
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
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("touchmove", this.handleTouchMove);
    this.setState({ headerHeight: this.divRef.clientHeight });
  }

  handleMouseMove = ({ pageX: x, pageY: y }) => {
    const { headerHeight } = this.state;
    const chatHeadRadiusPx = 20;

    if (y > headerHeight + chatHeadRadiusPx) {
      this.setState({ x, y: y - headerHeight });
    } else {
      this.setState({ x, y: chatHeadRadiusPx });
    }
  };

  handleTouchMove = ({ touches }) => {
    this.handleMouseMove(touches[0]);
  };

  handleStiffnessChange = ({ target }) => {
    this.setState({ stiffness: target.value });
  };

  handlePrecisionChange = ({ target }) => {
    if (!isNaN(target.value)) {
      this.setState({ precision: target.value });
    }
  };

  handleDampingChange = ({ target }) => {
    this.setState({ damping: target.value });
  };

  handleStiffnessParamChange = ({ target }) => {
    this.setState({ stiffnessBehaviour: target.value });
  };

  handleDampingParamChange = ({ target }) => {
    this.setState({ dampingBehaviour: target.value });
  };

  getStyles = prevStyles => {
    // `prevStyles` is the interpolated value of the last tick
    let { stiffness, damping, precision, headerHeight } = this.state;

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
  };

  getHeader = () => {
    const selectOptions = options.map(({ value, description }) => (
      <option value={value}>{description}</option>
    ));

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

    const slider = (
      <div>
        <div className="slider-container">
          <Slider
            value={this.state.stiffness}
            label={"Stiffness"}
            min={1}
            max={350}
            onChange={this.handleStiffnessChange}
          />
        </div>
        <div
          className="slider-container"
          style={{ marginBottom: "2em", marginTop: "0" }}
        >
          <Slider
            value={this.state.damping}
            label={"Damping"}
            min={0}
            max={100}
            onChange={this.handleDampingChange}
          />
        </div>
      </div>
    );

    return (
      <div className="header" ref={element => (this.divRef = element)}>
        <div className="parent-container">
          {stiffnessSelect}
          {dampingSelect}
          {precisionInput}
        </div>
        {slider}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.getHeader()}
        <StaggeredMotion
          defaultStyles={range(6).map(() => ({ x: 0, y: 0 }))}
          styles={this.getStyles}
        >
          {balls => (
            <div className="demo1">
              {balls.map(({ x, y }, i) => (
                <div
                  key={i}
                  className={`demo1-ball ball-${i}`}
                  style={{
                    WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                    transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                    zIndex: balls.length - i
                  }}
                />
              ))}
            </div>
          )}
        </StaggeredMotion>
      </div>
    );
  }
}

export default Demo;
