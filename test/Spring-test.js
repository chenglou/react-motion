import React, {addons, PropTypes} from 'react/addons';

import createMockRaf from './createMockRaf';

const TestUtils = addons.TestUtils;

const injector = require('inject!../src/components');
const injectorAnimationLoop = require('inject!../src/animationLoop');

describe('Spring', () => {
  let Spring;
  let TransitionSpring;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    const bothSprings = injector({
      './animationLoop': injectorAnimationLoop({
        raf: mockRaf.raf,
        'performance-now': mockRaf.now,
      }),
    })(React);

    Spring = bothSprings.Spring;
    TransitionSpring = bothSprings.TransitionSpring;
  });

  it('should allow returning null from children function', () => {
    const App = React.createClass({
      render() {
        // shouldn't throw here
        return <Spring endValue={{val: 0}}>{() => null}</Spring>;
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  it('should allow returning null from children function TransitionSpring', () => {
    const App2 = React.createClass({
      render() {
        // shouldn't throw here
        return (
          <TransitionSpring endValue={{a: {}}}>
            {() => null}
          </TransitionSpring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App2 />);
  });

  it('should not throw on unmount', () => {
    const App = React.createClass({
      render() {
        return (
          <Spring endValue={() => TestUtils.renderIntoDocument(<div />)}>
            {() => null}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  it('should allow a defaultValue', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={{val: 0}} endValue={{val: 10}}>
            {({val}) => {
              count.push(val);
              return null;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);

    // Move "time" by 8 steps, which is equivalent to 8 calls to `raf`
    mockRaf.manySteps(4);
    expect(count).toEqual([
      0,
      0.4722222222222222,
      1.1897376543209877,
      2.0123698988340193,
      2.8557218143909084]);
  });

  it('should allow a defaultValue for TransitionSpring', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionSpring defaultValue={{val: 0}} endValue={{val: 10}}>
            {({val}) => {
              count.push(val);

              return null;
            }}
          </TransitionSpring>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);
    mockRaf.manySteps(4);
    expect(count).toEqual([
      0,
      0.4722222222222222,
      1.1897376543209877,
      2.0123698988340193,
      2.8557218143909084]);
  });

  it('should interpolate nested objects', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={{a: {val: 0}, b: {c: {val: 0}}}} endValue={{a: {val: 10}, b: {c: {val: 400}}}}>
            {({a: {val}, b: {c: {val: val2}}}) => {
              count.push([val, val2]);

              return null;
            }}
          </Spring>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([[0, 0]]);
    mockRaf.manySteps(4);
    expect(count).toEqual([
      [0, 0],
      [0.4722222222222222, 18.888888888888886],
      [1.1897376543209877, 47.589506172839506],
      [2.0123698988340193, 80.49479595336076],
      [2.8557218143909084, 114.22887257563632]]);
  });

  it('should interpolate nested objects TransitionSpring', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionSpring defaultValue={{a: {val: 0}, b: {c: {val: 0}}}} endValue={{a: {val: 10}, b: {c: {val: 400}}}}>
            {({a: {val}, b: {c: {val: val2}}}) => {
              count.push([val, val2]);

              return null;
            }}
          </TransitionSpring>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([[0, 0]]);
    mockRaf.manySteps(4);
    expect(count).toEqual([
      [0, 0],
      [0.4722222222222222, 18.888888888888886],
      [1.1897376543209877, 47.589506172839506],
      [2.0123698988340193, 80.49479595336076],
      [2.8557218143909084, 114.22887257563632]]);
  });

  it('should allow interpolating scalar numbers', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={0} endValue={10}>
            {val => {
              count.push(val);
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);
    mockRaf.manySteps(4);
    expect(count).toEqual([
      0,
      0.4722222222222222,
      1.1897376543209877,
      2.0123698988340193,
      2.8557218143909084]);
  });

  it('should call raf one more time after it is done animating', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring endValue={{val: 400}}>
            {({val}) => {
              count.push(val);
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([400]);
    mockRaf.manySteps(10); // Shouldn't matter, we stop rafing
    expect(count).toEqual([400, 400]);
  });

  it('should pass the new value', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={{val: 0}} endValue={{val: 400}}>
            {({val}) => {
              count.push(val);
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);
    mockRaf.manySteps(4);
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);
  });

  it('should work with nested springs', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring endValue={{ownerVal: 10}}>
          {({ownerVal}) => {
            count.push(ownerVal);
            return (
              <Spring endValue={{val: 400}}>
                {({val}) => {
                  count.push(val);
                  return <div />;
                }}
              </Spring>
            );
          }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Here's why we expect this with the current
    // implementation (not necessarily good):
    //
    // - mount <App />
    // - render owner Spring           [10]
    // - the above triggers the child  [10, 400]
    //   Spring to render
    // - step once (both Spring
    //   calculations are done in the
    //   same step)
    // - render the child Spring       [10, 400, 400]
    // - render the owner Spring       [10, 400, 400, 10]
    // - the above triggers the child  [10, 400, 400, 10, 400]
    //   Spring to render

    expect(count).toEqual([10, 400]);
    mockRaf.step();
    expect(count).toEqual([10, 400, 400, 10, 400]);
    mockRaf.step();
    expect(count).toEqual([10, 400, 400, 10, 400]);
  });

  it('should be able to move by two steps if Spring gets out of sync', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={{val: 0}} endValue={{val: 400}}>
            {({val}) => {
              count.push(val);
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Initial render
    expect(count).toEqual([0]);
    mockRaf.manySteps(6);
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632,
      146.83959701218743,
      177.2738043339909]);
      // Due to floating point errors when calculating the accumulated time
      // inside the animationLoop, arriving at that last value the accumulated
      // time will go barely beyond 1000/60 and so the animation loop will move
      // by two frames but will only move by say 1% towards that 2nd frame.
      // Before the for loop calculating more than one frame would just
      // calculate the same frame over and over again, but we'd still move 1%
      // towards that. So when the loop was broken, 177.2738043339909 would be
      // 146.83959701218743
  });

  it('should not mutate currValue when adding a new key (TransitionSpring)', () => {
    let count = [];

    const App = React.createClass({
      getInitialState() {
        return {
          data: {
            key1: { val: 10 },
            key2: { val: 10 },
          },
        };
      },

      componentDidMount() {
        this.setState({
          data: {
            key1: { val: 10 },
            key2: { val: 10 },
            key3: { val: 10 },
          },
        });
      },

      render() {
        return (
          <TransitionSpring
            endValue={this.state.data}
            willEnter={() => ({ val: 0 })}
            willLeave={() => ({ val: 0 })}>
            {currValue => {
              count.push(currValue);
              return null;
            }}
          </TransitionSpring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    mockRaf.step();

    expect(count).toEqual([
      {
        key1: { val: 10 },
        key2: { val: 10 },
      }, { // This second obj would be mutated
        key1: { val: 10 },
        key2: { val: 10 },
      }, {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 0 },
      },
    ]);
  });

  it('should NOT warn when parent kills the child Spring', () => {
    let count = [];
    let shouldKill = false;
    const App = React.createClass({
      propTypes: {
        kill: PropTypes.func.isRequired,
      },

      endValue() {
        if (shouldKill) {
          this.props.kill();
        }

        return {val: 400};
      },

      render() {
        return (
          <Spring defaultValue={{val: 0}} endValue={this.endValue}>
            {({val}) => {
              count.push(val);
              return <div />;
            }}
          </Spring>
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

    mockRaf.manySteps(4);
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);

    shouldKill = true;

    // We render once more which should trigger endValue, calling
    // this.props.kill() which will setState of the parent thus killing the
    // child
    // This shouldn't warn
    mockRaf.step();

    // We haven't rendered the Spring since we unmounted
    expect(count).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);
  });

  it('should mount and unmount correctly (TransitionSpring)', () => {
    let count = [];

    const willEnterandLeave = {
      val: 0,
    };
    let endValue = {
      key1: { val: 10 },
      key2: { val: 10 },
    };
    const App = React.createClass({
      render() {
        return (
          <TransitionSpring
            endValue={() => endValue}
            willEnter={() => willEnterandLeave}
            willLeave={() => willEnterandLeave}>
            {currValue => {
              count.push(currValue);
              return (
                <div>
                  {Object.keys(currValue).map(key => {
                    return <div key={key} />;
                  })}
                </div>
              );
            }}
          </TransitionSpring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([endValue]);

    // Mount a new key!
    endValue = {
      ...endValue,
      key3: { val: 10 },
    };

    // Move in time by 88 steps because that's just enough to reach the endValue
    mockRaf.manySteps(88);
    expect(count.slice(0, 4)).toEqual([
      {
        key1: { val: 10 },
        key2: { val: 10 },
      }, {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 0 },
      }, {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 0.4722222222222222 },
      }, {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 1.1897376543209877 },
      },
    ]);

    // We reached the end!
    expect(count[count.length - 1]).toEqual({
      key1: { val: 10 },
      key2: { val: 10 },
      key3: { val: 10 },
    });


    // Empty array
    count = [];

    // More steps won't do anything
    mockRaf.manySteps(10);

    // Trigger a render of the owner
    TestUtils.renderIntoDocument(<App />);

    // Unmount baby! (We raf once after the owner forces the TransitionSpring
    // renders)
    endValue = {
      key1: { val: 10 },
      key2: { val: 10 },
    };

    // Move until we reach endValue
    mockRaf.manySteps(88);
    expect(count.slice(0, 3)).toEqual([
      {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 10 },
      }, {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 9.527777777777779 },
      }, {
        key1: { val: 10 },
        key2: { val: 10 },
        key3: { val: 8.81026234567901 },
      },
    ]);

    // Finally unmounted
    expect(count[count.length - 1]).toEqual({
      key1: { val: 10 },
      key2: { val: 10 },
    });
  });

  it('should reach destination value', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={0} endValue={400}>
            {val => {
              count.push(val);
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);

    // Move "time" until we reach the endCalue
    mockRaf.manySteps(111);
    expect(count.slice(0, 5)).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);

    expect(count[count.length - 1]).toEqual(400);
  });

  it('should reach destination value TransitionSpring', () => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionSpring defaultValue={{key: {val: 0}}} endValue={{key: {val: 400}}}>
            {({key: {val}}) => {
              count.push(val);
              return <div />;
            }}
          </TransitionSpring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);

    // Checking initial render
    expect(count).toEqual([0]);

    // Move "time" until we reach the endCalue
    mockRaf.manySteps(111);
    expect(count.slice(0, 5)).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336076,
      114.22887257563632]);

    expect(count[count.length - 1]).toEqual(400);
  });
});
