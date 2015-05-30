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

App = React.createClass({
  getInitialState: function() {
    return computeLayout({
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
    } = this.state;

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
