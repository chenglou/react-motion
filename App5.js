// swapping items! modularized with Springs component
// no unmounting animation yet

let React = require('react');
let computeLayout = require('css-layout');
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
      let {reduce, initVals} = this.props;

      let newFinalVals = currVals.reduce((finalVals, val, i) => {
        return reduce(currVals, finalVals, i)
      }, []);

      let newCurrVals = map3Tree(
        newFinalVals,
        currVals,
        currV,
        (destX, x, vx) => stepper(x, vx, destX, 120, 16)[0],
      );
      let newCurrV = map3Tree(
        newFinalVals,
        currVals,
        currV,
        (destX, x, vx) => stepper(x, vx, destX, 120, 16)[1],
      );

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

let layout1 = computeLayout({
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
  ],
});

let layout2 = computeLayout({
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 2},
    },
  ],
});

let layout3 = computeLayout({
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {flex: 3},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 2},
    },
  ],
});

let layouts = [layout1, layout2, layout3];

let config1 = ['a', 'b', 'c', 'd'];
let config2 = ['a', 'd', 'c', 'b'];
let config3 = ['d', 'a', 'b', 'c'];
let configs = [config1, config2, config3];

function yofuck(children, configNum) {
  let childrenObj = {};
  configs[configNum].forEach((key, i) => {
    childrenObj[key] = children[i];
  });

  return childrenObj;
}

let App = React.createClass({
  getInitialState: function() {
    return {
      configNum: 0,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', e => {
      // j = 74, k = 75, l = 76
      if (e.which === 74) {
        this.setState({
          configNum: 0,
        });
      } else if (e.which === 75) {
        this.setState({
          configNum: 1,
        });
      } else if (e.which === 76) {
        this.setState({
          configNum: 2,
        });
      }
    });
  },

  render: function() {
    let {configNum} = this.state;
    let {children, ...container} = layouts[configNum];

    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    return (
      <div style={{...container, outline: '1px solid black', position: 'relative'}}>
        <Springs initVals={[yofuck(children, configNum)]} reduce={() => [yofuck(children, configNum)]}>
          {([currVals]) => {
            return configs[configNum].map(key => {
              return (
                <div key={key} style={{...currVals[key], ...s}}>{key}</div>
              );
            });
          }}
        </Springs>
      </div>
    );
  }
});

module.exports = App
