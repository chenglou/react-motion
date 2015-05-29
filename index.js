let React = require('react');

/* Block position and velocity. */
var block = {
  x: 100,
  v: 0,
  destX: 120,

  y: 50,
  destY: 100,
  vy: 0
};

var block1 = {
  x: 100,
  v: 0,
  destX: 120,

  y: 50,
  destY: 100,
  vy: 0
};

var block2 = {
  x: 100,
  v: 0,
  destX: 120,

  y: 50,
  destY: 100,
  vy: 0
};

var frameRate = 1 / 60;

var canvas;
var ctx;
var width = 500;
var height = 600;

function stepper(x, v, destX, mass, k, b) {
  /* Spring stiffness, in kg / s^2 */
  // destX is really string length (spring at rest)
  var F_spring = -k * (x - destX);

  /* Damping constant, in kg / s */
  var F_damper = -b * v;

  // var mass = 0.5;
  var a = (F_spring + F_damper) / mass;

  var newX = x + v * frameRate;
  var newV = v + a * frameRate;

  if (Math.abs(newV - v) < 0.001 && Math.abs(newX - x) < 0.001) {
    return [destX, 0];
  }

  return [newX, newV];
}

// function loop() {
//   [block.x, block.v] = stepper(block.x, block.v, block.destX);
//   [block.y, block.vy] = stepper(block.y, block.vy, block.destY);

//   [block1.x, block1.v] = stepper(block1.x, block1.v, block.x);
//   [block1.y, block1.vy] = stepper(block1.y, block1.vy, block.y);

//   [block2.x, block2.v] = stepper(block2.x, block2.v, block1.x);
//   [block2.y, block2.vy] = stepper(block2.y, block2.vy, block1.y);

//   /* Drawing */
//   ctx.clearRect(0, 0, width, height);

//   ctx.save();

//   ctx.fillStyle = 'green';
//   ctx.fillRect(block2.x, block2.y, 50, 50);
//   ctx.fillStyle = 'red';
//   ctx.fillRect(block1.x, block1.y, 50, 50);
//   ctx.fillStyle = 'black';
//   ctx.fillRect(block.x, block.y, 50, 50);

//   ctx.restore();
// };

// canvas = document.getElementById('canvas');
// ctx = canvas.getContext('2d');

// canvas.onmousedown = canvas.onmousemove = function(e) {
//   // mouse down
//   if (e.which == 1) {
//     block.destX = e.pageX - canvas.offsetLeft;
//     block.destY = e.pageY - canvas.offsetTop;
//   }
// };

// function raf() {
//   requestAnimationFrame(function(a) {
//     loop();
//     raf();
//   });
// }
// raf();

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
      tension: 60,
      friction: 8,
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
        stepper(currValue == null ? value : currValue, v, value, 0.5, tension, friction);

      if (newV === v && newCurrValue === currValue) {
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
      // springs: [[0, 0]],
      springs: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
      // springs: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
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
            <Spring key={i}  value={destX} onValueChange={this.handleValueChange.bind(null, i, 0)}>
              <Spring  value={destY} onValueChange={this.handleValueChange.bind(null, i, 1)}>
                <div style={{
                  ...s,
                  WebkitTransform: `translate3d(${x}px, ${y}px, 0)`,
                  zIndex: springs.length - i,
                }} />
              </Spring>
            </Spring>
          );
        })}
      </div>
    );
  }
});

// React.render(<App />, document.getElementById('content'));

var App2 = React.createClass({
  getInitialState: function() {
    return {
      mouseX: 0,
      mouseY: 0,
      springs: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      // springs: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    };
  },

  rafId: null,

  repeatSetState: function(f) {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    var state = f();
    if (!state) {
      return;
    }

    this.setState(state);
    let loop = () => {
      this.rafId = requestAnimationFrame(() => {
        let state = f();
        if (state) {
          this.setState(state);
          loop();
        }
      });
    };

    loop();
  },

  handleMouseMove: function(e) {
    if (e.nativeEvent.which === 0) {
      return;
    }

    let {pageX, pageY} = e;
    this.repeatSetState(() => {
      let {springs} = this.state;
      let newSprings = springs.map(([x, y, vx, vy], i) => {
        let [destX, destY] = i === 0 ? [pageX, pageY] : springs[i - 1];
        let [newX, newVx] = stepper(x, vx, destX, 0.5, 60, 8);
        let [newY, newVy] = stepper(y, vy, destY, 0.5, 60, 8);

        return [newX, newY, newVx, newVy];
      });

      let newState = {
        mouseX: pageX,
        mouseY: pageY,
        springs: newSprings,
      };
      if (JSON.stringify(this.state) !== JSON.stringify(newState)) {
        return newState;
      }
      return null;
    });
  },

  // componentDidMount: function() {
  //   let loop = () => {
  //     requestAnimationFrame(() => {
  //       let {springs, mouseX, mouseY} = this.state;
  //       let newSprings = springs.map(([x, y, vx, vy], i) => {
  //         let [destX, destY] = i === 0 ? [mouseX, mouseY] : springs[i - 1];
  //         let [newX, newVx] = stepper(x, vx, destX, 0.5, 60, 8);
  //         let [newY, newVy] = stepper(y, vy, destY, 0.5, 60, 8);

  //         return [newX, newY, newVx, newVy];
  //       });

  //       this.setState({
  //         springs: newSprings,
  //       });
  //       loop();
  //     });
  //   };

  //   loop();
  // },

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

React.render(<App2 />, document.getElementById('content'));
