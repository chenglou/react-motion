// swapping items!
'use strict';

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

let layout1 = computeLayout({
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
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
      style: {flex: 2},
    },
  ],
});

function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

function yofuck(layout, ab) {
  let layoutObj = clone(layout);
  let [x0, x1] = layout.children;
  if (ab) {
    layoutObj.children = {
      a: x0,
      b: x1,
    };
  } else {
    layoutObj.children = {
      a: x1,
      b: x0,
    };
  }

  return layoutObj;
}

let App = React.createClass({
  getInitialState: function() {
    let layout = yofuck(layout1, true);
    return {
      // in-flight, animated. values computed with spring
      layout: layout,
      destLayout: layout,
      v: map3Tree(layout, layout, layout, () => 0),
      ab: true,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', e => {
      // j = 74, k = 75
      if (e.which === 74) {
        this.setState({
          ab: false,
          destLayout: yofuck(layout2, false),
        });
      } else if (e.which === 75) {
        this.setState({
          ab: true,
          destLayout: yofuck(layout1, true),
        });
      }
    });

    let loop = () => {
      requestAnimationFrame(() => {
        let {layout, v, destLayout, ab} = this.state;
        destLayout = clone(destLayout);

        let newLayout = map3Tree(layout, v, destLayout, (x, vx, destX) => {
          return stepper(x, vx, destX, 120, 16)[0];
        });
        let newV = map3Tree(layout, v, destLayout, (x, vx, destX) => {
          return stepper(x, vx, destX, 120, 16)[1];
        });

        this.setState({
          layout: newLayout,
          v: newV,
        });

        loop();
      });
    };

    loop();
  },

  render: function() {
    let {ab, layout} = this.state;
    let {
      children: {a, b},
      ...container
    } = layout;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    let comps;
    if (ab) {
      comps =
        <div>
          <div style={{...a, ...s}}>a</div>
          <div style={{...b, ...s}}>b</div>
        </div>;
    } else {
      comps =
        <div>
          <div style={{...b, ...s}}>b</div>
          <div style={{...a, ...s}}>a</div>
        </div>;
    }

    return (
      <div style={{...container, outline: '1px solid black'}}>
        {comps}
      </div>
    );
  }
});

module.exports = App;
