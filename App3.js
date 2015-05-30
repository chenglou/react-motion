let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('./stepper');

var App = React.createClass({
  getInitialState: function() {
    return {
      mouseX: 0,
      mouseY: 0,
      springs: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };
  },

  handleMouseMove: function(e) {
    if (e.nativeEvent.which === 0) {
      return;
    }

    this.setState({
      mouseX: e.pageX,
      mouseY: e.pageY,
    });
  },

  componentDidMount: function() {
    let loop = () => {
      requestAnimationFrame(() => {
        let {springs, mouseX, mouseY} = this.state;
        let newSprings = springs.map(([x, y, vx, vy], i) => {
          let [destX, destY] = i === 0 ? [mouseX, mouseY] : springs[i - 1];
          let [newX, newVx] = stepper(x, vx, destX, 120, 16);
          let [newY, newVy] = stepper(y, vy, destY, 120, 16);

          return [newX, newY, newVx, newVy];
        });

        this.setState({
          springs: newSprings,
        });
        loop();
      });
    };

    loop();
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
          return (
            <div key={i} style={{
              ...s,
              WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
              zIndex: springs.length - i,
            }} />
          );
        })}
      </div>
    );
  }
});

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

let layout1 = {
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
};

let layout2 = {
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
};

App = React.createClass({
  getInitialState: function() {
    let layout = computeLayout(layout1);

    return {
      // in-flight, animated. values computed with spring
      layout: layout,
      destLayout: layout,
      v: genVTree(layout),
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
      destLayout: toggle ? computeLayout(layout1) : computeLayout(layout2),
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
