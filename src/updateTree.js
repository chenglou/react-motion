/* @flow */
import stepper from './stepper';
import spring from './spring';
import type {Style, Velocity} from './Types';

// TODO: refactor common logic with updateCurrValue and updateCurrVelocity
export function interpolateValue(
  alpha: number,
  nextStyle: Style,
  prevStyle: Style): Style {
  // might be used by a TransitionMotion, where prevStyle might not exist anymore
  if (!prevStyle) {
    return nextStyle;
  }

  let ret = {};
  for (let key in nextStyle) {
    if (!nextStyle.hasOwnProperty(key)) {
      continue;
    }

    if (nextStyle[key] == null || !nextStyle[key].config) {
      ret[key] = nextStyle[key];
      // not a spring config, not something we want to interpolate
      continue;
    }
    const prevValue = prevStyle[key].config ? prevStyle[key].val : prevStyle[key];
    ret[key] = spring(
      nextStyle[key].val * alpha + prevValue * (1 - alpha),
      nextStyle[key].config,
    );
  }

  return ret;
}

// TODO: refactor common logic with updateCurrentVelocity
export function updateCurrentStyle(
  frameRate: number,
  currentStyle: Style,
  currentVelocity: Velocity,
  style: Style): Style {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (style[key] == null || !style[key].config) {
      ret[key] = style[key];
      // not a spring config, not something we want to interpolate
      continue;
    }
    const [k, b] = style[key].config;
    const val = stepper(
      frameRate,
      // might have been a non-springed prop that just became one
      currentStyle[key].val == null ? currentStyle[key] : currentStyle[key].val,
      currentVelocity[key],
      style[key].val,
      k,
      b,
    )[0];
    ret[key] = spring(val, style[key].config);
  }
  return ret;
}

export function updateCurrentVelocity(
  frameRate: number,
  currentStyle: Style,
  currentVelocity: Velocity,
  style: Style): Style {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (style[key] == null || !style[key].config) {
      // not a spring config, not something we want to interpolate
      ret[key] = 0;
      continue;
    }
    const [k, b] = style[key].config;
    const val = stepper(
      frameRate,
      // might have been a non-springed prop that just became one
      currentStyle[key].val == null ? currentStyle[key] : currentStyle[key].val,
      currentVelocity[key],
      style[key].val,
      k,
      b,
    )[1];
    ret[key] = val;
  }
  return ret;
}
