import React from 'react';
import {spring} from '../src/react-motion';
import createMockRaf from './createMockRaf';
import TestUtils from 'react-addons-test-utils';

const injector = require('inject!../src/makeTransitionMotion');

describe('TransitionMotion', () => {
  let TransitionMotion;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    TransitionMotion = injector({
      raf: mockRaf.raf,
      'performance-now': mockRaf.now,
    })(React);
  });

  it('should allow returning null from children function', () => {
    const App = React.createClass({
      render() {
        // shouldn't throw here
        return <TransitionMotion styles={{a: {}}}>{() => null}</TransitionMotion>;
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  // TODO: assert on console.warn/error
  it('should not throw on unmount', () => {
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion defaultStyles={{a: {x: 0}}} styles={{a: {x: 10}}}>
            {() => null}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);
    mockRaf.step(3);
    TestUtils.renderIntoDocument(<div />);
    mockRaf.step(3);
  });

  it('should allow a defaultStyles', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            defaultStyles={{k: {a: 0}}}
            styles={{k: {a: spring(10)}}}>
            {({k}) => {
              count.push(k);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{a: 0}]);
    mockRaf.step(4);
    expect(count).toEqual([
      {a: 0},
      {a: 0.4722222222222222},
      {a: 1.1897376543209877},
      {a: 2.0123698988340193},
      {a: 2.8557218143909084},
    ]);
  });

  it('should accept different spring configs', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            defaultStyles={{key: {a: 0}}}
            styles={{key: {a: spring(10, {stiffness: 100, damping: 50, precision: 16})}}}>
            {({key: {a}}) => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    mockRaf.step(99);
    expect(count).toEqual([
      0,
      0.2777777777777778,
      0.5941358024691358,
      0.9081361454046639,
      1.213021309632678,
      1.5079182450697726,
      1.7929588941684615,
      2.0684390330691236,
      10,
    ]);
  });

  it('should interpolate many values', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            defaultStyles={{k1: {a: 0, b: 10}, k2: {c: 20}}}
            styles={{k1: {a: spring(10), b: spring(410)}, k2: {c: spring(420)}}}>
            {a => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{k1: {a: 0, b: 10}, k2: {c: 20}}]);
    mockRaf.step(4);
    expect(count).toEqual([
      {k1: {a: 0, b: 10}, k2: {c: 20}},
      {k1: {a: 0.4722222222222222, b: 28.888888888888886}, k2: {c: 38.888888888888886}},
      {k1: {a: 1.1897376543209877, b: 57.589506172839506}, k2: {c: 67.589506172839506}},
      {k1: {a: 2.0123698988340193, b: 90.49479595336075}, k2: {c: 100.49479595336075}},
      {k1: {a: 2.8557218143909084, b: 124.22887257563633}, k2: {c: 134.22887257563632}},
    ]);
  });

  it('should work with nested TransitionMotions', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion defaultStyles={{owner: {x: 0}}} styles={{owner: {x: spring(10)}}}>
            {({owner}) => {
              count.push(owner);
              return (
                <TransitionMotion defaultStyles={{child: {x: 10}}} styles={{child: {x: spring(400)}}}>
                  {({child}) => {
                    count.push(child);
                    return null;
                  }}
                </TransitionMotion>
              );
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([
      {x: 0},
      {x: 10},
    ]);
    mockRaf.step();
    expect(count).toEqual([
      {x: 0},
      {x: 10},
      {x: 28.416666666666668}, // child
      {x: 0.4722222222222222}, // owner
      {x: 28.416666666666668}, // child
    ]);
    mockRaf.step(2);
    expect(count).toEqual([
      {x: 0},
      {x: 10},
      {x: 28.416666666666668},
      {x: 0.4722222222222222},
      {x: 28.416666666666668},

      {x: 56.39976851851852}, // child
      {x: 1.1897376543209877}, // owner
      {x: 56.39976851851852}, // child

      {x: 88.48242605452674}, // child
      {x: 2.0123698988340193}, // owner
      {x: 88.48242605452674}, // child
    ]);
  });

  it('should reach destination value', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            defaultStyles={{key: {a: 0}}}
            styles={{key: {a: spring(400)}}}>
            {({key: {a}}) => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    // Move "time" until we reach the final styles value
    mockRaf.step(111);
    expect(count.slice(0, 5)).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336075,
      114.22887257563633,
    ]);
    expect(count[count.length - 1]).toEqual(400);
  });

  it('should support jumping to value', () => {
    let count = [];
    let setState = () => {};
    const App = React.createClass({
      getInitialState() {
        return {p: false};
      },
      componentWillMount() {
        setState = this.setState.bind(this);
      },
      render() {
        return (
          <TransitionMotion styles={{a: {x: this.state.p ? 400 : spring(0)}}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{x: 0}]);
    setState({p: true});
    expect(count).toEqual([
      {x: 0},
      {x: 0}, // this new 0 comes from owner update, causing TransitionMotion to re-render
    ]);
    mockRaf.step(10);
    // jumped to end, will only have two renders no matter how much we step
    expect(count).toEqual([
      {x: 0},
      {x: 0},
      {x: 400},
    ]);
    setState({p: false});
    mockRaf.step(3);
    expect(count).toEqual([
      {x: 0},
      {x: 0},
      {x: 400},
      {x: 400}, // redundant 0 comes from owner update again
      {x: 381.1111111111111},
      {x: 352.4104938271605},
      {x: 319.5052040466392},
    ]);
  });

  it('should behave well when many owner updates come in-between rAFs', () => {
    let count = [];
    let setState = () => {};
    const App = React.createClass({
      getInitialState() {
        return {a: {x: spring(0)}};
      },
      componentWillMount() {
        setState = this.setState.bind(this);
      },
      render() {
        return (
          <TransitionMotion
            styles={this.state}
            willEnter={() => ({y: 0})}
            willLeave={() => ({y: spring(0)})}>
            {a => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{a: {x: 0}}]);
    setState({a: {x: 400}, b: {y: 10}});
    setState({a: {x: spring(100)}});
    mockRaf.step(2);
    setState({a: {x: spring(400)}});
    mockRaf.step(2);
    expect(count).toEqual([
      {a: {x: 0}},
      {a: {x: 0}}, // this new 0 comes from owner update, causing TransitionMotion to re-render
      {a: {x: 400}, b: {y: 10}},
      {a: {x: 385.8333333333333}, b: {y: 10}},
      {a: {x: 364.3078703703703}, b: {y: 10}},
      {a: {x: 364.3078703703703}, b: {y: 10}},
      {a: {x: 353.79556970164606}, b: {y: 10}},
      {a: {x: 350.02047519790233}, b: {y: 10}},
    ]);
  });

  it('should behave well when many owner styles function updates come in-between rAFs', () => {
    // same test as above, except `styles` is a funciton here
    let count = [];
    let setState = () => {};
    const App = React.createClass({
      getInitialState() {
        return {a: {x: spring(0)}};
      },
      componentWillMount() {
        setState = this.setState.bind(this);
      },
      render() {
        return (
          <TransitionMotion
            styles={() => this.state}
            willEnter={() => ({y: 0})}
            willLeave={() => ({y: spring(0)})}>
            {a => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{a: {x: 0}}]);
    setState({a: {x: 400}, b: {y: 10}});
    setState({a: {x: spring(100)}});
    mockRaf.step(2);
    setState({a: {x: spring(400)}});
    mockRaf.step(2);
    expect(count).toEqual([
      {a: {x: 0}},
      {a: {x: 0}}, // this new 0 comes from owner update, causing TransitionMotion to re-render
      {a: {x: 400}, b: {y: 10}},
      {a: {x: 385.8333333333333}, b: {y: 10}},
      {a: {x: 364.3078703703703}, b: {y: 10}},
      {a: {x: 364.3078703703703}, b: {y: 10}},
      {a: {x: 353.79556970164606}, b: {y: 10}},
      {a: {x: 350.02047519790233}, b: {y: 10}},
    ]);
  });

  it('should transition things in/out at the beginning', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            willLeave={() => ({c: spring(0)})}
            willEnter={() => ({d: 0})}
            defaultStyles={{k1: {a: 0, b: 10}, k2: {c: 20}}}
            styles={{k1: {a: spring(10), b: spring(410)}, k3: {d: spring(10)}}}>
            {a => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{k1: {a: 0, b: 10}, k2: {c: 20}, k3: {d: 0}}]);
    mockRaf.step(2);
    expect(count).toEqual([
      {k1: {a: 0, b: 10}, k2: {c: 20}, k3: {d: 0}},
      {k1: {a: 0.4722222222222222, b: 28.888888888888886}, k2: {c: 19.055555555555557}, k3: {d: 0.4722222222222222}},
      {k1: {a: 1.1897376543209877, b: 57.589506172839506}, k2: {c: 17.62052469135803}, k3: {d: 1.1897376543209877}},
    ]);
    mockRaf.step(999);
    expect(count.length).toBe(106);
    expect(count[count.length - 1]).toEqual({k1: {a: 10, b: 410}, k3: {d: 10}});
  });

  it('should eliminate things in/out at the beginning', () => {
    // similar to previous test, but without willEnter/leave
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            defaultStyles={{k1: {a: 0, b: 10}, k2: {c: 20}}}
            styles={{k1: {a: spring(10), b: spring(410)}, k3: {d: spring(10)}}}>
            {a => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{k1: {a: 0, b: 10}, k3: {d: 10}}]);
    mockRaf.step(2);
    expect(count).toEqual([
      {k1: {a: 0, b: 10}, k3: {d: 10}},
      {k1: {a: 0.4722222222222222, b: 28.888888888888886}, k3: {d: 10}},
      {k1: {a: 1.1897376543209877, b: 57.589506172839506}, k3: {d: 10}},
    ]);
  });
});
