'use strict';

import React from 'react';
import Springs from './Springs';

export default React.createClass({
  getInitialState: function() {
    return {items: ['1', '2', '3']};
  },

  componentDidMount: function() {
    window.addEventListener('keydown', e => {
      if (e.which === 74) { // j
        this.setState({items: ['1', '2', '3']});
      } else if (e.which === 75) { // k
        this.setState({items: ['2']});
      } else if (e.which === 76) { // l
        this.setState({items: ['1', '2', '4']});
      }
    });
  },

  render: function() {
    let {items} = this.state;
    return (
      <Springs
        finalVals={(currVals, tween) => {
          let configs = {};
          items.forEach((key, i) => {
            configs[key] = {
              x: 0,
              height: (i + 1) * 20,
              opacity: 1,
            };
          });
          return tween(configs);
        }}
        // TODO: default: reached dest, v = 0
        shouldRemove={(key, tween, destVals, currVals, currV) => {
          return currVals[key].opacity === 0 && currV[key].opacity === 0 ?
            null :
            tween({
              x: 300,
              height: 0,
              opacity: 0,
            });
        }}
        // TODO: default: destVals[key]
        // lifttable
        missingCurrentKey={(key, destVals) => {
          return {
            x: -300,
            height: 0,
            opacity: 1,
          };
        }}>
        {
          configs =>
            <div style={{width: 300, padding: 20, outline: '1px solid black'}}>
              {Object.keys(configs).map(key => {
                let {x, ...rest} = configs[key];
                return (
                  <div key={key} style={{
                    ...rest,
                    transform: `translate3d(${x}px, 0, 0)`,
                    outline: '1px solid black',
                  }}>{key}</div>
                );
              })}
            </div>
        }
      </Springs>
    );
  }
});
