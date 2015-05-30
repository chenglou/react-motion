let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('./stepper');

let config = [
  [1, 2, 3, 4],
  [1, 4, 3, 2],
];

let layout1 = {
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {flex: 1},
    },
    {
      style: {flex: 2},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
  ],
};

let App = React.createClass({
  getInitialState: function() {
    return {
      configNum: 0,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', e => {
      // j = 74, k = 75
      if (e.which === 74) {
        this.setState({
          configNum: 1
        });
      } else if (e.which === 75) {
        this.setState({
          configNum: 0
        });
      }
    });
  },

  render: function() {
    let {configNum} = this.state;
    let {
      children,
      ...container
    } = computeLayout(layout1);
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    return (
      <div style={{...container, outline: '1px solid black', position: 'relative'}}>
        {config[configNum].map((item, i) => {
          return (
            <div key={i} style={{...children[i], ...s}}>
              asd {item}
            </div>
          );
        })}
      </div>
    );
  }
});

module.exports = App
