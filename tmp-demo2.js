'use strict';

import React from 'react';
import Springs from './Springs';
import {clone} from './utils';

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

  handleSelect: function(selected) {
    this.setState({
      selected: selected
    });
  },

  handleClearCompleted: function() {
    let {todos} = this.state;
    let newTodos = {};
    for(var prop in todos) {
      if(!todos[prop].isDone) newTodos[prop] = todos[prop];
    }

    this.setState({todos: newTodos});
  },

  handleDestroy: function(date) {
    let {todos} = this.state;
    let newTodos = clone(todos);
    delete newTodos[date];
    this.setState({todos: newTodos});
  },

  render: function() {
    let {todos, value, selected} = this.state;
    return (
      <section className='todoapp'>
        <header className='header'>
          <h1>todos</h1>
          <form onSubmit={this.handleSubmit}>
            <input className='new-todo'
                   placeholder='What needs to be done?'
                   autoFocus={true}
                   value={value}
                   onChange={this.handleChange}/>
          </form>
        </header>
        <section className='main'>
          <input className='toggle-all' type='checkbox' onChange={this.handleToggleAll}/>
          <Springs
            className='demo2'
            finalVals={(currVals, tween) => {
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
            }}
            // TODO: default: reached dest, v = 0
            shouldRemove={(date, tween, destVals, currVals, currV) => {
              return currVals[date].opacity <= 0 && currV[date].opacity <= 0 ?
                null :
                tween({
                  height: 0,
                  opacity: 0,
                  data: tween(currVals[date].data, -1, -1),
                });
            }}
            // TODO: default: destVals[key]
            // lifttable
            missingCurrentKey={date => {
              return {
                height: 0,
                opacity: 1,
                data: todos[date],
              };
            }}>
            {configs => {
              return (
                <ul className='todo-list'>
                  {Object.keys(configs).map(date => {
                    return (
                      <li key={date} style={configs[date]} className={configs[date].data.isDone ? 'completed' : ''}>
                        <div className='view'>
                          <input className='toggle'
                                 type='checkbox'
                                 onChange={this.handleDone.bind(null, date)}
                                 checked={configs[date].data.isDone}/>
                          <label>{configs[date].data.text}</label>
                          <button className='destroy' onClick={this.handleDestroy.bind(null, date)}></button>
                        </div>
                      </li>
                    );
                  }
                  )}
                </ul>
              );
            }
            }
          </Springs>
        </section>
        <footer className='footer'>
          <span className='todo-count'>
            <strong>
              {Object.keys(todos).filter(key => !todos[key].isDone).length}
            </strong> item left
          </span>
          <ul className='filters'>
            <li>
              <a className={selected === 'all' ? 'selected' : ''}
                 onClick={this.handleSelect.bind(null, 'all')}
                 href='#/'>All</a>
            </li>
            <li>
              <a className={selected === 'active' ? 'selected' : ''}
                 onClick={this.handleSelect.bind(null, 'active')}
                 href='#/active'>Active</a>
            </li>
            <li>
              <a className={selected === 'completed' ? 'selected' : ''}
                 onClick={this.handleSelect.bind(null, 'completed')}
                 href='#/completed'>Completed</a>
            </li>
          </ul>
          <button className="clear-completed" onClick={this.handleClearCompleted}>Clear completed</button>
        </footer>
      </section>
    );
  }
});
