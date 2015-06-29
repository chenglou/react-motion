'use strict';

import React from 'react';
import Springs from './Springs';

if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

export default React.createClass({
  getInitialState: function() {
    return {
      todos: {
        // creation date => task name
        1: 'Board the plane',
        2: 'Sleep',
        3: 'Try to finish coneference slides',
        4: 'Eat cheese and drink wine',
        5: 'Go around in Uber',
        6: 'Talk with conf attendees',
        7: 'Show Demo 1',
        8: 'Show Demo 2',
        9: 'Lament about the state of animation',
        10: 'Show Secret Demo',
        11: 'Go home',
      },
      value: '',
    };
  },

  handleChange: function({target: {value}}) {
    this.setState({value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    let {todos, value} = this.state;
    this.setState({
      todos: {
        ...todos,
        [Date.now()]: value,
      },
    });
  },

  render: function() {
    let {todos, value} = this.state;
    return (
      <Springs
        className="demo2"
        finalVals={(currVals, tween) => {
          let configs = {};
          Object.keys(todos)
            .filter(date => {
              return todos[date].toUpperCase().includes(value.toUpperCase());
            })
            .forEach(date => {
              configs[date] = {height: 40, opacity: 1};
            });
          return tween(configs);
        }}
        // TODO: default: reached dest, v = 0
        shouldRemove={(key, tween, destVals, currVals, currV) => {
          return currVals[key].opacity === 0 && currV[key].opacity === 0 ?
            null :
            tween({height: 0, opacity: 0});
        }}
        // TODO: default: destVals[key]
        // lifttable
        missingCurrentKey={() => ({height: 0, opacity: 1})}>
        {configs =>
          <form onSubmit={this.handleSubmit}>
            <input value={value} onChange={this.handleChange} />
            {Object.keys(configs).map(date =>
              <div key={date} className="demo2-todo" style={configs[date]}>
                {todos[date]}
              </div>
            )}
          </form>
        }
      </Springs>
    );
  }
});
