import React from 'react';

const Slider = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    onChange: React.PropTypes.function,
    label: React.PropTypes.string,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
  },

  render() {
    return (
      <div className="container">
        <div className="slider">
          <input
            type="range"
            min={this.props.min}
            max={this.props.max}
            value={this.props.value}
            onChange={this.props.onChange}
          />
         <div className="text-parent">
          <div className="text-child">
            {`${this.props.label}: ${this.props.value}`}
          </div>
          </div>
        </div>
      </div>
    );
  },
});

export default Slider;
