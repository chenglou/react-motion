'use strict';

import React from 'react';
import {TransitionSpring} from '../Spring';

let Demo = React.createClass({
  getInitialState: function() {
    return {
      todos: {
        // key is creation date
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
      selected: 'all'
    };
  },

  handleChange: function({target: {value}}) {
    this.setState({value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    let {todos, value} = this.state;
    todos[Date.now()] = {text: value, isDone: false};
    this.forceUpdate();
  },

  handleDone: function(key) {
    let {todos} = this.state;
    todos[key].isDone = !todos[key].isDone;
    this.forceUpdate();
  },

  handleToggleAll: function() {
    let {todos} = this.state;
    let keys = Object.keys(todos);
    let allDone = keys.every(date => todos[date].isDone);
    keys.forEach(date => todos[date].isDone = !allDone);
    this.forceUpdate();
  },

  handleSelect: function(selected) {
    this.setState({selected});
  },

  handleClearCompleted: function() {
    let {todos} = this.state;
    let newTodos = {};
    for (var prop in todos) {
      if (!todos[prop].isDone) {
        newTodos[prop] = todos[prop];
      }
    }
    this.setState({todos: newTodos});
  },

  handleDestroy: function(date) {
    let {todos} = this.state;
    delete todos[date];
    this.forceUpdate();
  },

  getValues: function(tween) {
    let {todos, value, selected} = this.state;
    let configs = {};
    Object.keys(todos)
      .filter(date => {
        let todo = todos[date];
        return todo.text.toUpperCase().indexOf(value.toUpperCase()) >= 0 &&
          (selected === 'completed' && todo.isDone ||
            selected === 'active' && !todo.isDone ||
            selected === 'all');
      })
      .forEach(date => {
        configs[date] = {
          data: tween(todos[date], -1, -1),
          height: 60,
          opacity: 1,
        };
      });
    return tween(configs);
  },

  willEnter: function(date) {
    return {
      height: 0,
      opacity: 1,
      data: this.state.todos[date],
    };
  },

  willLeave: function(date, tween, destVals, currVals, currV) {
    if (currVals[date].opacity > 0 || currV[date].opacity > 0) {
      return tween({
        height: 0,
        opacity: 0,
        data: tween(currVals[date].data, -1, -1),
      }, 160, 23);
    }
  },

  render: function() {
    let {todos, value, selected} = this.state;
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form onSubmit={this.handleSubmit}>
            <input
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus={true}
              value={value}
              onChange={this.handleChange}
            />
          </form>
        </header>
        <section className="main">
          <input className="toggle-all" type="checkbox" onChange={this.handleToggleAll}/>
          <TransitionSpring values={this.getValues} willLeave={this.willLeave} willEnter={this.willEnter}>
            {configs =>
              <ul className="todo-list">
                {Object.keys(configs).map(date => {
                  let config = configs[date];
                  let {data: {isDone, text}, ...style} = config;
                  return (
                    <li key={date} style={style} className={isDone ? 'completed' : ''}>
                      <div className="view">
                        <input
                          className="toggle"
                          type="checkbox"
                          onChange={this.handleDone.bind(null, date)}
                          checked={isDone}
                        />
                        <label>{text}</label>
                        <button
                          className="destroy"
                          onClick={this.handleDestroy.bind(null, date)}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            }
          </TransitionSpring>
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong>
              {Object.keys(todos).filter(key => !todos[key].isDone).length}
            </strong> item left
          </span>
          <ul className="filters">
            <li>
              <a
                className={selected === 'all' ? 'selected' : ''}
                onClick={this.handleSelect.bind(null, 'all')}>
                All
              </a>
            </li>
            <li>
              <a
                className={selected === 'active' ? 'selected' : ''}
                onClick={this.handleSelect.bind(null, 'active')}>
                Active
              </a>
            </li>
            <li>
              <a
                className={selected === 'completed' ? 'selected' : ''}
                onClick={this.handleSelect.bind(null, 'completed')}>
                Completed
              </a>
            </li>
          </ul>
          <button className="clear-completed" onClick={this.handleClearCompleted}>
            Clear completed
          </button>
        </footer>
      </section>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
