'use strict';

import React from 'react';
import Springs from './Springs';
import {toArr, clone} from './utils';

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
        1: {text: 'Board the plane', isDone: false},
        2: {text: 'Sleep', isDone: false},
        3: {text: 'Try to finish coneference slides', isDone: false},
        4: {text: 'Eat cheese and drink wine', isDone: false},
        5: {text: 'Go around in Uber', isDone: false},
        6: {text: 'Talk with conf attendees', isDone: false},
        7: {text: 'Show Demo 1', isDone: false},
        8: {text: 'Show Demo 2', isDone: false},
        9: {text: 'Lament about the state of animation', isDone: false},
        10: {text: 'Show Secret Demo', isDone: false},
        11: {text: 'Go home', isDone: false},
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
        [Date.now()]: {text: value, isDone: false},
      },
    });
  },

  handleDone: function(key) {
    let {todos} = this.state;
    let newState = clone(todos);
    newState[key].isDone = !newState[key].isDone;
    this.setState({todos: newState});
  },

  handleToggleAll: function() {
    let {todos} = this.state;
    let allIsDone = false;
    // If all todos are done, we toggle all of them back
    for(let prop in todos) {
      if(!todos[prop].isDone) {
        allIsDone = true;
        break;
      }
    }

    let newTodos = {};
    for (let prop in todos) {
      newTodos[prop] = {text: todos[prop].text, isDone: allIsDone};
    }
    this.setState({todos: newTodos});
  },

  render: function() {
    let {todos, value} = this.state;
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form onSubmit={this.handleSubmit}>
            <input className="new-todo" placeholder="What needs to be done?" autoFocus={true} value={value} onChange={this.handleChange}/>
          </form>
        </header>
        <section className="main">
          <input className="toggle-all" type="checkbox" onChange={this.handleToggleAll}/>
          <Springs
            className="demo2"
            finalVals={(currVals, tween) => {
              let configs = {};
              Object.keys(todos)
                .filter(date => {
                  return todos[date].text.toUpperCase().includes(value.toUpperCase());
                })
                .forEach(date => {
                  configs[date] = {height: 60, opacity: 1};
                });
              return tween(configs);
            }}
            // TODO: default: reached dest, v = 0
            shouldRemove={(key, tween, destVals, currVals, currV) => {
              return currVals[key].opacity <= 0 && currV[key].opacity <= 0 ?
                null :
                tween({height: 0, opacity: 0});
            }}
            // TODO: default: destVals[key]
            // lifttable
            missingCurrentKey={() => ({height: 0, opacity: 1})}>
            {configs =>
              <ul className="todo-list">
                {Object.keys(configs).map(date =>
                  <li key={date} style={configs[date]} className={todos[date].isDone ? 'completed' : ''}>
                    <div className="view">
                      <input className="toggle" type="checkbox" onChange={this.handleDone.bind(null, date)} checked={todos[date].isDone}/>
                      <label>{todos[date].text}</label>
                    </div>
                  </li>
                )}
              </ul>
            }
          </Springs>
        </section>
        <footer className="footer">
          <span className="todo-count"><strong>{Object.keys(todos).filter(key => !todos[key].isDone).length}</strong> item left</span>
          <ul className="filters">
            <li>
              <a className="selected" href="#/">All</a>
            </li>
            <li>
              <a href="#/active">Active</a>
            </li>
            <li>
              <a href="#/completed">Completed</a>
            </li>
          </ul>
          <button className="clear-completed">Clear completed</button>
        </footer>
      </section>
    );
  }
});
