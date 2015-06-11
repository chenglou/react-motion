// twitter card interpolate layout

let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('./stepper');

// given a css-layout output tree, generate a homoiconic tree with values being
// speed (for spring) rather than the x values
function genVTree({width, height, top, left, children}) {
  return {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    children: children ? children.map(genVTree) : undefined,
  };
}

// assuming a and b are homoiconic
function map3Tree({width, height, top, left, children}, b, c, f) {
  return {
    width: f(width, b.width, c.width),
    height: f(height, b.height, c.height),
    top: f(top, b.top, c.top),
    left: f(left, b.left, c.left),
    children: children
      ? children.map((child, i) => map3Tree(child, b.children[i], c.children[i], f))
      : undefined,
  }
}

let layout1 = computeLayout({
  style: {width: 500, height: 300, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {justifyContent: 'space-between', flexDirection: 'row'},
      children: [
        {
          style: {flex: 1}
        },
        {
          style: {width: 100, height: 100}
        },
      ],
    },
    {
      style: {flex: 1}
    },
  ],
});

let layout2 = computeLayout({
  style: {width: 500, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {justifyContent: 'space-between', flexDirection: 'row'},
      children: [
        {
          style: {flex: 1}
        },
        {
          style: {width: 120, height: 120}
        },
      ],
    },
    {
      style: {flex: 1}
    },
  ],
});

let App = React.createClass({
  getInitialState: function() {
    return {
      // in-flight, animated. values computed with spring
      layout: layout1,
      destLayout: layout1,
      v: genVTree(layout1),
      toggle: false,
    };
  },

  componentDidMount: function() {
    let loop = () => {
      requestAnimationFrame(() => {
        let {layout, v, destLayout} = this.state;
        let newLayout =
          map3Tree(layout, v, destLayout, (x, vx, destX) => stepper(x, vx, destX, 120, 16)[0]);
        let newV =
          map3Tree(layout, v, destLayout, (x, vx, destX) => stepper(x, vx, destX, 120, 16)[1]);

        this.setState({
          layout: newLayout,
          v: newV,
        })

        loop();
      });
    };

    loop();
  },

  handleClick: function() {
    let toggle = this.state.toggle;
    this.setState({
      destLayout: toggle ? layout1 : layout2,
      toggle: !toggle,
    });
  },

  render: function() {
    let {
      children: [
        {
          children: [name, photo],
          ...firstRow
        },
        desc
      ],
      ...container,
    } = this.state.layout;

    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    return (
      <div onClick={this.handleClick} style={{...container, outline: '1px solid black', position: 'relative'}}>
        <div style={{...firstRow, ...s}}>
          <div style={{...name, ...s}}>
            @_chenglou
          </div>
          <div style={{...photo, ...s}}></div>
        </div>
        <div style={{...desc, ...s}}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet,
          enim. Iste ipsum a dignissimos obcaecati rerum doloribus cumque
          incidunt sunt, numquam, saepe natus corporis commodi aut rem,
          reprehenderit labore. A!
        </div>
      </div>
    );
  }
});

module.exports = App;
