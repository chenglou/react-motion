/* eslint-disable no-eq-null */
import stepper from './stepper';

// TODO: comply with no-eq-null :)
// TODO: refactor common logic with updateCurrV
// TODO: tests
export default function updateCurrVals(frameRate, currVals, currV, endValue, k = 170, b = 26) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currVals, currV, endValue, k, b)[0];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return endValue;
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    return {
      config: endValue.config,
      val: updateCurrVals(frameRate, currVals.val, currV.val, endValue.val, _k, _b)
    };
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrVals(frameRate, currVals[i], currV[i], endValue[i], k, b));
  }
  if (Object.prototype.toString.call(endValue) === '[object Object]') {
    const ret = {};
    Object.keys(endValue).forEach(key => {
      ret[key] = updateCurrVals(frameRate, currVals[key], currV[key], endValue[key], k, b);
    });
    return ret;
  }
  return endValue;
}
