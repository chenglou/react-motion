import React, {addons} from 'react/addons';
const TestUtils = addons.TestUtils;

const injector = require('inject!../src/Spring');
// const injectorAnimationLoop = require('inject!../src/animationLoop');

const FRAME_RATE = 1 / 60;

describe('updateCurrValue', () => {
  let updateCurrValue;

  beforeEach(() => {
    updateCurrValue = injector({
      './noVelocity': () => {
        return false;
      },
    }).updateCurrValue;
  });

  it('should not error on null', () => {
    expect(updateCurrValue(FRAME_RATE, {val: null}, {val: null}, {val: null}))
      .toEqual({val: null});
  });

  it('should jump to endValue when there is no val wrapper correctly', () => {
    const currValue = {count: 0};
    const currVelocity = {count: 1};
    const endValue = {count: 100};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue))
      .toEqual({count: 100});
  });

  it('should jump to endValue when config is []', () => {
    const currValue = {count: {val: 1, config: []}};
    const currVelocity = {count: {val: 5, config: []}};
    const endValue = {count: {val: 10, config: []}};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue))
      .toEqual({count: {val: 10, config: []}});
  });

  it('should do top-level updates', () => {
    const currValue = {val: [1, 2, 3]};
    const currVelocity = {val: [5, 5, 5]};
    const endValue = {val: [10, 10, 10]};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      val: [1.4722222222222223, 2.425, 3.3777777777777778],
    });
  });

  it('should do negative numbers', () => {
    const currValue = {val: 1};
    const currVelocity = {val: 100};
    const endValue = {val: -1000};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      val: -45.325,
    });
  });

  it('should do nested updates, with a default config', () => {
    const currValue = {count: {val: [1, 2, {a: 3}]}};
    const currVelocity = {count: {val: [10, 20, {a: 30}]}};
    const endValue = {count: {val: [100, 200, {a: 300}]}};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      count: {
        val: [5.769444444444445, 11.53888888888889, {a: 17.308333333333334}],
      },
    });
  });

  it('should have nested val override upper ones', () => {
    let currValue = {val: [2, {val: 2, config: [100, 10]}]};
    let currVelocity = {val: [10, {val: 10, config: [100, 10]}]};
    let endValue = {val: [2, {val: 2, config: [100, 10]}]};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      val: [2.0944444444444446, {val: 2.138888888888889, config: [100, 10]}],
    });

    currValue = {val: [1, {val: 1, config: []}]};
    currVelocity = {val: [5, {val: 5, config: []}]};
    endValue = {val: [10, {val: 10, config: []}]};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      val: [1.4722222222222223, {val: 10, config: []}],
    });
  });

  it('should skip non-numerical values', () => {
    const comp = <div key="1" />;
    const currValue = {val: [2, 'hi', comp]};
    const currVelocity = {val: [5, 'hi', comp]};
    const endValue = {val: [10, 'hi', comp]};
    expect(updateCurrValue(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      val: [2.425, 'hi', comp],
    });
  });
});

describe('updateCurrVelocity', () => {
  let updateCurrVelocity;

  beforeEach(() => {
    updateCurrVelocity = injector({
      './noVelocity': () => {
        return false;
      },
    }).updateCurrVelocity;
  });

  it('should not error on null', () => {
    expect(updateCurrVelocity(FRAME_RATE, {val: null}, {val: null}, {val: null}))
      .toEqual({val: null});
  });

  // to potential contributors: these behaviors are not set in stone, but don't
  // matter right now. It's debatable that we should e.g. in the below test keep
  // currVelocity to {count: 0}
  it('should have a velocity of 0 for non-updating values', () => {
    const currValue = {count: 0};
    const currVelocity = {count: 1};
    const endValue = {count: 100};
    expect(updateCurrVelocity(FRAME_RATE, currValue, currVelocity, endValue))
      .toEqual({count: 0});
  });

  it('should have a velocity of 0 for config []', () => {
    const currValue = {count: {val: 1, config: []}};
    const currVelocity = {count: {val: 5, config: []}};
    const endValue = {count: {val: 10, config: []}};
    expect(updateCurrVelocity(FRAME_RATE, currValue, currVelocity, endValue))
      .toEqual({count: {val: 0, config: []}});
  });

  it('should leave non-numerical values alone', () => {
    const comp = <div key="1" />;
    const currValue = {val: [1, ['hi'], comp]};
    const currVelocity = {val: [1, ['hi'], comp]};
    const endValue = {val: [10, ['hi'], comp]};
    expect(updateCurrVelocity(FRAME_RATE, currValue, currVelocity, endValue)).toEqual({
      val: [26.066666666666666, ['hi'], comp],
    });
  });
});

describe('Spring', () => {
  let Spring;
  beforeEach(() => {
    Spring = injector({
      // './animationLoop': injectorAnimationLoop({
      //   raf: cb => {
      //     cb();
      //   },
      // }),
    }).Spring;
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

  it('should pass the new value', done => {
    let count = [];
    const App = React.createClass({
      render() {
        return (
          <Spring endValue={currValue => ({val: currValue == null ? 0 : 400})}>
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
