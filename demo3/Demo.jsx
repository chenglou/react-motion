'use strict';

import React from 'react';
import {TransitionSpring} from '../Spring';

let Demo = React.createClass({
  getInitialState: function() {
    return {
      todos: [
        // key is creation date
        {key: 1, text: 'Board the plane', isDone: false},
        {key: 2, text: 'Sleep', isDone: false},
        {key: 3, text: 'Try to finish coneference slides', isDone: false},
        {key: 4, text: 'Eat cheese and drink wine', isDone: false},
        {key: 5, text: 'Go around in Uber', isDone: false},
        {key: 6, text: 'Talk with conf attendees', isDone: false},
        {key: 7, text: 'Show Demo 1', isDone: false},
        {key: 8, text: 'Show Demo 2', isDone: false},
        {key: 9, text: 'Lament about the state of animation', isDone: false},
        {key: 10, text: 'Show Secret Demo', isDone: false},
        {key: 11, text: 'Go home', isDone: false},
      ],
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
    this.setState({
      todos: [{text: value, isDone: false, key: Date.now()}, ...todos]
    });
  },

  handleDone: function(key) {
    let {todos} = this.state;
    todos.forEach((v, i) => {
      if (v.key === key) todos[i].isDone = !todos[i].isDone;
    });
    this.forceUpdate();
  },

  handleToggleAll: function() {
    let {todos} = this.state;

    let allDone = todos.every(v => v.isDone);
    todos.forEach((v, i) => todos[i].isDone = !allDone);
    this.forceUpdate();
  },

  handleSelect: function(selected) {
    this.setState({selected});
  },

  handleClearCompleted: function() {
    let {todos} = this.state;
    this.setState({todos: todos.filter(v => !v.isDone)});
  },

  handleDestroy: function(key) {
    let {todos} = this.state;
    this.setState({todos: todos.filter(v => v.key !== key)});
  },

  getValues: function(tween) {
    let {todos, value, selected} = this.state;
    // let configs = {};
    return tween(todos
      .filter(todo => {
        return todo.text.toUpperCase().indexOf(value.toUpperCase()) >= 0 &&
          (selected === 'completed' && todo.isDone ||
            selected === 'active' && !todo.isDone ||
            selected === 'all');
      })
      .map(todo => {
        return {
          key: todo.key,
          data: tween(todo, -1, -1),
          height: 60,
          opacity: 1,
        };
      }));
  },

  willEnter: function(currTodo) {
    return {
      key: currTodo.key,
      height: 0,
      opacity: 1,
      data: currTodo.data,
    };
  },

  willLeave: function(currTodo, tween) {
    if (currTodo.opacity > 0) {
      return tween({
        key: currTodo.key,
        height: 0,
        opacity: 0,
        data: tween(currTodo.data, -1, -1),
      });
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
                {configs.map(config => {
                  let {data: {isDone, text}, ...style} = config;
                  return (
                    <li key={config.key} style={style} className={isDone ? 'completed' : ''}>
                      <div className="view">
                        <input
                          className="toggle"
                          type="checkbox"
                          onChange={this.handleDone.bind(null, config.key)}
                          checked={isDone}
                        />
                        <label>{text}</label>
                        <button
                          className="destroy"
                          onClick={this.handleDestroy.bind(null, config.key)}
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

export default Demo;
