import React, {addons, PropTypes} from 'react/addons';
import {spring} from '../src/react-motion';
import createMockRaf from './createMockRaf';

const TestUtils = addons.TestUtils;

const injector = require('inject!../src/components');
const injectorAnimationLoop = require('inject!../src/animationLoop');

describe('Motion', () => {
  let Motion;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    const components = injector({
      './animationLoop': injectorAnimationLoop({
        raf: mockRaf.raf,
        'performance-now': mockRaf.now,
      }),
    })(React);

    Motion = components.Motion;
  });

  it('should allow returning null from children function', () => {
    const App = React.createClass({
      render() {
        // shouldn't throw here
        return <Motion style={{a: 0}}>{() => null}</Motion>;
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  xit('should not throw on unmount', () => {
    const App = React.createClass({
      render() {
        return (
          <Motion style={() => TestUtils.renderIntoDocument(<div />)}>
            {() => null}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  it('should allow a defaultStyle', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(10)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    // Move "time" by 8 steps, which is equivalent to 8 calls to `raf`
    mockRaf.step(4);
    expect(count).toEqual([
      0,
      0.4722222222222222,
      1.1897376543209877,
      2.0123698988340193,
      2.8557218143909084,
    ]);
  });

  it('should accept different spring configs', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(10, [100, 50])}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);
    // Move "time" by 8 steps, which is equivalent to 8 calls to `raf`
    mockRaf.step(2);
    expect(count).toEqual([
      0,
      0.2777777777777778,
      0.5941358024691358,
    ]);
  });

  it('should interpolate many values', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion
            defaultStyle={{a: 0, b: 10}}
            style={{a: spring(10), b: spring(410)}}>
            {({a, b}) => {
              count.push([a, b]);
              return null;
            }}
          </Motion>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([[0, 10]]);
    mockRaf.step(4);
    expect(count).toEqual([
      [0, 10],
      [0.4722222222222222, 28.888888888888886],
      [1.1897376543209877, 57.589506172839506],
      [2.0123698988340193, 90.49479595336076],
      [2.8557218143909084, 124.22887257563632],
    ]);
  });

  it('should call raf one more time after it is done animating', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion style={{val: 400}}>
            {({val}) => {
              count.push(val);
              return null;
            }}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([400]);
    mockRaf.step(10); // Shouldn't matter, we stop rafing
    expect(count).toEqual([400, 400]);
  });

  it('should work with nested Motions', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion style={{owner: 10}}>
          {({owner}) => {
            count.push(owner);
            return (
              <Motion style={{child: 400}}>
                {({child}) => {
                  count.push(child);
                  return null;
                }}
              </Motion>
            );
          }}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Here's why we expect this with the current implementation:
    //
    // - mount <App />
    // - render owner Motion                           [10]
    // - the above triggers the child Motion to render [10, 400]
    // - step once (both Motion calculations are done
    //   in the same step)
    // - render the child Motion                       [10, 400, 400]
    // - render the owner Motion                       [10, 400, 400, 10]
    // - the above triggers the child Motion to render [10, 400, 400, 10, 400]
    // - step a second time which only affects the
    //   child who registered one last raf in the step
    //   above

    expect(count).toEqual([10, 400]);
    mockRaf.step();
    expect(count).toEqual([10, 400, 400, 10, 400]);

    // Step many times won't matter, the child only renders once more
    mockRaf.step(10);
    expect(count).toEqual([10, 400, 400, 10, 400, 400]);
  });

  it('should be able to move by two steps if Motion gets out of sync', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(400)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Initial render
    expect(count).toEqual([0]);
    mockRaf.step(6);
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632,
      146.83959701218743,
      177.2738043339909,
    ]);
    // Due to floating point errors when calculating the accumulated time inside
    // the animationLoop, arriving at that last value the accumulated time will
    // go barely beyond 1000/60 and so the animation loop will move by two
    // frames but will only move by say 1% towards that 2nd frame. Before the
    // for loop calculating more than one frame would just calculate the same
    // frame over and over again, but we'd still move 1% towards that. So when
    // the loop was broken, 177.2738043339909 would be 146.83959701218743
  });

  xit('should NOT warn when parent kills the child Motion', () => {
    let count = [];
    let shouldKill = false;
    const App = React.createClass({
      propTypes: {
        kill: PropTypes.func.isRequired,
      },

      style() {
        if (shouldKill) {
          this.props.kill();
        }

        return {val: 400};
      },

      render() {
        return (
          <Motion defaultStyle={{val: 0}} style={this.style}>
            {({val}) => {
              count.push(val);
              return null;
            }}
          </Motion>
        );
      },
    });

    let Parent = React.createClass({
      getInitialState() {
        return {
          isAlive: true,
        };
      },
      render() {
        if (shouldKill) {
          expect(this.state.isAlive).toBe(false);
        }
        return this.state.isAlive && <App kill={() => this.setState({isAlive: false})}/>;
      },
    });

    TestUtils.renderIntoDocument(<Parent />);

    mockRaf.step(4);
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);

    shouldKill = true;

    // We render once more which should trigger style, calling
    // this.props.kill() which will setState of the parent thus killing the
    // child
    // This shouldn't warn
    mockRaf.step();

    // We haven't rendered the Motion since we unmounted
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);
  });

  it('should reach destination value', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(400)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    // Move "time" until we reach the final style value
    mockRaf.step(111);
    expect(count.slice(0, 5)).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632,
    ]);
    expect(count[count.length - 1]).toEqual(400);
  });
});

describe('TransitionMotion', () => {
  let TransitionMotion;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    const components = injector({
      './animationLoop': injectorAnimationLoop({
        raf: mockRaf.raf,
        'performance-now': mockRaf.now,
      }),
    })(React);

    TransitionMotion = components.TransitionMotion;
  });

  it('should allow returning null from children function', () => {
    const App2 = React.createClass({
      render() {
        // shouldn't throw here
        return (
          <TransitionMotion styles={{a: {}}}>{() => null}</TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App2 />);
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
            styles={{key: {a: spring(10, [100, 50])}}}>
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
    // Move "time" by 8 steps, which is equivalent to 8 calls to `raf`
    mockRaf.step(2);
    expect(count).toEqual([
      0,
      0.2777777777777778,
      0.5941358024691358,
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
            {val => {
              count.push(val);
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
      {k1: {a: 2.0123698988340193, b: 90.49479595336076}, k2: {c: 100.49479595336076}},
      {k1: {a: 2.8557218143909084, b: 124.22887257563632}, k2: {c: 134.22887257563632}},
    ]);
  });

  it('should not mutate currValue when adding a new key', () => {
    let count = [];
    const App = React.createClass({
      getInitialState() {
        return {
          data: {
            key1: {a: 10},
            key2: {a: 10},
          },
        };
      },

      componentDidMount() {
        this.update();
      },
      update() {
        this.setState({
          data: {
            key1: {a: 10},
            key2: {a: 10},
            key3: {a: 10},
          },
        });
      },
      render() {
        return (
          <TransitionMotion
            styles={this.state.data}
            willEnter={() => ({a: 0})}
            willLeave={() => ({a: 0})}>
            {a => {
              count.push(a);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    mockRaf.step();
    expect(count).toEqual([
      {
        key1: {a: 10},
        key2: {a: 10},
      },
      { // This second obj would be mutated
        key1: {a: 10},
        key2: {a: 10},
      },
      {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 0},
      },
    ]);
  });

  it('should mount and unmount correctly', () => {
    let count = [];
    let styles = {
      key1: {a: spring(10)},
      key2: {a: spring(10)},
    };
    const App = React.createClass({
      render() {
        return (
          <TransitionMotion
            styles={() => styles}
            // bad
            willEnter={() => ({a: 0})}
            willLeave={() => ({a: spring(0)})}>
            {val => {
              count.push(val);
              return null;
            }}
          </TransitionMotion>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{key1: {a: 10}, key2: {a: 10}}]);
    // Mount a new key!
    styles = {
      ...styles,
      key3: {a: spring(10)},
    };

    // Move in time by 88 steps because that's just enough to reach the styles
    mockRaf.step(88);
    expect(count.slice(0, 4)).toEqual([
      {
        key1: {a: 10},
        key2: {a: 10},
      },
      {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 0},
      },
      {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 0.4722222222222222},
      },
      {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 1.1897376543209877},
      },
    ]);

    // We reached the end!
    expect(count[count.length - 1]).toEqual({
      key1: {a: 10},
      key2: {a: 10},
      key3: {a: 10},
    });

    // Empty array
    count = [];

    // More steps won't do anything
    mockRaf.step(10);

    // Trigger a render of the owner
    TestUtils.renderIntoDocument(<App />);

    // Unmount baby! (We raf once after the owner forces the TransitionMotion
    // renders)
    styles = {
      key1: {a: spring(10)},
      key2: {a: spring(10)},
    };

    // Move until we reach styles
    mockRaf.step(88);
    expect(count.slice(0, 3)).toEqual([
      {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 10},
      }, {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 9.527777777777779},
      }, {
        key1: {a: 10},
        key2: {a: 10},
        key3: {a: 8.81026234567901},
      },
    ]);

    // Finally unmounted
    expect(count[count.length - 1]).toEqual({
      key1: {a: 10},
      key2: {a: 10},
    });
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
      80.49479595336076,
      114.22887257563632,
    ]);
    expect(count[count.length - 1]).toEqual(400);
  });
});
