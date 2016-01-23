import React from 'react';
import {TransitionMotion, spring} from '../../src/react-motion';
import presets from '../../src/presets';

const Demo = React.createClass({
  getInitialState() {
    return {
      todos: [
        // key is creation date
        {key: 't1', text: 'Board the plane', isDone: false},
        {key: 't2', text: 'Sleep', isDone: false},
        {key: 't3', text: 'Try to finish coneference slides', isDone: false},
        {key: 't4', text: 'Eat cheese and drink wine', isDone: false},
        {key: 't5', text: 'Go around in Uber', isDone: false},
        {key: 't6', text: 'Talk with conf attendees', isDone: false},
        {key: 't7', text: 'Show Demo 1', isDone: false},
        {key: 't8', text: 'Show Demo 2', isDone: false},
        {key: 't9', text: 'Lament about the state of animation', isDone: false},
        {key: 't10', text: 'Show Secret Demo', isDone: false},
        {key: 't11', text: 'Go home', isDone: false},
      ],
      value: '',
      selected: 'all',
    };
  },

  // logic from todo, unrelated to animation
  handleChange({target: {value}}) {
    this.setState({value});
  },

  handleSubmit(e) {
    e.preventDefault();
    const newItem = {
      key: 't' + Date.now(),
      text: this.state.value,
      isDone: false,
    };
    // append at head
    this.setState({todos: [newItem].concat(this.state.todos)});
  },

  handleDone(key) {
    this.setState({
      todos: this.state.todos.map(todo =>
        todo.key === key ? {...todo, isDone: !todo.isDone} : todo
      ),
    });
  },

  handleToggleAll() {
    const allDone = this.state.todos.every(({isDone}) => isDone);
    this.setState({
      todos: this.state.todos.map(todo => ({...todo, isDone: allDone})),
    });
  },

  handleSelect(selected) {
    this.setState({selected});
  },

  handleClearCompleted() {
    this.setState({todos: this.state.todos.filter(({isDone}) => !isDone)});
  },

  handleDestroy(date) {
    this.setState({todos: this.state.todos.filter(({key}) => key === date)});
  },

  // actual animation-related logic
  getDefaultStyles() {
    return this.state.todos.map(todo => ({...todo, style: {height: 0, opacity: 1}}));
  },

  getStyles() {
    const {todos, value, selected} = this.state;
    return todos.filter(({isDone, text}) => {
      return text.toUpperCase().indexOf(value.toUpperCase()) >= 0 &&
        (selected === 'completed' && isDone ||
        selected === 'active' && !isDone ||
        selected === 'all');
    })
    .map(todo => {
      return {
        ...todo,
        style: {
          height: spring(60, presets.gentle),
          opacity: spring(1, presets.gentle),
        }
      };
    });
  },

  willEnter() {
    return {
      height: 0,
      opacity: 1,
    };
  },

  willLeave() {
    return {
      height: spring(0),
      opacity: spring(0),
    };
  },

  render() {
    const {todos, value, selected} = this.state;
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form onSubmit={this.handleSubmit}>
            <input
              autoFocus={true}
              className="new-todo"
              placeholder="What needs to be done?"
              value={value}
              onChange={this.handleChange}
            />
          </form>
        </header>
        <section className="main">
          <input className="toggle-all" type="checkbox" onChange={this.handleToggleAll} />
          <TransitionMotion
            defaultStyles={this.getDefaultStyles()}
            styles={this.getStyles()}
            willLeave={this.willLeave}
            willEnter={this.willEnter}>
            {styles =>
              <ul className="todo-list">
                {styles.map(({key, isDone, text, style}) =>
                  <li key={key} style={style} className={isDone ? 'completed' : ''}>
                    <div className="view">
                      <input
                        className="toggle"
                        type="checkbox"
                        onChange={this.handleDone.bind(null, key)}
                        checked={isDone}
                      />
                      <label>{text}</label>
                      <button
                        className="destroy"
                        onClick={this.handleDestroy.bind(null, key)}
                      />
                    </div>
                  </li>
                )}
              </ul>
            }
          </TransitionMotion>
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong>
              {todos.filter(({isDone}) => !isDone).length}
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
  },
});

export default Demo;
