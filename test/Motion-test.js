/* eslint-disable class-methods-use-this */
import React from 'react';
import {spring} from '../src/react-motion';
import createMockRaf from './createMockRaf';
import TestUtils from 'react-dom/test-utils';

const {createSpy} = global.jasmine;

const injector = require('inject-loader!../src/Motion');

// temporarily putting the animation loop test here
// TODO: put it in the correct file
describe('animation loop', () => {
  let Motion;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    Motion = injector({
      raf: mockRaf.raf,
      'performance-now': mockRaf.now,
    }).default;
  });

  it('should interpolate correctly when the timer is perfect', () => {
    let count = [];
    class App extends React.Component {
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(10)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    mockRaf.step(5);
    expect(count).toEqual([
      0,
      0.4722222222222222,
      1.1897376543209877,
      2.0123698988340193,
      2.8557218143909084,
      3.670989925304686,
    ]);
  });

  it('should work with negative numbers', () => {
    let count = [];
    class App extends React.Component {
      render() {
        return (
          <Motion defaultStyle={{a: -10}} style={{a: spring(-100)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    mockRaf.step(5);
    expect(count).toEqual([
      -10,
      -14.25,
      -20.70763888888889,
      -28.11132908950617,
      -35.70149632951818,
      -43.038909327742175,
    ]);
  });

  it('should interpolate correctly when the timer is imperfect', () => {
    let count = [];
    class App extends React.Component {
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(10)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    mockRaf.step(10, 0);
    // 0 accumulatedTime, bail out of recalc & render
    expect(count).toEqual([0]);

    mockRaf.step(3, 0.1);
    expect(count).toEqual([
      0,
      // notice the numbers are all very close together
      0.002833333333333333,
      0.005666666666666666,
      0.0085,
    ]);
    // interval too large; bail
    mockRaf.step(10, 999);
    expect(count).toEqual([
      0,
      0.002833333333333333,
      0.005666666666666666,
      0.0085,
    ]);
    // more than one theoretical frame passed, each tick
    mockRaf.step(2, 36);
    expect(count).toEqual([
      0,
      0.002833333333333333,
      0.005666666666666666,
      0.0085,
      1.3213588134430725,
      3.116607609883317,
    ]);
  });
});

describe('Motion', () => {
  let Motion;
  let mockRaf;

  beforeEach(() => {
    mockRaf = createMockRaf();
    Motion = injector({
      raf: mockRaf.raf,
      'performance-now': mockRaf.now,
    }).default;
  });

  it('should allow returning null from children function', () => {
    class App extends React.Component {
      render() {
        // shouldn't throw here
        return <Motion style={{a: 0}}>{() => null}</Motion>;
      }
    }
    TestUtils.renderIntoDocument(<App />);
  });

  it('should not throw on unmount', () => {
    spyOn(console, 'error');
    let kill = () => {};
    class App extends React.Component {
      constructor() {
        super();

        this.state = {
          kill: false,
        };
      }
      componentWillMount() {
        kill = () => this.setState({kill: true});
      }
      render() {
        return this.state.kill
          ? null
          : <Motion defaultStyle={{a: 0}} style={{a: spring(10)}}>{() => null}</Motion>;
      }
    }
    TestUtils.renderIntoDocument(<App />);
    mockRaf.step(2);
    kill();
    mockRaf.step(3);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should allow a defaultStyle', () => {
    let count = [];
    class App extends React.Component {
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(10)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
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
    class App extends React.Component {
      render() {
        return (
          <Motion
              defaultStyle={{a: 0}}
              style={{a: spring(10, {stiffness: 100, damping: 50, precision: 16})}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
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
    class App extends React.Component {
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
      }
    }

    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([[0, 10]]);
    mockRaf.step(4);
    expect(count).toEqual([
      [0, 10],
      [0.4722222222222222, 28.888888888888886],
      [1.1897376543209877, 57.589506172839506],
      [2.0123698988340193, 90.49479595336075],
      [2.8557218143909084, 124.22887257563633],
    ]);
  });

  it('should work with nested Motions', () => {
    let count = [];
    class App extends React.Component {
      render() {
        return (
          <Motion defaultStyle={{owner: 0}} style={{owner: spring(10)}}>
            {({owner}) => {
              count.push(owner);
              return (
                <Motion defaultStyle={{child: 10}} style={{child: spring(400)}}>
                  {({child}) => {
                    count.push(child);
                    return null;
                  }}
                </Motion>
              );
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0, 10]);
    mockRaf.step();
    expect(count).toEqual([
      0,
      10,
      28.416666666666668, // child
      0.4722222222222222, // owner
      28.416666666666668, // child
    ]);
    mockRaf.step(2);
    expect(count).toEqual([
      0,
      10,
      28.416666666666668,
      0.4722222222222222,
      28.416666666666668,

      56.39976851851852, // child
      1.1897376543209877, // owner
      56.39976851851852, // child

      88.48242605452674, // child
      2.0123698988340193, // owner
      88.48242605452674, // child
    ]);
  });

  it('should reach destination value', () => {
    let count = [];
    class App extends React.Component {
      render() {
        return (
          <Motion defaultStyle={{a: 0}} style={{a: spring(400)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    mockRaf.step(111);
    expect(count.slice(0, 5)).toEqual([
      0,
      18.888888888888886,
      47.589506172839506,
      80.49479595336075,
      114.22887257563633,
    ]);
    expect(count.length).toBe(91);
    expect(count[count.length - 1]).toEqual(400);
  });

  it('should support jumping to value', () => {
    let count = [];
    let setState = () => {};
    class App extends React.Component {
      constructor() {
        super();

        this.state = {
          p: false,
        };
      }
      componentWillMount() {
        setState = this.setState.bind(this);
      }
      render() {
        return (
          <Motion style={{a: this.state.p ? 400 : spring(0)}}>
            {({a}) => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([0]);
    setState({p: true});
    expect(count).toEqual([
      0,
      0, // this new 0 comes from owner update, causing Motion to re-render
    ]);
    mockRaf.step(10);
    // jumped to end, will only have two renders no matter how much we step
    expect(count).toEqual([
      0,
      0,
      400,
    ]);
    setState({p: false});
    mockRaf.step(3);
    expect(count).toEqual([
      0,
      0,
      400,
      400, // redundant 0 comes from owner update again
      381.1111111111111,
      352.4104938271605,
      319.5052040466392,
    ]);
  });

  it('should call onRest at the end of an animation', () => {
    const onRest = createSpy('onRest');
    let result = 0;

    class App extends React.Component {
      render() {
        return (
          <Motion
            defaultStyle={{a: 0}}
            style={{a: spring(5, {stiffness: 380, damping: 18, precision: 1})}}
            onRest={onRest}
          >
            {
              ({a}) => {
                result = a;
                return null;
              }
            }
          </Motion>
        );
      }
    }

    TestUtils.renderIntoDocument(<App />);

    mockRaf.step(22);

    expect(result).toEqual(5);
    expect(onRest.calls.count()).toEqual(1);
  });


  it('should not call onRest if an animation is still in progress', () => {
    const onRest = createSpy('onRest');
    let resultA = 0;
    let resultB = 0;

    class App extends React.Component {
      render() {
        return (
          <Motion
            defaultStyle={{a: 0, b: 0}}
            style={{
              a: spring(5, {stiffness: 380, damping: 18, precision: 1}),
              b: spring(500, {stiffness: 380, damping: 18, precision: 1}),
            }}
            onRest={onRest}
          >
            {
              ({a, b}) => {
                resultA = a;
                resultB = b;
                return null;
              }
            }
          </Motion>
        );
      }
    }

    TestUtils.renderIntoDocument(<App />);

    mockRaf.step(22);

    expect(resultA).toEqual(5);
    expect(resultB).not.toEqual(500);
    expect(onRest).not.toHaveBeenCalled();
  });


  it('should not call onRest unless an animation occurred', () => {
    const onRest = createSpy('onRest');

    let setState;

    class App extends React.Component {
      constructor() {
        super();

        this.state = {
          a: spring(0),
        };
      }
      componentWillMount() {
        setState = this.setState.bind(this);
      }
      render() {
        return (
          <Motion
            defaultStyle={{a: 0}}
            style={{a: this.state.a}}
            onRest={onRest}
          >
            {() => null}
          </Motion>
        );
      }
    }

    TestUtils.renderIntoDocument(<App />);
    mockRaf.step();
    setState({a: 50});
    mockRaf.step();

    expect(onRest).not.toHaveBeenCalled();
  });

  it('should behave well when many owner updates come in-between rAFs', () => {
    let count = [];
    let setState = () => {};
    class App extends React.Component {
      constructor() {
        super();

        this.state = {
          a: spring(0),
        };
      }
      componentWillMount() {
        setState = this.setState.bind(this);
      }
      render() {
        return (
          <Motion style={this.state}>
            {a => {
              count.push(a);
              return null;
            }}
          </Motion>
        );
      }
    }
    TestUtils.renderIntoDocument(<App />);

    expect(count).toEqual([{a: 0}]);
    setState({a: 400});
    setState({a: spring(100)});
    mockRaf.step(2);
    setState({a: spring(400)});
    mockRaf.step(2);
    expect(count).toEqual([
      {a: 0},
      {a: 0}, // this new 0 comes from owner update, causing Motion to re-render
      {a: 400},
      {a: 385.8333333333333},
      {a: 364.3078703703703},
      {a: 364.3078703703703},
      {a: 353.79556970164606},
      {a: 350.02047519790233},
    ]);
    mockRaf.step(999);
    expect(count.length).toBe(85);
    setState({a: spring(400)});
    // make sure we're still updating children even if there's nothing to interp
    expect(count.length).toBe(86);
  });
});
