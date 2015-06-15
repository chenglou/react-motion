// smart but might need mixin

let React = require('react');
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
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };
  },

  // rafId: null,

  // repeatSetState: function(f) {
  //   if (this.rafId != null) {
  //     cancelAnimationFrame(this.rafId);
  //     this.rafId = null;
  //   }

  //   var state = f();
  //   if (!state) {
  //     return;
  //   }

  //   this.setState(state);
  //   let loop = () => {
  //     this.rafId = requestAnimationFrame(() => {
  //       let state = f();
  //       if (state) {
  //         this.setState(state);
  //         loop();
  //       }
  //     });
  //   };

  //   loop();
  // },

  // handleMouseMove: function(e) {
  //   if (e.nativeEvent.which === 0) {
  //     return;
  //   }

  //   let {pageX, pageY} = e;
  //   this.repeatSetState(() => {
  //     let {springs} = this.state;
  //     let newSprings = springs.map(([x, y, vx, vy], i) => {
  //       let [destX, destY] = i === 0 ? [pageX, pageY] : springs[i - 1];
  //       let [newX, newVx] = stepper(x, vx, destX, 140, 16);
  //       let [newY, newVy] = stepper(y, vy, destY, 140, 16);

  //       return [newX, newY, newVx, newVy];
  //     });

  //     let newState = {
  //       mouseX: pageX,
  //       mouseY: pageY,
  //       springs: newSprings,
  //     };
  //     if (JSON.stringify(this.state) !== JSON.stringify(newState)) {
  //       return newState;
  //     }
  //     return null;
  //   });
  // },

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
              transform: `translate3d(${x}px, ${y}px, 0)`,
              zIndex: springs.length - i,
            }} />
          );
        })}
      </div>
    );
  }
});

module.exports = App;
