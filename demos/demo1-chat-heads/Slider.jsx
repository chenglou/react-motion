import React from 'react'

const Slider = React.createClass({
  propTypes: {
	    value: React.PropTypes.string,
	    onChange: React.PropTypes.function
  },
  render () {
    return (
      <div className='container'>
        <div className='slider'>
          <input type='range' min='1' max='250' value={this.props.value}
            onChange={this.props.onChange} />
            {this.props.value}
        </div>
      </div>)
  }
})

export default Slider
