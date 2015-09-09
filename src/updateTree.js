import isPlainObject from 'lodash.isplainobject';
import stepper from './stepper';

// TODO: refactor common logic with updateCurrValue and updateCurrVelocity
export function interpolateValue(alpha, nextValue, prevValue) {
  if (nextValue == null) {
    return null;
  }
  if (prevValue == null) {
    return nextValue;
  }
  if (typeof nextValue === 'number') {
    // https://github.com/chenglou/react-motion/pull/57#issuecomment-121924628
    return nextValue * alpha + prevValue * (1 - alpha);
  }
  if (nextValue.val != null && nextValue.config && nextValue.config.length === 0) {
    return nextValue;
  }
  if (nextValue.val != null) {
    let ret = {
      val: interpolateValue(alpha, nextValue.val, prevValue.val),
    };
    if (nextValue.config) {
      ret.config = nextValue.config;
    }
    return ret;
  }
  if (Array.isArray(nextValue)) {
    return nextValue.map((_, i) => interpolateValue(alpha, nextValue[i], prevValue[i]));
  }
  if (isPlainObject(nextValue)) {
    return Object.keys(nextValue).reduce((ret, key) => {
      ret[key] = interpolateValue(alpha, nextValue[key], prevValue[key]);
      return ret;
    }, {});
  }
  return nextValue;
}

// TODO: refactor common logic with updateCurrentVelocity
export function updateCurrentStyle(frameRate, currentStyle, currentVelocity, style) {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (!style[key].config) {
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
    ret[key] = {
      val: val,
      config: style[key].config,
    };
  }
  return ret;
}

export function updateCurrentVelocity(frameRate, currentStyle, currentVelocity, style) {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (!style[key].config) {
      // not a spring config, not something we want to interpolate
      // console.log('asd', key);
      ret[key] = style[key];
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
