import stepper from './stepper';

// TODO: refactor common logic with updateCurrValue and updateCurrVelocity
export function interpolateValue(alpha, nextStyle, prevStyle) {
  // might be used by a TransitionMotion, where prevStyle might not exist anymore
  if (!prevStyle) {
    return nextStyle;
  }

  let ret = {};
  for (let key in nextStyle) {
    if (!nextStyle.hasOwnProperty(key)) {
      continue;
    }

    if (!nextStyle[key].config) {
      ret[key] = nextStyle[key];
      // not a spring config, not something we want to interpolate
      continue;
    }
    const prevValue = prevStyle[key].config ? prevStyle[key].val : prevStyle[key];
    ret[key] = {
      val: nextStyle[key].val * alpha + prevValue * (1 - alpha),
      config: nextStyle[key].config,
    };
  }

  return ret;
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
