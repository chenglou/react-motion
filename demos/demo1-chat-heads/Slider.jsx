import React from 'react'

const Slider = React.createClass({
  propTypes: {
	    value: React.PropTypes.string,
	    onChange: React.PropTypes.function,
	    max: React.PropTypes.number,
   	    min: React.PropTypes.number
  },
  render () {
    return (
      <div className='container'>
        <div className='slider'>
          <input type='range' min={this.props.min} max={this.props.max} value={this.props.value}
            onChange={this.props.onChange} />
            {this.props.value}
        </div>
      </div>)
  }
})

export default Slider
