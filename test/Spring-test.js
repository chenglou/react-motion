import expect from 'expect';
import * as s from '../src/Spring';
import React from 'react';

const FRAME_RATE = 1 / 60;

describe('TransitionSpring', ()=> {
  it('should default to a "div" as a child wrapper component', ()=> {
    const element = React.createElement(s.TransitionSpring, {endValue: {top: 100}}, () => {
      return React.createElement('span')
    });
    const renderer = React.addons.TestUtils.createRenderer();
    renderer.render(element);
    const component = renderer.getRenderOutput();
    expect(component.type).toEqual("div");
  });
  it('should allow a user to modify the containing component', ()=> {
    const element = React.createElement(s.TransitionSpring, {endValue: {top: 100}, component: 'span'}, () => {
      return React.createElement('span')
    });
    const renderer = React.addons.TestUtils.createRenderer();
    renderer.render(element);
    const component = renderer.getRenderOutput();
    expect(component.type).toEqual("span");
  });
});
describe('Spring', ()=> {
  it('should default to a "div" as a child wrapper component', ()=> {
    const element = React.createElement(s.Spring, {endValue: {top: 100}}, () => {
      return React.createElement('span')
    });
    const renderer = React.addons.TestUtils.createRenderer();
    renderer.render(element);
    const component = renderer.getRenderOutput();
    expect(component.type).toEqual("div");
  });
  it('should allow a user to modify the containing component', ()=> {
    const element = React.createElement(s.Spring, {endValue: {top: 100}, component: 'span'}, () => {
      return React.createElement('span')
    });
    const renderer = React.addons.TestUtils.createRenderer();
    renderer.render(element);
    const component = renderer.getRenderOutput();
    expect(component.type).toEqual("span");
  });
});

describe('updateCurrVals', () => {
  it('should not error on null', () => {
    expect(s.updateCurrVals(FRAME_RATE, {val: null}, {val: null}, {val: null}))
      .toEqual({val: null});
  });

  it('should jump to endValue when there is no val wrapper correctly', () => {
    const currVals = {count: 0};
    const currV = {count: 1};
    const endValue = {count: 100};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue))
      .toEqual({count: 100});
  });

  it('should jump to endValue when config is []', () => {
    const currVals = {count: {val: 1, config: []}};
    const currV = {count: {val: 5, config: []}};
    const endValue = {count: {val: 10, config: []}};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue))
      .toEqual({count: {val: 10, config: []}});
  });

  it('should do top-level updates', () => {
    const currVals = {val: [1, 2, 3]};
    const currV = {val: [5, 5, 5]};
    const endValue = {val: [10, 10, 10]};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue)).toEqual({
      val: [1.4722222222222223, 2.425, 3.3777777777777778],
    });
  });

  it('should do nested updates, with a default config', () => {
    const currVals = {count: {val: [1, 2, {a: 3}]}};
    const currV = {count: {val: [10, 20, {a: 30}]}};
    const endValue = {count: {val: [100, 200, {a: 300}]}};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue)).toEqual({
      count: {
        val: [5.769444444444445, 11.53888888888889, {a: 17.308333333333334}],
      },
    });
  });

  it('should have nested val override upper ones', () => {
    let currVals = {val: [2, {val: 2, config: [100, 10]}]};
    let currV = {val: [10, {val: 10, config: [100, 10]}]};
    let endValue = {val: [2, {val: 2, config: [100, 10]}]};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue)).toEqual({
      val: [2.0944444444444446, {val: 2.138888888888889, config: [100, 10]}],
    });

    currVals = {val: [1, {val: 1, config: []}]};
    currV = {val: [5, {val: 5, config: []}]};
    endValue = {val: [10, {val: 10, config: []}]};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue)).toEqual({
      val: [1.4722222222222223, {val: 10, config: []}],
    });
  });

  it('should skip non-numerical values', () => {
    const comp = <div key="1" />;
    const currVals = {val: [2, 'hi', comp]};
    const currV = {val: [5, 'hi', comp]};
    const endValue = {val: [10, 'hi', comp]};
    expect(s.updateCurrVals(FRAME_RATE, currVals, currV, endValue)).toEqual({
      val: [2.425, 'hi', comp],
    });
  });
});

describe('updateCurrV', () => {
  it('should not error on null', () => {
    expect(s.updateCurrV(FRAME_RATE, {val: null}, {val: null}, {val: null}))
      .toEqual({val: null});
  });

  // to potential contributors: these behaviors are not set in stone, but don't
  // matter right now. It's debatable that we should e.g. in the below test keep
  // currV to {count: 0}
  it('should have a velocity of 0 for non-updating values', () => {
    const currVals = {count: 0};
    const currV = {count: 1};
    const endValue = {count: 100};
    expect(s.updateCurrV(FRAME_RATE, currVals, currV, endValue))
      .toEqual({count: 0});
  });

  it('should have a velocity of 0 for config []', () => {
    const currVals = {count: {val: 1, config: []}};
    const currV = {count: {val: 5, config: []}};
    const endValue = {count: {val: 10, config: []}};
    expect(s.updateCurrV(FRAME_RATE, currVals, currV, endValue))
      .toEqual({count: {val: 0, config: []}});
  });

  it('should leave non-numerical values alone', () => {
    const comp = <div key="1" />;
    const currVals = {val: [1, ['hi'], comp]};
    const currV = {val: [1, ['hi'], comp]};
    const endValue = {val: [10, ['hi'], comp]};
    expect(s.updateCurrV(FRAME_RATE, currVals, currV, endValue)).toEqual({
      val: [26.066666666666666, ['hi'], comp],
    });
  });
});

describe('noSpeed', () => {
  it('should return true on 0s', () => {
    expect(s.noSpeed({a: [0, 0, {b: 0}]})).toBe(true);
  });

  it('should return true on collections of 0s with non-numerical vals', () => {
    const comp = <div />;
    expect(s.noSpeed({a: null, b: 0})).toBe(true);
    expect(s.noSpeed({a: [0, 0, 'hi']})).toBe(true);
    expect(s.noSpeed({a: [comp, 0, 'hi']})).toBe(true);
  });

  it('should return false otherwise', () => {
    expect(s.noSpeed({a: null, b: 1})).toBe(false);
    expect(s.noSpeed({a: [0, 2, 'hi']})).toBe(false);
    expect(s.noSpeed({a: [3, 0, 0]})).toBe(false);
  });
});
