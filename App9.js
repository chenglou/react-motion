// back to roots! App1, same componentization, but with decay!
'use strict';

let React = require('react');
let stepper = require('./stepper');

function map3Tree(t1, t2, t3, f) {
  if (Object.prototype.toString.call(t1) === '[object Array]') {
    return t1.map((val, i) => map3Tree(val, t2[i], t3[i], f));
  }
  if (Object.prototype.toString.call(t1) === '[object Object]') {
    let newTree = {};
    Object.keys(t1).forEach(key => newTree[key] = map3Tree(t1[key], t2[key], t3[key], f));
    return newTree;
  }
  return f(t1, t2, t3);
}

let Springs = React.createClass({
  getInitialState: function() {
    let {initVals} = this.props;
    return {
      currVals: initVals,
      currV: map3Tree(initVals, initVals, initVals, () => 0),
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      let {newFinalValsF, initVals} = this.props;

      let newCurrVals;
      let newCurrV;
      if (!newFinalValsF) {
        // decay
        newCurrVals = map3Tree(currVals, currV, currV, (x, vx) => x + vx / 60);
        newCurrV = map3Tree(currV, currV, currV, v => v * 0.95);
      } else {
        let newFinalVals = newFinalValsF(currVals);
        newCurrVals = map3Tree(
          newFinalVals,
          currVals,
          currV,
          (destX, x, vx) => stepper(x, vx, destX, 120, 16)[0],
        );
        newCurrV = map3Tree(
          newFinalVals,
          currVals,
          currV,
          (destX, x, vx) => stepper(x, vx, destX, 120, 16)[1],
        );
      }

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
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
        {this.props.children(this.state.currVals)}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      mouseX: 0,
      mouseY: 0,
      keyPressed: false,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', () => {
      this.setState({keyPressed: true});
    });
    window.addEventListener('keyup', () => {
      this.setState({keyPressed: false});
    });
  },

  handleMouseMove: function(e) {
    if (e.nativeEvent.which === 1) {
      this.setState({
        mouseX: e.pageX,
        mouseY: e.pageY,
      });
    }
  },

  render: function() {
    let {mouseX, mouseY, springs, keyPressed} = this.state;
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

    let initVals = [
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
      [0, 0],
    ];

    let f = currVals => {
      return currVals.reduce((accum, val, i) => {
        if (i === 0) {
          return [[mouseX, mouseY]];
        }
        return [...accum, currVals[i - 1]];
      }, []);
    };

    return (
      <div onMouseMove={this.handleMouseMove} onMouseDown={this.handleMouseMove} style={box}>
        <Springs initVals={initVals} newFinalValsF={keyPressed ? null : f}>
          {currVals => currVals.map(([x, y], i) => (
            <div key={i} style={{
              ...s,
              WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
              transform: `translate3d(${x}px, ${y}px, 0)`,
              zIndex: currVals.length - i,
            }} />
          ))}
        </Springs>
      </div>
    );
  }
});

module.exports = App;
