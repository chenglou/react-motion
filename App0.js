// dumb component version
// warning: intentionally very slow

let React = require('react');
let stepper = require('./stepper');

let Spring = React.createClass({
  propTypes: {
    tension: React.PropTypes.number,
    friction: React.PropTypes.number,
    // initialValue: React.PropTypes.number,
    value: React.PropTypes.number.isRequired,
    onValueChange: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      tension: 140,
      friction: 16,
    };
  },

  getInitialState: function() {
    return {
      v: 0,
      currValue: this.props.value,
      isRafing: true,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (!this.state.isRafing) {
      this.setState({isRafing: true});
      this.raf();
    }
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currValue, v} = this.state;
      let {tension, friction, value, onValueChange} = this.props;

      let [newCurrValue, newV] =
        stepper(currValue == null ? value : currValue, v, value, tension, friction);

      if (newV === 0 && newCurrValue === currValue) {
        this.setState({isRafing: false});
        return;
      }

      this.setState(() => {
        onValueChange && onValueChange(newCurrValue);
        return {
          currValue: newCurrValue,
          v: newV,
        };
      });

      this.raf();
    });
  },

  componentDidMount: function() {
    this.raf();
  },

  render: function() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      mouseX: 0,
      mouseY: 0,
      springs: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    };
  },

  handleMouseMove: function(e) {
    if (e.nativeEvent.which === 1) {
      this.setState({
        mouseX: e.pageX,
        mouseY: e.pageY,
      });
    }
  },

  // componentDidMount: function() {
  //   let asd = () => {
  //     let s = JSON.stringify(this.state);
  //     requestAnimationFrame(() => {
  //       // if (JSON.stringify(this.state) !== s) {
  //         // console.log('up');
  //         this.forceUpdate();
  //       // }
  //       asd();
  //     });
  //   }

  //   asd();
  // },

  handleValueChange: function(idx, pos, value) {
    this.state.springs[idx][pos] = value;
    this.setState({
      springs: this.state.springs,
    });
  },

  render: function() {
    let {mouseX, mouseY, springs} = this.state;
    let box = {
      width: 500,
      height: 600,
      backgroundColor: 'lightgray',
    };

    let s = {
      position: 'absolute',
      border: '1px solid black',
      borderRadius: 99,
      width: 50,
      height: 50,
      backgroundColor: 'red',
    };

    return (
      <div onMouseMove={this.handleMouseMove} onMouseDown={this.handleMouseMove} style={box}>
        {springs.map(([x, y], i) => {
          let [destX, destY] = i === 0 ? [mouseX, mouseY] : springs[i - 1];
          return (
            <div>
              <Spring key={i} value={destX} onValueChange={this.handleValueChange.bind(null, i, 0)} />
              <Spring value={destY} onValueChange={this.handleValueChange.bind(null, i, 1)} />

              <div style={{
                ...s,
                WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
                transform: `translate3d(${x}px, ${y}px, 0)`,
                zIndex: springs.length - i,
              }} />
            </div>
          );
          // return (
          //   <Spring key={i} value={destX} onValueChange={this.handleValueChange.bind(null, i, 0)}>
          //     <Spring  value={destY} onValueChange={this.handleValueChange.bind(null, i, 1)}>
          //       <div style={{
          //         ...s,
          //         WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
          //         zIndex: springs.length - i,
          //       }} />
          //     </Spring>
          //   </Spring>
          // );
        })}
      </div>
    );
  }
});

module.exports = App;
