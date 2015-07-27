import React, {addons} from 'react/addons';
const TestUtils = addons.TestUtils;

const injector = require('inject!../src/Spring');
// const injectorAnimationLoop = require('inject!../src/animationLoop');

describe('Spring', () => {
  let Spring;
  let TransitionSpring;
  beforeEach(() => {
    Spring = injector({
      // './animationLoop': injectorAnimationLoop({
      //   raf: cb => {
      //     cb();
      //   },
      // }),
    }).Spring;
    TransitionSpring = injector({
      // './animationLoop': injectorAnimationLoop({
      //   raf: cb => {
      //     cb();
      //   },
      // }),
    }).TransitionSpring;
  });

  it('should allow returning null from children function', () => {
    const App = React.createClass({
      render() {
        // shouldn't throw here
        return <Spring endValue={{val: 0}}>{() => null}</Spring>;
      },
    });
    TestUtils.renderIntoDocument(<App />);

    const App2 = React.createClass({
      render() {
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

  it('should allow a defaultValue', done => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={{val: 1}} endValue={{val: 10}}>
            {({val}) => {
              count.push(val);
              if (count.length === 2) {
                expect(count[0]).toBe(1);
                expect(count[1]).toBeGreaterThan(1);
                setTimeout(done, 0);
              }
              return null;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  it('should allow a defaultValue for TransitionSpring', done => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <TransitionSpring defaultValue={{a: {val: 1}}} endValue={{a: {val: 10}}}>
            {({a: {val}}) => {
              count.push(val);
              if (count.length === 2) {
                expect(count[0]).toBe(1);
                expect(count[1]).toBeGreaterThan(1);
                setTimeout(done, 0);
              }
              return null;
            }}
          </TransitionSpring>
        );
      },
    });

    TestUtils.renderIntoDocument(<App />);
  });

  it('should call raf one more time after it is done animating', done => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring endValue={{val: 400}}>
            {({val}) => {
              count.push(val);
              if (count.length === 2) {
                expect(count).toEqual([400, 400]);
                done();
              }
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  xit('should pass the new value', done => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring defaultValue={{val: 0}} endValue={{val: 400}}>
            {({val}) => {
              count.push(val);
              if (count.length > 2 && count[count.length - 1] === 400) {
                done();
              }
              return <div />;
            }}
          </Spring>
        );
      },
    });
    TestUtils.renderIntoDocument(<App />);
  });

  xit('should work with nested springs', done => {
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
    setTimeout(() => {
      expect(count).toEqual([400, 400]);
      done();
    }, 0);
  });
});
