import React from 'react';

const Dropdown = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onChange: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      value: null,
      valueField: 'value',
      labelField: 'label',
      onChange: null,
    };
  },

  getInitialState() {
    const selected = this.getSelectedFromProps(this.props);
    return {
      selected,
    };
  },

  componentWillReceiveProps(nextProps) {
    const selected = this.getSelectedFromProps(nextProps);
    this.setState({
      selected,
    });
  },

  getSelectedFromProps(props) {
    let selected;
    if (props.value === null && props.options.length !== 0) {
      selected = props.options[0][props.valueField];
    } else {
      selected = props.value;
    }
    return selected;
  },

  render() {
    const options = this.props.options.map(option =>
        <option
          key={option.value}
          value={option.value}
        >
        {option.description}
        </option>
    );

    return (
      <select
        id={this.props.id}
        className="form-control"
        value={this.state.selected}
        onChange={this.handleChange}
      >
      {options}
      </select>
    );
  },

  handleChange(e) {
    if (this.props.onChange) {
      const change = {
        oldValue: this.state.selected,
        newValue: e.target.value,
      };
      this.props.onChange(change);
    }
    this.setState({selected: e.target.value});
  },
});

export default Dropdown;
