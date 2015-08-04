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

    // Initial render
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

    // Initial render
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

    // Initial render
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

    // Initial render
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

    // Initial render
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

    // Initial render
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

    // Initial render
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

    // Here's why we expect this with the current implementation:
    //
    // - mount <App />
    // - render owner Spring                           [10]
    // - the above triggers the child Spring to render [10, 400]
    // - step once (both Spring calculations are done
    //   in the same step)
    // - render the child Spring                       [10, 400, 400]
    // - render the owner Spring                       [10, 400, 400, 10]
    // - the above triggers the child Spring to render [10, 400, 400, 10, 400]
    // - step a second time which only affects the
    //   child who registered one last raf in the step
    //   above

    expect(count).toEqual([10, 400]);
    mockRaf.step();
    expect(count).toEqual([10, 400, 400, 10, 400]);

    // Step many times won't matter, the child only renders once more
    mockRaf.manySteps(10);
    expect(count).toEqual([10, 400, 400, 10, 400, 400]);
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
});
