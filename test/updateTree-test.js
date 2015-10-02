import {interpolateValue, updateCurrentStyle, updateCurrentVelocity} from '../src/updateTree';
import {spring} from '../src/react-motion';

const FRAME_RATE = 1 / 60;

describe('interpolateValue', () => {
  it('should handle `undefined`', () => {
    const nextStyle = {a: undefined};
    const prevStyle = {a: undefined};
    expect(interpolateValue(1, nextStyle, prevStyle)).toEqual({a: undefined});
  });
});

describe('updateCurrentStyle', () => {
  it('should jump to style when there is no config', () => {
    const currentStyle = {a: 0};
    const currentVelocity = {a: 1};
    const style = {a: 100};
    expect(updateCurrentStyle(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 100});
  });

  it('should interpolate correctly with config and non-configs mixed', () => {
    const currentStyle = {a: 0, b: spring(3)};
    const currentVelocity = {a: 1, b: 1};
    const style = {a: 100, b: spring(10)};
    expect(updateCurrentStyle(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 100, b: {val: 3.34, config: [170, 26]}});
  });

  it('should handle `undefined`', () => {
    const currentStyle = {a: undefined};
    const currentVelocity = {a: undefined};
    const style = {a: undefined};
    expect(updateCurrentStyle(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: undefined});
  });

  it('should do negative numbers', () => {
    const currentStyle = {a: 0, b: spring(-3)};
    const currentVelocity = {a: 1, b: -1};
    const style = {a: 100, b: spring(-10)};
    expect(updateCurrentStyle(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 100, b: {val: -3.34, config: [170, 26]}});
  });

  it('should pass from configured to non-configured', () => {
    const currentStyle = {a: spring(10)};
    const currentVelocity = {a: 1};
    const style = {a: 0};
    expect(updateCurrentStyle(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 0});
  });

  it('should pass from non-configured to configured', () => {
    const currentStyle = {a: 10};
    const currentVelocity = {a: 5};
    const style = {a: spring(0)};
    expect(updateCurrentStyle(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: {val: 9.575, config: [170, 26]}});
  });
});

describe('updateCurrentVelocity', () => {
  // to potential contributors: these behaviors are not set in stone, but don't
  // matter right now. It's debatable that we should e.g. in the below test keep
  // currentVelocity to {a: 0}
  it('should have a velocity of 0 for non-updating values', () => {
    const currentStyle = {a: 0};
    const currentVelocity = {a: 1};
    const style = {a: 100};
    expect(updateCurrentVelocity(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 0});
  });

  it('should set velocity correctly with config and non-configs mixed', () => {
    const currentStyle = {a: 0, b: spring(3)};
    const currentVelocity = {a: 1, b: 1};
    const style = {a: 100, b: spring(10)};
    expect(updateCurrentVelocity(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 0, b: 20.4});
  });

  it('should handle `undefined`', () => {
    const currentStyle = {a: undefined};
    const currentVelocity = {a: undefined};
    const style = {a: undefined};
    expect(updateCurrentVelocity(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 0});
  });

  it('should do negative numbers', () => {
    const currentStyle = {a: 0, b: spring(-3)};
    const currentVelocity = {a: 1, b: -1};
    const style = {a: 100, b: spring(-10)};
    expect(updateCurrentVelocity(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 0, b: -20.4});
  });

  it('should pass from configured to non-configured', () => {
    const currentStyle = {a: spring(10)};
    const currentVelocity = {a: 1};
    const style = {a: 0};
    expect(updateCurrentVelocity(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: 0});
  });

  it('should pass from non-configured to configured', () => {
    const currentStyle = {a: 10};
    const currentVelocity = {a: 5};
    const style = {a: spring(0)};
    expect(updateCurrentVelocity(FRAME_RATE, currentStyle, currentVelocity, style))
      .toEqual({a: -25.5});
  });
});
